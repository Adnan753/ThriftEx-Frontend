const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}

// ── Costs ──────────────────────────────────────────────────────────────────
// Syncs latest AWS costs into DB and returns raw daily rows
export const syncCosts      = ()       => req('/api/costs/fetch');
// Read-only summary from DB: { current_month, previous_month, percent_change, forecast, top_spenders }
export const getCostSummary = ()       => req('/api/costs/analysis');

// ── Analysis ───────────────────────────────────────────────────────────────
// Returns { data: { raw: summary, ai: { summary, insights, recommendations } } }
export const getAIAnalysis  = ()       => req('/api/analysis/ai');

// ── Recommendations ────────────────────────────────────────────────────────
// Generates via Claude + saves to DB → { count, recommendations[] }
export const generateRecs   = ()       => req('/api/agent/recommend', { method: 'POST' });
// List pending from DB → { count, data: [{ id, service, action, priority, estimated_saving, reasoning, status }] }
export const getRecommendations = ()   => req('/api/agent/recommendations');
export const approveRec     = (id)     => req(`/api/agent/recommendations/${id}/approve`, { method: 'POST' });
export const rejectRec      = (id)     => req(`/api/agent/recommendations/${id}/reject`, { method: 'POST' });

// ── Agent (proxied to Python FastAPI) ──────────────────────────────────────
// Multi-step LLM analysis → { data: { raw_summary, agent_analysis: { summary, insights, recommendations } } }
export const runAgentAnalysis = (goal) => req(`/api/agent/analyze${goal ? `?goal=${encodeURIComponent(goal)}` : ''}`);
// Anomaly detection → { data: { anomalies: [{ date, cost, z_score, severity, type }], stats } }
export const getAnomalies   = ()       => req('/api/agent/anomalies');
// Forecast → { data: { forecast: [{ date, predicted, lower, upper }], summary } }
export const getForecast    = (days = 30) => req(`/api/agent/forecast?days=${days}`);

// ── Resources ──────────────────────────────────────────────────────────────
// Discovers from AWS → { data: { ec2[], rds[], s3[], summary } }
export const discoverResources = ()    => req('/api/resources/discover');

// ── Goals ──────────────────────────────────────────────────────────────────
export const getGoals       = ()       => req('/api/goals');
export const createGoal     = (title, target_percentage) => req('/api/goals', {
  method: 'POST',
  body: JSON.stringify({ title, target_percentage: Number(target_percentage) }),
});
export const achieveGoal    = (id)     => req(`/api/goals/${id}/achieve`, { method: 'POST' });
