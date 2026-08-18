import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface SmartLinkProps {
  to: string
  className?: string
  children: ReactNode
}

// CMS-authored CTA URLs can be an internal path ("/products") or a full
// external URL - route the former through react-router, the latter through
// a plain anchor.
export function SmartLink({ to, className, children }: SmartLinkProps) {
  if (to.startsWith('/')) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
