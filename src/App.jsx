import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import {
  cellKey,
  executePathfinding
} from './algorithms/pathfinding.js'
import {
  generateRecursiveDivision,
  generateRandomWalls,
  generateCaveSystem,
  generateSpiral,
  generateTerrainWeights
} from './algorithms/mazeGenerators.js'
import { BENCHMARK_MAPS } from './benchmarks/benchmarkSuites.js'
import { sound } from './utils/audioSynth.js'

import PlaybackControls from './components/PlaybackControls.jsx'
import MetricsPanel from './components/MetricsPanel.jsx'
import EdgeCaseAlert from './components/EdgeCaseAlert.jsx'
import ComparisonView from './components/ComparisonView.jsx'
import BenchmarkView from './components/BenchmarkView.jsx'

const ROWS = 16
const COLUMNS = 28
const DEFAULT_START = { row: 7, column: 3 }
const DEFAULT_GOAL = { row: 7, column: 24 }

export default function App() {
  const [activeTab, setActiveTab] = useState('visualizer') // 'visualizer' | 'comparison' | 'benchmark'

  // Search settings
  const [algorithm, setAlgorithm] = useState('A*')
  const [heuristic, setHeuristic] = useState('manhattan')
  const [allowDiagonal, setAllowDiagonal] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Map state
  const [start, setStart] = useState(DEFAULT_START)
  const [goal, setGoal] = useState(DEFAULT_GOAL)
  const [walls, setWalls] = useState(() => new Set())
  const [weights, setWeights] = useState(() => new Map()) // key -> cost (4 for mud, 8 for water)

  // Drawing tool: 'wall' | 'mud' | 'water' | 'erase' | 'start' | 'goal'
  const [tool, setTool] = useState('wall')
  const [isMouseDown, setIsMouseDown] = useState(false)

  // Playback & results
  const [searchResult, setSearchResult] = useState(null)
  const [playbackState, setPlaybackState] = useState('idle') // 'idle' | 'playing' | 'paused' | 'finished'
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(20)
  const [isInstant, setIsInstant] = useState(false)
  const [status, setStatus] = useState('Ready to explore')
  const [hoveredCell, setHoveredCell] = useState(null)

  const animationTimerRef = useRef(null)

  const stopAnimation = useCallback(() => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current)
      animationTimerRef.current = null
    }
  }, [])

  const clearSearch = useCallback(() => {
    stopAnimation()
    setSearchResult(null)
    setPlaybackState('idle')
    setCurrentStep(0)
    setStatus('Ready to explore')
  }, [stopAnimation])

  function resetGrid() {
    stopAnimation()
    setStart(DEFAULT_START)
    setGoal(DEFAULT_GOAL)
    setWalls(new Set())
    setWeights(new Map())
    clearSearch()
  }

  function handleLoadMapToCanvas(mapId) {
    const mapDef = BENCHMARK_MAPS.find((m) => m.id === mapId)
    if (!mapDef) return

    stopAnimation()
    const { walls: newWalls, weights: newWeights } = mapDef.generate(ROWS, COLUMNS)
    setStart({
      row: Math.min(mapDef.start.row, ROWS - 1),
      column: Math.min(mapDef.start.column, COLUMNS - 1)
    })
    setGoal({
      row: Math.min(mapDef.goal.row, ROWS - 1),
      column: Math.min(mapDef.goal.column, COLUMNS - 1)
    })
    setWalls(new Set(newWalls))
    setWeights(new Map(newWeights))
    clearSearch()
    setActiveTab('visualizer')
    setStatus(`Loaded map: ${mapDef.name}`)
  }

  function applyToolToCell(r, c) {
    const key = cellKey(r, c)
    const isStart = key === cellKey(start.row, start.column)
    const isGoal = key === cellKey(goal.row, goal.column)

    if (tool === 'start') {
      if (!isGoal && !walls.has(key)) {
        setStart({ row: r, column: c })
        clearSearch()
      }
      return
    }

    if (tool === 'goal') {
      if (!isStart && !walls.has(key)) {
        setGoal({ row: r, column: c })
        clearSearch()
      }
      return
    }

    if (isStart || isGoal) return

    clearSearch()

    if (tool === 'wall') {
      setWalls((prev) => {
        const next = new Set(prev)
        next.add(key)
        return next
      })
      setWeights((prev) => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
    } else if (tool === 'mud') {
      setWalls((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      setWeights((prev) => {
        const next = new Map(prev)
        next.set(key, 4)
        return next
      })
    } else if (tool === 'water') {
      setWalls((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      setWeights((prev) => {
        const next = new Map(prev)
        next.set(key, 8)
        return next
      })
    } else if (tool === 'erase') {
      setWalls((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      setWeights((prev) => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
    }
  }

  function handleGenerateMaze(type) {
    stopAnimation()
    clearSearch()
    let newWalls = new Set()
    let newWeights = new Map()

    if (type === 'recursive') {
      newWalls = generateRecursiveDivision(ROWS, COLUMNS, start, goal)
    } else if (type === 'random') {
      newWalls = generateRandomWalls(ROWS, COLUMNS, start, goal, 0.28)
    } else if (type === 'dense') {
      newWalls = generateRandomWalls(ROWS, COLUMNS, start, goal, 0.42)
    } else if (type === 'cave') {
      newWalls = generateCaveSystem(ROWS, COLUMNS, start, goal)
    } else if (type === 'spiral') {
      newWalls = generateSpiral(ROWS, COLUMNS, start, goal)
    } else if (type === 'terrain') {
      newWeights = generateTerrainWeights(ROWS, COLUMNS, start, goal, walls)
    }

    if (type === 'terrain') {
      setWeights(newWeights)
      setStatus('Generated terrain weights')
    } else {
      setWalls(newWalls)
      setStatus(`Generated ${type} maze`)
    }
  }

  function handleToggleSound(checked) {
    setSoundEnabled(checked)
    sound.toggleSound(checked)
  }

  function runSearch() {
    stopAnimation()

    const t0 = performance.now()
    const result = executePathfinding(
      algorithm,
      start,
      goal,
      ROWS,
      COLUMNS,
      walls,
      weights,
      allowDiagonal,
      heuristic
    )
    const elapsed = performance.now() - t0

    setSearchResult({ ...result, runtime: elapsed })
    setStatus(result.found ? `Path found (${result.path.length - 1} steps, cost ${result.cost})` : 'No valid path')

    if (isInstant) {
      const totalSteps = result.explored.length + result.path.length
      setCurrentStep(totalSteps)
      setPlaybackState('finished')
      if (result.found) sound.playSuccess()
      else sound.playFailure()
    } else {
      setCurrentStep(0)
      setPlaybackState('playing')
    }
  }

  useEffect(() => {
    if (playbackState !== 'playing' || !searchResult) return

    const totalExplored = searchResult.explored.length
    const totalPath = searchResult.path.length
    const total = totalExplored + totalPath

    animationTimerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1
        if (next < totalExplored) {
          if (next % 4 === 0) sound.playStep(next / totalExplored)
        } else if (next === total) {
          stopAnimation()
          setPlaybackState('finished')
          if (searchResult.found) sound.playSuccess()
          else sound.playFailure()
          return total
        }
        return next
      })
    }, Math.max(speed, 2))

    return () => stopAnimation()
  }, [playbackState, searchResult, speed, stopAnimation])

  function handlePlay() {
    if (!searchResult) {
      runSearch()
    } else {
      setPlaybackState('playing')
    }
  }

  function handlePause() {
    stopAnimation()
    setPlaybackState('paused')
  }

  function handleStepForward() {
    if (!searchResult) return
    stopAnimation()
    setPlaybackState('paused')
    const total = searchResult.explored.length + searchResult.path.length
    setCurrentStep((prev) => Math.min(prev + 1, total))
  }

  function handleStepBackward() {
    if (!searchResult) return
    stopAnimation()
    setPlaybackState('paused')
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  function handleJumpStart() {
    stopAnimation()
    setPlaybackState('paused')
    setCurrentStep(0)
  }

  function handleJumpEnd() {
    if (!searchResult) return
    stopAnimation()
    const total = searchResult.explored.length + searchResult.path.length
    setCurrentStep(total)
    setPlaybackState('finished')
  }

  function handleExportGridJSON() {
    const data = {
      rows: ROWS,
      cols: COLUMNS,
      start,
      goal,
      walls: Array.from(walls),
      weights: Array.from(weights.entries())
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `map_layout_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportGridJSON(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.start) setStart(data.start)
        if (data.goal) setGoal(data.goal)
        if (data.walls) setWalls(new Set(data.walls))
        if (data.weights) setWeights(new Map(data.weights))
        clearSearch()
        setStatus('Map imported')
      } catch {
        alert('Invalid JSON file format.')
      }
    }
    reader.readAsText(file)
  }

  const totalExplored = searchResult ? searchResult.explored.length : 0
  const totalPath = searchResult ? searchResult.path.length : 0
  const totalSteps = totalExplored + totalPath

  const revealedExploredCount = searchResult ? Math.min(currentStep, totalExplored) : 0
  const revealedPathCount = searchResult && currentStep > totalExplored ? currentStep - totalExplored : 0

  const activeVisitedSet = searchResult
    ? new Set(
        searchResult.explored
          .slice(0, revealedExploredCount)
          .map((c) => cellKey(c.row, c.column))
      )
    : new Set()

  const activePathSet = searchResult
    ? new Set(
        searchResult.path
          .slice(0, revealedPathCount)
          .map((c) => cellKey(c.row, c.column))
      )
    : new Set()

  const cells = Array.from({ length: ROWS * COLUMNS }, (_, idx) => ({
    row: Math.floor(idx / COLUMNS),
    column: idx % COLUMNS
  }))

  return (
    <main
      className="app-shell"
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
    >
      <header className="topbar">
        <div className="brand-lockup">
          <div>
            <p className="eyebrow">PATHFINDING</p>
            <h1>Search algorithm visualizer</h1>
          </div>
        </div>

        <nav className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualizer')}
          >
            Visualizer
          </button>
          <button
            className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            Compare Algorithms
          </button>
          <button
            className={`tab-btn ${activeTab === 'benchmark' ? 'active' : ''}`}
            onClick={() => setActiveTab('benchmark')}
          >
            Batch Benchmark
          </button>
        </nav>

        <div className="topbar-actions">
          <label className="sound-toggle-label" title="Sound Effects">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => handleToggleSound(e.target.checked)}
            />
            <span>{soundEnabled ? 'Audio: On' : 'Audio: Off'}</span>
          </label>
          <div className="status-chip">Status: {status}</div>
        </div>
      </header>

      {activeTab === 'benchmark' ? (
        <BenchmarkView onLoadMapToCanvas={handleLoadMapToCanvas} />
      ) : activeTab === 'comparison' ? (
        <ComparisonView
          rows={ROWS}
          cols={COLUMNS}
          start={start}
          goal={goal}
          walls={walls}
          weights={weights}
          allowDiagonal={allowDiagonal}
          heuristic={heuristic}
        />
      ) : (
        <>
          <EdgeCaseAlert result={searchResult} onDismiss={clearSearch} />

          <section className="workspace">
            <aside className="controls-panel">
              <div className="panel-heading">
                <span className="section-number">01</span>
                <div>
                  <p className="eyebrow">CONTROLS</p>
                  <h3>Grid settings</h3>
                </div>
              </div>

              <div className="control-group">
                <label>Algorithm</label>
                <div className="algo-grid">
                  {['A*', 'Dijkstra', 'BFS', 'Greedy', 'Bidirectional', 'DFS'].map((item) => (
                    <button
                      key={item}
                      className={`algo-btn ${algorithm === item ? 'selected' : ''}`}
                      onClick={() => {
                        setAlgorithm(item)
                        clearSearch()
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {(algorithm === 'A*' || algorithm === 'Greedy') && (
                <div className="control-group">
                  <label>Heuristic</label>
                  <select
                    value={heuristic}
                    onChange={(e) => {
                      setHeuristic(e.target.value)
                      clearSearch()
                    }}
                    className="heuristic-select"
                  >
                    <option value="manhattan">Manhattan Distance</option>
                    <option value="euclidean">Euclidean Distance</option>
                    <option value="octile">Octile Distance</option>
                    <option value="chebyshev">Chebyshev Distance</option>
                  </select>
                </div>
              )}

              <div className="control-group">
                <label className="checkbox-toggle">
                  <input
                    type="checkbox"
                    checked={allowDiagonal}
                    onChange={(e) => {
                      setAllowDiagonal(e.target.checked)
                      clearSearch()
                    }}
                  />
                  <span>Allow diagonal movement</span>
                </label>
              </div>

              <div className="control-group">
                <label>Draw mode</label>
                <div className="tool-list-enhanced">
                  <button
                    className={`tool-pill ${tool === 'wall' ? 'selected' : ''}`}
                    onClick={() => setTool('wall')}
                  >
                    <span className="tool-swatch wall-swatch" /> Wall
                  </button>
                  <button
                    className={`tool-pill ${tool === 'mud' ? 'selected' : ''}`}
                    onClick={() => setTool('mud')}
                  >
                    <span className="tool-swatch mud-swatch" /> Mud (cost 4)
                  </button>
                  <button
                    className={`tool-pill ${tool === 'water' ? 'selected' : ''}`}
                    onClick={() => setTool('water')}
                  >
                    <span className="tool-swatch water-swatch" /> Water (cost 8)
                  </button>
                  <button
                    className={`tool-pill ${tool === 'erase' ? 'selected' : ''}`}
                    onClick={() => setTool('erase')}
                  >
                    <span className="tool-swatch erase-swatch" /> Eraser
                  </button>
                  <button
                    className={`tool-pill ${tool === 'start' ? 'selected' : ''}`}
                    onClick={() => setTool('start')}
                  >
                    <span className="tool-swatch start-swatch" /> Start node
                  </button>
                  <button
                    className={`tool-pill ${tool === 'goal' ? 'selected' : ''}`}
                    onClick={() => setTool('goal')}
                  >
                    <span className="tool-swatch goal-swatch" /> Goal node
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label>Generate maze / map</label>
                <div className="maze-btn-grid">
                  <button onClick={() => handleGenerateMaze('recursive')}>Recursive division</button>
                  <button onClick={() => handleGenerateMaze('random')}>Random walls</button>
                  <button onClick={() => handleGenerateMaze('cave')}>Cave system</button>
                  <button onClick={() => handleGenerateMaze('spiral')}>Spiral maze</button>
                  <button onClick={() => handleGenerateMaze('terrain')}>Mud & water</button>
                </div>
              </div>

              <div className="panel-actions">
                <button className="run-button" onClick={runSearch}>
                  <span>Run search</span>
                  <span className="arrow">↗</span>
                </button>
                <div className="action-row">
                  <button className="text-button" onClick={resetGrid}>
                    Reset field
                  </button>
                  <button className="text-button" onClick={clearSearch}>
                    Clear result
                  </button>
                </div>
                <div className="import-export-row">
                  <button className="text-button" onClick={handleExportGridJSON}>
                    Export map
                  </button>
                  <label className="text-button file-import-label">
                    Import map
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportGridJSON}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </aside>

            <div className="map-panel">
              <div className="map-heading">
                <div>
                  <span className="section-number">02</span>
                  <div>
                    <p className="eyebrow">GRID</p>
                    <h3>Map</h3>
                  </div>
                </div>
                <div className="map-meta-info">
                  <span className="badge category-badge">
                    {ROWS} × {COLUMNS}
                  </span>
                  {hoveredCell && (
                    <span className="hover-telemetry">
                      Cell: ({hoveredCell.row}, {hoveredCell.column})
                      {weights.has(cellKey(hoveredCell.row, hoveredCell.column)) &&
                        ` · Cost: ${weights.get(cellKey(hoveredCell.row, hoveredCell.column))}`}
                    </span>
                  )}
                </div>
              </div>

              <PlaybackControls
                playbackState={playbackState}
                onPlay={handlePlay}
                onPause={handlePause}
                onStepForward={handleStepForward}
                onStepBackward={handleStepBackward}
                onJumpStart={handleJumpStart}
                onJumpEnd={handleJumpEnd}
                currentStep={currentStep}
                totalSteps={totalSteps}
                speed={speed}
                onSpeedChange={setSpeed}
                isInstant={isInstant}
                onToggleInstant={setIsInstant}
              />

              <div
                className="grid main-canvas-grid"
                style={{ '--columns': COLUMNS }}
                onMouseDown={() => setIsMouseDown(true)}
              >
                {cells.map((cell) => {
                  const key = cellKey(cell.row, cell.column)
                  const classes = ['cell']

                  if (walls.has(key)) classes.push('wall')
                  else if (weights.get(key) === 4) classes.push('mud')
                  else if (weights.get(key) >= 8) classes.push('water')

                  if (activeVisitedSet.has(key)) classes.push('visited')
                  if (activePathSet.has(key)) classes.push('path')

                  if (key === cellKey(start.row, start.column)) classes.push('start')
                  if (key === cellKey(goal.row, goal.column)) classes.push('goal')

                  return (
                    <button
                      key={key}
                      className={classes.join(' ')}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        applyToolToCell(cell.row, cell.column)
                      }}
                      onMouseEnter={() => {
                        setHoveredCell(cell)
                        if (isMouseDown) applyToolToCell(cell.row, cell.column)
                      }}
                      aria-label={`Cell row ${cell.row}, col ${cell.column}`}
                    />
                  )
                })}
              </div>

              <div className="canvas-legend-row">
                <div className="legend-item">
                  <span className="tool-swatch start-swatch" /> Start
                </div>
                <div className="legend-item">
                  <span className="tool-swatch goal-swatch" /> Goal
                </div>
                <div className="legend-item">
                  <span className="tool-swatch wall-swatch" /> Wall
                </div>
                <div className="legend-item">
                  <span className="tool-swatch mud-swatch" /> Mud (cost 4)
                </div>
                <div className="legend-item">
                  <span className="tool-swatch water-swatch" /> Water (cost 8)
                </div>
                <div className="legend-item">
                  <span className="legend-swatch visited-swatch" /> Explored
                </div>
                <div className="legend-item">
                  <span className="legend-swatch path-swatch" /> Final route
                </div>
              </div>
            </div>
          </section>

          <MetricsPanel
            algorithm={algorithm}
            exploredCount={revealedExploredCount}
            totalCells={ROWS * COLUMNS}
            pathLength={revealedPathCount ? revealedPathCount - 1 : 0}
            pathCost={searchResult?.cost ?? 0}
            runtime={searchResult?.runtime ?? null}
            found={searchResult?.found ?? false}
            allowDiagonal={allowDiagonal}
          />
        </>
      )}

      <footer className="super-project-footer">
        <span>PATHFINDING VISUALIZER</span>
        <span>{ROWS} ROWS / {COLUMNS} COLUMNS</span>
        <span>Anjaliben Ghanshyambhai Valand and Keagan Anderson</span>
      </footer>
    </main>
  )
}
