import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, FileText, Loader, AlertCircle } from 'lucide-react'
import api from '../services/api'

const LOAN_TYPES = ['Term Loan','Working Capital','Overdraft','Equipment Finance','MSME Loan']

export default function UploadPage() {
  const [files,    setFiles]    = useState([])
  const [form,     setForm]     = useState({ applicantName:'', businessName:'', loanAmount:'', loanType:'Term Loan', pan:'', gstin:'' })
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef  = useRef()
  const navigate  = useNavigate()

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf')
    setFiles(prev => [...prev, ...pdfs.filter(f => !prev.find(p => p.name === f.name))])
  }

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name))

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!files.length) return setError('Please upload at least one PDF document')
    setError(''); setLoading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('documents', f))
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      const { data } = await api.post('/upload', fd)
      navigate(`/jobs/${data.jobId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={styles.header}>
        <h1 style={styles.h1}>New Case</h1>
        <p style={styles.sub}>Upload applicant documents and case details</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Case Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Case Details</div>
          <div style={styles.grid2}>
            <Field label="Applicant Name *" value={form.applicantName} onChange={v => set('applicantName', v)} placeholder="Full legal name" required />
            <Field label="Business Name"     value={form.businessName}  onChange={v => set('businessName', v)}  placeholder="Company / firm name" />
            <Field label="Loan Amount (₹) *" value={form.loanAmount}   onChange={v => set('loanAmount', v)}    placeholder="e.g. 5000000" type="number" required />
            <div>
              <label style={styles.label}>Loan Type</label>
              <select value={form.loanType} onChange={e => set('loanType', e.target.value)} style={{ marginTop: 6 }}>
                {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <Field label="PAN Number"   value={form.pan}   onChange={v => set('pan', v.toUpperCase())}   placeholder="ABCDE1234F" maxLength={10} />
            <Field label="GSTIN"        value={form.gstin} onChange={v => set('gstin', v.toUpperCase())} placeholder="22AAAAA0000A1Z5"  maxLength={15} />
          </div>
        </div>

        {/* Document Upload */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Documents <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(PDF only)</span></div>

          <div
            style={{ ...styles.dropzone, borderColor: dragging ? 'var(--accent)' : 'var(--border-light)', background: dragging ? 'var(--bg-hover)' : 'var(--bg)' }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <Upload size={24} color="var(--text-muted)" />
            <div style={styles.dropText}>Drop PDFs here or click to browse</div>
            <div style={styles.dropHint}>Balance sheet · P&L · ITR · Bank statements · GST returns · KYC</div>
            <input ref={inputRef} type="file" accept=".pdf" multiple style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)} />
          </div>

          {files.length > 0 && (
            <div style={styles.fileList}>
              {files.map(f => (
                <div key={f.name} style={styles.fileItem}>
                  <FileText size={14} color="var(--accent)" />
                  <span style={styles.fileName}>{f.name}</span>
                  <span style={styles.fileSize}>{(f.size / 1024).toFixed(0)} KB</span>
                  <button type="button" style={styles.removeBtn} onClick={() => removeFile(f.name)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div style={styles.error}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={styles.actions}>
          <button type="button" style={styles.btnCancel} onClick={() => navigate('/dashboard')}>Cancel</button>
          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : 'Submit Case'}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Field({ label, value, onChange, required, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
      {label}
      <input value={value} onChange={e => onChange(e.target.value)} required={required} style={{ marginTop: 6 }} {...rest} />
    </label>
  )
}

const styles = {
  header:      { marginBottom: 28 },
  h1:          { fontSize: 26, color: 'var(--text)', marginBottom: 4 },
  sub:         { fontSize: 13, color: 'var(--text-muted)' },
  form:        { display: 'flex', flexDirection: 'column', gap: 20 },
  section:     { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle:{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 },
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  label:       { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 6 },
  dropzone:    { border: '1.5px dashed', borderRadius: 8, padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all .15s' },
  dropText:    { fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' },
  dropHint:    { fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' },
  fileList:    { display: 'flex', flexDirection: 'column', gap: 6 },
  fileItem:    { display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px' },
  fileName:    { flex: 1, fontSize: 12, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileSize:    { fontSize: 11, color: 'var(--text-muted)' },
  removeBtn:   { background: 'none', color: 'var(--text-muted)', display: 'flex', padding: 2 },
  error:       { display: 'flex', alignItems: 'center', gap: 8, background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 6, padding: '10px 14px', color: '#fca5a5', fontSize: 12 },
  actions:     { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnCancel:   { background: 'var(--bg-card)', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12, padding: '10px 20px', borderRadius: 7, border: '1px solid var(--border)' },
  btnSubmit:   { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 7 },
}
