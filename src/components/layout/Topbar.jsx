import { Bell, RefreshCw } from 'lucide-react';

const PAGE_LABELS = {
  'Dashboard':       'Overview',
  'Cost Analysis':   'Insights',
  'Recommendations': 'Queue',
  'Agent':           'AI Agent',
  'Resources':       'Inventory',
  'Goals':           'Savings Goals',
};

export function Topbar({ activeTab }) {
  const label = PAGE_LABELS[activeTab] ?? activeTab;

  return (
    <header className="h-[54px] flex-shrink-0 border-b border-[var(--border)] flex items-center justify-between px-6 z-10 bg-[var(--bg)]">
      <div className="flex items-center gap-2.5">
        <span
          style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--lime)',
            background: 'var(--lime-dim)',
            border: '1px solid var(--lime-bdr)',
            padding: '2px 8px',
            borderRadius: 999,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span className="text-[var(--border2)]">·</span>
        <h1 className="text-[14px] font-medium text-[var(--text2)]">{activeTab}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-[var(--text3)] hidden sm:flex items-center gap-1.5 font-medium">
          <RefreshCw size={10} className="text-[var(--lime)]" />
          Synced 2 min ago
        </span>
        <div className="w-px h-4 bg-[var(--border2)]" />
        <button className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-colors relative">
          <Bell size={14} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--red)] rounded-full" />
        </button>
      </div>
    </header>
  );
}
