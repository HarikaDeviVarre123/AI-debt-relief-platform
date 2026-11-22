import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Overview', glyph: '◈' },
  { to: '/loans', label: 'Loans', glyph: '◎' },
  { to: '/settlements', label: 'Settlements', glyph: '⟐' },
  { to: '/ai-assistant', label: 'AI Assistant', glyph: '✦' },
  { to: '/profile', label: 'Profile', glyph: '☰' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 shrink-0 bg-surface border-r border-surface-border
        flex flex-col z-40 transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="px-6 py-6 flex items-center gap-3 border-b border-surface-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-mint flex items-center justify-center text-ink-900 font-display font-bold text-lg">
            F
          </div>
          <div>
            <p className="font-display text-lg leading-none text-parchment">FinRelief</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold">AI</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-mint/10 text-mint border border-mint/30'
                    : 'text-parchment-dim hover:bg-ink-800 hover:text-parchment'
                }`
              }
            >
              <span className="text-base opacity-80">{item.glyph}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-surface-border">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-ink-800 border border-surface-border flex items-center justify-center font-display text-gold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-parchment truncate">{user?.name}</p>
              <p className="text-xs text-parchment-faint truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-ghost w-full justify-start px-2 text-sm">
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
