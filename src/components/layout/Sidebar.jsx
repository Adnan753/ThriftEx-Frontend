import { cn } from '../../lib/utils';
import {
  LayoutDashboard, TrendingDown, Sparkles,
  Bot, Server, Target
} from 'lucide-react';

const navItems = [
  { id: 'Dashboard',       icon: LayoutDashboard },
  { id: 'Cost Analysis',   icon: TrendingDown },
  { id: 'Recommendations', icon: Sparkles, badge: 3 },
  { id: 'Agent',           icon: Bot },
  { id: 'Resources',       icon: Server },
  { id: 'Goals',           icon: Target },
];

export function Sidebar({ activeTab, setActiveTab, apiConnected }) {
  return (
    <aside className="w-[220px] flex-shrink-0 bg-[var(--bg)] border-r border-[var(--border)] flex-col hidden md:flex">
      {/* Logo — matches landing page nav style */}
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-display font-semibold text-[var(--text)] tracking-tight">
            thrift<span style={{ color: 'var(--lime)' }}>Ex</span>
          </span>
          <span
            style={{
              fontFamily: 'var(--fm)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--lime)',
              background: 'var(--lime-dim)',
              border: '1px solid var(--lime-bdr)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            BETA
          </span>
        </div>
        <p className="text-[10px] text-[var(--text3)] font-medium tracking-[0.12em] uppercase mt-1.5">
          AWS Cost Intelligence
        </p>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center h-[36px] px-3 rounded-[var(--radius-sm)] text-[13px] font-medium transition-all duration-150 outline-none relative',
                isActive
                  ? 'bg-[var(--lime-dim)] text-[var(--text)]'
                  : 'text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)]'
              )}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: 'var(--lime)' }}
                />
              )}
              <Icon
                size={15}
                className={cn('mr-2.5 flex-shrink-0', isActive ? 'text-[var(--lime)]' : 'text-[var(--text3)]')}
              />
              <span className="flex-1 text-left">{item.id}</span>
              {item.badge && (
                <span
                  style={{
                    fontFamily: 'var(--fm)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--bg)',
                    background: 'var(--lime)',
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--border)]">
        <div
          className="flex items-center gap-2 text-[11px] font-medium px-3 py-2 rounded-[var(--radius-sm)]"
          style={{
            background: apiConnected ? 'rgba(87,232,163,0.06)' : 'rgba(255,82,82,0.06)',
            border: `1px solid ${apiConnected ? 'rgba(87,232,163,0.2)' : 'rgba(255,82,82,0.2)'}`,
            color: apiConnected ? 'var(--success)' : 'var(--red)',
          }}
        >
          <div className={cn('w-1.5 h-1.5 rounded-full', apiConnected ? 'bg-[var(--success)]' : 'bg-[var(--red)]')} />
          {apiConnected ? 'API Connected' : 'API Offline'}
        </div>
      </div>
    </aside>
  );
}
