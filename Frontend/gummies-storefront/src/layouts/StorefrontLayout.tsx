import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Headset, Mail, Search, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { usePublicSettingsQuery } from '@/hooks/useSettings'

export function StorefrontLayout() {
  const { itemCount } = useCart()
  const settingsQuery = usePublicSettingsQuery()
  const storeName = settingsQuery.data?.store_name ?? 'Gummy Co.'
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    navigate(searchValue.trim() ? `/products?search=${encodeURIComponent(searchValue.trim())}` : '/products')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-6 py-4">
          <Link to="/" className="shrink-0 text-xl font-extrabold text-blue-800">
            {storeName}
          </Link>

          <form onSubmit={handleSearch} className="order-3 flex w-full min-w-0 flex-1 sm:order-0">
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search gummies, flavors or categories..."
              className="w-full min-w-0 rounded-l-md border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-r-md bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/track-order"
              className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:flex"
            >
              <Headset size={18} />
              Track order
            </Link>
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="border-t border-b border-slate-200">
          <div className="mx-auto flex max-w-[1600px] items-center gap-1 px-6 py-2.5 text-sm font-medium">
            <Link
              to="/products"
              className="mr-2 rounded-md bg-blue-800 px-4 py-1.5 font-semibold text-white transition hover:bg-blue-900"
            >
              Shop All
            </Link>
            <Link to="/" className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100">
              Home
            </Link>
            <Link to="/products" className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100">
              Products
            </Link>
            <Link to="/track-order" className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100">
              Track order
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-10">
        <Outlet />
      </main>

      <footer className="bg-blue-900">
        <div className="mx-auto max-w-[1600px] px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white px-6 py-5">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Customer support</p>
              <p className="mt-0.5 text-base font-semibold text-slate-900">Need help with your order?</p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm text-slate-600">
              <Mail size={16} className="text-blue-700" />
              {settingsQuery.data?.contact_email ?? 'support@gummies.local'}
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1600px] gap-8 px-6 py-10 sm:grid-cols-3">
          <div>
            <p className="text-lg font-extrabold text-white">{storeName}</p>
            <p className="mt-2 max-w-xs text-sm text-blue-200">
              Small-batch gummy vitamins made with real fruit, shipped straight to your door.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Shop</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-blue-200">
              <Link to="/products" className="hover:text-white">
                All products
              </Link>
              <Link to="/" className="hover:text-white">
                Home
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Help</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-blue-200">
              <Link to="/track-order" className="hover:text-white">
                Track an order
              </Link>
              <a href={`mailto:${settingsQuery.data?.contact_email ?? ''}`} className="hover:text-white">
                Contact us
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800">
          <div className="mx-auto max-w-[1600px] px-6 py-4 text-xs text-blue-300">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
