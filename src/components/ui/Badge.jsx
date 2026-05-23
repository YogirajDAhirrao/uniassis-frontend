import './Badge.css';

export default function Badge({ type, children }) {
  return (
    <span className={`badge badge-${type}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}
