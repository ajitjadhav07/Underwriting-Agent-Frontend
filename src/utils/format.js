export function fmtCurrency(val) {
  if (!val && val !== 0) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function decisionColor(decision) {
  if (decision === 'APPROVE') return 'var(--approve)'
  if (decision === 'REFER')   return 'var(--refer)'
  if (decision === 'DECLINE') return 'var(--decline)'
  return 'var(--text-muted)'
}

export function decisionIcon(decision) {
  if (decision === 'APPROVE') return '✓'
  if (decision === 'REFER')   return '⚠'
  if (decision === 'DECLINE') return '✗'
  return '—'
}
