function RiskInsightsPanel({ insights, loading, error, onGenerate }) {
  return (
    <section className="insights-layout">
      <header className="insights-header">
        <div>
          <h2>Risk Insights</h2>
          <p>
            Generate Gemini analysis from the last 30 days of incident data.
          </p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Generate 30-Day Analysis"}
        </button>
      </header>

      {error && <p className="error-text">{error}</p>}

      {!insights && !loading && !error && (
        <p className="muted-text">
          No analysis loaded yet. Generate a report to view patterns.
        </p>
      )}

      {insights && (
        <article className="insight-card">
          <p className="eyebrow">
            {insights.incidents_analyzed} incidents analyzed
          </p>
          <h3>{insights.headline}</h3>
          <p>{insights.analysis}</p>

          <div className="insight-columns">
            <section>
              <h4>High-Risk Patterns</h4>
              <ul>
                {(insights.high_risk_patterns || []).map((pattern) => (
                  <li key={pattern}>{pattern}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>Recommended Actions</h4>
              <ul>
                {(insights.recommendations || []).map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      )}
    </section>
  );
}

export default RiskInsightsPanel;
