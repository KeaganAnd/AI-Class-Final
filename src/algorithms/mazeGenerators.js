import { cellKey } from './pathfinding.js'

// Recursive Division Maze
export function generateRecursiveDivision(rows, cols, start, goal) {
  const walls = new Set()
  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)

  // Add outer border walls
  for (let r = 0; r < rows; r++) {
    const k1 = cellKey(r, 0)
    const k2 = cellKey(r, cols - 1)
    if (k1 !== startKey && k1 !== goalKey) walls.add(k1)
    if (k2 !== startKey && k2 !== goalKey) walls.add(k2)
  }
  for (let c = 0; c < cols; c++) {
    const k1 = cellKey(0, c)
    const k2 = cellKey(rows - 1, c)
    if (k1 !== startKey && k1 !== goalKey) walls.add(k1)
    if (k2 !== startKey && k2 !== goalKey) walls.add(k2)
  }

  function divide(r1, r2, c1, c2) {
    if (r2 - r1 < 3 || c2 - c1 < 3) return

    const horizontal = r2 - r1 > c2 - c1

    if (horizontal) {
      // Choose wall row
      const wallRow = Math.floor(Math.random() * (r2 - r1 - 2)) + r1 + 1
      const passageCol = Math.floor(Math.random() * (c2 - c1 + 1)) + c1

      for (let c = c1; c <= c2; c++) {
        if (c !== passageCol) {
          const key = cellKey(wallRow, c)
          if (key !== startKey && key !== goalKey) {
            walls.add(key)
          }
        }
      }

      divide(r1, wallRow - 1, c1, c2)
      divide(wallRow + 1, r2, c1, c2)
    } else {
      // Choose wall column
      const wallCol = Math.floor(Math.random() * (c2 - c1 - 2)) + c1 + 1
      const passageRow = Math.floor(Math.random() * (r2 - r1 + 1)) + r1

      for (let r = r1; r <= r2; r++) {
        if (r !== passageRow) {
          const key = cellKey(r, wallCol)
          if (key !== startKey && key !== goalKey) {
            walls.add(key)
          }
        }
      }

      divide(r1, r2, c1, wallCol - 1)
      divide(r1, r2, wallCol + 1, c2)
    }
  }

  divide(1, rows - 2, 1, cols - 2)
  return walls
}

// Random Obstacles
export function generateRandomWalls(rows, cols, start, goal, density = 0.28) {
  const walls = new Set()
  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = cellKey(r, c)
      if (key === startKey || key === goalKey) continue
      if (Math.random() < density) {
        walls.add(key)
      }
    }
  }

  return walls
}

// Cellular Automata Caves
export function generateCaveSystem(rows, cols, start, goal) {
  let grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() < 0.42 ? 1 : 0))
  )

  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)

  for (let step = 0; step < 3; step++) {
    const nextGrid = Array.from({ length: rows }, () => Array(cols).fill(0))
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let wallCount = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = r + dr
            const nc = c + dc
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
              wallCount++
            } else if (grid[nr][nc] === 1) {
              wallCount++
            }
          }
        }
        nextGrid[r][c] = wallCount >= 4 ? 1 : 0
      }
    }
    grid = nextGrid
  }

  const walls = new Set()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = cellKey(r, c)
      if (key !== startKey && key !== goalKey && grid[r][c] === 1) {
        walls.add(key)
      }
    }
  }

  return walls
}

// Spiral Maze
export function generateSpiral(rows, cols, start, goal) {
  const walls = new Set()
  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)

  let top = 1
  let bottom = rows - 2
  let left = 1
  let right = cols - 2

  while (top < bottom && left < right) {
    for (let c = left; c <= right; c++) {
      const k = cellKey(top, c)
      if (k !== startKey && k !== goalKey && c !== right - 1) walls.add(k)
    }
    top += 2

    for (let r = top - 1; r <= bottom; r++) {
      const k = cellKey(r, right)
      if (k !== startKey && k !== goalKey && r !== bottom - 1) walls.add(k)
    }
    right -= 2

    for (let c = right + 1; c >= left; c--) {
      const k = cellKey(bottom, c)
      if (k !== startKey && k !== goalKey && c !== left + 1) walls.add(k)
    }
    bottom -= 2

    for (let r = bottom + 1; r >= top; r--) {
      const k = cellKey(r, left)
      if (k !== startKey && k !== goalKey && r !== top + 1) walls.add(k)
    }
    left += 2
  }

  return walls
}

// Generate Terrain Weights (Mud = cost 4, Water = cost 8)
export function generateTerrainWeights(rows, cols, start, goal, walls) {
  const weights = new Map()
  const startKey = cellKey(start.row, start.column)
  const goalKey = cellKey(goal.row, goal.column)

  // Create a couple of muddy swamps
  const mudCenters = [
    { r: Math.floor(rows * 0.35), c: Math.floor(cols * 0.45), radius: 3 },
    { r: Math.floor(rows * 0.7), c: Math.floor(cols * 0.65), radius: 2.5 }
  ]

  // Create a river barrier
  const riverCol = Math.floor(cols * 0.52)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = cellKey(r, c)
      if (walls.has(key) || key === startKey || key === goalKey) continue

      // River
      if (c === riverCol || c === riverCol + 1) {
        if (r !== Math.floor(rows * 0.25) && r !== Math.floor(rows * 0.75)) {
          weights.set(key, 8) // Water
          continue
        }
      }

      // Mud patches
      for (const center of mudCenters) {
        const dist = Math.hypot(r - center.r, c - center.c)
        if (dist <= center.radius) {
          weights.set(key, 4) // Mud
          break
        }
      }
    }
  }

  return weights
}

