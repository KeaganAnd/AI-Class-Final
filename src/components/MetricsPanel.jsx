export default function MetricsPanel({
  algorithm,
  exploredCount,
  totalCells,
  pathLength,
  pathCost,
  runtime,
  found,
  allowDiagonal
}) {
  const coveragePercent = totalCells > 0 ? ((exploredCount / totalCells) * 100).toFixed(1) : '0.0'
  const efficiencyRatio = exploredCount > 0 && pathLength > 0 ? ((pathLength / exploredCount) * 100).toFixed(1) : '0.0'

  const isOptimal = ['BFS', 'Dijkstra', 'A* (manhattan)', 'A* (euclidean)', 'A*'].some(a => algorithm.startsWith(a)) && !algorithm.includes('Greedy')

  return (
    <section className="metrics-panel-enhanced">
      <div className="panel-heading">
        <span className="section-number">03</span>
        <div>
          <p className="eyebrow">RESULTS</p>
          <h3>Search metrics</h3>
        </div>
      </div>

      <div className="metrics-cards-grid">
        <div className="metric-card">
          <span className="metric-label">Algorithm</span>
          <strong className="metric-val highlight">{algorithm}</strong>
          <span className="metric-sub">
            {isOptimal ? 'Optimal path' : 'Heuristic search'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Explored nodes</span>
          <strong className="metric-val">{exploredCount || '—'}</strong>
          <span className="metric-sub">{coveragePercent}% of map</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Path length / cost</span>
          <strong className="metric-val">
            {pathLength ? `${pathLength} steps` : '—'}
          </strong>
          <span className="metric-sub">
            {pathCost ? `Cost: ${pathCost}` : found ? 'Start = Goal' : 'No path'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Runtime</span>
          <strong className="metric-val">
            {runtime === null ? '—' : `${runtime.toFixed(2)} ms`}
          </strong>
          <span className="metric-sub">
            {runtime !== null ? `${(runtime * 1000).toFixed(0)} µs` : 'Ready'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Exploration ratio</span>
          <strong className="metric-val">{efficiencyRatio}%</strong>
          <span className="metric-sub">Path / explored</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Movement</span>
          <strong className="metric-val">{allowDiagonal ? '8-Way' : '4-Way'}</strong>
          <span className="metric-sub">{allowDiagonal ? 'Diagonal allowed' : 'Orthogonal only'}</span>
        </div>
      </div>
    </section>
  )
}
