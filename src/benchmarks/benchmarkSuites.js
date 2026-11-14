import { cellKey } from '../algorithms/pathfinding.js'

export const BENCHMARK_MAPS = [
  {
    id: 'open-plains',
    name: '01. Open Plains',
    description: 'Empty grid measuring pure expansion speed and baseline branching factor',
    category: 'Baseline',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 2 },
    goal: { row: 7, column: 19 },
    generate: () => ({ walls: new Set(), weights: new Map() })
  },
  {
    id: 'center-pillar',
    name: '02. Center Monolith',
    description: 'Single large rectangular obstacle testing wavefront splitting',
    category: 'Obstacle',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 3 },
    goal: { row: 7, column: 18 },
    generate: () => {
      const walls = new Set()
      for (let r = 4; r <= 9; r++) {
        for (let c = 9; c <= 12; c++) {
          walls.add(cellKey(r, c))
        }
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'single-chokepoint',
    name: '03. Single Chokepoint Wall',
    description: 'Full vertical wall with a single 1-cell aperture at center',
    category: 'Chokepoint',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 3 },
    goal: { row: 7, column: 18 },
    generate: (rows, cols) => {
      const walls = new Set()
      const midCol = Math.floor(cols / 2)
      for (let r = 0; r < rows; r++) {
        if (r !== 7) walls.add(cellKey(r, midCol))
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'dual-gates',
    name: '04. Dual Gateways',
    description: 'Vertical wall with top and bottom gates testing symmetric route choice',
    category: 'Chokepoint',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 3 },
    goal: { row: 7, column: 18 },
    generate: (rows, cols) => {
      const walls = new Set()
      const midCol = Math.floor(cols / 2)
      for (let r = 0; r < rows; r++) {
        if (r !== 2 && r !== rows - 3) walls.add(cellKey(r, midCol))
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'bottleneck-funnel',
    name: '05. Bottleneck Funnel',
    description: 'Funnel narrowing into a tight 1-cell corridor',
    category: 'Chokepoint',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 2 },
    goal: { row: 7, column: 19 },
    generate: (rows) => {
      const walls = new Set()
      for (let c = 6; c <= 12; c++) {
        const topLimit = Math.floor(6 - (c - 6) * 0.7)
        const botLimit = Math.floor(8 + (c - 6) * 0.7)
        for (let r = 0; r <= topLimit; r++) walls.add(cellKey(r, c))
        for (let r = botLimit; r < rows; r++) walls.add(cellKey(r, c))
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 's-corridor',
    name: '06. Classic S-Corridor',
    description: 'Winding path with two alternating horizontal barrier walls',
    category: 'Maze',
    rows: 14,
    cols: 22,
    start: { row: 2, column: 2 },
    goal: { row: 11, column: 19 },
    generate: (_rows, cols) => {
      const walls = new Set()
      for (let c = 0; c < cols - 4; c++) walls.add(cellKey(4, c))
      for (let c = 4; c < cols; c++) walls.add(cellKey(9, c))
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'double-s-curve',
    name: '07. Triple Slalom Maze',
    description: 'Three alternating barriers creating high exploration overhead for BFS',
    category: 'Maze',
    rows: 14,
    cols: 22,
    start: { row: 1, column: 2 },
    goal: { row: 12, column: 2 },
    generate: (_rows, cols) => {
      const walls = new Set()
      for (let c = 0; c < cols - 4; c++) walls.add(cellKey(3, c))
      for (let c = 4; c < cols; c++) walls.add(cellKey(7, c))
      for (let c = 0; c < cols - 4; c++) walls.add(cellKey(10, c))
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'horseshoe-trap',
    name: '08. Horseshoe Cul-de-Sac (Local Minima)',
    description: 'Deep concave U-cup trapping greedy heuristics toward the goal',
    category: 'Heuristic Trap',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 3 },
    goal: { row: 7, column: 14 },
    generate: () => {
      const walls = new Set()
      for (let r = 3; r <= 11; r++) walls.add(cellKey(r, 16))
      for (let c = 8; c <= 16; c++) walls.add(cellKey(3, c))
      for (let c = 8; c <= 16; c++) walls.add(cellKey(11, c))
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'double-horseshoe',
    name: '09. Double Nested Cup',
    description: 'Two interlocking concave barriers forcing massive backtracking',
    category: 'Heuristic Trap',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 2 },
    goal: { row: 7, column: 19 },
    generate: () => {
      const walls = new Set()
      for (let r = 2; r <= 11; r++) walls.add(cellKey(r, 10))
      for (let c = 5; c <= 10; c++) {
        walls.add(cellKey(2, c))
        walls.add(cellKey(11, c))
      }
      for (let r = 3; r <= 10; r++) walls.add(cellKey(r, 13))
      for (let c = 13; c <= 17; c++) {
        walls.add(cellKey(3, c))
        walls.add(cellKey(10, c))
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'dense-clutter',
    name: '10. Dense Asteroid Field (30% Obstacles)',
    description: 'Pseudo-random high density obstacle field with deterministic seed',
    category: 'Clutter',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 2 },
    goal: { row: 7, column: 19 },
    generate: (rows, cols) => {
      const walls = new Set()
      for (let r = 0; r < rows; r++) {
        for (let c = 3; c < cols - 3; c++) {
          if (((r * 31 + c * 17 + 7) % 100) < 32) {
            walls.add(cellKey(r, c))
          }
        }
      }
      walls.delete(cellKey(7, 2))
      walls.delete(cellKey(7, 3))
      walls.delete(cellKey(7, 18))
      walls.delete(cellKey(7, 19))
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'sparse-clutter',
    name: '11. Sparse Obstacle Field (15% Obstacles)',
    description: 'Light scattering of obstacles testing direct path deviation',
    category: 'Clutter',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 2 },
    goal: { row: 7, column: 19 },
    generate: (rows, cols) => {
      const walls = new Set()
      for (let r = 0; r < rows; r++) {
        for (let c = 3; c < cols - 3; c++) {
          if (((r * 47 + c * 29 + 13) % 100) < 16) {
            walls.add(cellKey(r, c))
          }
        }
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'diagonal-slits',
    name: '12. Diagonal Louvers',
    description: 'Slanted barrier teeth testing stair-stepping behavior',
    category: 'Geometry',
    rows: 14,
    cols: 22,
    start: { row: 2, column: 2 },
    goal: { row: 11, column: 19 },
    generate: () => {
      const walls = new Set()
      for (let i = 0; i < 9; i++) {
        walls.add(cellKey(i + 2, i + 4))
        walls.add(cellKey(i + 3, i + 9))
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'mud-swamp-highway',
    name: '13. Mud Swamp vs Clean Highway',
    description: 'High cost terrain in direct line: tests if weighted algorithms go around',
    category: 'Terrain Cost',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 2 },
    goal: { row: 7, column: 19 },
    generate: () => {
      const weights = new Map()
      for (let r = 4; r <= 10; r++) {
        for (let c = 7; c <= 14; c++) {
          weights.set(cellKey(r, c), 6)
        }
      }
      return { walls: new Set(), weights }
    }
  },
  {
    id: 'river-crossing',
    name: '14. River with Single Wooden Bridge',
    description: 'Water barrier (cost 12) with one zero-cost bridge crossing',
    category: 'Terrain Cost',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 3 },
    goal: { row: 7, column: 18 },
    generate: (rows) => {
      const weights = new Map()
      const midCol = 11
      for (let r = 0; r < rows; r++) {
        if (r !== 7) {
          weights.set(cellKey(r, midCol), 12)
          weights.set(cellKey(r, midCol + 1), 12)
        }
      }
      return { walls: new Set(), weights }
    }
  },
  {
    id: 'shortcut-dilemma',
    name: '15. Short Muddy Cut vs Long Free Bypass',
    description: 'Tests cost-benefit trade-off between step count and edge weight',
    category: 'Terrain Cost',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 2 },
    goal: { row: 7, column: 19 },
    generate: () => {
      const walls = new Set()
      const weights = new Map()
      for (let c = 5; c <= 16; c++) {
        walls.add(cellKey(4, c))
        walls.add(cellKey(10, c))
      }
      for (let c = 6; c <= 15; c++) {
        weights.set(cellKey(7, c), 5)
      }
      return { walls, weights }
    }
  },
  {
    id: 'checkerboard',
    name: '16. Checkerboard Permeable Mesh',
    description: 'Alternating lattice creating dense micro-branching paths',
    category: 'Geometry',
    rows: 14,
    cols: 22,
    start: { row: 1, column: 2 },
    goal: { row: 12, column: 19 },
    generate: (rows, cols) => {
      const walls = new Set()
      for (let r = 2; r < rows - 2; r++) {
        for (let c = 4; c < cols - 4; c++) {
          if ((r + c) % 2 === 0 && (r * c) % 3 !== 0) {
            walls.add(cellKey(r, c))
          }
        }
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'spiral-labyrinth',
    name: '17. Spiral Labyrinth',
    description: 'Centripetal spiral forcing maximum geodesic distance',
    category: 'Maze',
    rows: 14,
    cols: 22,
    start: { row: 2, column: 2 },
    goal: { row: 7, column: 11 },
    generate: () => {
      const walls = new Set()
      for (let c = 1; c <= 20; c++) walls.add(cellKey(1, c))
      for (let r = 1; r <= 12; r++) walls.add(cellKey(r, 20))
      for (let c = 3; c <= 20; c++) walls.add(cellKey(12, c))
      for (let r = 3; r <= 12; r++) walls.add(cellKey(r, 3))
      for (let c = 3; c <= 18; c++) walls.add(cellKey(3, c))
      for (let r = 3; r <= 10; r++) walls.add(cellKey(r, 18))
      for (let c = 5; c <= 18; c++) walls.add(cellKey(10, c))
      for (let r = 5; r <= 10; r++) walls.add(cellKey(r, 5))
      for (let c = 5; c <= 16; c++) walls.add(cellKey(5, c))
      for (let r = 5; r <= 8; r++) walls.add(cellKey(r, 16))
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'four-rooms',
    name: '18. Four Quadrant Dungeon',
    description: 'Four connected chambers with single inter-doorways',
    category: 'Maze',
    rows: 14,
    cols: 22,
    start: { row: 3, column: 4 },
    goal: { row: 10, column: 17 },
    generate: (rows, cols) => {
      const walls = new Set()
      const midR = 7
      const midC = 11
      for (let r = 0; r < rows; r++) {
        if (r !== 3 && r !== 10) walls.add(cellKey(r, midC))
      }
      for (let c = 0; c < cols; c++) {
        if (c !== 5 && c !== 16) walls.add(cellKey(midR, c))
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'zig-zag-pillars',
    name: '19. Alternating Pillar Slalom',
    description: 'Alternating staggered pillars creating a serpentine search pattern',
    category: 'Geometry',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 1 },
    goal: { row: 7, column: 20 },
    generate: (rows) => {
      const walls = new Set()
      const colsPillars = [4, 8, 12, 16]
      colsPillars.forEach((c, idx) => {
        if (idx % 2 === 0) {
          for (let r = 0; r < rows - 4; r++) walls.add(cellKey(r, c))
        } else {
          for (let r = 4; r < rows; r++) walls.add(cellKey(r, c))
        }
      })
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'trapped-goal-edgecase',
    name: '20. Sealed Vault (No Valid Path)',
    description: 'Edge case: Goal node is completely surrounded by an impenetrable 360° wall',
    category: 'Edge Case',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 3 },
    goal: { row: 7, column: 16 },
    generate: () => {
      const walls = new Set()
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          walls.add(cellKey(7 + dr, 16 + dc))
        }
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'trapped-start-edgecase',
    name: '21. Trapped Start Capsule',
    description: 'Edge case: Start node is enclosed in a tight isolation box',
    category: 'Edge Case',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 4 },
    goal: { row: 7, column: 18 },
    generate: () => {
      const walls = new Set()
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          walls.add(cellKey(7 + dr, 4 + dc))
        }
      }
      return { walls, weights: new Map() }
    }
  },
  {
    id: 'identical-nodes',
    name: '22. Coincident Start & Goal (Zero Distance)',
    description: 'Edge case: Start and Goal at the exact same location (cost 0, length 0)',
    category: 'Edge Case',
    rows: 14,
    cols: 22,
    start: { row: 7, column: 11 },
    goal: { row: 7, column: 11 },
    generate: () => ({ walls: new Set(), weights: new Map() })
  }
]
