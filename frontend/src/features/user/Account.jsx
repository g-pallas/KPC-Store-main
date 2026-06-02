import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../../components/shared";
import { api, currency, mediaUrl } from "../../lib/kpc";
import { Auth } from "./Auth";

function maskEmail(email = "") {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}${"*".repeat(Math.max(4, name.length - 2))}@${domain}`;
}

function maskPhone(phone = "") {
  if (!phone) return "Not set";
  return phone.replace(/(\d{4})\d+(\d{2})$/, "$1******$2");
}

function AccountLayout({ store, title, children }) {
  if (!store.user) return <Auth store={store} mode="login" />;

  return (
    <Layout store={store}>
      <main className="account-page">
        <aside className="account-sidebar">
          <p>Hello, {store.user.name}</p>
          <span className="verified-badge">Verified Account</span>
          <nav>
            <NavLink className="account-section-button" to="/account/manage">
              Manage My Account
            </NavLink>
            <NavLink to="/account/profile">My Profile</NavLink>
            <NavLink to="/account/address">Address Book</NavLink>
            <NavLink to="/account/payment">My Payment Options</NavLink>
            <NavLink className="account-section-button" to="/account/orders">
              My Orders
            </NavLink>
            <NavLink to="/account/returns">My Returns</NavLink>
            <NavLink to="/account/cancellations">My Cancellations</NavLink>
            <NavLink to="/account/reviews">My Reviews</NavLink>
          </nav>
        </aside>
        <section className="account-content">
          <h1>{title}</h1>
          {children}
        </section>
      </main>
    </Layout>
  );
}

export function AccountPage({ store, view = "profile" }) {
  const [orders, setOrders] = useState([]);
  const [orderNotice, setOrderNotice] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const hasSeededProfile = store.user?.role === "admin";
  const defaultAddress = hasSeededProfile
    ? "Phase 1, Block 4, Lot 21 and 22, Buenavista Homes, Cebu - Consolacion - Jugan"
    : "";
  const phone = hasSeededProfile ? "09472454652" : "";
  const hasAddress = Boolean(defaultAddress && phone);
  const hasPaymentOption = Boolean(phone);

  const loadOrders = useCallback(async () => {
    if (!store.token) return [];
    const nextOrders = await api("/orders", {}, store.token);
    setOrders(nextOrders);
    return nextOrders;
  }, [store.token]);

  useEffect(() => {
    let cancelled = false;
    if (!store.token) return undefined;

    api("/orders", {}, store.token)
      .then((nextOrders) => {
        if (!cancelled) setOrders(nextOrders);
      })
      .catch((err) => {
        if (!cancelled) setOrderError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [store.token]);

  async function confirmReceived(order) {
    try {
      await api(
        `/orders/${order.id}/confirm-received`,
        { method: "POST" },
        store.token,
      );
      setOrderNotice(
        "Order confirmed received. You can now review the products from that order.",
      );
      setOrderError("");
      await loadOrders();
    } catch (err) {
      setOrderError(err.message);
    }
  }

  if (!store.user) return <Auth store={store} mode="login" />;

  const titleMap = {
    manage: "Manage My Account",
    profile: "My profile",
    address: "Address Book",
    payment: "Select Payment Method",
    orders: "My Orders",
    returns: "My Returns",
    cancellations: "My Cancellations",
    reviews: "My Reviews",
  };

  const toReviewItems = orders
    .flatMap((order) =>
      order.status === "completed"
        ? (order.items || []).map((item) => ({ ...item, order }))
        : [],
    )
    .filter((item) => item.product);
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "all") return true;
    if (orderFilter === "pay") return order.status === "pending";
    if (orderFilter === "ship")
      return ["processing", "shipped"].includes(order.status);
    if (orderFilter === "receive") return order.status === "delivered";
    if (orderFilter === "review") return order.status === "completed";
    return true;
  });
  return (
    <AccountLayout store={store} title={titleMap[view]}>
      {view === "manage" && (
        <div className="account-dashboard">
          <section className="account-card personal-card">
            <h2>
              Personal Profile <button>Edit</button>
            </h2>
            <p>{store.user.name}</p>
            <p>{maskEmail(store.user.email)}</p>
            <label>
              <input type="checkbox" /> Receive marketing SMS
            </label>
            <label>
              <input type="checkbox" /> Receive marketing emails
            </label>
          </section>
          <section className="account-card address-summary">
            <h2>
              Address Book <NavLink to="/account/address">Edit</NavLink>
            </h2>
            <div>
              {hasAddress ? (
                <>
                  <article>
                    <span>Default Shipping Address</span>
                    <b>{store.user.name}</b>
                    <p>{defaultAddress}</p>
                    <p>(+63) {phone}</p>
                  </article>
                  <article>
                    <span>Default Billing Address</span>
                    <b>{store.user.name}</b>
                    <p>{defaultAddress}</p>
                    <p>(+63) {phone}</p>
                  </article>
                </>
              ) : (
                <article>
                  <span>Address Book</span>
                  <b>No address yet</b>
                  <p>Add a shipping address before checkout or from Address Book.</p>
                </article>
              )}
            </div>
          </section>
          <section className="account-card recent-orders">
            <h2>Recent Orders</h2>
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Placed On</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{order.items?.length || 0}</td>
                    <td>{currency(order.total)}</td>
                    <td>
                      <NavLink to="/account/orders">Manage</NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="empty-state">There are no orders placed yet.</p>
            )}
          </section>
        </div>
      )}

      {view === "profile" && (
        <section className="account-card my-profile-card">
          <div className="profile-fields">
            <article>
              <span>Full Name</span>
              <b>{store.user.name}</b>
            </article>
            <article>
              <span>
                Email Address <button>Change</button>
              </span>
              <b>{maskEmail(store.user.email)}</b>
              <label>
                <input type="checkbox" /> Receive marketing emails
              </label>
            </article>
            <article>
              <span>
                Mobile <button>Change</button>
              </span>
              <b>{phone ? `+63 ${maskPhone(phone).replace(/^0/, "")}` : "Not set"}</b>
              <label>
                <input type="checkbox" /> Receive marketing SMS
              </label>
            </article>
            <article>
              <span>Birthday</span>
              <b>{hasSeededProfile ? "2002-11-20" : "Not set"}</b>
            </article>
            <article>
              <span>Gender</span>
              <b>{hasSeededProfile ? "male" : "Not set"}</b>
            </article>
          </div>
          <div className="profile-actions">
            <button>Edit Profile</button>
            <button>Set Password</button>
            <button>Account Security</button>
          </div>
        </section>
      )}

      {view === "address" && (
        <section className="account-card address-book-card">
          <div className="account-actions">
            <button>Make default shipping address</button>
            <button>Make default billing address</button>
          </div>
          {hasAddress ? (
            <div className="address-table">
              <b>Full Name</b>
              <b>Address</b>
              <b>Postcode</b>
              <b>Phone Number</b>
              <b></b>
              <span>{store.user.name}</span>
              <span>
                <em>Home</em> {defaultAddress}
              </span>
              <span>Cebu - Consolacion - Jugan</span>
              <span>{phone}</span>
              <button>Edit</button>
            </div>
          ) : (
            <p className="empty-state">No address added yet.</p>
          )}
          <button className="account-primary">+ Add New Address</button>
        </section>
      )}

      {view === "payment" && (
        <section className="account-card payment-card">
          <h2>Digital Wallet</h2>
          {hasPaymentOption ? (
            <div className="payment-row">
              <span>GCash</span>
              <b>63-9*****{phone.slice(-4)}</b>
              <button>Delete</button>
            </div>
          ) : (
            <p className="empty-state">No payment options saved yet.</p>
          )}
          <button className="text-button">Add Payment Option +</button>
        </section>
      )}

      {view === "orders" && (
        <section className="order-list account-list">
          <div className="order-tabs">
            {[
              ["all", "All"],
              ["pay", "To pay"],
              ["ship", "To ship"],
              ["receive", "To receive"],
              ["review", `To review(${toReviewItems.length})`],
            ].map(([key, label]) => (
              <button
                className={orderFilter === key ? "active" : ""}
                key={key}
                onClick={() => setOrderFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          {orderNotice && <p className="notice">{orderNotice}</p>}
          {orderError && <p className="error">{orderError}</p>}
          {filteredOrders.length === 0 && (
            <div className="empty-account">
              <p>There are no orders placed yet.</p>
              <Link to="/products">Continue Shopping</Link>
            </div>
          )}
          {filteredOrders.map((order) => (
            <article className="account-order-card" key={order.id}>
              <div>
                <b>KPC Store</b>
                <span>{order.status}</span>
                <strong>{currency(order.total)}</strong>
              </div>
              {order.status === "delivered" && (
                <button
                  className="small-button"
                  onClick={() => confirmReceived(order)}
                >
                  Confirm Received
                </button>
              )}
              {order.status === "completed" && (
                <small className="muted">
                  Received. You may review each product once.
                </small>
              )}
              <div className="order-product-list">
                {order.items?.map((item) => {
                  const target =
                    order.status === "completed" || !item.product
                      ? `/account/orders/${order.id}`
                      : `/products/${item.product.slug}`;
                  return (
                    <Link key={item.id} to={target}>
                      <span>
                        {item.product?.primary_image && (
                          <img
                            src={mediaUrl(item.product.primary_image)}
                            alt=""
                          />
                        )}
                        {item.product_name}
                      </span>
                      <small>
                        {order.status === "completed" && item.product
                          ? "Review product"
                          : item.product
                            ? `Qty ${item.quantity}`
                            : "Product no longer listed"}
                      </small>
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      )}

      {view === "returns" && (
        <section className="empty-account">
          <p>There are no returns yet.</p>
          <Link to="/products">Continue Shopping</Link>
        </section>
      )}
      {view === "cancellations" && (
        <section className="account-list">
          {orders
            .filter((order) => order.status === "cancelled")
            .map((order) => (
              <article className="account-order-card" key={order.id}>
                <div>
                  <b>
                    Cancelled on {new Date(order.updated_at).toLocaleString()}
                  </b>
                  <span>Order #{order.order_number}</span>
                </div>
                <div className="order-product-list">
                  {order.items?.map((item) => (
                    <span key={item.id}>
                      {item.product_name}
                      <small>Cancelled</small>
                    </span>
                  ))}
                </div>
              </article>
            ))}
          {orders.every((order) => order.status !== "cancelled") && (
            <div className="empty-account">
              <p>There are no cancellations yet.</p>
              <Link to="/products">Continue Shopping</Link>
            </div>
          )}
        </section>
      )}
      {view === "reviews" && (
        <section className="account-list">
          <div className="order-tabs">
            <button className="active">
              To Be Reviewed ({toReviewItems.length})
            </button>
            <button>History</button>
          </div>
          {toReviewItems.length === 0 && (
            <div className="empty-account">
              <p>No products are waiting for review.</p>
              <Link to="/account/orders">View Orders</Link>
            </div>
          )}
          {toReviewItems.map((item) => (
            <article
              className="review-account-row"
              key={`${item.order.id}-${item.id}`}
            >
              <div>
                {item.product?.primary_image && (
                  <img src={mediaUrl(item.product.primary_image)} alt="" />
                )}
                <span>
                  <b>{item.product_name}</b>
                  <small>
                    Purchased on{" "}
                    {new Date(item.order.created_at).toLocaleDateString()}
                  </small>
                </span>
              </div>
              <Link to={`/account/reviews/${item.order.id}/${item.id}`}>
                Review
              </Link>
            </article>
          ))}
        </section>
      )}
    </AccountLayout>
  );
}

export function OrderDetails({ store }) {
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const defaultAddress =
    "Phase 1, Block 4, Lot 21 and 22, Buenavista Homes, Cebu - Consolacion - Jugan";

  useEffect(() => {
    if (store.token)
      api("/orders", {}, store.token)
        .then(setOrders)
        .catch((err) => setError(err.message));
  }, [store.token]);

  if (!store.user) return <Auth store={store} mode="login" />;

  const order = orders.find((item) => String(item.id) === String(orderId));
  const shippingFee = Number(order?.shipping_total || 0);
  const serviceFee = order
    ? Math.round(Number(order.total) * 0.02 * 100) / 100
    : 0;

  return (
    <AccountLayout store={store} title="Order Details">
      {error && <p className="error">{error}</p>}
      {!order && !error && (
        <section className="account-card">
          <p className="muted">Loading order details...</p>
        </section>
      )}
      {order && (
        <>
          <section className="order-detail-card">
            <div className="order-detail-store">
              <b>KPC Store</b>
              <span>
                {order.status === "completed" ? "Received" : order.status}
              </span>
            </div>
            <p className="order-info-strip">
              Additional services and fees included. This is a pseudo
              order-detail view for your store.
            </p>
            <div className="delivery-track">
              <span>Standard Delivery</span>
              <b>{order.order_number}</b>
              <strong>{currency(order.total)}</strong>
              <button>Track Package</button>
              <small>Orders have been received, please leave a review.</small>
            </div>
            {order.items?.map((item) => (
              <article className="order-detail-item" key={item.id}>
                {item.product?.primary_image && (
                  <img src={mediaUrl(item.product.primary_image)} alt="" />
                )}
                <span>
                  <b>{item.product_name}</b>
                  <small>{item.product?.brand || "KPC Store"}</small>
                  <em>Free Returns</em>
                </span>
                <strong>{currency(item.unit_price)}</strong>
                <small>Qty: {item.quantity}</small>
                {item.product ? (
                  <Link to={`/account/reviews/${order.id}/${item.id}`}>
                    Write A Review
                  </Link>
                ) : (
                  <span className="muted">Product no longer listed</span>
                )}
              </article>
            ))}
            <div className="order-detail-meta">
              <span>Order {order.order_number}</span>
              <small>
                Placed on {new Date(order.created_at).toLocaleString()}
              </small>
              <small>
                Completed on{" "}
                {new Date(
                  order.received_at || order.updated_at,
                ).toLocaleString()}
              </small>
              <b>Paid by {order.payment_method?.replace("_", " ")}</b>
              <button
                onClick={() =>
                  order.items?.forEach(
                    (item) =>
                      item.product &&
                      store.addToCart(item.product, item.quantity),
                  )
                }
              >
                Buy again
              </button>
            </div>
          </section>
          <section className="order-detail-bottom">
            <article className="account-card">
              <b>{order.customer_name || store.user.name}</b>
              <p>
                <em>Home</em> {order.shipping_address || defaultAddress}
              </p>
              <p>{order.phone}</p>
            </article>
            <article className="account-card total-summary">
              <h2>Total Summary</h2>
              <p>
                Subtotal ({order.items?.length || 0} item
                {order.items?.length === 1 ? "" : "s"}){" "}
                <b>{currency(order.subtotal)}</b>
              </p>
              <p>
                Service & Insurance Subtotal <b>{currency(serviceFee)}</b>
              </p>
              <p>
                Shipping Fee <b>{currency(shippingFee)}</b>
              </p>
              <p>
                Lazada Voucher <b>-{currency(20)}</b>
              </p>
              <p>
                Free Shipping Voucher <b>-{currency(shippingFee)}</b>
              </p>
              <hr />
              <p>
                Total (VAT incl.) <strong>{currency(order.total)}</strong>
              </p>
              <small>Paid by {order.payment_method?.replace("_", " ")}</small>
            </article>
          </section>
        </>
      )}
    </AccountLayout>
  );
}

export function WriteReview({ store }) {
  const { orderId, itemId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    rating: 5,
    body: "",
    seller_body: "",
    delivery_rating: 5,
    delivery_body: "",
    anonymous: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (store.token)
      api("/orders", {}, store.token)
        .then(setOrders)
        .catch((err) => setError(err.message));
  }, [store.token]);

  if (!store.user) return <Auth store={store} mode="login" />;

  const order = orders.find((item) => String(item.id) === String(orderId));
  const orderItem = order?.items?.find(
    (item) => String(item.id) === String(itemId),
  );
  const product = orderItem?.product;

  async function submit(event) {
    event.preventDefault();
    if (!product) return;
    try {
      await api(
        `/products/${product.id}/reviews`,
        {
          method: "POST",
          body: JSON.stringify({ rating: form.rating, body: form.body }),
        },
        store.token,
      );
      await store.refresh();
      navigate("/account/reviews");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AccountLayout store={store} title="Write Review">
      <form className="write-review-card" onSubmit={submit}>
        {error && <p className="error">{error}</p>}
        {!orderItem && !error && (
          <p className="muted">Loading review item...</p>
        )}
        {orderItem && !product && (
          <p className="error">
            This product is no longer listed, so it cannot be reviewed. Keep
            sold products in the catalog to preserve order history and reviews.
          </p>
        )}
        {orderItem && product && (
          <>
            <section className="write-review-product">
              <p className="muted">
                Delivered on{" "}
                {new Date(
                  order.received_at || order.updated_at || order.created_at,
                ).toLocaleDateString()}
              </p>
              <b>Rate and review purchased product:</b>
              <div className="write-review-item">
                {product?.primary_image && (
                  <img src={mediaUrl(product.primary_image)} alt="" />
                )}
                <span>
                  <b>{orderItem.product_name}</b>
                  <small>{product?.brand || "KPC Store"}</small>
                </span>
              </div>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    type="button"
                    className={rating <= form.rating ? "active" : ""}
                    key={rating}
                    onClick={() => setForm({ ...form, rating })}
                  >
                    ★
                  </button>
                ))}
                <span>
                  {form.rating >= 5 ? "Delightful" : "Thanks for your feedback"}
                </span>
              </div>
              <label>
                Review detail
                <textarea
                  required
                  minLength="8"
                  placeholder="What do you think of this product?"
                  value={form.body}
                  onChange={(event) =>
                    setForm({ ...form, body: event.target.value })
                  }
                />
              </label>
              <button type="button" className="upload-photo-box">
                Upload Photo
              </button>
            </section>
            <aside className="write-review-side">
              <p>
                Sold by <b>KPC Store</b>
              </p>
              <b>Rate and review your seller:</b>
              <div className="seller-mood">
                <button type="button">☹</button>
                <button type="button">😐</button>
                <button type="button" className="active">
                  ☺
                </button>
                <span>Positive</span>
              </div>
              <label>
                Review detail
                <textarea
                  placeholder="How is your overall experience with the seller?"
                  value={form.seller_body}
                  onChange={(event) =>
                    setForm({ ...form, seller_body: event.target.value })
                  }
                />
              </label>
              <b>Rate and review delivery service:</b>
              <div className="star-picker small">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    type="button"
                    className={rating <= form.delivery_rating ? "active" : ""}
                    key={rating}
                    onClick={() =>
                      setForm({ ...form, delivery_rating: rating })
                    }
                  >
                    ★
                  </button>
                ))}
              </div>
              <label>
                Review detail
                <textarea
                  placeholder="How is your overall delivery experience?"
                  value={form.delivery_body}
                  onChange={(event) =>
                    setForm({ ...form, delivery_body: event.target.value })
                  }
                />
              </label>
              <label className="anonymous-toggle">
                Review as {store.user.name.split(" ")[0]}
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(event) =>
                    setForm({ ...form, anonymous: event.target.checked })
                  }
                />{" "}
                Anonymous
              </label>
              <button className="submit-review-button">Submit</button>
            </aside>
          </>
        )}
      </form>
    </AccountLayout>
  );
}
