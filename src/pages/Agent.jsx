import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Download, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PillBadge } from '../components/ui/PillBadge';
import { CustomTooltip } from '../components/ui/CustomTooltip';
import { runAgentAnalysis, getAnomalies, getForecast } from '../services/api';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ── Analyze Tab ────────────────────────────────────────────────────────────
function AnalyzeTab() {
  const [inputVal, setInputVal] = useState('');
  const [logs, setLogs]         = useState([
    '> ThriftEx Agent initialized.',
    '> Ready to analyze cost patterns and run queries.',
  ]);
  const [running, setRunning]   = useState(false);
  const terminalRef             = useRef(null);

  const runAnalysis = async (e) => {
    e?.preventDefault();
    if (!inputVal.trim() || running) return;

    const goal = inputVal.trim();
    setRunning(true);
    setLogs(prev => [...prev, `> Executing: ${goal}`]);
    setInputVal('');

    try {
      setLogs(prev => [...prev, 'Connecting to agent…', 'Fetching cost data from Supabase…', 'Running multi-step LLM analysis…']);
      const res = await runAgentAnalysis(goal);
      const analysis = res.data?.agent_analysis ?? res.data ?? {};

      const lines = [];
      if (analysis.summary) lines.push(`[SUMMARY] ${analysis.summary}`);
      if (Array.isArray(analysis.insights)) {
        analysis.insights.forEach(ins =>
          lines.push(`[${ins.type?.toUpperCase() ?? 'INFO'}] ${ins.title}: ${ins.description}`)
        );
      }
      if (Array.isArray(analysis.recommendations)) {
        lines.push(`[SUCCESS] ${analysis.recommendations.length} optimization(s) identified.`);
        analysis.recommendations.forEach(r =>
          lines.push(`  • ${r.service} — ${r.action} (${r.priority} priority, est. ${r.estimated_saving})`)
        );
      }
      if (!lines.length) lines.push('[SUCCESS] Analysis complete — see Recommendations tab for results.');

      setLogs(prev => [...prev, ...lines]);
    } catch (e) {
      setLogs(prev => [...prev, `[ERROR] ${e.message}`]);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs, running]);

  return (
    <div className="space-y-4 fade-in">
      <form onSubmit={runAnalysis} className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Agent Command"
            placeholder="e.g. Find underutilized EC2 instances in us-east-1"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
        </div>
        <Button type="submit" loading={running}>
          <Play size={14} className="mr-2" /> Run Analysis
        </Button>
      </form>

      <div
        ref={terminalRef}
        className="bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 h-[400px] overflow-y-auto font-[var(--fm)] text-[13px] leading-relaxed"
      >
        {logs.map((log, i) => (
          <div
            key={i}
            className={
              log.includes('[SUCCESS]') ? 'text-[var(--lime)]' :
              log.includes('[ERROR]')   ? 'text-[var(--red)]' :
              log.includes('[WARNING]') ? 'text-[var(--warning)]' :
              log.includes('[SUMMARY]') ? 'text-[var(--text)]' :
              'text-[var(--text2)]'
            }
          >
            {log}
          </div>
        ))}
        {running && (
          <div className="mt-2 text-[var(--lime)]">
            Processing<span className="cursor-blink">_</span>
          </div>
        )}
        {!running && (
          <div className="mt-2 text-[var(--text3)]">
            <span className="cursor-blink">_</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Anomalies Tab ──────────────────────────────────────────────────────────
const SEVERITY_VARIANT = { high: 'rejected', medium: 'pending', low: 'info' };

function AnomaliesTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getAnomalies()
      .then(res => setData(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
      {[1,2,3].map(i => <div key={i} className="h-[160px] rounded-[var(--radius-md)] skeleton" />)}
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <AlertCircle size={36} className="text-[var(--red)] mb-3" />
      <p className="text-[14px] text-[var(--text)] font-medium mb-1">Failed to load anomalies</p>
      <p className="text-[12px] text-[var(--text3)]">{error}</p>
    </div>
  );

  const anomalies = data?.anomalies ?? [];
  const stats     = data?.stats ?? {};

  return (
    <div className="space-y-4 fade-in">
      {/* Stats row */}
      {stats.total_days_analyzed > 0 && (
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Days Analyzed', value: stats.total_days_analyzed },
            { label: 'Mean Daily', value: `$${stats.mean_daily?.toFixed(2)}` },
            { label: 'Std Deviation', value: `$${stats.std_dev?.toFixed(2)}` },
          ].map(s => (
            <div key={s.label} className="bg-[var(--bg2)] border border-[var(--border)] px-4 py-2 rounded-[var(--radius-sm)] text-[12px]">
              <span className="text-[var(--text3)] mr-2">{s.label}:</span>
              <span className="text-[var(--text)] font-[var(--fm)]">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {anomalies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[var(--border3)] rounded-[var(--radius-lg)]">
          <p className="text-[15px] text-[var(--text)] font-medium mb-1">No anomalies detected</p>
          <p className="text-[13px] text-[var(--text3)]">Your cost patterns look normal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anomalies.map((anom, i) => (
            <Card key={i} className="border-l-4 border-l-[var(--red)] relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <PillBadge variant={SEVERITY_VARIANT[anom.severity] ?? 'info'}>{anom.severity}</PillBadge>
              </div>
              <h4 className="text-[14px] font-medium text-[var(--text)] mb-1">{anom.type === 'spike' ? '↑ Cost Spike' : '↓ Cost Drop'}</h4>
              <p className="text-[12px] text-[var(--text3)] mb-3">{anom.date}</p>
              <div className="text-[28px] font-[var(--fm)] text-[var(--red)] tracking-tight">
                ${anom.cost?.toFixed(2)}
              </div>
              <p className="text-[11px] text-[var(--text3)] mt-1">
                {anom.deviation_percentage > 0 ? '+' : ''}{anom.deviation_percentage}% from baseline · z-score {anom.z_score}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Forecast Tab ───────────────────────────────────────────────────────────
function ForecastTab() {
  const [days, setDays]       = useState(30);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async (d) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getForecast(d);
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(days); }, []);

  const forecast = data?.forecast ?? [];
  const summary  = data?.summary  ?? {};

  const chartData = forecast.map(f => ({
    date:      new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: parseFloat(f.predicted?.toFixed(2) ?? 0),
    lower:     parseFloat(f.lower?.toFixed(2) ?? 0),
    upper:     parseFloat(f.upper?.toFixed(2) ?? 0),
  }));

  const handleDaysChange = (d) => { setDays(d); load(d); };

  return (
    <Card className="fade-in" hover={false}>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-[16px] font-display text-[var(--text)]">Spend Forecast</h3>
          {summary.total_predicted > 0 && (
            <p className="text-[12px] text-[var(--text3)] mt-1">
              Predicted total: <span className="font-[var(--fm)] text-[var(--lime)]">${summary.total_predicted?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              {' '}· Avg daily: <span className="font-[var(--fm)] text-[var(--text)]">${summary.avg_predicted_daily?.toFixed(2)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {[30, 60, 90].map(d => (
            <button
              key={d}
              onClick={() => handleDaysChange(d)}
              className={`h-[30px] px-3 text-[12px] rounded-[var(--radius-sm)] border transition-all font-medium ${
                days === d
                  ? 'bg-[var(--lime-dim)] border-[var(--lime-bdr)] text-[var(--lime)]'
                  : 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)]'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[350px] rounded-[var(--radius-md)] skeleton" />
      ) : error ? (
        <div className="h-[350px] flex flex-col items-center justify-center text-center">
          <AlertCircle size={36} className="text-[var(--red)] mb-3" />
          <p className="text-[14px] text-[var(--text)] font-medium mb-1">Forecast failed</p>
          <p className="text-[12px] text-[var(--text3)]">{error}</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-[var(--text3)] text-[13px]">
          Not enough cost history for forecasting (need ≥ 10 days)
        </div>
      ) : (
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} dx={-10} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="upper"     stroke="rgba(174,255,87,0.2)"  strokeWidth={0} dot={false} />
              <Line type="monotone" dataKey="predicted" stroke="var(--lime)"           strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--lime)' }} />
              <Line type="monotone" dataKey="lower"     stroke="rgba(174,255,87,0.2)"  strokeWidth={0} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-[12px] text-[var(--text2)]">
          <span className="w-4 h-0.5 bg-[var(--lime)] inline-block" /> Predicted
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[var(--text2)]">
          <span className="w-4 h-0.5 bg-[rgba(174,255,87,0.3)] inline-block" /> Confidence band
        </div>
      </div>
    </Card>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
const TABS = ['analyze', 'anomalies', 'forecast'];

export default function Agent() {
  const [tab, setTab] = useState('analyze');

  return (
    <div className="fade-in space-y-6">
      <div>
        <div className="section-label">AI Agent</div>
        <h2 className="page-title">Agent Console</h2>
        <p className="page-sub">Run analyses, inspect anomalies, and forecast future spend.</p>
      </div>

      <div className="flex gap-4 border-b border-[var(--border)] pb-[1px]">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-1 py-3 text-[13px] font-medium capitalize outline-none transition-colors border-b-2',
              tab === t
                ? 'text-[var(--text)] border-[var(--lime)]'
                : 'text-[var(--text2)] border-transparent hover:text-[var(--text)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'analyze'   && <AnalyzeTab />}
      {tab === 'anomalies' && <AnomaliesTab />}
      {tab === 'forecast'  && <ForecastTab />}
    </div>
  );
}
