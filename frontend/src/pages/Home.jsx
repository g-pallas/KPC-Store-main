import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Headphones, RefreshCcw, Truck } from "lucide-react";
import { Layout, ProductGrid } from "../components/shared";
import { mediaUrl } from "../lib/kpc";

export function Home({ store }) {
  const categoryRef = useRef(null);
  const newProducts = store.products.filter((product) => product.is_new);
  const topProducts = store.products.filter((product) => product.is_top_seller);
  const scrollCategories = (direction) => {
    categoryRef.current?.scrollBy({
      left: direction * 640,
      behavior: "smooth",
    });
  };

  return (
    <Layout store={store}>
      <section className="hero">
        <div>
          <span>Deals</span>
          <h1>Grab on the Best Deals</h1>
          <h2>Free Shipping Nationwide</h2>
          <p>
            Big discounts on specific products. Up to 50% off with vouchers.
          </p>
          <Link className="pill-button" to="/products">
            Shop Now
          </Link>
        </div>
        <img src="/images/main-bg1.jpg" alt="Gaming PC case" />
      </section>
      <section className="section">
        <h2>Categories</h2>
        <div className="category-shell">
          <button
            className="category-arrow category-arrow-left"
            onClick={() => scrollCategories(-1)}
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={34} />
          </button>
          <div className="category-row" ref={categoryRef}>
            {store.categories.map((category) => (
              <Link
                to={`/products?category=${category.slug}`}
                key={category.id}
                className="category-card"
              >
                <img src={mediaUrl(category.image)} alt={category.name} />
                <b>{category.name}</b>
              </Link>
            ))}
          </div>
          <button
            className="category-arrow category-arrow-right"
            onClick={() => scrollCategories(1)}
            aria-label="Scroll categories right"
          >
            <ChevronRight size={34} />
          </button>
        </div>
      </section>
      <section className="section">
        <h2>New Arrivals</h2>
        <ProductGrid products={newProducts} onAdd={store.addToCart} />
      </section>
      <section className="sale-row">
        <div>
          <b>Budget Builds</b>
          <span>Sale Off 25%</span>
          <img src="/images/sale1.png" alt="" />
        </div>
        <div>
          <b>Last Gen Graphics Cards</b>
          <span>Sale Off 45%</span>
          <img src="/images/sale2.png" alt="" />
        </div>
        <div>
          <b>RGB Fans</b>
          <span>Sale Off 15%</span>
          <img src="/images/sale3.png" alt="" />
        </div>
      </section>
      <section className="section">
        <div className="heading-row">
          <h2>Top Sellers</h2>
          <Link to="/hot-products">All</Link>
        </div>
        <ProductGrid products={topProducts} onAdd={store.addToCart} />
      </section>
      <section className="help-band">
        <span>Support</span>
        <h2>Need Any Help?</h2>
        <a className="pill-button" href="mailto:example@mail.com">
          Contact Us
        </a>
      </section>
      <section className="service-row">
        <div>
          <Truck />
          <b>Free Shipping</b>
          <span>Free shipping for all orders</span>
        </div>
        <div>
          <Headphones />
          <b>Support</b>
          <span>We support 24h a day</span>
        </div>
        <div>
          <RefreshCcw />
          <b>100% Money Back</b>
          <span>You have 30 days to return</span>
        </div>
      </section>
    </Layout>
  );
}
