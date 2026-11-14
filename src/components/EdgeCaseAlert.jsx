export default function EdgeCaseAlert({ result, onDismiss }) {
  if (!result || result.found) return null

  return (
    <div className="edge-case-alert" role="alert">
      <div className="alert-icon">⚠️</div>
      <div className="alert-body">
        <h4 className="alert-title">No Valid Path Found</h4>
        <p className="alert-desc">
          The search finished without reaching the goal node.
        </p>
        <ul className="alert-diagnostics">
          <li>
            <strong>Explored nodes:</strong> {result.explored?.length ?? 0}
          </li>
          <li>
            <strong>Reason:</strong> The goal or start node is completely surrounded by walls.
          </li>
          <li>
            <strong>Suggestion:</strong> Remove walls blocking the path, reposition start/goal, or enable diagonal movement.
          </li>
        </ul>
      </div>
      {onDismiss && (
        <button className="alert-close" onClick={onDismiss} aria-label="Close alert">
          ✕
        </button>
      )}
    </div>
  )
}
