import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-lg font-semibold text-slate-900">Page not found</p>
      <Link to="/" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline">
        Back to home
      </Link>
    </div>
  )
}
