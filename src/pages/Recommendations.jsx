import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Bot, AlertCircle, TriangleAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PillBadge } from '../components/ui/PillBadge';
import { useToast } from '../context/ToastContext';
import { getRecommendations, generateRecs, approveRec, rejectRec } from '../services/api';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const PRIORITY_VARIANT = { high: 'rejected', medium: 'pending', low: 'info' };

// Max plausible saving per recommendation: $50,000/mo.
// Anything higher is almost certainly an LLM hallucination.
const MAX_PLAUSIBLE_SAVING = 50_000;

// Extract the FIRST dollar figure from whatever the LLM returned.
// Handles plain numbers, "$450", "$150‑$180 per month (≈80%)", etc.
// Returns NaN if nothing parseable is found.
function extractFirstNumeric(val) {
  if (typeof val === 'number') return val;
  // Match the first sequence that looks like a dollar amount: optional $, digits, optional decimal
  const match = String(val).match(/\$?([\d,]+\.?\d*)/);
  if (!match) return NaN;
  return parseFloat(match[1].replace(/,/g, ''));
}

// Returns true when the first dollar figure exceeds what's plausible for the account.
function isUnreliable(val) {
  const n = extractFirstNumeric(val);
  return isNaN(n) || n > MAX_PLAUSIBLE_SAVING;
}

export default function Recommendations() {
  const { addToast } = useToast();
  const [recs, setRecs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await getRecommendations();
      setRecs(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateRecs();
      addToast(`Generated ${res.count} recommendations`, 'success');
      await load();
    } catch (e) {
      addToast(`Failed: ${e.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (id, action) => {
    // Optimistic fade
    setRecs(prev => prev.map(r => r.id === id ? { ...r, fading: true } : r));
    try {
      if (action === 'approve') {
        await approveRec(id);
        addToast('Recommendation approved & executed', 'success');
      } else {
        await rejectRec(id);
        addToast('Recommendation dismissed', 'info');
      }
      setTimeout(() => setRecs(prev => prev.filter(r => r.id !== id)), 300);
    } catch (e) {
      // Revert fade on error
      setRecs(prev => prev.map(r => r.id === id ? { ...r, fading: false } : r));
      addToast(`Failed: ${e.message}`, 'error');
    }
  };

  // Only sum values that are plausible — skip LLM hallucinations
  const reliableRecs    = recs.filter(r => !isUnreliable(r.estimated_saving));
  const unreliableCount = recs.length - reliableRecs.length;
  const totalSavings    = reliableRecs.reduce((s, r) => s + extractFirstNumeric(r.estimated_saving), 0);

  return (
    <div className="fade-in space-y-6">
      {generating && (
        <div className="top-loader" style={{ animation: 'loadBar 2s ease forwards' }} />
      )}

      <div className="flex justify-between items-start">
        <div>
          <div className="section-label">Action Queue</div>
          <h2 className="page-title">Recommendations</h2>
          <p className="page-sub">Approve or reject AI-generated optimizations to reduce your AWS bill.</p>
        </div>
        <Button onClick={handleGenerate} loading={generating} className="mt-1">
          <Sparkles size={14} className="mr-2" /> Generate
        </Button>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-[12px] text-[var(--text2)] bg-[var(--bg2)] border border-[var(--border)] px-3 py-1.5 rounded-[var(--radius-sm)]">
          <span className="text-[var(--text)] font-[var(--fm)] mr-1">{recs.length}</span> pending
        </div>
        <div className="text-[12px] text-[var(--text2)] bg-[var(--bg2)] border border-[var(--border)] px-3 py-1.5 rounded-[var(--radius-sm)]">
          Est. savings:{' '}
          <span className="text-[var(--success)] font-[var(--fm)]">
            ${totalSavings.toFixed(2)}/mo
          </span>
        </div>
        {unreliableCount > 0 && (
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--warning)] bg-[var(--warning-bg)] border border-[var(--warning)]/20 px-3 py-1.5 rounded-[var(--radius-sm)]">
            <TriangleAlert size={12} />
            {unreliableCount} estimate{unreliableCount > 1 ? 's' : ''} excluded — implausible LLM value
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-[60px] rounded-[var(--radius-md)] skeleton" />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={36} className="text-[var(--red)] mb-3" />
          <p className="text-[14px] text-[var(--text)] font-medium mb-1">Failed to load</p>
          <p className="text-[12px] text-[var(--text3)] mb-3">{error}</p>
          <button onClick={load} className="text-[13px] text-[var(--lime)] hover:underline">Retry →</button>
        </div>
      ) : recs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[var(--border3)] rounded-[var(--radius-lg)]">
          <Bot size={48} className="text-[var(--text3)] mb-4" />
          <p className="text-[15px] text-[var(--text)] font-medium mb-2">No pending recommendations</p>
          <button onClick={handleGenerate} className="text-[13px] text-[var(--lime)] hover:underline">
            Generate your first recommendations →
          </button>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex items-center px-4 h-[40px] bg-[var(--bg3)] text-[11px] uppercase text-[var(--text3)] font-medium tracking-widest rounded-t-[var(--radius-md)] border border-b-0 border-[var(--border)]">
            <div className="flex-1">Action</div>
            <div className="w-24 hidden sm:block">Service</div>
            <div className="w-28 hidden md:block">Priority</div>
            <div className="w-36 text-right">Est. Savings</div>
            <div className="w-48 text-right">Actions</div>
          </div>

          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-b-[var(--radius-md)]">
            {recs.map(rec => (
              <div
                key={rec.id}
                className={cn(
                  'flex items-center px-4 h-[60px] border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-all duration-300',
                  rec.fading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                )}
                title={rec.reasoning || ''}
              >
                <div className="flex-1 text-[13px] text-[var(--text)] font-medium truncate pr-4">
                  {rec.action}
                </div>
                <div className="w-24 text-[13px] text-[var(--text2)] hidden sm:block truncate">{rec.service}</div>
                <div className="w-28 hidden md:block">
                  <PillBadge variant={PRIORITY_VARIANT[rec.priority] ?? 'info'}>
                    {rec.priority || 'low'}
                  </PillBadge>
                </div>
                <div className="w-36 text-right text-[13px] font-[var(--fm)]">
                  {isUnreliable(rec.estimated_saving) ? (
                    <span
                      className="flex items-center justify-end gap-1 text-[var(--warning)]"
                      title={`Value "${rec.estimated_saving}" exceeds $${MAX_PLAUSIBLE_SAVING.toLocaleString()} — excluded from total`}
                    >
                      <TriangleAlert size={12} />
                      Unreliable
                    </span>
                  ) : (
                    <span className="text-[var(--success)]" title={rec.estimated_saving}>
                      {rec.estimated_saving}
                    </span>
                  )}
                </div>
                <div className="w-48 flex justify-end gap-2">
                  <Button variant="ghostRed" size="sm" onClick={() => handleAction(rec.id, 'reject')}>
                    Reject
                  </Button>
                  <Button variant="ghostGreen" size="sm" onClick={() => handleAction(rec.id, 'approve')}>
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
