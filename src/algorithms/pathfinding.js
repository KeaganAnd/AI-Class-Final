import { PriorityQueue } from './priorityQueue.js'
import { Heuristics } from './heuristics.js'

export function cellKey(row, column) {
  return `${row}-${column}`
}

export function parseKey(key) {
  const [row, column] = key.split('-').map(Number)
  return { row, column }
}

export function getNeighbors(cell, rows, cols, walls, allowDiagonal = false) {
  const orthogonal = [
    [-1, 0, 1],
    [1, 0, 1],
    [0, -1, 1],
    [0, 1, 1]
  ]
  const diagonal = [
    [-1, -1, 1.414],
    [-1, 1, 1.414],
    [1, -1, 1.414],
    [1, 1, 1.414]
  ]

  const directions = allowDiagonal ? [...orthogonal, ...diagonal] : orthogonal
  const neighbors = []

  for (const [dRow, dCol, distMult] of directions) {
    const r = cell.row + dRow
    const c = cell.column + dCol
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      const key = cellKey(r, c)
      if (!walls.has(key)) {
        // Prevent squeezing through diagonal walls
        if (dRow !== 0 && dCol !== 0) {
          const adj1 = cellKey(cell.row + dRow, cell.column)
          const adj2 = cellKey(cell.row, cell.column + dCol)
          if (walls.has(adj1) && walls.has(adj2)) continue
        }
        neighbors.push({ row: r, column: c, distMult })
      }
    }
  }

  return neighbors
}

// Reconstruct path from goal back to start using parent map
export function reconstructPath(parents, start, goal) {
  const path = []
  let currentKey = cellKey(goal.row, goal.column)
  const startKey = cellKey(start.row, start.column)

  while (currentKey) {
    const cell = parseKey(currentKey)
    path.unshift(cell)
    if (currentKey === startKey) return path
    currentKey = parents.get(currentKey)
  }
  return []
}

// Breadth-First Search (BFS)
export function runBFS(start, goal, rows, cols, walls, weights = new Map(), allowDiagonal = false) {
  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)
  const queue = [start]
  const visited = new Set([startKey])
  const parents = new Map()
  const explored = []

  let found = false

  while (queue.length > 0) {
    const current = queue.shift()
    explored.push({ ...current })

    const curKey = cellKey(current.row, current.column)
    if (curKey === goalKey) {
      found = true
      break
    }

    const neighbors = getNeighbors(current, rows, cols, walls, allowDiagonal)
    for (const neighbor of neighbors) {
      const nKey = cellKey(neighbor.row, neighbor.column)
      if (!visited.has(nKey)) {
        visited.add(nKey)
        parents.set(nKey, curKey)
        queue.push(neighbor)
      }
    }
  }

  const path = found ? reconstructPath(parents, start, goal) : []
  let totalCost = 0
  for (let i = 1; i < path.length; i++) {
    const key = cellKey(path[i].row, path[i].column)
    totalCost += weights.get(key) || 1
  }

  return {
    algorithm: 'BFS',
    explored,
    path,
    cost: totalCost || (path.length ? path.length - 1 : 0),
    found,
    message: found ? 'Path found' : 'No path found'
  }
}

// Depth-First Search (DFS)
export function runDFS(start, goal, rows, cols, walls, weights = new Map(), allowDiagonal = false) {
  const goalKey = cellKey(goal.row, goal.column)
  const stack = [start]
  const visited = new Set()
  const parents = new Map()
  const explored = []

  let found = false

  while (stack.length > 0) {
    const current = stack.pop()
    const curKey = cellKey(current.row, current.column)

    if (visited.has(curKey)) continue
    visited.add(curKey)
    explored.push({ ...current })

    if (curKey === goalKey) {
      found = true
      break
    }

    const neighbors = getNeighbors(current, rows, cols, walls, allowDiagonal)
    for (const neighbor of neighbors) {
      const nKey = cellKey(neighbor.row, neighbor.column)
      if (!visited.has(nKey)) {
        parents.set(nKey, curKey)
        stack.push(neighbor)
      }
    }
  }

  const path = found ? reconstructPath(parents, start, goal) : []
  let totalCost = 0
  for (let i = 1; i < path.length; i++) {
    const key = cellKey(path[i].row, path[i].column)
    totalCost += weights.get(key) || 1
  }

  return {
    algorithm: 'DFS',
    explored,
    path,
    cost: totalCost || (path.length ? path.length - 1 : 0),
    found,
    message: found ? 'Path found' : 'No path found'
  }
}

// Dijkstra's Algorithm
export function runDijkstra(start, goal, rows, cols, walls, weights = new Map(), allowDiagonal = false) {
  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)

  const pq = new PriorityQueue()
  const distances = new Map([[startKey, 0]])
  const parents = new Map()
  const visited = new Set()
  const explored = []

  pq.push(start, 0)
  let found = false

  while (!pq.isEmpty()) {
    const item = pq.pop()
    const current = item.element
    const curKey = cellKey(current.row, current.column)

    if (visited.has(curKey)) continue
    visited.add(curKey)
    explored.push({ ...current, g: item.priority })

    if (curKey === goalKey) {
      found = true
      break
    }

    const currentDist = distances.get(curKey)
    const neighbors = getNeighbors(current, rows, cols, walls, allowDiagonal)

    for (const neighbor of neighbors) {
      const nKey = cellKey(neighbor.row, neighbor.column)
      if (visited.has(nKey)) continue

      const cellWeight = (weights.get(nKey) || 1) * (neighbor.distMult || 1)
      const altDist = currentDist + cellWeight

      if (altDist < (distances.get(nKey) ?? Infinity)) {
        distances.set(nKey, altDist)
        parents.set(nKey, curKey)
        pq.push(neighbor, altDist)
      }
    }
  }

  const path = found ? reconstructPath(parents, start, goal) : []
  const cost = found ? distances.get(goalKey) : 0

  return {
    algorithm: 'Dijkstra',
    explored,
    path,
    cost: Number(cost.toFixed(2)),
    found,
    message: found ? 'Path found' : 'No path found'
  }
}

// A* Search
export function runAStar(start, goal, rows, cols, walls, weights = new Map(), allowDiagonal = false, heuristicType = 'manhattan') {
  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)

  const heuristicFn = Heuristics[heuristicType] || Heuristics.manhattan
  const pq = new PriorityQueue()

  const gScore = new Map([[startKey, 0]])
  const fScore = new Map([[startKey, heuristicFn(start, goal)]])
  const parents = new Map()
  const visited = new Set()
  const explored = []

  pq.push(start, fScore.get(startKey))
  let found = false

  while (!pq.isEmpty()) {
    const item = pq.pop()
    const current = item.element
    const curKey = cellKey(current.row, current.column)

    if (visited.has(curKey)) continue
    visited.add(curKey)

    const g = gScore.get(curKey) ?? 0
    const h = heuristicFn(current, goal)
    explored.push({ ...current, g, h, f: g + h })

    if (curKey === goalKey) {
      found = true
      break
    }

    const neighbors = getNeighbors(current, rows, cols, walls, allowDiagonal)

    for (const neighbor of neighbors) {
      const nKey = cellKey(neighbor.row, neighbor.column)
      if (visited.has(nKey)) continue

      const cellWeight = (weights.get(nKey) || 1) * (neighbor.distMult || 1)
      const tentativeG = g + cellWeight

      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        parents.set(nKey, curKey)
        gScore.set(nKey, tentativeG)
        const hVal = heuristicFn(neighbor, goal)
        const fVal = tentativeG + hVal
        fScore.set(nKey, fVal)
        pq.push(neighbor, fVal)
      }
    }
  }

  const path = found ? reconstructPath(parents, start, goal) : []
  const cost = found ? (gScore.get(goalKey) ?? 0) : 0

  return {
    algorithm: `A* (${heuristicType})`,
    explored,
    path,
    cost: Number(cost.toFixed(2)),
    found,
    message: found ? 'Path found' : 'No path found'
  }
}

// Greedy Best-First Search
export function runGreedyBestFirst(start, goal, rows, cols, walls, weights = new Map(), allowDiagonal = false, heuristicType = 'manhattan') {
  const goalKey = cellKey(goal.row, goal.column)
  const heuristicFn = Heuristics[heuristicType] || Heuristics.manhattan
  const pq = new PriorityQueue()

  const parents = new Map()
  const visited = new Set()
  const explored = []

  pq.push(start, heuristicFn(start, goal))
  let found = false

  while (!pq.isEmpty()) {
    const item = pq.pop()
    const current = item.element
    const curKey = cellKey(current.row, current.column)

    if (visited.has(curKey)) continue
    visited.add(curKey)

    const h = heuristicFn(current, goal)
    explored.push({ ...current, h, f: h })

    if (curKey === goalKey) {
      found = true
      break
    }

    const neighbors = getNeighbors(current, rows, cols, walls, allowDiagonal)
    for (const neighbor of neighbors) {
      const nKey = cellKey(neighbor.row, neighbor.column)
      if (!visited.has(nKey)) {
        if (!parents.has(nKey)) {
          parents.set(nKey, curKey)
        }
        pq.push(neighbor, heuristicFn(neighbor, goal))
      }
    }
  }

  const path = found ? reconstructPath(parents, start, goal) : []
  let totalCost = 0
  for (let i = 1; i < path.length; i++) {
    const key = cellKey(path[i].row, path[i].column)
    totalCost += weights.get(key) || 1
  }

  return {
    algorithm: 'Greedy Best-First',
    explored,
    path,
    cost: Number(totalCost.toFixed(2)),
    found,
    message: found ? 'Path found' : 'No path found'
  }
}

// Bidirectional BFS
export function runBidirectionalBFS(start, goal, rows, cols, walls, weights = new Map(), allowDiagonal = false) {
  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)

  if (startKey === goalKey) {
    return {
      algorithm: 'Bidirectional BFS',
      explored: [start],
      path: [start],
      cost: 0,
      found: true,
      message: 'Start and goal are the same'
    }
  }

  const queueA = [start]
  const queueB = [goal]

  const visitedA = new Map([[startKey, null]])
  const visitedB = new Map([[goalKey, null]])

  const explored = []
  let intersectionKey = null

  while (queueA.length > 0 && queueB.length > 0) {
    // Search from start
    const currentA = queueA.shift()
    explored.push({ ...currentA, source: 'start' })
    const aKey = cellKey(currentA.row, currentA.column)

    if (visitedB.has(aKey)) {
      intersectionKey = aKey
      break
    }

    for (const neighbor of getNeighbors(currentA, rows, cols, walls, allowDiagonal)) {
      const nKey = cellKey(neighbor.row, neighbor.column)
      if (!visitedA.has(nKey)) {
        visitedA.set(nKey, aKey)
        queueA.push(neighbor)
        if (visitedB.has(nKey)) {
          intersectionKey = nKey
          break
        }
      }
    }
    if (intersectionKey) break

    // Search from goal
    const currentB = queueB.shift()
    explored.push({ ...currentB, source: 'goal' })
    const bKey = cellKey(currentB.row, currentB.column)

    if (visitedA.has(bKey)) {
      intersectionKey = bKey
      break
    }

    for (const neighbor of getNeighbors(currentB, rows, cols, walls, allowDiagonal)) {
      const nKey = cellKey(neighbor.row, neighbor.column)
      if (!visitedB.has(nKey)) {
        visitedB.set(nKey, bKey)
        queueB.push(neighbor)
        if (visitedA.has(nKey)) {
          intersectionKey = nKey
          break
        }
      }
    }
    if (intersectionKey) break
  }

  if (!intersectionKey) {
    return {
      algorithm: 'Bidirectional BFS',
      explored,
      path: [],
      cost: 0,
      found: false,
      message: 'No path found'
    }
  }

  // Recombine paths from both directions
  const pathStart = []
  let curA = intersectionKey
  while (curA) {
    pathStart.unshift(parseKey(curA))
    curA = visitedA.get(curA)
  }

  const pathGoal = []
  let curB = visitedB.get(intersectionKey)
  while (curB) {
    pathGoal.push(parseKey(curB))
    curB = visitedB.get(curB)
  }

  const path = [...pathStart, ...pathGoal]
  let totalCost = 0
  for (let i = 1; i < path.length; i++) {
    const key = cellKey(path[i].row, path[i].column)
    totalCost += weights.get(key) || 1
  }

  return {
    algorithm: 'Bidirectional BFS',
    explored,
    path,
    cost: totalCost || (path.length ? path.length - 1 : 0),
    found: true,
    message: 'Path found'
  }
}

// Main runner
export function executePathfinding(algoName, start, goal, rows, cols, walls, weights = new Map(), allowDiagonal = false, heuristic = 'manhattan') {
  switch (algoName) {
    case 'BFS':
      return runBFS(start, goal, rows, cols, walls, weights, allowDiagonal)
    case 'DFS':
      return runDFS(start, goal, rows, cols, walls, weights, allowDiagonal)
    case 'Dijkstra':
      return runDijkstra(start, goal, rows, cols, walls, weights, allowDiagonal)
    case 'A*':
      return runAStar(start, goal, rows, cols, walls, weights, allowDiagonal, heuristic)
    case 'Greedy':
      return runGreedyBestFirst(start, goal, rows, cols, walls, weights, allowDiagonal, heuristic)
    case 'Bidirectional':
      return runBidirectionalBFS(start, goal, rows, cols, walls, weights, allowDiagonal)
    default:
      return runAStar(start, goal, rows, cols, walls, weights, allowDiagonal, heuristic)
  }
}
