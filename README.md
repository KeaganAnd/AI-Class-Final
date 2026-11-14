# Search Algorithm Visualizer

AI Class Final Project

**Authors:**
- Anjaliben Ghanshyambhai Valand
- Keagan Anderson

## Overview
This project is an interactive pathfinding and search algorithm visualizer built with React and Vite. It allows you to visualize and compare different graph search algorithms on customizable grid maps with obstacles, weights, and mazes.

## Algorithms
- **Breadth-First Search (BFS)** - Finds the shortest path on unweighted graphs.
- **Depth-First Search (DFS)** - Explores deeply along branches before backtracking.
- **Dijkstra's Algorithm** - Finds the lowest-cost path using a min-heap priority queue.
- **A\* Search** - Uses heuristics ($f = g + h$) with support for Manhattan, Euclidean, Octile, and Chebyshev distances.
- **Greedy Best-First Search** - Expands nodes based solely on the heuristic.
- **Bidirectional BFS** - Expands simultaneously from both start and goal nodes.

## Features
- **Playback Controls**: Step-by-step playback, pause, resume, step forward/backward, scrubber slider, and speed control.
- **Grid Editing**: Click and drag to place walls, mud (weight 4), water (weight 8), and erase. Move start and goal nodes.
- **Maze Generation**: Recursive division, random clutter, cellular caves, and spirals.
- **Algorithm Comparison**: Dual split-screen view to race two algorithms side-by-side.
- **22-Map Benchmark Suite**: Automated testing across 22 maps (chokepoints, mazes, edge cases, traps) with stats and CSV export.
- **Edge Case Detection**: Clear feedback when a goal is completely blocked or unreachable.
- **Sound Effects**: Optional audio cues during search and on path completion.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173/` in your browser.

To build:
```bash
npm run build
```

To run lint:
```bash
npm run lint
```
