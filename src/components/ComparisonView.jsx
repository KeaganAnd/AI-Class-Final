import { useState, useEffect, useRef } from 'react'
import { cellKey, executePathfinding } from '../algorithms/pathfinding.js'

export default function ComparisonView({
  rows,
  cols,
  start,
  goal,
  walls,
  weights,
  allowDiagonal,
  heuristic
}) {
  const [algoA, setAlgoA] = useState('BFS')
  const [algoB, setAlgoB] = useState('A*')

  const [resA, setResA] = useState(null)
  const [resB, setResB] = useState(null)

  const [stepA, setStepA] = useState(0)
  const [stepB, setStepB] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef(null)

  function runComparison() {
    if (timerRef.current) clearInterval(timerRef.current)

    const t0A = performance.now()
    const outA = executePathfinding(algoA, start, goal, rows, cols, walls, weights, allowDiagonal, heuristic)
    const timeA = performance.now() - t0A

    const t0B = performance.now()
    const outB = executePathfinding(algoB, start, goal, rows, cols, walls, weights, allowDiagonal, heuristic)
    const timeB = performance.now() - t0B

    setResA({ ...outA, runtime: timeA })
    setResB({ ...outB, runtime: timeB })

    setStepA(0)
    setStepB(0)
    setIsRunning(true)
  }

  useEffect(() => {
    if (!isRunning || !resA || !resB) return

    const maxSteps = Math.max(
      resA.explored.length + resA.path.length,
      resB.explored.length + resB.path.length
    )

    let current = 0
    timerRef.current = setInterval(() => {
      current += 2
      setStepA((prev) => Math.min(prev + 2, resA.explored.length + resA.path.length))
      setStepB((prev) => Math.min(prev + 2, resB.explored.length + resB.path.length))

      if (current >= maxSteps) {
        clearInterval(timerRef.current)
        setIsRunning(false)
      }
    }, 25)

    return () => clearInterval(timerRef.current)
  }, [isRunning, resA, resB])

  function renderSubGrid(algoName, result, step) {
    if (!result) {
      return (
        <div className="comparison-placeholder">
          <p>Select algorithms and click &quot;Run Comparison&quot; to test.</p>
        </div>
      )
    }

    const exploredSlice = result.explored.slice(0, Math.min(step, result.explored.length))
    const pathSlice =
      step > result.explored.length
        ? result.path.slice(0, step - result.explored.length)
        : []

    const visitedSet = new Set(exploredSlice.map((c) => cellKey(c.row, c.column)))
    const pathSet = new Set(pathSlice.map((c) => cellKey(c.row, c.column)))

    const cells = Array.from({ length: rows * cols }, (_, idx) => ({
      row: Math.floor(idx / cols),
      column: idx % cols
    }))

    return (
      <div className="comparison-panel">
        <div className="comparison-panel-header">
          <h4>{algoName}</h4>
          <span className="badge category-badge">
            {visitedSet.size} Explored / {result.path.length ? `${result.path.length - 1} steps` : '0 steps'}
          </span>
        </div>

        <div className="grid comparison-grid" style={{ '--columns': cols }}>
          {cells.map((cell) => {
            const key = cellKey(cell.row, cell.column)
            const classes = ['cell']
            if (walls.has(key)) classes.push('wall')
            else if (weights.get(key) === 4) classes.push('mud')
            else if (weights.get(key) >= 8) classes.push('water')

            if (visitedSet.has(key)) classes.push('visited')
            if (pathSet.has(key)) classes.push('path')

            if (key === cellKey(start.row, start.column)) classes.push('start')
            if (key === cellKey(goal.row, goal.column)) classes.push('goal')

            return <div key={key} className={classes.join(' ')} />
          })}
        </div>

        <div className="comparison-metrics">
          <div>
            <span>Nodes Explored:</span>
            <strong>{result.explored.length}</strong>
          </div>
          <div>
            <span>Path Length:</span>
            <strong>{result.path.length ? `${result.path.length - 1} steps` : '—'}</strong>
          </div>
          <div>
            <span>Path Cost:</span>
            <strong>{result.cost}</strong>
          </div>
          <div>
            <span>Runtime:</span>
            <strong>{result.runtime.toFixed(3)} ms</strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="comparison-view">
      <div className="comparison-controls">
        <div className="algo-selector-group">
          <div>
            <label>Algorithm A:</label>
            <select value={algoA} onChange={(e) => setAlgoA(e.target.value)} disabled={isRunning}>
              <option value="BFS">BFS</option>
              <option value="Dijkstra">Dijkstra</option>
              <option value="A*">A*</option>
              <option value="Greedy">Greedy Best-First</option>
              <option value="Bidirectional">Bidirectional BFS</option>
              <option value="DFS">DFS</option>
            </select>
          </div>
          <span className="vs-badge">VS</span>
          <div>
            <label>Algorithm B:</label>
            <select value={algoB} onChange={(e) => setAlgoB(e.target.value)} disabled={isRunning}>
              <option value="A*">A*</option>
              <option value="Dijkstra">Dijkstra</option>
              <option value="BFS">BFS</option>
              <option value="Greedy">Greedy Best-First</option>
              <option value="Bidirectional">Bidirectional BFS</option>
              <option value="DFS">DFS</option>
            </select>
          </div>
        </div>

        <button
          className="run-button"
          onClick={runComparison}
          disabled={isRunning}
          style={{ width: 'auto', padding: '10px 24px' }}
        >
          {isRunning ? 'Running...' : 'Run Comparison'}
        </button>
      </div>

      <div className="comparison-split-screen">
        {renderSubGrid(algoA, resA, stepA)}
        {renderSubGrid(algoB, resB, stepB)}
      </div>
    </div>
  )
}
