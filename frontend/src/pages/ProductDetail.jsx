import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Layout, ProductGrid, Rating } from "../components/shared";
import { api, currency, mediaUrl } from "../lib/kpc";

export function ProductDetail({ store }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState({ productId: null, path: "" });
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressStep, setAddressStep] = useState(0);
  const [addressParts, setAddressParts] = useState([
    "Cebu",
    "Consolacion",
    "Jugan",
  ]);
  const [detailTab, setDetailTab] = useState("reviews");
  const [reviewData, setReviewData] = useState({
    reviews: [],
    can_review: false,
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: "" });
  const [reviewError, setReviewError] = useState("");
  const thumbsRef = useRef(null);
  const product = store.products.find((item) => item.slug === slug);
  const productId = product?.id;

  useEffect(() => {
    if (!productId) return;
    api(`/products/${productId}/reviews`, {}, store.token)
      .then(setReviewData)
      .catch((err) => setReviewError(err.message));
  }, [productId, store.token]);

  if (!product)
    return (
      <Layout store={store}>
        <section className="page-head">
          <h1>Product not found</h1>
        </section>
      </Layout>
    );

  const related = store.products
    .filter(
      (item) =>
        item.category_id === product.category_id && item.id !== product.id,
    )
    .slice(0, 6);
  const youMayAlsoLike = store.products
    .filter(
      (item) =>
        item.id !== product.id &&
        !related.some((relatedItem) => relatedItem.id === item.id),
    )
    .slice(0, 6);
  const specs = product.specifications || {};
  const galleryImages = product.images?.length
    ? product.images.map((image) => image.path)
    : [product.primary_image].filter(Boolean);
  const catalogImages = product.detail_images?.length
    ? product.detail_images.map((image) => image.path)
    : [];
  const discount = product.old_price
    ? Math.max(
        0,
        Math.round(
          (1 - Number(product.price) / Number(product.old_price)) * 100,
        ),
      )
    : 0;
  const selectedImage =
    activeImage.productId === product.id && activeImage.path
      ? activeImage.path
      : product.primary_image;
  const safeQuantity = Math.max(
    1,
    Math.min(Number(quantity) || 1, product.stock || 1),
  );
  const isUnavailable = product.is_sold || product.stock <= 0;
  const reviews = reviewData.reviews || product.reviews || [];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
      reviews.length
    : Number(product.rating || 0);
  const addressLevels = [
    [
      "Abra",
      "Agusan Del Norte",
      "Agusan Del Sur",
      "Aklan",
      "Albay",
      "Antique",
      "Bohol",
      "Cebu",
      "Davao Del Sur",
      "Metro Manila",
    ],
    [
      "Cebu City",
      "Consolacion",
      "Lapu-Lapu City",
      "Mandaue City",
      "Minglanilla",
      "Talisay City",
    ],
    [
      "Casili",
      "Jugan",
      "Lamac",
      "Nangka",
      "Poblacion Occidental",
      "Poblacion Oriental",
      "Tayud",
      "Tilhaong",
    ],
  ];
  const addressLabels = ["Province", "City / Municipality", "Barangay"];
  const addressOptions = addressLevels[addressStep].filter((item) =>
    item.toLowerCase().includes(addressQuery.toLowerCase()),
  );
  const deliveryAddress = addressParts.filter(Boolean).join(", ");

  function selectAddressPart(value) {
    const nextParts = [...addressParts];
    nextParts[addressStep] = value;
    nextParts.splice(addressStep + 1);
    setAddressParts(nextParts);
    setAddressQuery("");
    if (addressStep < addressLevels.length - 1) {
      setAddressStep(addressStep + 1);
    } else {
      setAddressOpen(false);
      setAddressStep(0);
    }
  }

  function openAddressPicker() {
    setAddressOpen(true);
    setAddressQuery("");
    setAddressStep(0);
  }

  async function buyNow() {
    if (isUnavailable) return;
    await store.addToCart(product, safeQuantity);
    navigate("/checkout");
  }

  async function submitReview(event) {
    event.preventDefault();
    try {
      await api(
        `/products/${product.id}/reviews`,
        {
          method: "POST",
          body: JSON.stringify(reviewForm),
        },
        store.token,
      );
      setReviewForm({ rating: 5, body: "" });
      setReviewError("");
      setReviewData(
        await api(`/products/${product.id}/reviews`, {}, store.token),
      );
      await store.refresh();
    } catch (err) {
      setReviewError(err.message);
    }
  }

  return (
    <Layout store={store}>
      <section className="detail product-buy-box">
        <div className="detail-gallery">
          <div className="detail-image">
            <img src={mediaUrl(selectedImage)} alt={product.name} />
          </div>
          <div className="thumb-shell">
            <button
              className="thumb-arrow"
              onClick={() =>
                thumbsRef.current?.scrollBy({ left: -220, behavior: "smooth" })
              }
              aria-label="Previous image"
            >
              <ChevronLeft size={26} />
            </button>
            <div className="thumb-row" ref={thumbsRef}>
              {galleryImages.map((image) => (
                <button
                  className={image === selectedImage ? "active" : ""}
                  key={image}
                  onClick={() =>
                    setActiveImage({ productId: product.id, path: image })
                  }
                >
                  <img src={mediaUrl(image)} alt="" />
                </button>
              ))}
            </div>
            <button
              className="thumb-arrow"
              onClick={() =>
                thumbsRef.current?.scrollBy({ left: 220, behavior: "smooth" })
              }
              aria-label="Next image"
            >
              <ChevronRight size={26} />
            </button>
          </div>
        </div>
        <div className="detail-info">
          <span className="mall-label">KPC Mall</span>
          {isUnavailable && (
            <span className="sold-badge detail-sold-badge">Sold</span>
          )}
          <h1>{product.name}</h1>
          <div className="review-line">
            <Rating value={averageRating} count={reviews.length} />
            <span>
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="brand-line">
            Brand: <b>{product.brand}</b> <span>|</span> More{" "}
            {product.category?.name} from {product.brand}
          </p>
          <div className="price-line">
            <span className="detail-price">{currency(product.price)}</span>
            {product.old_price && (
              <span className="old-price">{currency(product.old_price)}</span>
            )}
            {discount > 0 && <b>-{discount}%</b>}
          </div>
          <div className="detail-benefits">
            <div className="delivery-row">
              <MapPin size={21} />
              <span>
                <b>Delivery Options</b>
                <small>{deliveryAddress}</small>
              </span>
              <button onClick={openAddressPicker}>Change</button>
              {addressOpen && (
                <div className="address-popover">
                  <div className="address-crumbs">
                    {addressParts.slice(0, addressStep).map((part, index) => (
                      <button
                        key={part}
                        onClick={() => {
                          setAddressStep(index);
                          setAddressQuery("");
                        }}
                      >
                        {part}
                      </button>
                    ))}
                    <span>{addressLabels[addressStep]}</span>
                  </div>
                  <div className="address-search">
                    <input
                      autoFocus
                      placeholder={`Select ${addressLabels[addressStep]}`}
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                    />
                    <Search size={18} />
                  </div>
                  <div className="address-options">
                    {addressOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => selectAddressPart(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <CalendarDays size={21} />
              <span>
                <b>Guaranteed Delivery</b>
                <small>
                  Standard, with shipping fee calculated at checkout
                </small>
              </span>
            </div>
            <div>
              <BadgeCheck size={21} />
              <span>
                <b>Return & Warranty</b>
                <small>
                  100% Authentic · 30 Days Free Return · 1 Year Local
                  Manufacturer Warranty
                </small>
              </span>
            </div>
            <div>
              <ShieldCheck size={21} />
              <span>
                <b>Installment</b>
                <small>
                  Up to 3 months, as low as{" "}
                  {currency(Number(product.price) / 3)} per month.
                </small>
              </span>
            </div>
          </div>
          <div className="quantity-row">
            <span>Quantity:</span>
            <div className="stepper">
              <button
                onClick={() => setQuantity(Math.max(1, safeQuantity - 1))}
              >
                <Minus size={16} />
              </button>
              <input
                value={safeQuantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock || 1, safeQuantity + 1))
                }
              >
                <Plus size={16} />
              </button>
            </div>
            <small>
              {product.is_sold
                ? "Sold"
                : product.stock > 0
                  ? `${product.stock} item(s) left`
                  : "Out of stock"}
            </small>
          </div>
          <div className="buy-actions">
            <button
              className="buy-now-button"
              onClick={buyNow}
              disabled={isUnavailable}
            >
              {isUnavailable ? "Sold" : "Buy Now"}
            </button>
            <button
              className="cart-action-button"
              onClick={() => store.addToCart(product, safeQuantity)}
              disabled={isUnavailable}
            >
              {isUnavailable ? "Sold" : "Add to Cart"}
            </button>
          </div>
        </div>
      </section>
      <section className="product-detail-tabs">
        <div className="detail-tab-list">
          {["reviews", "product details", "recommendations"].map((tab) => (
            <button
              className={detailTab === tab ? "active" : ""}
              key={tab}
              onClick={() => setDetailTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>
      <section className="product-detail-area">
        {detailTab === "reviews" && (
          <div className="product-tab-panel">
            <h2>Reviews({reviews.length})</h2>
            <div className="review-toolbar">
              <div className="review-summary">
                <strong>
                  {Number(averageRating || 0).toFixed(1)}
                  <span>/5</span>
                </strong>
                <Rating value={averageRating} count={0} />
              </div>
              <button>Filter by All stars</button>
              <button>Sort by Relevance</button>
            </div>
            {reviewError && <p className="error">{reviewError}</p>}
            {store.user && reviewData.can_review && (
              <form className="review-form" onSubmit={submitReview}>
                <label>
                  Rating
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        rating: Number(e.target.value),
                      })
                    }
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} stars
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Review
                  <textarea
                    required
                    minLength="8"
                    placeholder="Share how the product arrived and performed."
                    value={reviewForm.body}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, body: e.target.value })
                    }
                  />
                </label>
                <button className="wide-button">Submit Review</button>
              </form>
            )}
            {store.user && !reviewData.can_review && (
              <p className="muted">
                You can review this product after a delivered order is confirmed
                received. Each account can review a product once.
              </p>
            )}
            {!store.user && (
              <p className="muted">
                <Link to="/login">Login</Link> to review products you have
                received.
              </p>
            )}
            <div className="review-list">
              {reviews.length === 0 && (
                <p className="muted">No real customer reviews yet.</p>
              )}
              {reviews.map((review) => (
                <article className="review-item" key={review.id}>
                  <div className="review-avatar">
                    {review.user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <b>{review.user?.name || "Customer"}</b>
                    <small>
                      {new Date(review.created_at).toLocaleDateString()}
                    </small>
                    <Rating value={review.rating} count={0} />
                    <p>{review.body}</p>
                    <button className="helpful-button">Helpful(0)</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {detailTab === "product details" && (
          <div className="product-tab-panel">
            <h2>Product Details</h2>
            {product.summary && <p className="summary">{product.summary}</p>}
            <div className="spec-section">
              <h3>Specifications of {product.name}</h3>
              <div className="specs product-spec-grid">
                {Object.entries(specs).length ? (
                  Object.entries(specs).map(([key, value]) => (
                    <p key={key}>
                      <span>{key}</span>
                      <b>{value}</b>
                    </p>
                  ))
                ) : (
                  <p>
                    <span>Brand</span>
                    <b>{product.brand || "KPC"}</b>
                  </p>
                )}
              </div>
            </div>
            <div className="catalog-stack">
              <h3>Product details of {product.name}</h3>
              {catalogImages.length ? (
                catalogImages.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={mediaUrl(image)}
                    alt={`${product.name} catalog ${index + 1}`}
                  />
                ))
              ) : (
                <p className="muted">
                  No catalog images have been added for this product yet.
                </p>
              )}
            </div>
          </div>
        )}

        {detailTab === "recommendations" && (
          <div className="product-tab-panel recommendations-panel">
            <section>
              <h2>Related Products</h2>
              <ProductGrid products={related} onAdd={store.addToCart} />
            </section>
            <section>
              <h2>You may also like</h2>
              <ProductGrid products={youMayAlsoLike} onAdd={store.addToCart} />
            </section>
          </div>
        )}
      </section>
    </Layout>
  );
}
