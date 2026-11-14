export default function PlaybackControls({
  playbackState,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onJumpStart,
  onJumpEnd,
  currentStep,
  totalSteps,
  speed,
  onSpeedChange,
  isInstant,
  onToggleInstant
}) {
  const isPlaying = playbackState === 'playing'
  const isFinished = playbackState === 'finished'

  return (
    <div className="playback-controls-card">
      <div className="playback-header">
        <span className="control-label">STEP CONTROLS</span>
        <span className="step-counter">
          Step {currentStep} / {totalSteps}
        </span>
      </div>

      <div className="playback-scrubber-row">
        <input
          type="range"
          min="0"
          max={Math.max(totalSteps, 1)}
          value={currentStep}
          onChange={(e) => {
            const val = Number(e.target.value)
            onPause()
            onJumpStart()
            for (let i = 0; i < val; i++) onStepForward()
          }}
          className="scrubber-slider"
          disabled={totalSteps === 0}
        />
      </div>

      <div className="playback-buttons-grid">
        <button
          className="btn-playback"
          title="Jump to Start"
          onClick={onJumpStart}
          disabled={currentStep === 0 || totalSteps === 0}
        >
          ⏮
        </button>
        <button
          className="btn-playback"
          title="Step Backward"
          onClick={onStepBackward}
          disabled={currentStep === 0 || totalSteps === 0}
        >
          ⏪
        </button>
        {isPlaying ? (
          <button
            className="btn-playback btn-playback-primary"
            title="Pause"
            onClick={onPause}
          >
            Pause
          </button>
        ) : (
          <button
            className="btn-playback btn-playback-primary"
            title="Play"
            onClick={onPlay}
            disabled={totalSteps === 0 || (isFinished && currentStep >= totalSteps)}
          >
            Play
          </button>
        )}
        <button
          className="btn-playback"
          title="Step Forward"
          onClick={onStepForward}
          disabled={currentStep >= totalSteps || totalSteps === 0}
        >
          ⏩
        </button>
        <button
          className="btn-playback"
          title="Jump to End"
          onClick={onJumpEnd}
          disabled={currentStep >= totalSteps || totalSteps === 0}
        >
          ⏭
        </button>
      </div>

      <div className="speed-control-row">
        <div className="speed-group">
          <label htmlFor="speed-select">Speed:</label>
          <select
            id="speed-select"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            disabled={isInstant}
            className="speed-dropdown"
          >
            <option value={100}>0.25x</option>
            <option value={50}>0.5x</option>
            <option value={20}>1.0x</option>
            <option value={8}>2.5x</option>
            <option value={2}>5.0x</option>
          </select>
        </div>

        <label className="checkbox-instant">
          <input
            type="checkbox"
            checked={isInstant}
            onChange={(e) => onToggleInstant(e.target.checked)}
          />
          <span>Instant</span>
        </label>
      </div>
    </div>
  )
}
