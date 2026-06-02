import { useEffect, useMemo, useState } from 'react'
import { api, guestCartKey, sessionKey } from '../lib/kpc'

export function useKpcStore() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem(sessionKey) || 'null'))
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [serverCart, setServerCart] = useState(null)
  const [guestCart, setGuestCart] = useState(() => JSON.parse(localStorage.getItem(guestCartKey) || '[]'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = session?.token
  const user = session?.user

  async function loadCatalog() {
    setLoading(true)
    try {
      const [productPage, categoryList] = await Promise.all([
        api('/products?per_page=100'),
        api('/categories'),
      ])
      setProducts(productPage.data || [])
      setCategories(categoryList)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadServerCart() {
    if (!token) return
    setServerCart(await api('/cart', {}, token))
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([
      api('/products?per_page=100'),
      api('/categories'),
    ])
      .then(([productPage, categoryList]) => {
        if (cancelled) return
        setProducts(productPage.data || [])
        setCategories(categoryList)
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(guestCartKey, JSON.stringify(guestCart))
  }, [guestCart])

  useEffect(() => {
    if (session) localStorage.setItem(sessionKey, JSON.stringify(session))
    else localStorage.removeItem(sessionKey)
  }, [session])

  useEffect(() => {
    let cancelled = false
    if (!token) return undefined

    api('/cart', {}, token)
      .then((cart) => {
        if (!cancelled) setServerCart(cart)
      })
      .catch(() => {
        if (!cancelled) setSession(null)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const cartItems = useMemo(() => {
    if (token && serverCart) {
      return serverCart.items.map((item) => ({ product: item.product, quantity: item.quantity }))
    }
    return guestCart
      .map((item) => ({ product: products.find((product) => product.id === item.product_id), quantity: item.quantity }))
      .filter((item) => item.product)
  }, [guestCart, products, serverCart, token])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  async function addToCart(product, quantity = 1) {
    if (!product || product.is_sold || product.stock <= 0) return

    if (token) {
      setServerCart(await api('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id, quantity }),
      }, token))
      return
    }
    setGuestCart((items) => {
      const existing = items.find((item) => item.product_id === product.id)
      if (existing) {
        return items.map((item) => item.product_id === product.id
          ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
          : item)
      }
      return [...items, { product_id: product.id, quantity }]
    })
  }

  async function updateCart(productId, quantity) {
    if (token) {
      setServerCart(await api(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }, token))
      return
    }
    setGuestCart((items) => quantity === 0
      ? items.filter((item) => item.product_id !== productId)
      : items.map((item) => item.product_id === productId ? { ...item, quantity } : item))
  }

  async function login(email, password, mode, name) {
    const guestPayload = guestCart.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
    const path = mode === 'register' ? '/auth/register' : '/auth/login'
    const payload = mode === 'register' ? { name, email, password, cart: guestPayload } : { email, password, cart: guestPayload }
    const nextSession = await api(path, { method: 'POST', body: JSON.stringify(payload) })
    setSession(nextSession)
    setGuestCart([])
  }

  async function logout() {
    if (token) {
      await api('/auth/logout', { method: 'POST' }, token).catch(() => null)
    }
    setSession(null)
    setServerCart(null)
  }

  async function placeOrder(details) {
    const isLoggedIn = Boolean(token)
    const payload = {
      ...details,
      ...(isLoggedIn
        ? { use_server_cart: true, email: details.email || user.email, customer_name: details.customer_name || user.name }
        : { items: guestCart }),
    }
    const order = await api(isLoggedIn ? '/orders' : '/guest-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token)
    if (isLoggedIn) await loadServerCart()
    else setGuestCart([])
    await loadCatalog()
    return order
  }

  return {
    products,
    categories,
    loading,
    error,
    user,
    token,
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateCart,
    login,
    logout,
    placeOrder,
    refresh: loadCatalog,
  }
}
