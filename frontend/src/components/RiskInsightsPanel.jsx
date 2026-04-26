function RiskInsightsPanel({ insights, loading, error, onGenerate }) {
  return (
    <section className="insights-layout">
      <header className="insights-header">
        <div>
          <h2>Risk Insights</h2>
          <p className="subtitle">
            Generate Gemini analysis from the last 30 days of incident data.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onGenerate}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" y1="5" x2="22" y2="5"></line><line x1="19" y1="2" x2="19" y2="8"></line><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
          {loading ? "Analyzing..." : "Generate 30-Day Analysis"}
        </button>
      </header>

      {error && <p className="error-text">{error}</p>}

      {!insights && !loading && !error && (
        <div className="empty-state">
          <svg className="empty-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p>No analysis loaded yet. Generate a report to view patterns.</p>
        </div>
      )}

      {insights && (
        <article className="insight-card">
          <div className="insight-card-header">
            <span className="category-label type-security" style={{alignSelf: "flex-start"}}>
              {insights.incidents_analyzed} INCIDENTS ANALYZED
            </span>
            <h3>{insights.headline}</h3>
          </div>

          <div className="ai-summary-box" style={{marginBottom: '0', padding: '1.5rem'}}>
            <span className="sparkle-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 0L13 8.5L21.5 10L13 11.5L11.5 20L10 11.5L1.5 10L10 8.5L11.5 0Z"/></svg>
            </span>
            <div className="summary-text">
              <p style={{fontSize: '0.95rem'}}>{insights.analysis}</p>
            </div>
          </div>

          <div className="insight-columns">
            <section>
              <h4>High-Risk Patterns</h4>
              <ul className="custom-list">
                {(insights.high_risk_patterns || []).map((pattern) => (
                  <li key={pattern}>{pattern}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>Recommended Actions</h4>
              <ul className="custom-list">
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
