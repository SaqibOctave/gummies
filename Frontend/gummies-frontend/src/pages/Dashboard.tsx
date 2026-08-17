import { useAuth } from '@/context/auth-context'

// Placeholder page content to prove AppLayout + the login/session loop work.
// Real dashboard widgets are a separate task.
export function Dashboard() {
  const { admin } = useAuth()

  return (
    <div className="px-6 py-6">
      <h1 className="text-xl font-semibold text-slate-900">Welcome, {admin?.name}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {admin?.email} &middot; {admin?.role}
      </p>
    </div>
  )
}
