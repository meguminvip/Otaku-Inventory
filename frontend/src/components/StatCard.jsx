/**
 * Author: A.R.O.N.A
 */

export default function StatCard({ icon, value, label, hint, onClick }) {
  if (onClick) {
    return (
      <button type="button" className="stat-card stat-card-link panel-card" onClick={onClick}>
        <span className="stat-icon">{icon}</span>
        <strong>{value}</strong>
        <span>{label}</span>
        {hint ? <span className="stat-link-hint">{hint}</span> : null}
      </button>
    );
  }

  return (
    <div className="stat-card panel-card">
      <span className="stat-icon">{icon}</span>
      <strong>{value}</strong>
      <span>{label}</span>
      {hint ? <span className="stat-link-hint">{hint}</span> : null}
    </div>
  );
}
