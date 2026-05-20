export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: 'var(--bg4)',
        border: '1px solid var(--border3)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        minWidth: 140,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--fm)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text3)',
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
};
