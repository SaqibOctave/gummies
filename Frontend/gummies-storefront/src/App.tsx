import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { CartProvider } from '@/context/CartContext'
import { StorefrontLayout } from '@/layouts/StorefrontLayout'
import { Home } from '@/pages/Home'
import { Products } from '@/pages/Products'
import { ProductDetail } from '@/pages/ProductDetail'
import { CategoryDetail } from '@/pages/CategoryDetail'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { TrackOrder } from '@/pages/TrackOrder'
import { NotFound } from '@/pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
