function EmptyState({ icon = '📭', title, message, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state-enhanced">
      <div className="empty-state-illustration" aria-hidden="true">{icon}</div>
      {title && <h3>{title}</h3>}
      <p>{message}</p>
      {actionLabel && (
        actionTo ? (
          <a href={actionTo} className="btn btn-primary">{actionLabel}</a>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
        )
      )}
    </div>
  );
}

export default EmptyState;
