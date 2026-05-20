import { useState, useEffect, useMemo } from 'react';
import { Server, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PillBadge } from '../components/ui/PillBadge';
import { useToast } from '../context/ToastContext';
import { discoverResources } from '../services/api';

// Normalise the 3 AWS resource types into a common shape for the table
function normalise(raw) {
  const rows = [];

  for (const ec2 of raw.ec2 || []) {
    rows.push({
      id:     ec2.id,
      type:   'EC2',
      name:   ec2.name || ec2.id,
      region: ec2.region,
      state:  ec2.state,
      size:   ec2.type,          // instance type e.g. t3.large
      idle:   ec2.is_idle,
    });
  }

  for (const rds of raw.rds || []) {
    rows.push({
      id:     rds.id,
      type:   'RDS',
      name:   rds.id,
      region: rds.region,
      state:  rds.status,
      size:   rds.instance_class,
      idle:   rds.is_idle,
    });
  }

  for (const s3 of raw.s3 || []) {
    rows.push({
      id:     s3.name,
      type:   'S3',
      name:   s3.name,
      region: s3.region || 'global',
      state:  'active',
      size:   '—',
      idle:   false,
    });
  }

  return rows;
}

const STATE_VARIANT = {
  running:   'approved',
  available: 'approved',
  active:    'approved',
  stopped:   'pending',
  stopping:  'pending',
  modifying: 'pending',
};

export default function Resources() {
  const { addToast }      = useToast();
  const [rows, setRows]   = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const discover = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await discoverResources();
      setRows(normalise(res.data));
      setSummary(res.data?.summary ?? null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { discover(); }, []);

  const types = useMemo(() => ['all', ...Array.from(new Set(rows.map(r => r.type)))], [rows]);

  const filtered = useMemo(() => rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) ||
                        r.type.toLowerCase().includes(q) || r.size.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  }), [rows, search, typeFilter]);

  const groups = useMemo(() =>
    filtered.reduce((acc, r) => { (acc[r.type] = acc[r.type] || []).push(r); return acc; }, {}),
  [filtered]);

  const handleExport = () => {
    const csv = [
      ['Resource ID', 'Name', 'Type', 'Region', 'Size', 'State', 'Idle'],
      ...rows.map(r => [r.id, r.name, r.type, r.region, r.size, r.state, r.idle]),
    ].map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'thriftex-resources.csv',
    });
    a.click();
    URL.revokeObjectURL(a.href);
    addToast('CSV exported', 'success');
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="section-label">Inventory</div>
          <h2 className="page-title">Discovered Resources</h2>
          <p className="page-sub">All active and tracked AWS components across your account.</p>
        </div>
        <div className="flex gap-2 mt-1">
          <Button variant="ghost" onClick={discover} disabled={loading}>Refresh</Button>
          <Button variant="ghost" onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {/* Summary chips */}
      {summary && (
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'EC2', value: summary.total_ec2, sub: `${summary.idle_ec2} idle` },
            { label: 'RDS', value: summary.total_rds },
            { label: 'S3',  value: summary.total_s3  },
          ].map(s => (
            <div key={s.label} className="text-[12px] text-[var(--text2)] bg-[var(--bg2)] border border-[var(--border)] px-3 py-1.5 rounded-[var(--radius-sm)]">
              <span className="text-[var(--text)] font-[var(--fm)] mr-1">{s.value}</span> {s.label}
              {s.sub && <span className="text-[var(--text3)] ml-1">({s.sub})</span>}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="h-[36px] bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 text-[13px] text-[var(--text)] placeholder:text-[var(--text3)] transition-all outline-none focus:border-[var(--lime)] focus:shadow-[0_0_0_1px_var(--lime-bdr)] w-60"
          placeholder="Search resources…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`h-[36px] px-3 text-[12px] rounded-[var(--radius-sm)] border transition-all font-medium capitalize ${
                typeFilter === t
                  ? 'bg-[var(--lime-dim)] border-[var(--lime-bdr)] text-[var(--lime)]'
                  : 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-16 w-full rounded-[var(--radius-md)] skeleton" />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border3)] rounded-[var(--radius-lg)]">
          <AlertCircle size={36} className="text-[var(--red)] mb-3" />
          <p className="text-[14px] text-[var(--text)] font-medium mb-1">Discovery failed</p>
          <p className="text-[12px] text-[var(--text3)] mb-3">{error}</p>
          <button onClick={discover} className="text-[13px] text-[var(--lime)] hover:underline">Retry →</button>
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="py-16 text-center text-[var(--text3)] border border-dashed border-[var(--border3)] rounded-[var(--radius-lg)]">
          No resources match your filters.
        </div>
      ) : (
        Object.entries(groups).map(([type, items]) => (
          <div key={type} className="space-y-3">
            <div className="flex items-center gap-2">
              <Server size={15} className="text-[var(--text3)]" />
              <h3 className="text-[14px] font-medium text-[var(--text)]">{type} Resources</h3>
              <span className="bg-[var(--bg3)] text-[var(--text2)] text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
                {items.length}
              </span>
            </div>

            <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
              <div className="flex items-center px-4 h-[40px] bg-[var(--bg3)] border-b border-[var(--border)] text-[11px] uppercase text-[var(--text3)] font-medium tracking-widest">
                <div className="w-52">Resource ID</div>
                <div className="flex-1 hidden sm:block">Name</div>
                <div className="w-32 hidden sm:block">Region</div>
                <div className="w-32 hidden md:block">Size / Class</div>
                <div className="w-24">State</div>
              </div>

              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center px-4 h-[52px] border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-colors"
                >
                  <div className="w-52 text-[12px] font-[var(--fm)] text-[var(--text)] truncate">{item.id}</div>
                  <div className="flex-1 text-[13px] text-[var(--text2)] hidden sm:block truncate pr-2">{item.name !== item.id ? item.name : '—'}</div>
                  <div className="w-32 text-[13px] text-[var(--text2)] hidden sm:block">{item.region}</div>
                  <div className="w-32 text-[13px] text-[var(--text2)] hidden md:block">{item.size}</div>
                  <div className="w-24">
                    <PillBadge variant={STATE_VARIANT[item.state] ?? 'info'}>{item.state}</PillBadge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
