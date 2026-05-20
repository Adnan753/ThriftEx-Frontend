import { cn } from '../../lib/utils';

export const PillBadge = ({ children, variant = 'info' }) => {
  const variants = {
    pending:  'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/20',
    approved: 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/20',
    rejected: 'bg-[var(--red-bg)] text-[var(--red)] border-[var(--red)]/20',
    info:     'bg-[var(--bg3)] text-[var(--text2)] border-[var(--border2)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[9px] rounded border font-bold uppercase tracking-[0.1em]',
        variants[variant]
      )}
      style={{ fontFamily: 'var(--fm)' }}
    >
      {children}
    </span>
  );
};
