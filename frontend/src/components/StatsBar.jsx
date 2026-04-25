const STAT_CONFIG = [
  { key: "total", label: "Total Incidents", tone: "neutral" },
  { key: "active", label: "Active", tone: "critical" },
  { key: "responding", label: "Responding", tone: "warning" },
  { key: "resolved", label: "Resolved", tone: "success" },
  { key: "today", label: "Today", tone: "info" },
];

function StatsBar({ stats }) {
  return (
    <section className="stats-bar" aria-label="Incident stats">
      {STAT_CONFIG.map((item) => (
        <article className={`stat-tile tone-${item.tone}`} key={item.key}>
          <p>{item.label}</p>
          <strong>{stats[item.key] ?? 0}</strong>
        </article>
      ))}
    </section>
  );
}

export default StatsBar;
