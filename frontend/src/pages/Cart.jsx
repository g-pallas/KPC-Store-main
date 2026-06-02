import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Layout } from "../components/shared";
import { currency, mediaUrl } from "../lib/kpc";

export function Cart({ store }) {
  return (
    <Layout store={store}>
      <section className="page-head">
        <h1>Your Cart</h1>
        <p>{store.cartCount} items ready for checkout.</p>
      </section>
      <section className="cart-layout">
        <div className="cart-list">
          {store.cartItems.map(({ product, quantity }) => (
            <div className="cart-item" key={product.id}>
              <img src={mediaUrl(product.primary_image)} alt={product.name} />
              <div>
                <Link to={`/products/${product.slug}`}>{product.name}</Link>
                <span>{currency(product.price)}</span>
              </div>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) =>
                  store.updateCart(product.id, Number(e.target.value))
                }
              />
              <strong>{currency(Number(product.price) * quantity)}</strong>
              <button onClick={() => store.updateCart(product.id, 0)}>
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <aside className="checkout-card">
          <h2>Order Summary</h2>
          <p>
            Subtotal <b>{currency(store.cartTotal)}</b>
          </p>
          <p>
            Shipping <b>Calculated at checkout</b>
          </p>
          <Link className="wide-button" to="/checkout">
            Checkout
          </Link>
        </aside>
      </section>
    </Layout>
  );
}
