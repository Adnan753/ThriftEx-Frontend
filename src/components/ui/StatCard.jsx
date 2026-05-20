import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCountUp } from '../../hooks/useCountUp';

export const StatCard = ({ label, value, delta, deltaLabel, icon: Icon, isPositive }) => {
  const current = useCountUp(value);
  const isMonetary = typeof value === 'number' && value > 100;

  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] card-hover cursor-pointer group">
      {/* Subtle lime corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--lime)] opacity-[0.03] rounded-full translate-x-8 -translate-y-8 pointer-events-none" />

      <div className="flex justify-between items-start">
        <span className="text-[10px] uppercase text-[var(--text3)] font-semibold tracking-[0.12em]">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--lime-dim)] border border-[var(--lime-bdr)] flex items-center justify-center transition-colors group-hover:bg-[var(--lime-dim)]">
            <Icon size={15} className="text-[var(--lime)]" />
          </div>
        )}
      </div>

      <div>
        <div className="stat-num mt-3 mb-1">
          {isMonetary ? `$${current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : current.toLocaleString()}
        </div>
        {delta != null ? (
          <div className="flex items-center text-[12px] font-medium">
            <span className={cn('flex items-center mr-2', isPositive ? 'text-[var(--success)]' : 'text-[var(--red)]')}>
              {isPositive ? <ChevronDown size={13} className="mr-0.5" /> : <ChevronUp size={13} className="mr-0.5" />}
              {delta}%
            </span>
            <span className="text-[var(--text3)] text-[11px]">{deltaLabel}</span>
          </div>
        ) : (
          <div className="h-[20px]" />
        )}
      </div>
    </div>
  );
};
