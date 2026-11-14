import { useState } from 'react'
import { BENCHMARK_MAPS } from '../benchmarks/benchmarkSuites.js'
import {
  BENCHMARK_ALGORITHMS,
  runFullBenchmark,
  exportBenchmarkToCSV
} from '../benchmarks/benchmarkRunner.js'

export default function BenchmarkView({ onLoadMapToCanvas }) {
  const [results, setResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('mapName')
  const [sortAsc, setSortAsc] = useState(true)

  function executeBenchmarkSuite() {
    setIsRunning(true)
    setTimeout(() => {
      const res = runFullBenchmark()
      setResults(res)
      setIsRunning(false)
    }, 50)
  }

  function handleExportCSV() {
    if (!results) return
    const csvContent = exportBenchmarkToCSV(results)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `benchmark_results_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleExportJSON() {
    if (!results) return
    const jsonStr = JSON.stringify(results, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `benchmark_results_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const categories = ['All', ...new Set(BENCHMARK_MAPS.map((m) => m.category))]

  const filteredResults = results
    ? results.filter(
        (r) => selectedCategory === 'All' || r.category === selectedCategory
      )
    : []

  const sortedResults = [...filteredResults].sort((a, b) => {
    let valA = a[sortBy]
    let valB = b[sortBy]
    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    return sortAsc ? valA - valB : valB - valA
  })

  const stats = results
    ? BENCHMARK_ALGORITHMS.map((algo) => {
        const algoRuns = results.filter((r) => r.algorithm === algo.name)
        const totalExplored = algoRuns.reduce((sum, r) => sum + r.explored, 0)
        const avgExplored = (totalExplored / algoRuns.length).toFixed(1)
        const totalTime = algoRuns.reduce((sum, r) => sum + r.runtimeMs, 0)
        const avgTime = (totalTime / algoRuns.length).toFixed(3)
        const solvedCount = algoRuns.filter((r) => r.found).length
        return {
          algorithm: algo.name,
          avgExplored: Number(avgExplored),
          avgTime: Number(avgTime),
          solvedCount,
          totalMaps: algoRuns.length
        }
      })
    : []

  return (
    <div className="benchmark-container">
      <div className="benchmark-hero">
        <div>
          <span className="eyebrow">BATCH TESTING</span>
          <h2>22-Map Benchmark Suite</h2>
          <p className="intro-copy" style={{ maxWidth: '650px' }}>
            Run searches across 22 test maps including open fields, chokepoints, mazes, local traps, and edge cases to compare explored node counts and runtimes.
          </p>
        </div>
        <div className="benchmark-hero-actions">
          <button
            className="run-button"
            onClick={executeBenchmarkSuite}
            disabled={isRunning}
            style={{ minWidth: '180px' }}
          >
            {isRunning ? 'Running tests...' : 'Run All 22 Maps'}
          </button>
          {results && (
            <div className="export-btn-group">
              <button className="text-button export-btn" onClick={handleExportCSV}>
                Export CSV
              </button>
              <button className="text-button export-btn" onClick={handleExportJSON}>
                Export JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <div className="benchmark-leaderboard-card">
          <div className="panel-heading">
            <span className="section-number">SUMMARY</span>
            <div>
              <p className="eyebrow">AVERAGES</p>
              <h3>Algorithm Performance Summary</h3>
            </div>
          </div>
          <div className="leaderboard-grid">
            {stats.map((item) => (
              <div key={item.algorithm} className="leaderboard-card">
                <h4>{item.algorithm}</h4>
                <div className="stat-line">
                  <span>Avg Explored:</span>
                  <strong>{item.avgExplored}</strong>
                </div>
                <div className="stat-line">
                  <span>Avg Time:</span>
                  <strong>{item.avgTime} ms</strong>
                </div>
                <div className="stat-line">
                  <span>Solved:</span>
                  <strong>{item.solvedCount} / {item.totalMaps}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results && (
        <div className="benchmark-table-wrapper">
          <div className="benchmark-filter-bar">
            <div className="filter-group">
              <label>Category:</label>
              <div className="category-chips">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
              >
                <option value="mapName">Map Name</option>
                <option value="algorithm">Algorithm</option>
                <option value="explored">Nodes Explored</option>
                <option value="pathLength">Path Length</option>
                <option value="cost">Path Cost</option>
                <option value="runtimeMs">Runtime (ms)</option>
                <option value="efficiencyPercent">Ratio (%)</option>
              </select>
              <button
                className="btn-toggle-sort"
                onClick={() => setSortAsc(!sortAsc)}
                title="Toggle Sort Order"
              >
                {sortAsc ? '▲ Asc' : '▼ Desc'}
              </button>
            </div>
          </div>

          <table className="benchmark-table">
            <thead>
              <tr>
                <th>Map Scenario</th>
                <th>Category</th>
                <th>Algorithm</th>
                <th>Status</th>
                <th>Explored</th>
                <th>Length</th>
                <th>Cost</th>
                <th>Time (ms)</th>
                <th>Ratio</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((row, idx) => (
                <tr key={`${row.mapId}-${row.algorithm}-${idx}`}>
                  <td>
                    <strong>{row.mapName}</strong>
                  </td>
                  <td>
                    <span className="badge category-badge">{row.category}</span>
                  </td>
                  <td>
                    <strong>{row.algorithm}</strong>
                  </td>
                  <td>
                    <span className={`badge ${row.found ? 'badge-success' : 'badge-failure'}`}>
                      {row.found ? 'Solved' : 'No Path'}
                    </span>
                  </td>
                  <td>{row.explored}</td>
                  <td>{row.pathLength || '—'}</td>
                  <td>{row.cost || '—'}</td>
                  <td>{row.runtimeMs.toFixed(3)}</td>
                  <td>{row.efficiencyPercent}%</td>
                  <td>
                    <button
                      className="load-map-btn"
                      onClick={() => onLoadMapToCanvas(row.mapId)}
                      title="Load this map into visualizer"
                    >
                      Load Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!results && (
        <div className="preset-map-preview-grid">
          {BENCHMARK_MAPS.map((map) => (
            <div key={map.id} className="preset-map-card">
              <div className="preset-map-header">
                <h4>{map.name}</h4>
                <span className="badge category-badge">{map.category}</span>
              </div>
              <p className="preset-map-desc">{map.description}</p>
              <div className="preset-map-footer">
                <span>
                  Size: {map.rows} × {map.cols}
                </span>
                <button
                  className="load-map-btn"
                  onClick={() => onLoadMapToCanvas(map.id)}
                >
                  Load Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
