const STAT_CONFIG = [
  { key: "total", label: "Total Incidents" },
  { key: "active", label: "Active" },
  { key: "responding", label: "Responding" },
  { key: "resolved", label: "Resolved" },
  { key: "today", label: "Today" },
];

function StatsBar({ stats }) {
  return (
    <section className="stats-bar" aria-label="Incident stats">
      {STAT_CONFIG.map((item) => (
        <article className="stat-tile" key={item.key}>
          <p>{item.label}</p>
          <strong className={item.key === "active" ? "active" : ""}>
            {stats[item.key] ?? 0}
          </strong>
        </article>
      ))}
    </section>
  );
}

export default StatsBar;
