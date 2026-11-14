// Binary Min-Heap Priority Queue for Dijkstra and A*
export class PriorityQueue {
  constructor() {
    this.heap = []
  }

  size() {
    return this.heap.length
  }

  isEmpty() {
    return this.heap.length === 0
  }

  peek() {
    return this.heap[0] ?? null
  }

  push(element, priority) {
    const node = { element, priority }
    this.heap.push(node)
    this._bubbleUp(this.heap.length - 1)
  }

  pop() {
    if (this.isEmpty()) return null
    const root = this.heap[0]
    const last = this.heap.pop()
    if (!this.isEmpty()) {
      this.heap[0] = last
      this._sinkDown(0)
    }
    return root
  }

  _bubbleUp(index) {
    let currentIndex = index
    const node = this.heap[currentIndex]

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2)
      const parent = this.heap[parentIndex]

      if (node.priority >= parent.priority) break

      this.heap[currentIndex] = parent
      currentIndex = parentIndex
    }
    this.heap[currentIndex] = node
  }

  _sinkDown(index) {
    let currentIndex = index
    const length = this.heap.length
    const node = this.heap[currentIndex]

    while (true) {
      const leftChildIndex = 2 * currentIndex + 1
      const rightChildIndex = 2 * currentIndex + 2
      let swapIndex = null
      let minPriority = node.priority

      if (leftChildIndex < length) {
        const leftChild = this.heap[leftChildIndex]
        if (leftChild.priority < minPriority) {
          minPriority = leftChild.priority
          swapIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.heap[rightChildIndex]
        if (rightChild.priority < minPriority) {
          swapIndex = rightChildIndex
        }
      }

      if (swapIndex === null) break

      this.heap[currentIndex] = this.heap[swapIndex]
      currentIndex = swapIndex
    }
    this.heap[currentIndex] = node
  }
}

