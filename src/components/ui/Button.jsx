import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export function Button({ children, variant = 'primary', size = 'md', loading = false, className, ...props }) {
  return (
    <button
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none',
        size === 'sm'   ? 'h-[30px] px-3 text-[12px] rounded-[var(--radius-sm)]'  :
        size === 'lg'   ? 'h-[44px] px-6 text-[14px] rounded-[var(--radius-md)]'  :
                          'h-[36px] px-4 text-[13px] rounded-[var(--radius-sm)]',
        variant === 'primary'    && 'bg-[var(--lime)] text-[var(--bg)] font-semibold hover:opacity-90 active:scale-[0.97]',
        variant === 'ghost'      && 'bg-transparent border border-[var(--border2)] text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]',
        variant === 'danger'     && 'bg-[var(--red-bg)] border border-[var(--red)]/30 text-[var(--red)] hover:bg-[var(--red)]/20',
        variant === 'ghostRed'   && 'bg-transparent border border-[var(--border2)] text-[var(--text2)] hover:bg-[var(--red-bg)] hover:text-[var(--red)] hover:border-[var(--red)]/30',
        variant === 'ghostGreen' && 'bg-transparent border border-[var(--border2)] text-[var(--text2)] hover:bg-[var(--success-bg)] hover:text-[var(--success)] hover:border-[var(--success)]/30',
        variant === 'info'       && 'bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text2)] hover:bg-[var(--bg4)] hover:text-[var(--text)]',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 size={13} className="mr-2 animate-spin" />}
      {children}
    </button>
  );
}
