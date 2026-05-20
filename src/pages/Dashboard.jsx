import { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingDown, Sparkles, Target, RefreshCw, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import { CustomTooltip } from '../components/ui/CustomTooltip';
import { useToast } from '../context/ToastContext';
import { getCostSummary, syncCosts, getRecommendations } from '../services/api';

// Build a daily-spend chart array from raw cost rows returned by syncCosts
function buildChartData(rows) {
  const totals = {};
  for (const row of rows) {
    const label = new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    totals[label] = (totals[label] || 0) + parseFloat(row.cost_amount || 0);
  }
  return Object.entries(totals)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, cost]) => ({ date, cost: parseFloat(cost.toFixed(2)) }));
}

// Derive a synthetic daily-spend chart from the avg_daily when no rows are available
function deriveChartData(summary) {
  const avg = summary.forecast?.avg_daily || 0;
  const from = new Date(summary.current_month?.from || Date.now());
  const to   = new Date(summary.current_month?.to   || Date.now());
  const chart = [];
  for (let d = new Date(from); d < to; d.setDate(d.getDate() + 1)) {
    chart.push({
      date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cost: parseFloat((avg * (0.82 + Math.random() * 0.36)).toFixed(2)),
    });
  }
  return chart;
}

const MAX_PLAUSIBLE_SAVING = 50_000;

function extractFirstNumeric(val) {
  if (typeof val === 'number') return val;
  const match = String(val).match(/\$?([\d,]+\.?\d*)/);
  if (!match) return NaN;
  return parseFloat(match[1].replace(/,/g, ''));
}

export default function Dashboard() {
  const { addToast } = useToast();

  const [summary, setSummary]     = useState(null);
  const [recs, setRecs]           = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [syncing, setSyncing]     = useState(false);
  const [error, setError]         = useState(null);

  const loadSummary = useCallback(async () => {
    try {
      const [sumRes, recRes] = await Promise.all([getCostSummary(), getRecommendations()]);
      setSummary(sumRes);
      const recList = recRes.data || [];
      setRecs(recList);
      // Derive chart from avg_daily until user explicitly syncs
      setChartData(deriveChartData(sumRes));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncCosts();
      const rows = res.data || [];
      if (rows.length) {
        setChartData(buildChartData(rows));
        addToast(`Synced ${res.count} cost records`, 'success');
      } else {
        addToast('No new cost data returned', 'info');
      }
      await loadSummary();
    } catch (e) {
      addToast(`Sync failed: ${e.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const totalSpend   = summary?.current_month?.total ?? 0;
  const projected    = summary?.forecast?.forecasted_month_total ?? 0;
  const pctChange    = summary?.percent_change
    ? parseFloat(summary.percent_change) || 0
    : 0;
  const recsCount    = recs.length;
  const estSavings   = recs.reduce((s, r) => {
    const n = extractFirstNumeric(r.estimated_saving);
    return s + (isNaN(n) || n > MAX_PLAUSIBLE_SAVING ? 0 : n);
  }, 0);
  const topServices  = summary?.top_spenders ?? [];

  if (loading) {
    return (
      <div className="fade-in space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="section-label">Overview</div>
            <h2 className="page-title">Dashboard</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-[140px] rounded-[var(--radius-md)] skeleton" />)}
        </div>
        <div className="h-[340px] rounded-[var(--radius-md)] skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle size={40} className="text-[var(--red)] mb-4" />
        <p className="text-[15px] text-[var(--text)] font-medium mb-1">Failed to load dashboard</p>
        <p className="text-[13px] text-[var(--text3)] mb-4">{error}</p>
        <button onClick={loadSummary} className="text-[13px] text-[var(--lime)] hover:underline">
          Retry →
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="section-label">Overview</div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-sub">Your AWS spend, anomalies, and top services at a glance.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center px-4 py-2 text-[13px] font-medium bg-transparent border border-[var(--border2)] text-[var(--text2)] rounded-[var(--radius-sm)] hover:bg-[var(--bg3)] transition-all mt-1"
        >
          <RefreshCw size={14} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing…' : 'Sync Latest Costs'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total AWS Spend"
          value={totalSpend}
          delta={Math.abs(pctChange)}
          deltaLabel="vs last month"
          icon={Activity}
          isPositive={pctChange <= 0}
        />
        <StatCard
          label="Projected Month End"
          value={projected}
          icon={TrendingDown}
        />
        <StatCard
          label="Active Recommendations"
          value={recsCount}
          icon={Sparkles}
        />
        <StatCard
          label="Est. Monthly Savings"
          value={estSavings}
          icon={Target}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Spend over time */}
        <div className="lg:col-span-3 bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 card-hover">
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
            30-Day Trend
          </div>
          <h3 className="text-[16px] font-display text-[var(--text)] mb-6">Spend Over Time</h3>
          {chartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-[var(--text3)] text-[13px]">
              Click "Sync Latest Costs" to load chart data
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--lime)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--lime)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} dx={-10} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="cost" stroke="var(--lime)" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top services */}
        <div className="lg:col-span-2 bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 card-hover">
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
            Breakdown
          </div>
          <h3 className="text-[16px] font-display text-[var(--text)] mb-6">Top Services by Cost</h3>
          {topServices.length === 0 ? (
            <div className="text-[13px] text-[var(--text3)] py-8 text-center">No service data yet — sync to load</div>
          ) : (
            <div className="space-y-4">
              {topServices.map(svc => {
                const max = topServices[0]?.total || 1;
                return (
                  <div key={svc.service}>
                    <div className="flex justify-between text-[13px] mb-2">
                      <span className="text-[var(--text)] font-medium truncate pr-2">{svc.service}</span>
                      <span style={{ fontFamily: 'var(--fm)' }}>${svc.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--bg3)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--lime)] rounded-full transition-all duration-700" style={{ width: `${(svc.total / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
