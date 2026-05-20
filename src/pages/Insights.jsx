import { useState, useEffect, useCallback } from 'react';
import { Bot, Terminal, Download, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CustomTooltip } from '../components/ui/CustomTooltip';
import { useToast } from '../context/ToastContext';
import { getCostSummary, getAIAnalysis } from '../services/api';

const cn = (...classes) => classes.filter(Boolean).join(' ');

function renderAIText(data) {
  if (!data) return null;
  const ai = data?.ai ?? data;

  const lines = [];
  if (ai.summary) lines.push(ai.summary);
  if (Array.isArray(ai.insights)) {
    ai.insights.forEach(ins => {
      lines.push(`\n[${ins.type?.toUpperCase() ?? 'INFO'}] ${ins.title}`);
      lines.push(ins.description);
    });
  }
  if (ai.agent_reasoning?.observations) {
    lines.push('\n[REASONING]');
    lines.push(ai.agent_reasoning.observations);
  }
  const text = lines.join('\n');

  // Highlight dollar amounts as <mark>
  const withMark = text.replace(/(\$[\d,]+(\.\d{2})?)/g, '<mark>$1</mark>');
  return (
    <div
      dangerouslySetInnerHTML={{ __html: withMark }}
      className="text-[14px] leading-[1.8] whitespace-pre-wrap text-[var(--text2)]"
    />
  );
}

export default function CostAnalysis() {
  const { addToast }             = useToast();
  const [tab, setTab]            = useState('summary');
  const [summary, setSummary]    = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError]     = useState(null);
  const [aiData, setAiData]      = useState(null);
  const [aiGenerating, setAiGenerating]     = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const res = await getCostSummary();
      setSummary(res);
    } catch (e) {
      setSummaryError(e.message);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const generateReport = async () => {
    setAiGenerating(true);
    setAiData(null);
    try {
      const res = await getAIAnalysis();
      setAiData(res.data);
      addToast('AI report generated', 'success');
    } catch (e) {
      addToast(`Failed: ${e.message}`, 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const kpiCards = summary ? [
    { label: 'Total Spend (MTD)',    value: `$${summary.current_month.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { label: 'Avg Daily Run Rate',   value: `$${summary.forecast.avg_daily.toFixed(2)}` },
    { label: 'Projected Month End',  value: `$${summary.forecast.forecasted_month_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
  ] : [];

  // Use top_spenders as bar chart data (service breakdown)
  const barData = (summary?.top_spenders ?? []).map(s => ({
    service: s.service.replace('Amazon ', '').replace('AWS ', ''),
    cost:    parseFloat(s.total.toFixed(2)),
  }));

  return (
    <div className="fade-in space-y-6">
      <div>
        <div className="section-label">Cost Analysis</div>
        <h2 className="page-title">Spend Insights</h2>
        <p className="page-sub">Service breakdown, projections, and AI-generated spend summaries.</p>
      </div>

      <div className="flex gap-4 border-b border-[var(--border)] pb-[1px]">
        {['summary', 'ai analysis'].map(t => (
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

      {tab === 'summary' ? (
        <div className="space-y-6 fade-in">
          {loadingSummary ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-[80px] rounded-[var(--radius-md)] skeleton" />)}
            </div>
          ) : summaryError ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle size={36} className="text-[var(--red)] mb-3" />
              <p className="text-[14px] text-[var(--text)] font-medium mb-1">Failed to load summary</p>
              <p className="text-[12px] text-[var(--text3)] mb-3">{summaryError}</p>
              <button onClick={loadSummary} className="text-[13px] text-[var(--lime)] hover:underline">Retry →</button>
            </div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {kpiCards.map(({ label, value }) => (
                  <Card key={label} className="py-4 px-5">
                    <p className="text-[10px] uppercase text-[var(--text3)] tracking-[0.12em] mb-2 font-semibold" style={{ fontFamily: 'var(--fm)' }}>
                      {label}
                    </p>
                    <p className="text-[22px] text-[var(--text)] font-[var(--fm)] tracking-tight">{value}</p>
                  </Card>
                ))}
              </div>

              {/* Percent change chip */}
              {summary.percent_change && summary.percent_change !== 'No previous data' && (
                <div className="flex items-center gap-2 text-[13px] text-[var(--text2)]">
                  <span>Month-over-month change:</span>
                  <span className={`font-[var(--fm)] font-semibold ${parseFloat(summary.percent_change) > 0 ? 'text-[var(--red)]' : 'text-[var(--success)]'}`}>
                    {parseFloat(summary.percent_change) > 0 ? '+' : ''}{summary.percent_change}
                  </span>
                </div>
              )}

              {/* Service cost breakdown bar chart */}
              <Card hover={false}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[16px] font-display text-[var(--text)]">Cost by Service</h3>
                  <Button variant="ghost" size="sm" onClick={() => addToast('Export coming soon', 'info')}>
                    <Download size={13} className="mr-2" /> Export
                  </Button>
                </div>
                {barData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-[var(--text3)] text-[13px]">
                    No service data — sync costs to populate
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                        <YAxis type="category" dataKey="service" stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg3)' }} />
                        <Bar dataKey="cost" fill="var(--lime)" radius={[0, 3, 3, 0]} opacity={0.85} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              {/* Forecast detail */}
              {summary.forecast && (
                <Card hover={false}>
                  <h3 className="text-[16px] font-display text-[var(--text)] mb-4">Forecast Detail</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Avg Daily Spend',    value: `$${summary.forecast.avg_daily.toFixed(2)}` },
                      { label: 'Remaining Days',     value: summary.forecast.remaining_days },
                      { label: 'Forecasted Total',   value: `$${summary.forecast.forecasted_month_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                    ].map(f => (
                      <div key={f.label} className="bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3">
                        <div className="text-[10px] text-[var(--text3)] uppercase tracking-[0.1em] font-semibold mb-1" style={{ fontFamily: 'var(--fm)' }}>{f.label}</div>
                        <div className="text-[18px] font-[var(--fm)] text-[var(--text)]">{f.value}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      ) : (
        /* AI Analysis Tab */
        <div className="fade-in">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[14px] text-[var(--text2)]">
              Let Claude analyze your billing data and provide an executive summary.
            </p>
            <Button onClick={generateReport} loading={aiGenerating}>
              <Bot size={16} className="mr-2" /> Generate AI Report
            </Button>
          </div>

          <Card className="min-h-[200px]" hover={false}>
            {aiGenerating ? (
              <div className="space-y-4">
                <div className="h-4 w-3/4 rounded skeleton" />
                <div className="h-4 w-full rounded skeleton" />
                <div className="h-4 w-5/6 rounded skeleton" />
                <div className="h-4 w-1/2 rounded skeleton" />
              </div>
            ) : aiData ? (
              renderAIText(aiData)
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text3)] py-12">
                <Terminal size={48} className="mb-4 opacity-30" />
                <p>Click generate to begin analysis.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

