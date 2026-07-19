function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div
        className="spinner-sm"
        style={{
          width: '36px',
          height: '36px',
          borderColor: 'var(--border)',
          borderTopColor: 'var(--primary)',
        }}
      />
      <p>{message}</p>
    </div>
  );
}

export default PageLoader;
