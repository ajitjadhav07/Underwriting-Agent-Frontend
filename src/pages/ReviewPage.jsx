import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../services/api'
import { fmtCurrency, decisionColor } from '../utils/format'

export default function ReviewPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [job,      setJob]      = useState(null)
  const [remarks,  setRemarks]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [expanded, setExpanded] = useState({ ratios: true, api: true, flags: true })

  useEffect(() => { api.get(`/jobs/${id}`).then(r => setJob(r.data)).catch(() => {}) }, [id])

  const decide = async (decision) => {
    setLoading(true)
    try {
      await api.post(`/decision/${id}`, { decision, remarks })
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 1800)
    } catch { setLoading(false) }
  }

  const toggle = (k) => setExpanded(p => ({ ...p, [k]: !p[k] }))

  if (!job) return <div style={styles.loading}><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</div>

  const r  = job.result || {}
  const ed = job.extractedData || {}
  const { cibil, perfios, itr, gst, nsdl } = ed

  if (done) return (
    <div style={styles.loading}>
      <CheckCircle size={20} color="var(--approve)" /> Decision recorded. Redirecting…
    </div>
  )

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>{job.applicantName}</h1>
          <p style={styles.sub}>{job.businessName} · {fmtCurrency(job.loanAmount)} · {job.loanType}</p>
        </div>
        {r.decision && (
          <div style={{ ...styles.decisionBig, color: decisionColor(r.decision), borderColor: decisionColor(r.decision) + '44', background: decisionColor(r.decision) + '11' }}>
            <span>AI: {r.decision}</span>
            {r.score != null && <span style={{ opacity: .7, fontSize: 13 }}>Score {r.score}/100</span>}
          </div>
        )}
      </div>

      {/* AI Recommendation */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>AI Recommendation</div>
        <div style={styles.recGrid}>
          <Metric label="Decision"           value={r.decision || '—'}   color={decisionColor(r.decision)} />
          <Metric label="Credit Score"       value={r.score != null ? `${r.score}/100` : '—'} />
          <Metric label="Recommended Amount" value={r.recommendedAmount ? fmtCurrency(r.recommendedAmount) : '—'} />
          <Metric label="Knockout Reason"    value={r.knockoutReason || 'None'} />
        </div>
        {r.flags?.length > 0 && (
          <Section title="Flags" expanded={expanded.flags} onToggle={() => toggle('flags')}>
            <div style={styles.flagList}>
              {r.flags.map(f => (
                <span key={f} style={styles.flag}><AlertCircle size={10} /> {f.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Financial Ratios */}
      {r.ratios && (
        <Section title="Financial Ratios" card expanded={expanded.ratios} onToggle={() => toggle('ratios')}>
          <div style={styles.recGrid}>
            <Metric label="DSCR"           value={r.ratios.dscr} />
            <Metric label="Current Ratio"  value={r.ratios.currentRatio} />
            <Metric label="Debt-to-Income" value={r.ratios.debtToIncome} />
            <Metric label="Gross Margin"   value={r.ratios.grossMargin !== 'N/A' ? r.ratios.grossMargin + '%' : 'N/A'} />
          </div>
        </Section>
      )}

      {/* External API Data */}
      <Section title="External Verification Data" card expanded={expanded.api} onToggle={() => toggle('api')}>
        <div style={styles.apiGrid}>
          {nsdl && <ApiCard title="NSDL — PAN" stub={nsdl.stub}>
            <ApiRow label="Valid"  value={nsdl.valid ? '✓ Yes' : '✗ No'} />
            <ApiRow label="Name"   value={nsdl.name} />
            <ApiRow label="Status" value={nsdl.status} />
          </ApiCard>}
          {cibil && <ApiCard title="CIBIL — Credit" stub={cibil.stub}>
            <ApiRow label="Score"       value={cibil.score} />
            <ApiRow label="Rating"      value={cibil.rating} />
            <ApiRow label="Active Loans" value={cibil.activeLoans} />
            <ApiRow label="Overdues"    value={cibil.overdues} />
            <ApiRow label="Monthly EMI" value={cibil.emiObligations ? fmtCurrency(cibil.emiObligations) : '—'} />
          </ApiCard>}
          {perfios && <ApiCard title="Perfios — Bank" stub={perfios.stub}>
            <ApiRow label="Avg Balance"  value={fmtCurrency(perfios.avgMonthlyBalance)} />
            <ApiRow label="Avg Credit"   value={fmtCurrency(perfios.avgMonthlyCredit)} />
            <ApiRow label="Bounces"      value={perfios.bounceCount} />
            <ApiRow label="Stability"    value={perfios.incomeStability} />
            <ApiRow label="Cash Flow Score" value={perfios.cashFlowScore} />
          </ApiCard>}
          {itr && <ApiCard title="Karza — ITR" stub={itr.stub}>
            <ApiRow label="Filed Years"    value={itr.filedYears?.join(', ') || '—'} />
            <ApiRow label="Declared Income" value={fmtCurrency(itr.declaredIncome)} />
            <ApiRow label="Tax Paid"       value={fmtCurrency(itr.taxPaid)} />
            <ApiRow label="Consistent"     value={itr.consistent ? '✓ Yes' : '✗ No'} />
          </ApiCard>}
          {gst && <ApiCard title="Karza — GST" stub={gst.stub}>
            <ApiRow label="Registered"    value={gst.registered ? '✓ Yes' : '✗ No'} />
            <ApiRow label="Compliance"    value={gst.filingCompliance + '%'} />
            <ApiRow label="Avg Turnover"  value={fmtCurrency(gst.avgMonthlyTurnover) + '/mo'} />
            <ApiRow label="GST Score"     value={gst.gstScore} />
          </ApiCard>}
        </div>
      </Section>

      {/* Human Decision */}
      {!job.humanDecision ? (
        <div style={styles.decisionCard}>
          <div style={styles.cardTitle}>Your Decision</div>
          <textarea
            value={remarks} onChange={e => setRemarks(e.target.value)}
            placeholder="Add remarks or notes (optional)…"
            rows={3} style={{ marginBottom: 16 }}
          />
          <div style={styles.btns}>
            <DecideBtn color="var(--decline)" label="Decline"  icon={<XCircle size={14}/>}    onClick={() => decide('DECLINE')} loading={loading} />
            <DecideBtn color="var(--refer)"   label="Refer"    icon={<AlertCircle size={14}/>} onClick={() => decide('REFER')}   loading={loading} />
            <DecideBtn color="var(--approve)" label="Approve"  icon={<CheckCircle size={14}/>} onClick={() => decide('APPROVE')} loading={loading} />
          </div>
        </div>
      ) : (
        <div style={{ ...styles.decisionCard, borderColor: decisionColor(job.humanDecision) + '44' }}>
          <div style={styles.cardTitle}>Decision Recorded</div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Metric label="Final Decision" value={job.humanDecision} color={decisionColor(job.humanDecision)} />
            <Metric label="Decided By"     value={job.decidedBy} />
            <Metric label="Remarks"        value={job.humanRemarks || '—'} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Section({ title, children, card, expanded, onToggle }) {
  const wrap = card
    ? { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px', marginBottom: 16 }
    : { marginTop: 14 }
  return (
    <div style={wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expanded ? 14 : 0 }} onClick={onToggle}>
        {card ? <div style={styles.cardTitle}>{title}</div> : <div style={styles.subTitle}>{title}</div>}
        {expanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </div>
      {expanded && children}
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
    </div>
  )
}

function ApiCard({ title, stub, children }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
        {title}
        {stub && <span style={{ color: 'var(--refer)', fontSize: 10 }}>STUB</span>}
      </div>
      {children}
    </div>
  )
}

function ApiRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>{value ?? '—'}</span>
    </div>
  )
}

function DecideBtn({ color, label, icon, onClick, loading }) {
  return (
    <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: color + '18', color, border: `1px solid ${color}44`, fontWeight: 700, fontSize: 13, padding: '11px', borderRadius: 8 }}
      onClick={onClick} disabled={loading}>
      {icon} {label}
    </button>
  )
}

const styles = {
  loading:    { display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: 40 },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  h1:         { fontSize: 22, color: 'var(--text)', marginBottom: 4 },
  sub:        { fontSize: 12, color: 'var(--text-muted)' },
  decisionBig:{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, border: '1px solid', borderRadius: 10, padding: '12px 16px', fontWeight: 700, fontSize: 16 },
  card:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px', marginBottom: 16 },
  cardTitle:  { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  subTitle:   { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' },
  recGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 16 },
  apiGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10, marginTop: 4 },
  flagList:   { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  flag:       { display: 'inline-flex', alignItems: 'center', gap: 5, background: '#2d1f0a', color: 'var(--refer)', border: '1px solid #7c5e1444', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 500 },
  decisionCard:{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', marginBottom: 16 },
  btns:       { display: 'flex', gap: 10 },
}
