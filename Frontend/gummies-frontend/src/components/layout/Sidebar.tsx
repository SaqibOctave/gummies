import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { primaryNavItems, secondaryNavItems } from './navItems'
import type { NavItem } from './navItems'

const COLLAPSE_STORAGE_KEY = 'gummies-admin:sidebar-collapsed'

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)
  const { admin, logout } = useAuth()

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next))
      } catch {
        // localStorage unavailable (private mode, etc.) - collapse state just won't persist.
      }
      return next
    })
  }

  return (
    <aside
      className={[
        'flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64',
      ].join(' ')}
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3">
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-slate-900">Gummies Admin</span>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        <div className="space-y-1">
          {primaryNavItems.map((item) => (
            <SidebarLink key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>
        <div className="space-y-1 border-t border-slate-200 pt-4">
          {secondaryNavItems.map((item) => (
            <SidebarLink key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-2">
        <div className={['flex items-center gap-2 rounded-md px-1 py-2', collapsed ? 'justify-center' : ''].join(' ')}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {admin ? initials(admin.name) : '?'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{admin?.name}</p>
              <p className="truncate text-xs text-slate-500">{admin?.role}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => logout()}
          title="Log out"
          className={[
            'mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <LogOut size={18} strokeWidth={2} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  )
}
