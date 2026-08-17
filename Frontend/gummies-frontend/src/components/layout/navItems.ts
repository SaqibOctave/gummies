import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Boxes,
  Users,
  Image,
  LayoutTemplate,
  BarChart3,
  ShieldCheck,
  History,
  Settings,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const primaryNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Categories', path: '/categories', icon: FolderTree },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Media', path: '/media', icon: Image },
  { label: 'Homepage CMS', path: '/homepage', icon: LayoutTemplate },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
]

export const secondaryNavItems: NavItem[] = [
  { label: 'Admins', path: '/admins', icon: ShieldCheck },
  { label: 'Audit Logs', path: '/audit-logs', icon: History },
  { label: 'Settings', path: '/settings', icon: Settings },
]
