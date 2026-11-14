class AudioEngine {
  constructor() {
    this.ctx = null
    this.enabled = false
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
  }

  toggleSound(enable) {
    this.enabled = enable
    if (enable && !this.ctx) {
      this.init()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playStep(pitchRatio = 1) {
    if (!this.enabled || !this.ctx) return
    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      const freq = 220 + Math.min(pitchRatio * 440, 880)
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.05)
    } catch {
      // Audio errors safely ignored
    }
  }

  playSuccess() {
    if (!this.enabled || !this.ctx) return
    try {
      const now = this.ctx.currentTime
      const notes = [440, 554.37, 659.25, 880] // A major arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.07)

        gain.gain.setValueAtTime(0.04, now + idx * 0.07)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.3)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + idx * 0.07)
        osc.stop(now + idx * 0.07 + 0.35)
      })
    } catch {
      // safely ignored
    }
  }

  playFailure() {
    if (!this.enabled || !this.ctx) return
    try {
      const now = this.ctx.currentTime
      const notes = [311.13, 293.66, 277.18] // Diminishing dissonance
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)

        gain.gain.setValueAtTime(0.03, now + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.25)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.28)
      })
    } catch {
      // safely ignored
    }
  }
}

export const sound = new AudioEngine()

