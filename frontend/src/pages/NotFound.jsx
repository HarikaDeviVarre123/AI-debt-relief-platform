import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink px-4 text-center">
      <p className="font-mono text-gold text-sm mb-2">404</p>
      <h1 className="font-display text-3xl text-parchment mb-3">Page not found</h1>
      <p className="text-parchment-dim mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  )
}
