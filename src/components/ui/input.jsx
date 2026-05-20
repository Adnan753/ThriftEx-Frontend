import { cn } from '../../lib/utils';

export function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text3)',
          }}
        >
          {label}
        </label>
      )}
      <input
        className={cn(
          'h-[36px] w-full bg-[var(--bg)] border rounded-[var(--radius-sm)] px-3 text-[13px] text-[var(--text)] placeholder:text-[var(--text3)] outline-none transition-all focus:border-[var(--lime)] focus:shadow-[0_0_0_1px_var(--lime-bdr)] disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-[var(--red)]/50' : 'border-[var(--border2)]',
          className,
        )}
        {...props}
      />
      {error && (
        <p style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--red)' }}>{error}</p>
      )}
    </div>
  );
}
