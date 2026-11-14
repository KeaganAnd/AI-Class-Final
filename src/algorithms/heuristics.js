export const Heuristics = {
  manhattan: (cell, goal) => {
    return Math.abs(cell.row - goal.row) + Math.abs(cell.column - goal.column)
  },
  euclidean: (cell, goal) => {
    const dr = cell.row - goal.row
    const dc = cell.column - goal.column
    return Math.hypot(dr, dc)
  },
  octile: (cell, goal) => {
    const dr = Math.abs(cell.row - goal.row)
    const dc = Math.abs(cell.column - goal.column)
    const F = Math.SQRT2 - 1
    return dr < dc ? F * dr + dc : F * dc + dr
  },
  chebyshev: (cell, goal) => {
    return Math.max(Math.abs(cell.row - goal.row), Math.abs(cell.column - goal.column))
  }
}

