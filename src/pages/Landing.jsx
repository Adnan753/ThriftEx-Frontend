import { useState, useEffect, useRef } from 'react'
import { ScanSearch, Zap, Cpu, TrendingUp, Target, ArrowRight, Play, LogIn, Calendar, MessageCircle } from 'lucide-react'
import { FaAws, FaSlack } from 'react-icons/fa6'

// ─── TERMINAL DATA ─────────────────────────────────────────────────
const TERM_LINES = [
  { text: '$ thriftex scan --account prod-aws-01 --all-regions', cls: 'cmd',      delay: 0 },
  { text: '',                                                     cls: 'blank',    delay: 400 },
  { text: '  Connecting to AWS Cost Explorer...',                 cls: 't-muted',  delay: 700 },
  { text: '  ✓ Connected to Cost Explorer API',                   cls: 't-success',delay: 1100 },
  { text: '  Analyzing 847 resources across 4 regions...',        cls: 't-muted',  delay: 1400 },
  { text: '',                                                     cls: 'blank',    delay: 1900 },
  { text: '  ─────────────────────────────────────────────',      cls: 't-dim',    delay: 2000 },
  { text: '  WASTE DETECTED',                                     cls: 't-accent', delay: 2100 },
  { text: '  ─────────────────────────────────────────────',      cls: 't-dim',    delay: 2150 },
  { text: '  ● 5 idle EC2 instances          $847/mo',            cls: 't-waste',  delay: 2400 },
  { text: '  ● 3 over-provisioned RDS        $1,200/mo',          cls: 't-waste',  delay: 2700 },
  { text: '  ● 12 unattached EBS volumes     $184/mo',            cls: 't-waste',  delay: 3000 },
  { text: '  ● 8 unused Elastic IPs          $28/mo',             cls: 't-waste',  delay: 3300 },
  { text: '',                                                     cls: 'blank',    delay: 3500 },
  { text: '  Total waste identified:  $2,259/mo',                 cls: 't-accent', delay: 3600 },
  { text: '',                                                     cls: 'blank',    delay: 3900 },
  { text: '  Running low-risk optimizations...',                  cls: 't-muted',  delay: 4100 },
  { text: '',                                                     cls: 'blank',    delay: 4300 },
  { text: '  ✓ Terminated i-0a3f2b1c (idle 14d)      -$168/mo',   cls: 't-saving', delay: 4600 },
  { text: '  ✓ Released 5 unused Elastic IPs          -$18/mo',   cls: 't-saving', delay: 5200 },
  { text: '  ✓ Deleted 8 orphan EBS volumes           -$96/mo',   cls: 't-saving', delay: 5800 },
  { text: '',                                                     cls: 'blank',    delay: 6100 },
  { text: '  ⏳ Pending approval: RDS rightsizing     -$1,200/mo',cls: 't-pending',delay: 6300 },
  { text: '',                                                     cls: 'blank',    delay: 6600 },
  { text: '  Notification sent → #finops-alerts ✓',               cls: 't-muted',  delay: 6800 },
  { text: '',                                                     cls: 'blank',    delay: 7000 },
  { text: '  Net savings: $282/mo (auto) + $1,200/mo (pending)',  cls: 't-accent', delay: 7200 },
]

const TICKER_ITEMS = [
  { action: 'i-0a3f2b1c terminated (idle 14d)',            save: '−$168/mo'   },
  { action: 'RDS db.r5.2xlarge → db.r5.large (30% util)',  save: '−$620/mo'   },
  { action: '8 orphan EBS volumes deleted',                save: '−$96/mo'    },
  { action: 'Auto-scaling configured for web-asg',         save: '−$340/mo'   },
  { action: 'S3 lifecycle policy applied (30d → Glacier)',  save: '−$210/mo'   },
  { action: '5 unused Elastic IPs released',               save: '−$18/mo'    },
  { action: 'Lambda concurrency limit optimized',           save: '−$54/mo'    },
  { action: 'Reserved Instance opportunity identified',     save: '−$1,200/mo' },
]

const FEATURES = [
  { Icon: ScanSearch,    t: 'Continuous cost scanning',   d: 'Scans your entire AWS account every 6 hours. Detects idle resources, waste patterns, and anomalies before they compound.' },
  { Icon: Zap,           t: 'Autonomous execution',        d: 'Safe optimizations run automatically. No human in the loop required — unless you want one. Risk-scored, audited, reversible.' },
  { Icon: FaSlack,       t: 'Slack-native interface',       d: 'Ask questions, approve actions, and get cost alerts directly in Slack. No dashboard required to operate.' },
  { Icon: Cpu,           t: 'LLM-powered reasoning',       d: 'Not rules — reasoning. The agent understands context: deployment patterns, team preferences, business criticality.' },
  { Icon: TrendingUp,    t: '30/60/90-day forecasting',    d: 'Prophet-based time series forecasting catches cost trends before they become budget crises.' },
  { Icon: Target,        t: 'Goal-driven optimization',    d: 'Set a target — "reduce spend by 20%" — and the agent creates and executes a multi-step plan to hit it.' },
]

const COMPARE_ROWS = [
  { feat: 'Autonomous optimization execution',  us: true,   ch: false,     ace: false },
  { feat: 'Agentic multi-step planning',         us: true,   ch: false,     ace: false },
  { feat: 'Natural language cost queries',       us: true,   ch: false,     ace: false },
  { feat: 'Learns team preferences over time',   us: true,   ch: false,     ace: false },
  { feat: 'Automated rollback on failure',       us: true,   ch: 'partial', ace: false },
  { feat: 'Cost anomaly detection',              us: true,   ch: true,      ace: true  },
  { feat: 'Cost forecasting',                    us: true,   ch: true,      ace: true  },
  { feat: 'Starting price',                      us: 'Free', ch: '~$500/mo',ace: 'Free (limited)' },
]

const QUEUE_ITEMS = [
  { badge: 'AUTO',     badgeCls: 'risk-auto',     text: 'Terminate i-0a3f2b1c (idle 14d, 0% CPU)',          saving: '−$168/mo',   hi: false },
  { badge: 'AUTO',     badgeCls: 'risk-auto',     text: 'Delete 8 unattached EBS volumes (us-east-1)',       saving: '−$96/mo',    hi: false },
  { badge: 'AUTO',     badgeCls: 'risk-auto',     text: 'Release 5 unused Elastic IPs',                     saving: '−$18/mo',    hi: false },
  { badge: 'APPROVAL', badgeCls: 'risk-approval', text: 'Rightsize db.r5.2xlarge → db.r5.large (28% util)', saving: '−$620/mo',   hi: true  },
  { badge: 'APPROVAL', badgeCls: 'risk-approval', text: 'Purchase 1yr Reserved Instance (m5.xlarge)',       saving: '−$1,200/mo', hi: true  },
]

const PLANS = [
  {
    tier: 'Free', price: '$0', per: '/month',
    desc: 'For teams getting started with FinOps. No credit card required.',
    features: ['1 AWS account','Cost visibility dashboard','Basic recommendations (read-only)','7-day cost history','Up to $10K monthly AWS spend'],
    missing: ['Autonomous execution','Slack bot'],
    cta: 'Get started free', featured: false,
  },
  {
    tier: 'Pro', price: '$20', per: '/month',
    desc: 'For growing teams spending $10K–$100K/month on AWS.',
    features: ['Up to 5 AWS accounts','Full autonomous optimization','Slack bot + approval workflows','90-day cost forecasting','Goal-driven optimization','Preference learning','Priority email support'],
    missing: [],
    cta: 'Start 14-day trial →', featured: true,
  },
  {
    tier: 'Enterprise', price: 'Custom', per: '',
    desc: 'For organizations with complex multi-account AWS environments.',
    features: ['Unlimited AWS accounts','AWS Organizations support','SSO / SAML integration','Custom approval workflows','Team-based cost attribution','Dedicated Slack channel','SOC2 compliance reporting'],
    missing: [],
    cta: 'Talk to us', featured: false,
  },
]

const FOOTER_COLS = [
  { title: 'Product',   links: ['Features','Pricing','Changelog','Roadmap','Open source'] },
  { title: 'Company',   links: ['About','Blog','GitHub','Twitter','LinkedIn'] },
  { title: 'Resources', links: ['Documentation','API reference','Status','Security','Contact'] },
]

// ─── FADE UP WRAPPER ───────────────────────────────────────────────
function FadeUp({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`fade-up${visible ? ' visible' : ''}${className ? ' ' + className : ''}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

// ─── METRIC CARD WITH COUNTER ──────────────────────────────────────
function MetricCard({ target, suffix = '%', prefix = '', label, sub }) {
  const ref = useRef(null)
  const [count, setCount] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.unobserve(el)
      let current = 0
      const step = target / (1600 / 16)
      const timer = setInterval(() => {
        current = Math.min(current + step, target)
        setCount(Math.round(current))
        if (current >= target) clearInterval(timer)
      }, 16)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])
  return (
    <div ref={ref} className="metric-card">
      <div className="metric-n">{prefix}{count}{suffix}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-sub">{sub}</div>
    </div>
  )
}

// ─── TERMINAL ──────────────────────────────────────────────────────
function Terminal() {
  const [lines, setLines] = useState([])
  const [done, setDone] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    const timers = TERM_LINES.map((line, i) =>
      setTimeout(() => {
        setLines(prev => [...prev, { ...line, id: i }])
        if (i === TERM_LINES.length - 1) setDone(true)
      }, 800 + line.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="t-dot t-red" />
        <span className="t-dot t-yellow" />
        <span className="t-dot t-green" />
        <span className="terminal-title">thriftex — prod-aws-01 — agent v0.9.4</span>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {lines.map(({ text, cls, id }) => (
          <div key={id} className="t-line">
            {cls === 'blank' ? (
              <span style={{ lineHeight: '0.6' }}>&nbsp;</span>
            ) : cls === 'cmd' ? (
              <><span className="t-prompt">▶</span>{' '}<span className="t-cmd">{text.replace('$ ', '')}</span></>
            ) : (
              <span className={cls}>{text}</span>
            )}
          </div>
        ))}
        {done && <span className="cursor" />}
      </div>
    </div>
  )
}

// ─── COMPARISON CELL ───────────────────────────────────────────────
function Cell({ v }) {
  if (v === true)      return <span className="check-y">✓</span>
  if (v === false)     return <span className="check-n">—</span>
  if (v === 'partial') return <span className="check-p">Partial</span>
  return <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: 'var(--text2)' }}>{v}</span>
}

// ─── NAV ───────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav style={{ borderBottomColor: scrolled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.07)' }}>
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          thriftEx
          <span className="ex-badge">BETA</span>
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#compare">Compare</a>
        </div>
        <div className="nav-cta">
          <button className="btn-ghost"><LogIn size={14} strokeWidth={1.75}/>Sign in</button>
          <button className="btn-lime">Start free<ArrowRight size={14} strokeWidth={2}/></button>
        </div>
      </div>
    </nav>
  )
}

// ─── HERO ──────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="hero">
      <div className="container">
        <div style={{ marginBottom: 36 }}>
          <span className="hero-announcement">
            <span className="pill">NEW</span>
            Agentic FinOps — joins your team, not your dashboard stack
            <span className="arrow">→</span>
          </span>
        </div>
        <div className="hero-grid">
          <div className="hero-left">
            <h1>
              Your cloud bill<br />
              has a <em>30% leak.</em><br />
              <span className="line-muted">We seal it.</span>
            </h1>
            <p className="hero-sub">
              thriftEx is an autonomous AI agent that analyzes your AWS spend,
              executes optimizations 24/7, and learns your team's preferences —
              without you lifting a finger.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary">
                <span>Connect</span>
                <FaAws size={22} color="#0A0A0A"/>
                <span>free</span>
                <ArrowRight size={15} strokeWidth={2}/>
              </button>
              <button className="btn-hero-secondary">
                <Play size={13} strokeWidth={0} fill="currentColor"/>
                Watch 3-min demo
              </button>
            </div>
            <div className="hero-social">
              <span><span className="dot">●</span> No credit card required</span>
              <span><span className="dot">●</span> Read-only to start</span>
              <span><span className="dot">●</span> Setup in 4 minutes</span>
            </div>
          </div>
          <div className="terminal-wrap">
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── TICKER ────────────────────────────────────────────────────────
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {items.map(({ action, save }, i) => (
          <span key={i} className="ticker-item">
            <span className="t-action">{action}</span>
            <span className="t-sep">·</span>
            <span className="t-save">{save}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── PROBLEM ───────────────────────────────────────────────────────
const PROBLEM_STATS = [
  { n: '$210B',  t: 'Wasted annually, globally', d: 'Idle EC2s, orphan EBS volumes, over-provisioned RDS — running up your bill while you sleep.' },
  { n: '20 hrs', t: 'Per week, per team',        d: 'The manual cost of FinOps. Engineers who should be shipping features are running Cost Explorer queries.' },
  { n: 'Weeks',  t: 'Before you even notice',    d: "Most tools alert after the damage is done. By then, you've already paid the bill." },
]

function Problem() {
  return (
    <section id="problem">
      <div className="container">
        <div className="section-label">The problem</div>
        <h2 className="section-title">
          Cloud waste is costing<br />you more than you think.
        </h2>

        <FadeUp className="problem-anchor">
          <div className="problem-anchor-n">$600<span className="problem-anchor-unit">B</span></div>
          <div className="problem-anchor-right">
            <div className="problem-anchor-label">global cloud spend in 2024</div>
            <div className="problem-anchor-sub">
              Up to 35% is pure waste — idle resources, over-provisioned instances,
              forgotten services running 24/7 on your bill.
            </div>
            <div className="problem-source">— Gartner Cloud Spending Report, 2024</div>
          </div>
        </FadeUp>

        <div className="problem-cards">
          {PROBLEM_STATS.map(({ n, t, d }, i) => (
            <FadeUp key={n} className="problem-card" delay={i * 0.1}>
              <div className="problem-card-n">{n}</div>
              <div className="problem-card-t">{t}</div>
              <div className="problem-card-d">{d}</div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ──────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', Icon: FaAws, t: 'Connect', d: 'Link your AWS account via read-only IAM role in under 4 minutes. No agents to install, no code changes required.' },
    { n: '02', Icon: Cpu,  t: 'Analyze',  d: 'The agent scans Cost Explorer, CloudWatch, EC2, RDS, ECS, S3 — building a complete picture of your waste landscape every 6 hours.' },
    { n: '03', Icon: Zap,  t: 'Execute',  d: 'Low-risk actions run automatically. High-risk changes get routed to Slack for your approval. Every decision is logged with full reasoning.' },
  ]
  return (
    <section id="how">
      <div className="container">
        <div className="section-label">How thriftEx works</div>
        <h2 className="section-title">An agent that acts,<br />not just reports.</h2>
        <p className="section-sub">
          thriftEx connects to your AWS account, reasons over your entire cost landscape,
          and takes autonomous action — with the right guardrails.
        </p>

        <FadeUp className="how-steps">
          {steps.map(({ n, Icon, t, d }, i) => (
            <div key={n} className="how-step">
              <div className="how-step-n">STEP {n}</div>
              <div className="how-step-icon"><Icon size={28} color="var(--lime)" strokeWidth={1.5} /></div>
              <div className="how-step-t">{t}</div>
              <div className="how-step-d">{d}</div>
              {i < 2 && <div className="how-connector">→</div>}
            </div>
          ))}
        </FadeUp>

        <div className="how-detail">
          <FadeUp className="how-detail-text">
            <div className="how-detail-title">Smart risk scoring.<br />Human control where it counts.</div>
            <p className="how-detail-desc">
              Not all optimizations are equal. thriftEx scores every action by risk,
              executes safe ones automatically, and surfaces the rest for one-click approval.
              Over time, it learns what you're comfortable with.
            </p>
            <ul className="how-detail-list">
              {[
                ['Multi-factor risk scoring', '— considers resource age, usage patterns, business hours'],
                ['Automatic rollback',        '— if an optimization causes issues, it reverts within minutes'],
                ['Full audit trail',          '— every decision, reasoning chain, and outcome is logged'],
                ['Preference learning',       '— approve 3 similar actions and it handles the rest automatically'],
              ].map(([title, desc]) => (
                <li key={title}>
                  <span className="ck">✓</span>
                  <span><span className="ck-text">{title}</span> {desc}</span>
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp className="risk-chips" delay={0.15}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em', marginBottom: 14 }}>
              LIVE ACTION QUEUE
            </div>
            {QUEUE_ITEMS.map(({ badge, badgeCls, text, saving, hi }, i) => (
              <div key={i} className="risk-chip" style={hi ? { borderColor: 'rgba(255,213,87,0.2)' } : {}}>
                <span className={`risk-badge ${badgeCls}`}>{badge}</span>
                <span className="risk-text">{text}</span>
                <span className="risk-saving">{saving}</span>
              </div>
            ))}
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--text3)', marginTop: 14, textAlign: 'center' }}>
              Total identified this scan: <span style={{ color: 'var(--lime)' }}>−$2,102/mo</span>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── FORECAST MINI CHART ──────────────────────────────────────────
function ForecastChart() {
  const pts = [[0,76],[20,71],[40,64],[60,54],[80,43],[100,32],[120,22],[145,13],[170,7],[200,3]]
  const line = pts.map(([x,y]) => `${x},${y}`).join(' ')
  const area = `0,80 ${line} 200,80`
  return (
    <svg viewBox="0 0 200 80" className="forecast-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#fg)"/>
      <polyline points={line} fill="none" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── BENTO GRID ────────────────────────────────────────────────────
function BentoGrid() {
  const goalItems = [
    { label: 'EC2 rightsizing',    pct: 100, done: true  },
    { label: 'RDS optimization',   pct: 100, done: true  },
    { label: 'Reserved Instances', pct: 55,  done: false },
  ]
  return (
    <section id="features">
      <div className="container">
        <div className="section-label">Features</div>
        <h2 className="section-title">Built for teams that ship,<br/>not teams that audit.</h2>
        <FadeUp className="bento-grid">

          {/* ── Autonomous execution (wide) ── */}
          <div className="bento-card bc-7">
            <div className="bento-tag">AUTONOMOUS EXECUTION</div>
            <div className="bento-title">Acts 24/7. No tickets, no alerts.</div>
            <div className="bento-body">Low-risk optimizations execute automatically. Every action is risk-scored, audited, and reversible.</div>
            <div className="bento-queue">
              {QUEUE_ITEMS.slice(0, 3).map(({ badge, badgeCls, text, saving }) => (
                <div key={text} className="bento-queue-row">
                  <span className={`risk-badge ${badgeCls}`}>{badge}</span>
                  <span className="bento-queue-text">{text}</span>
                  <span className="risk-saving">{saving}</span>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--text3)', marginTop: 12 }}>
              Total auto-saved this scan: <span style={{ color: 'var(--lime)' }}>−$282/mo</span>
            </div>
          </div>

          {/* ── AWS Connect (narrow) ── */}
          <div className="bento-card bc-5 bento-center">
            <FaAws size={44} color="#FF9900"/>
            <div className="bento-stat">4 min</div>
            <div className="bento-stat-sub">to connect your AWS account</div>
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Read-only IAM role', 'No agents to install', 'Works across all regions'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--lime)', fontSize: 12 }}>✓</span>{f}
                </div>
              ))}
            </div>
          </div>

          {/* ── Slack (narrow) ── */}
          <div className="bento-card bc-5">
            <FaSlack size={30} style={{ color: '#4A154B', background: 'white', borderRadius: 7, padding: 4, display: 'block' }}/>
            <div className="bento-title" style={{ marginTop: 14 }}>Lives in Slack.</div>
            <div className="bento-body">Approvals, alerts, and cost queries — without leaving your workflow.</div>
            <div className="slack-bubble">
              <div className="slack-header">
                <div className="slack-avatar">tE</div>
                <span className="slack-name">thriftEx</span>
                <span className="slack-time">2:14 AM</span>
              </div>
              <div className="slack-msg">
                ⚡ Auto-terminated <code>i-0a3f2b1c</code> (idle 14d)<br/>
                Saving <span style={{ color: 'var(--lime)' }}>−$168/mo</span> · Rollback available
              </div>
              <div className="slack-action-row">
                <button className="slack-btn slack-btn-approve">View details</button>
                <button className="slack-btn slack-btn-dismiss">Undo</button>
              </div>
            </div>
          </div>

          {/* ── LLM Reasoning (wide) ── */}
          <div className="bento-card bc-7">
            <div className="bento-tag">LLM-POWERED REASONING</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div className="bento-icon-wrap"><Cpu size={20} color="var(--lime)" strokeWidth={1.5}/></div>
              <div className="bento-title" style={{ margin: 0 }}>Not rules. Reasoning.</div>
            </div>
            <div className="bento-body">The agent understands context — deployment patterns, team preferences, business criticality — and reasons about risk before acting.</div>
            <div className="bento-checks">
              {[
                ['Multi-factor risk scoring',  'considers resource age, usage, and business hours'],
                ['Automatic rollback',          'reverts within minutes if an issue is detected'],
                ['Full audit trail',            'every decision and reasoning chain is logged'],
                ['Preference learning',         'approve 3 similar actions and it handles the rest'],
              ].map(([title, desc]) => (
                <div key={title} className="bento-check-row">
                  <span className="bento-check-icon">✓</span>
                  <span><strong style={{ color: 'var(--text)', fontWeight: 500 }}>{title}</strong> — {desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Forecasting ── */}
          <div className="bento-card bc-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div className="bento-icon-wrap"><TrendingUp size={16} color="var(--lime)" strokeWidth={1.5}/></div>
              <div className="bento-tag" style={{ margin: 0 }}>30 / 60 / 90-DAY FORECASTING</div>
            </div>
            <div className="bento-title">See waste before it compounds.</div>
            <div className="bento-body">Prophet-based time series forecasting catches cost trends before they become budget crises.</div>
            <div className="forecast-wrap">
              <ForecastChart/>
              <div className="forecast-labels">
                <span>Day 1</span><span>Day 30</span><span>Day 60</span><span>Day 90</span>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
              Projected 90-day savings: <span style={{ color: 'var(--lime)' }}>+$14,400</span>
            </div>
          </div>

          {/* ── Goal-driven ── */}
          <div className="bento-card bc-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div className="bento-icon-wrap"><Target size={16} color="var(--lime)" strokeWidth={1.5}/></div>
              <div className="bento-tag" style={{ margin: 0 }}>GOAL-DRIVEN OPTIMIZATION</div>
            </div>
            <div className="bento-title">Set a target. Watch it happen.</div>
            <div className="bento-body">Define a savings goal and the agent builds and executes a multi-step plan to hit it.</div>
            <div className="goal-progress">
              <div className="goal-row">
                <span>Target: reduce spend by 30%</span>
                <span style={{ color: 'var(--lime)', fontFamily: 'var(--fm)', fontSize: 12 }}>21% achieved</span>
              </div>
              <div className="goal-bar-bg">
                <div className="goal-bar-fill" style={{ width: '70%' }}/>
              </div>
              {goalItems.map(({ label, pct, done }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: done ? 'var(--lime)' : 'var(--text3)' }}>{done ? '✓' : '○'}</span>
                      {label}
                    </span>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 11 }}>{pct}%</span>
                  </div>
                  <div className="goal-bar-bg" style={{ height: 3 }}>
                    <div className="goal-bar-fill" style={{ width: `${pct}%`, background: done ? 'var(--lime)' : 'rgba(174,255,87,0.35)' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </FadeUp>
      </div>
    </section>
  )
}

// ─── COMPARISON ────────────────────────────────────────────────────
function Comparison() {
  return (
    <section id="compare">
      <div className="container">
        <div className="section-label">Comparison</div>
        <h2 className="section-title">Dashboards tell you.<br />thriftEx does something about it.</h2>
        <FadeUp>
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Capability</th>
                <th className="highlight" style={{ width: '25%' }}>✦ thriftEx</th>
                <th style={{ width: '22%' }}>CloudHealth</th>
                <th style={{ width: '23%' }}><FaAws style={{ marginRight: 6, color: '#FF9900', verticalAlign: 'middle' }} />AWS Cost Explorer</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(({ feat, us, ch, ace }, i) => (
                <tr key={i}>
                  <td className="feature-name">{feat}</td>
                  <td className="highlight"><Cell v={us} /></td>
                  <td><Cell v={ch} /></td>
                  <td><Cell v={ace} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </FadeUp>
      </div>
    </section>
  )
}

// ─── METRICS ───────────────────────────────────────────────────────
function Metrics() {
  return (
    <section id="metrics">
      <div className="container">
        <div className="section-label">Proof</div>
        <h2 className="section-title">Results that speak for themselves.</h2>
        <FadeUp className="metrics-grid">
          <MetricCard target={30} suffix="%"    label="Avg. cloud spend reduction for beta users"    sub="across EC2, RDS, S3, Lambda" />
          <MetricCard target={80} suffix="%"    label="Reduction in manual optimization effort"      sub="hours/week reclaimed by engineering teams" />
          <MetricCard target={4}  suffix=" min" label="To connect your first AWS account"            sub="read-only IAM role setup" />
          <MetricCard target={2}  suffix="mo"   label="Average payback period"                       sub="thriftEx pays for itself, fast" />
        </FadeUp>
      </div>
    </section>
  )
}

// ─── PRICING ───────────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing">
      <div className="container">
        <div className="section-label">Pricing</div>
        <h2 className="section-title">Simple pricing.<br />ROI within 30 days, or it's on us.</h2>
        <p className="section-sub" style={{ marginBottom: 0 }}>
          No seat licenses. No per-resource fees. One flat price per AWS account.
        </p>
        <FadeUp className="pricing-grid">
          {PLANS.map(({ tier, price, per, desc, features, missing, cta, featured }) => (
            <div key={tier} className={`pricing-card${featured ? ' featured' : ''}`}>
              {featured && <div className="popular-badge">Most popular</div>}
              <div className="pricing-tier">{tier}</div>
              <div className="pricing-price">
                {price}{per && <span className="per"> {per}</span>}
              </div>
              <div className="pricing-desc">{desc}</div>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                {features.map(f => (
                  <li key={f}><span className="pf-check">✓</span><span className="pf-text">{f}</span></li>
                ))}
                {missing.map(f => (
                  <li key={f}>
                    <span className="pf-check" style={{ color: 'var(--text3)' }}>—</span>
                    <span style={{ color: 'var(--text2)' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={featured ? 'btn-pricing-lime' : 'btn-pricing'}>
                {tier === 'Enterprise' ? <MessageCircle size={14} strokeWidth={1.75}/> : <ArrowRight size={14} strokeWidth={2}/>}
                {cta.replace(' →', '')}
              </button>
            </div>
          ))}
        </FadeUp>
        <p style={{ textAlign: 'center', fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--text3)', marginTop: 28, letterSpacing: '0.03em' }}>
          Average Pro customer saves $2,000–$8,000/month — at $20/mo, it pays for itself on day one.
        </p>
      </div>
    </section>
  )
}

// ─── CTA BANNER ────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section id="cta-banner">
      <div className="container">
        <FadeUp className="cta-inner">
          <div className="cta-title">
            Stop auditing your<br />cloud bill. <span className="accent">Fix it.</span>
          </div>
          <p className="cta-sub">
            Connect your AWS account in 4 minutes. thriftEx identifies your first
            savings opportunity within an hour — no commitment required.
          </p>
          <div className="cta-actions">
            <button className="btn-hero-primary">
              <span>Connect</span><FaAws size={22} color="#0A0A0A"/><span>free</span><ArrowRight size={15} strokeWidth={2}/>
            </button>
            <button className="btn-hero-secondary">
              <Calendar size={14} strokeWidth={1.75}/>Book a demo
            </button>
          </div>
          <p className="cta-note">Free plan · Read-only to start · No credit card · Setup in 4 minutes</p>
        </FadeUp>
      </div>
    </section>
  )
}

// ─── FOOTER ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">thriftEx</div>
            <p className="footer-tagline">
              Autonomous FinOps intelligence for engineering teams who'd rather be building.
            </p>
          </div>
          {FOOTER_COLS.map(({ title, links }) => (
            <div key={title}>
              <div className="footer-col-title">{title}</div>
              <ul className="footer-links">
                {links.map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2025 thriftEx. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">MIT License</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── ROOT ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Ticker />
      <Problem />
      <HowItWorks />
      <BentoGrid />
      <Comparison />
      <Metrics />
      <Pricing />
      <CTABanner />
      <Footer />
    </>
  )
}
