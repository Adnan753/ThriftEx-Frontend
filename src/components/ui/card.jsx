import { cn } from '../../lib/utils';

export function Card({ children, className, hover = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius-md)] p-6',
        hover && 'card-hover',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
