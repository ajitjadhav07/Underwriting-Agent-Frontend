import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Upload, LogOut, FileSearch, ChevronRight } from 'lucide-react'
import useAuthStore from '../store/authStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,           label: 'New Case' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <FileSearch size={20} color="var(--accent)" />
          <span style={styles.logoText}>Underwriting<br /><em>Agent</em></span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              ...styles.navItem,
              background:  isActive ? 'var(--bg-hover)' : 'transparent',
              color:       isActive ? 'var(--accent)'   : 'var(--text-muted)',
              borderLeft:  isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}>
              <Icon size={16} />
              <span>{label}</span>
              {document.location.pathname === to && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
            </NavLink>
          ))}
        </nav>

        <div style={styles.userBox}>
          <div style={styles.avatar}>{user?.name?.[0]}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  shell:    { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar:  { width: 220, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo:     { display: 'flex', alignItems: 'center', gap: 10, padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' },
  logoText: { fontSize: 13, fontFamily: "'DM Serif Display', serif", lineHeight: 1.3, color: 'var(--text)' },
  nav:      { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem:  { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, transition: 'all .15s' },
  userBox:  { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px', borderTop: '1px solid var(--border)' },
  avatar:   { width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 },
  userName: { fontSize: 12, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' },
  logoutBtn:{ background: 'none', color: 'var(--text-muted)', padding: 4, borderRadius: 4, display: 'flex', flexShrink: 0 },
  main:     { flex: 1, overflow: 'auto', padding: '32px 36px' },
}
