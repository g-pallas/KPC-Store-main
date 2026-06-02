import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  CircleHelp,
  Headphones,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
  Star,
  User,
  UserCircle,
} from 'lucide-react'
import { api, currency, mediaUrl } from '../lib/kpc'

export function Header({ store }) {
  const [open, setOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const productSearch = new URLSearchParams(location.search)
  const isProductsPage = location.pathname === '/products'
  const isPopularPage = isProductsPage && productSearch.get('top') === '1'

  function submitSearch(event) {
    event.preventDefault()
    navigate(`/products?search=${encodeURIComponent(query)}`)
    setOpen(false)
  }

  function closeMenus() {
    setOpen(false)
    setAccountOpen(false)
  }

  function logout() {
    store.logout()
    closeMenus()
    navigate('/')
  }

  return (
    <>
      <div className="top-strip">20% Off to All Offers And All Category, Make your Orders Now</div>
      <header className="site-header">
        <Link to="/" className="brand"><img src="/images/logo2.png" alt="KPC" /></Link>
        <button className="icon-button mobile-only" onClick={() => setOpen(!open)} aria-label="Menu"><Menu size={22} /></button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <Link className={isProductsPage && !isPopularPage ? 'active' : ''} to="/products">Shop Now</Link>
          <NavLink to="/hot-products">Hot Products</NavLink>
          <Link className={isPopularPage ? 'active' : ''} to="/products?top=1">Popular</Link>
          <NavLink to="/support">Support</NavLink>
          <NavLink to="/faqs">FAQs</NavLink>
        </nav>
        <form className="search-form" onSubmit={submitSearch}>
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" />
        </form>
        <div className="header-actions">
          <div className="account-menu">
            <button
              className="icon-button"
              type="button"
              onClick={() => setAccountOpen((current) => !current)}
              aria-label="Account menu"
              aria-expanded={accountOpen}
            >
              <User size={21} />
            </button>
            {accountOpen && (
              <div className="account-dropdown">
                {store.user ? (
                  <>
                    <Link to="/account/manage" onClick={closeMenus}><UserCircle size={20} /> Manage My Account</Link>
                    <Link to="/account/orders" onClick={closeMenus}><Package size={20} /> My Orders</Link>
                    <Link to="/account/reviews" onClick={closeMenus}><Star size={20} /> My Reviews</Link>
                    <Link to="/account/returns" onClick={closeMenus}><RotateCcw size={20} /> My Returns</Link>
                    <Link to="/account/cancellations" onClick={closeMenus}><CircleHelp size={20} /> My Cancellations</Link>
                    {store.user.role === 'admin' && (
                      <Link to="/admin" onClick={closeMenus}><LayoutDashboard size={20} /> Admin Dashboard</Link>
                    )}
                    <button type="button" onClick={logout}><LogOut size={20} /> Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMenus}><LogIn size={20} /> Login</Link>
                    <Link to="/register" onClick={closeMenus}><UserCircle size={20} /> Create Account</Link>
                    <Link to="/support" onClick={closeMenus}><Headphones size={20} /> Support</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link className="cart-button" to="/cart" aria-label="Cart"><ShoppingCart size={22} /><span>{store.cartCount}</span></Link>
        </div>
      </header>
    </>
  )
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function subscribe(event) {
    event.preventDefault()
    await api('/subscribers', { method: 'POST', body: JSON.stringify({ email }) })
    setEmail('')
    setMessage('Subscribed')
  }

  return (
    <footer className="footer">
      <div className="payments">
        <img src="/images/master_card.png" alt="Mastercard" />
        <img src="/images/visa.png" alt="Visa" />
        <img src="/images/paypal.png" alt="PayPal" />
        <img src="/images/GCash.png" alt="GCash" />
        <strong>Safe And Secure Payment Methods</strong>
      </div>
      <div className="footer-grid">
        <div>
          <img className="footer-logo" src="/images/KPC logo-w.png" alt="KPC" />
          <p>Computer parts, peripherals, and gaming gear for builders who want the good stuff without the maze.</p>
        </div>
        <div><h3>Main Links</h3><Link to="/">Home</Link><Link to="/products">Products</Link><Link to="/cart">Cart</Link></div>
        <div><h3>External Links</h3><a>Privacy Policy</a><a>Disclaimer</a><a>Terms and Conditions</a></div>
        <form onSubmit={subscribe}><h3>Subscribe Now</h3><div className="subscribe"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Example@gmail.com" /><button>Subscribe</button></div><small>{message}</small></form>
      </div>
      <div className="copyright">Made By KSabatin <span>© Copyright 2026 - KPC Store</span></div>
    </footer>
  )
}

export function Layout({ store, children }) {
  return <><Header store={store} />{children}<Footer /></>
}

export function Rating({ value, count }) {
  return <span className="rating">★ <b>{Number(value) ? value : 'No Reviews'}</b>{count ? ` (${count})` : ''}</span>
}

export function ProductCard({ product, onAdd }) {
  const isUnavailable = product.is_sold || product.stock <= 0

  return (
    <article className="product-card">
      {isUnavailable && <span className="sold-badge">Sold</span>}
      <Link to={`/products/${product.slug}`} className="product-image"><img src={mediaUrl(product.primary_image)} alt={product.name} /></Link>
      <Link to={`/products/${product.slug}`} className="product-name">{product.name}</Link>
      <Rating value={product.rating} count={product.review_count} />
      <div className="old-price">{product.old_price ? currency(product.old_price) : ''}</div>
      <div className="price">{currency(product.price)}</div>
      <button className="small-button" onClick={() => onAdd(product)} disabled={isUnavailable}>{isUnavailable ? 'Sold' : 'Add to Cart'}</button>
    </article>
  )
}

export function ProductGrid({ products, onAdd }) {
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div>
}
