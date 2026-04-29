import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Circle, Loader, AlertCircle, ArrowRight } from 'lucide-react'
import api from '../services/api'
import { connectJobSocket } from '../services/websocket'
import { fmtCurrency } from '../utils/format'

const PIPELINE_STEPS = [
  'Detecting document types…',
  'Extracting fields with Claude AI…',
  'Running external verifications…',
  'Cross-verifying extracted data…',
  'Running credit scoring engine…',
  'Finalising report…',
  'Completed',
]

export default function JobStatusPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data)).catch(() => {})

    const ws = connectJobSocket(id, (msg) => {
      if (msg.type === 'progress' || msg.type === 'completed' || msg.type === 'failed') {
        api.get(`/jobs/${id}`).then(r => setJob(r.data)).catch(() => {})
      }
    })

    const poll = setInterval(() => {
      api.get(`/jobs/${id}`).then(r => {
        setJob(r.data)
        if (['completed','failed','decided'].includes(r.data.status)) clearInterval(poll)
      }).catch(() => {})
    }, 3000)

    return () => { ws.close(); clearInterval(poll) }
  }, [id])

  if (!job) return <div style={styles.loading}><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</div>

  const stepIdx = PIPELINE_STEPS.findIndex(s => s === job.currentStep)

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>{job.applicantName}</h1>
          <p style={styles.sub}>{job.businessName} · {fmtCurrency(job.loanAmount)} · {job.loanType}</p>
        </div>
        {job.status === 'completed' && (
          <button style={styles.reviewBtn} onClick={() => navigate(`/review/${id}`)}>
            Review Case <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={styles.card}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>{job.currentStep}</span>
          <span style={styles.progressPct}>{job.progress}%</span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${job.progress}%`, background: job.status === 'failed' ? 'var(--decline)' : 'var(--accent)' }} />
        </div>

        {/* Steps */}
        <div style={styles.steps}>
          {PIPELINE_STEPS.map((step, i) => {
            const done    = job.progress === 100 || (stepIdx > i)
            const active  = step === job.currentStep && job.status === 'processing'
            const failed  = job.status === 'failed' && step === job.currentStep
            return (
              <div key={step} style={styles.stepRow}>
                <div style={{ ...styles.stepIcon }}>
                  {failed    ? <AlertCircle size={14} color="var(--decline)" />
                   : done    ? <CheckCircle size={14} color="var(--approve)" />
                   : active  ? <Loader size={14} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
                   :           <Circle size={14} color="var(--border-light)" />}
                </div>
                <span style={{ ...styles.stepLabel, color: done || active ? 'var(--text)' : 'var(--text-muted)' }}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Case info */}
      <div style={styles.infoCard}>
        <Row label="Case ID"        value={job.id.substring(0,8).toUpperCase()} />
        <Row label="PAN"            value={job.pan || '—'} />
        <Row label="GSTIN"          value={job.gstin || '—'} />
        <Row label="Documents"      value={job.documentNames?.join(', ') || job.documentCount + ' file(s)'} />
        <Row label="Submitted By"   value={job.submittedBy} />
        <Row label="Status"         value={job.status} />
      </div>

      {job.status === 'failed' && (
        <div style={styles.errorBox}>
          <AlertCircle size={14} /> Pipeline failed: {job.error}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-dim)', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

const styles = {
  loading:       { display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: 40 },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  h1:            { fontSize: 22, color: 'var(--text)', marginBottom: 4 },
  sub:           { fontSize: 12, color: 'var(--text-muted)' },
  reviewBtn:     { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 12, padding: '9px 18px', borderRadius: 7 },
  card:          { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', marginBottom: 16 },
  progressHeader:{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 },
  progressLabel: { color: 'var(--text-dim)', fontWeight: 500 },
  progressPct:   { color: 'var(--accent)', fontWeight: 700 },
  progressTrack: { height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 20 },
  progressFill:  { height: '100%', borderRadius: 3, transition: 'width 0.6s ease' },
  steps:         { display: 'flex', flexDirection: 'column', gap: 10 },
  stepRow:       { display: 'flex', alignItems: 'center', gap: 10 },
  stepIcon:      { width: 20, display: 'flex', justifyContent: 'center' },
  stepLabel:     { fontSize: 12, transition: 'color .3s' },
  infoCard:      { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 20px', marginBottom: 16 },
  errorBox:      { display: 'flex', alignItems: 'center', gap: 8, background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 8, padding: '12px 16px', color: '#fca5a5', fontSize: 12 },
}
