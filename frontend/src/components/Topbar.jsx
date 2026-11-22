import { useDarkMode } from '../hooks/useDarkMode'

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { isDark, toggle } = useDarkMode()

  return (
    <header className="sticky top-0 z-20 bg-ink/80 backdrop-blur border-b border-surface-border px-5 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-parchment-dim hover:text-parchment p-1.5 -ml-1.5"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <div>
          <h1 className="font-display text-xl md:text-2xl text-parchment leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-parchment-faint mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <button
        onClick={toggle}
        className="btn-secondary !px-3 !py-2"
        aria-label="Toggle dark mode"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </header>
  )
}
