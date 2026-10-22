export function EmptyState({ title, body }) {
  return (
    <div className="card-surface p-8 text-center">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card-surface p-6 text-center" role="alert">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button className="mt-3 text-sm font-medium text-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
