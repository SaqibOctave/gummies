import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'

// Placeholder to prove the login -> protected route -> logout loop works.
// Real dashboard content is a separate task.
export function Dashboard() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome, {admin?.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {admin?.email} &middot; {admin?.role}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
