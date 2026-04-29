import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react'
import api from '../services/api'
import { fmtCurrency, fmtDate, decisionColor, decisionIcon } from '../utils/format'

export default function DashboardPage() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const { data } = await api.get('/jobs')
      setJobs(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t) }, [])

  const stats = {
    total:    jobs.length,
    approved: jobs.filter(j => j.humanDecision === 'APPROVE' || j.result?.decision === 'APPROVE').length,
    pending:  jobs.filter(j => ['queued','processing'].includes(j.status)).length,
    review:   jobs.filter(j => j.status === 'completed' && !j.humanDecision).length,
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Dashboard</h1>
          <p style={styles.sub}>All underwriting cases</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={styles.btnSecondary} onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button style={styles.btnPrimary} onClick={() => navigate('/upload')}>
            <Plus size={14} /> New Case
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Cases',   value: stats.total,    icon: FileText,    color: 'var(--blue)' },
          { label: 'Approved',      value: stats.approved, icon: CheckCircle, color: 'var(--approve)' },
          { label: 'Needs Review',  value: stats.review,   icon: AlertCircle, color: 'var(--refer)' },
          { label: 'Processing',    value: stats.pending,  icon: Clock,       color: 'var(--text-muted)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: color + '22' }}>
              <Icon size={16} color={color} />
            </div>
            <div>
              <div style={styles.statValue}>{value}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Applicant','Business','Loan Amount','Type','Status','AI Decision','Submitted','Action'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={styles.empty}>Loading…</td></tr>
            )}
            {!loading && jobs.length === 0 && (
              <tr><td colSpan={8} style={styles.empty}>No cases yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/upload')}>Submit your first case →</span></td></tr>
            )}
            {jobs.map(job => (
              <tr key={job.id} style={styles.tr}>
                <td style={styles.td}><strong>{job.applicantName}</strong></td>
                <td style={styles.td}>{job.businessName || '—'}</td>
                <td style={styles.td}>{fmtCurrency(job.loanAmount)}</td>
                <td style={styles.td}>{job.loanType}</td>
                <td style={styles.td}><StatusBadge status={job.status} /></td>
                <td style={styles.td}>
                  {job.result?.decision
                    ? <DecisionBadge decision={job.result.decision} score={job.result.score} />
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>
                  }
                </td>
                <td style={styles.td}>{fmtDate(job.createdAt)}</td>
                <td style={styles.td}>
                  <button style={styles.viewBtn}
                    onClick={() => navigate(job.status === 'completed' ? `/review/${job.id}` : `/jobs/${job.id}`)}>
                    {job.status === 'completed' ? 'Review' : 'Track'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    queued:     { color: '#6b7280', bg: '#1f2937', label: 'Queued' },
    processing: { color: '#f59e0b', bg: '#292110', label: 'Processing' },
    completed:  { color: '#22c55e', bg: '#0f2918', label: 'Completed' },
    decided:    { color: '#3b82f6', bg: '#0f1e36', label: 'Decided' },
    failed:     { color: '#ef4444', bg: '#2d1515', label: 'Failed' },
  }
  const s = map[status] || map.queued
  return <span style={{ ...styles.badge, color: s.color, background: s.bg }}>{s.label}</span>
}

function DecisionBadge({ decision, score }) {
  const c = decisionColor(decision)
  return (
    <span style={{ ...styles.badge, color: c, background: c + '22', gap: 6 }}>
      {decision}
      {score != null && <span style={{ opacity: 0.7 }}>· {score}</span>}
    </span>
  )
}

const styles = {
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  h1:         { fontSize: 26, color: 'var(--text)', marginBottom: 4 },
  sub:        { fontSize: 13, color: 'var(--text-muted)' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#000', fontWeight: 600, fontSize: 12, padding: '8px 16px', borderRadius: 7 },
  btnSecondary:{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12, padding: '8px 14px', borderRadius: 7, border: '1px solid var(--border)' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 },
  statCard:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 },
  statIcon:   { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue:  { fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1 },
  statLabel:  { fontSize: 11, color: 'var(--text-muted)', marginTop: 3 },
  tableCard:  { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { padding: '11px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
  tr:         { borderBottom: '1px solid var(--border)', transition: 'background .1s' },
  td:         { padding: '13px 14px', fontSize: 12, color: 'var(--text-dim)', verticalAlign: 'middle' },
  empty:      { padding: '40px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
  badge:      { display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  viewBtn:    { background: 'var(--bg-hover)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border-light)' },
}
