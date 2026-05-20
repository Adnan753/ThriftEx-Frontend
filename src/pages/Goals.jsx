import { useState, useEffect, useCallback } from 'react';
import { Plus, Trophy, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { getGoals, createGoal, achieveGoal } from '../services/api';

const cn = (...classes) => classes.filter(Boolean).join(' ');

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Goals() {
  const { addToast }       = useToast();
  const [goals, setGoals]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [title, setTitle]     = useState('');
  const [target, setTarget]   = useState(10);
  const [titleError, setTitleError] = useState('');
  const [creating, setCreating]     = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getGoals();
      setGoals(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setTitleError('Please enter a goal title.'); return; }
    setTitleError('');
    setCreating(true);
    try {
      await createGoal(title.trim(), target);
      addToast('Goal created successfully', 'success');
      setTitle('');
      setTarget(10);
      await load();
    } catch (e) {
      addToast(`Failed: ${e.message}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleAchieve = async (id) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, fading: true } : g));
    try {
      await achieveGoal(id);
      addToast('Goal achieved! Great job.', 'success');
      setTimeout(() => setGoals(prev => prev.filter(g => g.id !== id)), 500);
    } catch (e) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, fading: false } : g));
      addToast(`Failed: ${e.message}`, 'error');
    }
  };

  const totalSavings = goals.reduce((s, g) => s + (g.saved_so_far ?? 0), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8 fade-in">
      {/* Left – Active goals */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="section-label">Savings Goals</div>
            <h2 className="page-title">Active Goals</h2>
          </div>
          {goals.length > 0 && (
            <div className="text-[12px] text-[var(--text2)] bg-[var(--bg2)] border border-[var(--border)] px-3 py-1.5 rounded-[var(--radius-sm)] mt-1">
              Realised savings:{' '}
              <span className="font-[var(--fm)] text-[var(--success)]">
                ${totalSavings.toFixed(2)}/mo
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-[160px] rounded-[var(--radius-md)] skeleton" />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border3)] rounded-[var(--radius-md)]">
            <AlertCircle size={36} className="text-[var(--red)] mb-3" />
            <p className="text-[14px] text-[var(--text)] font-medium mb-1">Failed to load goals</p>
            <p className="text-[12px] text-[var(--text3)] mb-3">{error}</p>
            <button onClick={load} className="text-[13px] text-[var(--lime)] hover:underline">Retry →</button>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-[var(--text3)] p-12 text-center border border-dashed border-[var(--border3)] rounded-[var(--radius-md)]">
            <Trophy size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-[15px] text-[var(--text)] font-medium mb-1">No active goals</p>
            <p className="text-[13px]">Create one to start tracking savings.</p>
          </div>
        ) : (
          goals.map(goal => (
            <Card
              key={goal.id}
              className={cn('transition-all duration-500', goal.fading && 'opacity-0 scale-95')}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[16px] font-medium text-[var(--text)] truncate">{goal.title}</h3>
                    {goal.is_achieved && (
                      <span className="text-[10px] uppercase tracking-widest font-medium text-[var(--success)] bg-[var(--success-bg)] border border-[var(--success)]/20 px-2 py-0.5 rounded-[var(--radius-sm)] flex-shrink-0">
                        Achieved
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--text3)]">
                    Target: {goal.target_percentage}% reduction ·{' '}
                    <span className="font-[var(--fm)] text-[var(--text)]">
                      ${(goal.baseline_amount - goal.target_amount).toFixed(2)}/mo
                    </span>{' '}
                    projected · Created {fmt(goal.created_at)}
                  </p>
                  {goal.remaining_to_save > 0 && (
                    <p className="text-[12px] text-[var(--text3)] mt-0.5">
                      Remaining: <span className="font-[var(--fm)] text-[var(--warning)]">${goal.remaining_to_save.toFixed(2)}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="ghostGreen" size="sm" onClick={() => handleAchieve(goal.id)}>
                    <Trophy size={13} className="mr-1.5" /> Achieve
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-1.5 bg-[var(--bg3)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--success)] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(goal.progress_percent ?? 0, 100)}%` }}
                  />
                </div>
                <span className="text-[13px] font-[var(--fm)] text-[var(--text)] w-12 text-right">
                  {(goal.progress_percent ?? 0).toFixed(1)}%
                </span>
              </div>

              {/* Milestones */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {[25, 50, 75, 100].map(m => (
                  <div
                    key={m}
                    className={cn(
                      'text-[10px] px-2 py-1 rounded-[var(--radius-sm)] border font-medium font-[var(--fm)]',
                      (goal.progress_percent ?? 0) >= m
                        ? 'bg-[var(--success-bg)] border-[var(--success)]/20 text-[var(--success)]'
                        : 'bg-[var(--bg3)] border-[var(--border)] text-[var(--text3)]'
                    )}
                  >
                    {m}%
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Right – Create goal form */}
      <div className="w-full lg:w-[360px] flex-shrink-0">
        <div className="sticky top-[80px]">
          <Card>
            <h3 className="text-[16px] font-display text-[var(--text)] mb-5">Set a New Goal</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Goal Title"
                placeholder="e.g. Optimize S3 Storage"
                value={title}
                onChange={e => { setTitle(e.target.value); setTitleError(''); }}
                error={titleError}
              />

              <Input
                label="Target Reduction %"
                type="number"
                min="1"
                max="99"
                value={target}
                onChange={e => setTarget(e.target.value)}
              />

              {/* Preview */}
              <div className="p-3 bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[12px] text-[var(--text2)]">
                <strong className="text-[var(--text)]">Preview:</strong> Reduce costs by {target}% — the agent will calculate exact savings from your current baseline.
              </div>

              <Button type="submit" loading={creating} className="w-full">
                <Plus size={14} className="mr-2" /> Create Goal
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
