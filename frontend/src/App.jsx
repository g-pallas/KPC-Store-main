import { Route, Routes } from 'react-router-dom'
import './App.css'
import './Review.css'
import { useKpcStore } from './store/useKpcStore'
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Support } from './pages/Support'
import { Faqs } from './pages/Faqs'
import { Auth } from './features/user/Auth'
import { AccountPage, OrderDetails, WriteReview } from './features/user/Account'
import { Admin } from './features/admin/Admin'

export default function App() {
  const store = useKpcStore()

  if (store.loading) return <div className="loader">Loading KPC Store...</div>

  return (
    <Routes>
      <Route path="/" element={<Home store={store} />} />
      <Route path="/products" element={<Products store={store} />} />
      <Route path="/hot-products" element={<Products store={store} hotOnly />} />
      <Route path="/products/:slug" element={<ProductDetail store={store} />} />
        <Route path="/cart" element={<Cart store={store} />} />
        <Route path="/checkout" element={<Checkout store={store} />} />
        <Route path="/support" element={<Support store={store} />} />
        <Route path="/faqs" element={<Faqs store={store} />} />
        <Route path="/login" element={<Auth store={store} mode="login" />} />
      <Route path="/register" element={<Auth store={store} mode="register" />} />
      <Route path="/account" element={<AccountPage store={store} view="manage" />} />
      <Route path="/account/manage" element={<AccountPage store={store} view="manage" />} />
      <Route path="/account/profile" element={<AccountPage store={store} view="profile" />} />
      <Route path="/account/address" element={<AccountPage store={store} view="address" />} />
      <Route path="/account/payment" element={<AccountPage store={store} view="payment" />} />
      <Route path="/account/orders" element={<AccountPage store={store} view="orders" />} />
      <Route path="/account/orders/:orderId" element={<OrderDetails store={store} />} />
      <Route path="/account/returns" element={<AccountPage store={store} view="returns" />} />
      <Route path="/account/cancellations" element={<AccountPage store={store} view="cancellations" />} />
      <Route path="/account/reviews" element={<AccountPage store={store} view="reviews" />} />
      <Route path="/account/reviews/:orderId/:itemId" element={<WriteReview store={store} />} />
      <Route path="/admin" element={<Admin store={store} />} />
      <Route path="/admin/products" element={<Admin store={store} />} />
      <Route path="/admin/categories" element={<Admin store={store} />} />
      <Route path="/admin/orders" element={<Admin store={store} />} />
    </Routes>
  )
}
