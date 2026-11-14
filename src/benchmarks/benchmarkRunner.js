import { BENCHMARK_MAPS } from './benchmarkSuites.js'
import { executePathfinding } from '../algorithms/pathfinding.js'

export const BENCHMARK_ALGORITHMS = [
  { id: 'BFS', name: 'BFS', heuristic: null },
  { id: 'Dijkstra', name: 'Dijkstra', heuristic: null },
  { id: 'A*', name: 'A* (Manhattan)', heuristic: 'manhattan' },
  { id: 'A*', name: 'A* (Euclidean)', heuristic: 'euclidean' },
  { id: 'Greedy', name: 'Greedy Best-First', heuristic: 'manhattan' },
  { id: 'Bidirectional', name: 'Bidirectional BFS', heuristic: null },
]

export function runFullBenchmark(algorithms = BENCHMARK_ALGORITHMS, maps = BENCHMARK_MAPS, allowDiagonal = false) {
  const results = []

  for (const map of maps) {
    const { walls, weights } = map.generate(map.rows, map.cols)

    for (const algo of algorithms) {
      const t0 = performance.now()
      const runResult = executePathfinding(
        algo.id,
        map.start,
        map.goal,
        map.rows,
        map.cols,
        walls,
        weights,
        allowDiagonal,
        algo.heuristic || 'manhattan'
      )
      const t1 = performance.now()
      const durationMs = t1 - t0

      const pathLength = runResult.path.length ? runResult.path.length - 1 : 0
      const exploredCount = runResult.explored.length
      const efficiency = exploredCount > 0 ? ((pathLength / exploredCount) * 100).toFixed(1) : '0.0'

      results.push({
        mapId: map.id,
        mapName: map.name,
        category: map.category,
        algorithm: algo.name,
        explored: exploredCount,
        pathLength,
        cost: runResult.cost,
        found: runResult.found,
        runtimeMs: durationMs,
        efficiencyPercent: Number(efficiency)
      })
    }
  }

  return results
}

export function exportBenchmarkToCSV(results) {
  const headers = ['Map ID', 'Map Name', 'Category', 'Algorithm', 'Path Found', 'Explored Nodes', 'Path Length', 'Total Cost', 'Runtime (ms)', 'Efficiency (%)']
  const rows = results.map(r => [
    `"${r.mapId}"`,
    `"${r.mapName}"`,
    `"${r.category}"`,
    `"${r.algorithm}"`,
    r.found ? 'YES' : 'NO',
    r.explored,
    r.pathLength,
    r.cost,
    r.runtimeMs.toFixed(3),
    `${r.efficiencyPercent}%`
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

