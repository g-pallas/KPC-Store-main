import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Layout } from "../components/shared";

export function Checkout({ store }) {
  const [form, setForm] = useState({
    customer_name: store.user?.name || "",
    email: store.user?.email || "",
    phone: "",
    shipping_address: "",
    shipping_method: "standard",
    payment_method: "cod",
    notes: "",
  });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      setOrder(await store.placeOrder(form));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout store={store}>
      <section className="page-head">
        <h1>Checkout</h1>
        <p>
          Payments are recorded for admin review; no real payment is charged.
        </p>
      </section>
      {order ? (
        <section className="success">
          <ShieldCheck />
          <h2>Thank you for your purchase!</h2>
          <p>Order {order.order_number} was created.</p>
          <Link className="pill-button" to="/">
            Continue Shopping
          </Link>
        </section>
      ) : (
        <form className="checkout-form" onSubmit={submit}>
          {error && <p className="error">{error}</p>}
          {["customer_name", "email", "phone"].map((field) => (
            <label key={field}>
              {field.replace("_", " ")}
              <input
                required={field !== "customer_name"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </label>
          ))}
          <label>
            shipping address
            <textarea
              required
              value={form.shipping_address}
              onChange={(e) =>
                setForm({ ...form, shipping_address: e.target.value })
              }
            />
          </label>
          <label>
            shipping method
            <select
              value={form.shipping_method}
              onChange={(e) =>
                setForm({ ...form, shipping_method: e.target.value })
              }
            >
              <option value="standard">Standard free shipping</option>
              <option value="express">Express shipping (+250)</option>
            </select>
          </label>
          <label>
            payment method
            <select
              value={form.payment_method}
              onChange={(e) =>
                setForm({ ...form, payment_method: e.target.value })
              }
            >
              <option value="cod">Cash on delivery</option>
              <option value="gcash">GCash</option>
              <option value="paypal">PayPal</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank transfer</option>
            </select>
          </label>
          <label>
            notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          <button className="wide-button">Place Order</button>
        </form>
      )}
    </Layout>
  );
}
