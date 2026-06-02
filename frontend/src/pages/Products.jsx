import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Layout, ProductGrid } from "../components/shared";

export function Products({ store, hotOnly = false }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const search = params.get("search")?.toLowerCase() || "";
  const category = params.get("category");
  const top = params.get("top");
  const [activeCategory, setActiveCategory] = useState(category || "");

  const filtered = store.products.filter((product) => {
    if (hotOnly && !product.is_hot) return false;
    if (top && !product.is_top_seller) return false;
    if (activeCategory && product.category?.slug !== activeCategory)
      return false;
    if (
      search &&
      !`${product.name} ${product.brand} ${product.summary}`
        .toLowerCase()
        .includes(search)
    )
      return false;
    return true;
  });

  return (
    <Layout store={store}>
      <section className="page-head">
        <h1>{hotOnly ? "Hot Products" : "Shop Products"}</h1>
        <p>
          {hotOnly
            ? "Here is the best products to buy"
            : "Search, filter, and build your next PC setup."}
        </p>
      </section>
      <section className="section">
        {!hotOnly && (
          <div className="filters">
            <button onClick={() => setActiveCategory("")}>All</button>
            {store.categories.map((item) => (
              <button
                className={activeCategory === item.slug ? "active" : ""}
                onClick={() => setActiveCategory(item.slug)}
                key={item.id}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
        <ProductGrid products={filtered} onAdd={store.addToCart} />
      </section>
    </Layout>
  );
}
