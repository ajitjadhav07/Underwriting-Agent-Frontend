import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileSearch, Loader } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [email,    setEmail]    = useState('rahul@axisbank.com')
  const [password, setPassword] = useState('demo123')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuthStore()
  const navigate   = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials. Try rahul@axisbank.com / demo123')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <FileSearch size={28} color="var(--accent)" />
          <div>
            <div style={styles.title}>Underwriting Agent</div>
            <div style={styles.sub}>Axis Bank — MSME Credit Platform</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email
            <input value={email} onChange={e => setEmail(e.target.value)}
              type="email" required placeholder="you@axisbank.com" style={{ marginTop: 6 }} />
          </label>
          <label style={styles.label}>Password
            <input value={password} onChange={e => setPassword(e.target.value)}
              type="password" required placeholder="••••••••" style={{ marginTop: 6 }} />
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
          </button>
        </form>

        <div style={styles.hint}>
          Demo accounts: rahul / priya / arjun @axisbank.com — password: demo123
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const styles = {
  bg:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 },
  card:   { width: '100%', maxWidth: 400, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '36px 32px' },
  logoRow:{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 },
  title:  { fontSize: 18, fontFamily: "'DM Serif Display',serif", color: 'var(--text)' },
  sub:    { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  form:   { display: 'flex', flexDirection: 'column', gap: 16 },
  label:  { display: 'flex', flexDirection: 'column', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },
  error:  { background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 6, padding: '10px 12px', color: '#fca5a5', fontSize: 12 },
  btn:    { background: 'var(--accent)', color: '#000', fontWeight: 600, fontSize: 13, padding: '11px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  hint:   { marginTop: 20, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 },
}
