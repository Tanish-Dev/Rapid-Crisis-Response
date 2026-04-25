const TYPE_LABELS = {
  medical: "Medical",
  fire: "Fire",
  security: "Security",
  distress: "Distress",
};

const STATUS_LABELS = {
  active: "Active",
  responding: "Responding",
  resolved: "Resolved",
};

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "Unknown time";
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getBriefPayload(brief) {
  if (!brief) {
    return {
      summary: "Generating Gemini brief...",
      actions: [],
    };
  }

  if (typeof brief === "string") {
    return {
      summary: brief,
      actions: [],
    };
  }

  const actions = Array.isArray(brief.recommended_actions)
    ? brief.recommended_actions.filter(Boolean).slice(0, 3)
    : [];

  return {
    summary: brief.summary || "No summary available.",
    actions,
  };
}

function AlertCard({ alert, onAcknowledge, isAcknowledgePending }) {
  const brief = getBriefPayload(alert.gemini_brief);

  return (
    <article className={`alert-card tone-${alert.type}`}>
      <header className="alert-card-header">
        <div>
          <p className="alert-type">{TYPE_LABELS[alert.type] || "Incident"}</p>
          <h3>Room {alert.room}</h3>
        </div>
        <span className={`status-pill status-${alert.status}`}>
          {STATUS_LABELS[alert.status] || "Active"}
        </span>
      </header>

      <p className="alert-meta">Device: {alert.device_name}</p>
      <p className="alert-meta">
        Triggered: {formatTimestamp(alert.timestamp)}
      </p>

      <section className="brief-panel">
        <h4>Situation Brief</h4>
        <p>{brief.summary}</p>
        {brief.actions.length > 0 && (
          <ul>
            {brief.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        )}
      </section>

      <footer className="alert-footer">
        {alert.status === "active" && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => onAcknowledge(alert.id)}
            disabled={isAcknowledgePending}
          >
            {isAcknowledgePending ? "Acknowledging..." : "Acknowledge"}
          </button>
        )}

        {alert.status !== "active" && (
          <p className="ack-meta">
            {alert.acknowledged_by
              ? `Acknowledged by ${alert.acknowledged_by}`
              : "Acknowledged"}
          </p>
        )}
      </footer>
    </article>
  );
}

export default AlertCard;
