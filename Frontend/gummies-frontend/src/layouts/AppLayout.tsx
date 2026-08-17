import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'

// Shared shell for every authenticated page: collapsible sidebar + content
// area. Individual pages render into the <Outlet /> and own their own
// header/actions/content - this component only owns the frame around them.
export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
