import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  FolderTree,
  LogOut,
  Mail,
  PackageCheck,
  Users,
} from "lucide-react";
import { Layout } from "../../components/shared";
import {
  api,
  currency,
  emptySpecsFor,
  mediaUrl,
  moneyNumber,
} from "../../lib/kpc";
import { Auth } from "../user/Auth";

export function Admin({ store }) {
  const emptyProduct = {
    name: "",
    price: "",
    old_price: "",
    stock: 1,
    brand: "",
    category_id: "",
    primary_image: "/images/r1-3.png",
    gallery_images: [],
    detail_images: [],
    summary: "",
    specifications: emptySpecsFor(),
    is_hot: false,
    is_new: true,
    is_top_seller: false,
    is_sold: false,
  };
  const emptyCategory = { name: "", image: "/images/c1.png" };
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [users, setUsers] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [notice, setNotice] = useState("");
  const [adminError, setAdminError] = useState("");
  const [newSpec, setNewSpec] = useState({ key: "", value: "" });

  const load = useCallback(async () => {
    if (!store.token || store.user?.role !== "admin") return;
    const [
      adminDashboard,
      adminProducts,
      adminCategories,
      adminOrders,
      adminSubscribers,
      adminUsers,
    ] = await Promise.all([
      api("/admin/dashboard", {}, store.token),
      api("/admin/products", {}, store.token),
      api("/admin/categories", {}, store.token),
      api("/admin/orders", {}, store.token),
      api("/admin/subscribers", {}, store.token),
      api("/admin/users", {}, store.token),
    ]);
    setDashboard(adminDashboard);
    setProducts(adminProducts);
    setCategories(adminCategories);
    setOrders(adminOrders);
    setSubscribers(adminSubscribers);
    setUsers(adminUsers);
  }, [store.token, store.user?.role]);

  useEffect(() => {
    let cancelled = false;
    if (!store.token || store.user?.role !== "admin") return undefined;

    Promise.all([
      api("/admin/dashboard", {}, store.token),
      api("/admin/products", {}, store.token),
      api("/admin/categories", {}, store.token),
      api("/admin/orders", {}, store.token),
      api("/admin/subscribers", {}, store.token),
      api("/admin/users", {}, store.token),
    ])
      .then(
        ([
          adminDashboard,
          adminProducts,
          adminCategories,
          adminOrders,
          adminSubscribers,
          adminUsers,
        ]) => {
          if (cancelled) return;
          setDashboard(adminDashboard);
          setProducts(adminProducts);
          setCategories(adminCategories);
          setOrders(adminOrders);
          setSubscribers(adminSubscribers);
          setUsers(adminUsers);
        },
      )
      .catch((err) => {
        if (!cancelled) setAdminError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [store.token, store.user?.role]);

  function productPayload() {
    const specifications = Object.fromEntries(
      Object.entries(productForm.specifications || {})
        .map(([key, value]) => [key.trim(), String(value ?? "").trim()])
        .filter(([key, value]) => key && value),
    );

    return {
      ...productForm,
      price: moneyNumber(productForm.price),
      old_price: productForm.old_price
        ? moneyNumber(productForm.old_price)
        : null,
      stock: moneyNumber(productForm.stock),
      category_id: productForm.category_id
        ? Number(productForm.category_id)
        : null,
      specifications,
      gallery_images: productForm.gallery_images || [],
      detail_images: productForm.detail_images || [],
      rating: 0,
      review_count: 0,
    };
  }

  async function saveProduct(event) {
    event.preventDefault();
    try {
      const path = editingProductId
        ? `/admin/products/${editingProductId}`
        : "/admin/products";
      await api(
        path,
        {
          method: editingProductId ? "PUT" : "POST",
          body: JSON.stringify(productPayload()),
        },
        store.token,
      );
      setProductForm(emptyProduct);
      setEditingProductId(null);
      setNotice(editingProductId ? "Product updated." : "Product created.");
      setAdminError("");
      await store.refresh();
      await load();
    } catch (err) {
      setAdminError(err.message);
    }
  }

  async function uploadAdminImage(file, folder, onUploaded) {
    if (!file) return;
    const body = new FormData();
    body.append("image", file);
    body.append("folder", folder);
    const uploaded = await api(
      "/admin/uploads/image",
      { method: "POST", body },
      store.token,
    );
    onUploaded(uploaded.path);
    setNotice("Image uploaded.");
  }

  async function uploadProductImages(files, targetKey, label) {
    if (!files?.length) return;
    const uploadedPaths = [];
    for (const file of files) {
      const body = new FormData();
      body.append("image", file);
      body.append("folder", "products");
      const uploaded = await api(
        "/admin/uploads/image",
        { method: "POST", body },
        store.token,
      );
      uploadedPaths.push(uploaded.path);
    }
    setProductForm((current) => ({
      ...current,
      [targetKey]: [...(current[targetKey] || []), ...uploadedPaths],
    }));
    setNotice(`${label} uploaded.`);
  }

  function updateSpec(key, value) {
    setProductForm((current) => ({
      ...current,
      specifications: { ...(current.specifications || {}), [key]: value },
    }));
  }

  function removeSpec(key) {
    setProductForm((current) => {
      const nextSpecs = { ...(current.specifications || {}) };
      delete nextSpecs[key];
      return { ...current, specifications: nextSpecs };
    });
  }

  function addSpec() {
    const key = newSpec.key.trim();
    if (!key) return;
    setProductForm((current) => ({
      ...current,
      specifications: {
        ...(current.specifications || {}),
        [key]: newSpec.value,
      },
    }));
    setNewSpec({ key: "", value: "" });
  }

  function applyCategorySpecs(categoryId, reset = false) {
    const category = categories.find(
      (item) => String(item.id) === String(categoryId),
    );
    const nextTemplate = emptySpecsFor(category?.name || "");
    setProductForm((current) => ({
      ...current,
      category_id: categoryId,
      specifications: reset
        ? nextTemplate
        : { ...nextTemplate, ...(current.specifications || {}) },
    }));
  }

  function editProduct(product) {
    setProductForm({
      name: product.name,
      price: product.price,
      old_price: product.old_price || "",
      stock: product.stock,
      brand: product.brand || "",
      category_id: product.category_id || "",
      primary_image: product.primary_image || "",
      gallery_images: product.images?.map((image) => image.path) || [],
      detail_images: product.detail_images?.map((image) => image.path) || [],
      summary: product.summary || "",
      specifications: {
        ...emptySpecsFor(product.category?.name || ""),
        ...(product.specifications || {}),
      },
      is_hot: product.is_hot,
      is_new: product.is_new,
      is_top_seller: product.is_top_seller,
      is_sold: product.is_sold,
    });
    setEditingProductId(product.id);
    setActiveTab("products");
  }

  async function deleteProduct(product) {
    if (!confirm(`Delete ${product.name}?`)) return;
    try {
      await api(
        `/admin/products/${product.id}`,
        { method: "DELETE" },
        store.token,
      );
      setNotice("Product deleted.");
      setAdminError("");
      await store.refresh();
      await load();
    } catch (err) {
      setAdminError(err.message);
    }
  }

  async function saveCategory(event) {
    event.preventDefault();
    const path = editingCategoryId
      ? `/admin/categories/${editingCategoryId}`
      : "/admin/categories";
    await api(
      path,
      {
        method: editingCategoryId ? "PUT" : "POST",
        body: JSON.stringify(categoryForm),
      },
      store.token,
    );
    setCategoryForm(emptyCategory);
    setEditingCategoryId(null);
    setNotice(editingCategoryId ? "Category updated." : "Category created.");
    await store.refresh();
    await load();
  }

  function editCategory(category) {
    setCategoryForm({ name: category.name, image: category.image || "" });
    setEditingCategoryId(category.id);
    setActiveTab("categories");
  }

  async function deleteCategory(category) {
    if (
      !confirm(
        `Delete ${category.name}? Products in this category will remain uncategorized.`,
      )
    )
      return;
    await api(
      `/admin/categories/${category.id}`,
      { method: "DELETE" },
      store.token,
    );
    setNotice("Category deleted.");
    await store.refresh();
    await load();
  }

  async function updateStatus(order, status) {
    await api(
      `/admin/orders/${order.id}/status`,
      { method: "PUT", body: JSON.stringify({ status }) },
      store.token,
    );
    load();
  }

  async function deleteSubscriber(subscriber) {
    await api(
      `/admin/subscribers/${subscriber.id}`,
      { method: "DELETE" },
      store.token,
    );
    setNotice("Subscriber removed.");
    load();
  }

  async function updateUserRole(user, role) {
    try {
      await api(
        `/admin/users/${user.id}/role`,
        { method: "PUT", body: JSON.stringify({ role }) },
        store.token,
      );
      setNotice(`${user.name} is now ${role}.`);
      setAdminError("");
      await load();
    } catch (err) {
      setAdminError(err.message);
    }
  }

  async function deleteUser(user) {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api(
        `/admin/users/${user.id}`,
        { method: "DELETE" },
        store.token,
      );
      setNotice("User deleted.");
      setAdminError("");
      await load();
    } catch (err) {
      setAdminError(err.message);
    }
  }

  if (!store.user) return <Auth store={store} mode="login" />;
  if (store.user.role !== "admin")
    return (
      <Layout store={store}>
        <section className="page-head">
          <h1>Admin access required</h1>
        </section>
      </Layout>
    );

  const activeProducts = products.filter((product) => !product.is_sold);
  const soldProducts = products.filter((product) => product.is_sold);
  const lowStockProducts = products.filter(
    (product) => !product.is_sold && Number(product.stock) > 0 && Number(product.stock) <= 5,
  );
  const outOfStockProducts = products.filter(
    (product) => !product.is_sold && Number(product.stock) <= 0,
  );
  const uncategorizedProducts = products.filter((product) => !product.category_id);
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const activeOrders = orders.filter((order) =>
    ["pending", "processing", "shipped", "delivered"].includes(order.status),
  );
  const completedOrders = orders.filter((order) => order.status === "completed");
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");
  const adminUsers = users.filter((user) => user.role === "admin");
  const customerUsers = users.filter((user) => user.role === "customer");
  const stockUnits = activeProducts.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0,
  );
  const inventoryValue = activeProducts.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
    0,
  );
  const alerts = [
    ...lowStockProducts.map((product) => ({
      key: `low-${product.id}`,
      title: "Low stock",
      message: `${product.name} has ${product.stock} item(s) left.`,
      tab: "products",
    })),
    ...outOfStockProducts.map((product) => ({
      key: `out-${product.id}`,
      title: "Out of stock",
      message: `${product.name} cannot be purchased until restocked or marked sold.`,
      tab: "products",
    })),
    ...uncategorizedProducts.map((product) => ({
      key: `cat-${product.id}`,
      title: "Missing category",
      message: `${product.name} is not assigned to a category.`,
      tab: "products",
    })),
    ...pendingOrders.map((order) => ({
      key: `order-${order.id}`,
      title: "Pending order",
      message: `${order.order_number} is waiting for processing.`,
      tab: "orders",
    })),
  ].slice(0, 8);

  return (
    <Layout store={store}>
      <section className="admin-head">
        <div>
          <span className="muted">Store control center</span>
          <h1>Admin Dashboard</h1>
        </div>
        <button className="small-button" onClick={store.logout}>
          <LogOut size={16} /> Logout
        </button>
      </section>
      <section className="admin-tabs">
        {[
          "dashboard",
          "products",
          "categories",
          "orders",
          "customers",
          "subscribers",
        ].map((tab) => (
          <button
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </button>
        ))}
      </section>
      <section className="admin-shell">
        {notice && <p className="notice">{notice}</p>}
        {adminError && <p className="error">{adminError}</p>}
        {activeTab === "dashboard" && dashboard && (
          <>
            <div className="admin-metrics detailed-metrics">
              {[
                [Boxes, dashboard.products, "Products", `${activeProducts.length} active / ${soldProducts.length} sold`],
                [FolderTree, dashboard.categories, "Categories", `${uncategorizedProducts.length} uncategorized products`],
                [ClipboardList, dashboard.orders, "Orders", `${activeOrders.length} active / ${completedOrders.length} completed`],
                [AlertTriangle, dashboard.pending_orders, "Pending", `${cancelledOrders.length} cancelled`],
                [Users, dashboard.customers, "Customers", `${adminUsers.length} admin account(s)`],
                [Mail, dashboard.subscribers || subscribers.length, "Subscribers", "Email marketing list"],
                [PackageCheck, stockUnits, "Stock units", `${lowStockProducts.length} low stock alert(s)`],
                [Boxes, currency(inventoryValue), "Inventory value", "Active product stock value"],
              ].map(([Icon, value, label, meta]) => (
                <article key={label}>
                  <Icon size={22} />
                  <b>{value}</b>
                  <span>{label}</span>
                  <small>{meta}</small>
                </article>
              ))}
            </div>

            <div className="admin-dashboard-grid">
              <section className="admin-panel admin-alerts">
                <div className="admin-panel-head">
                  <h2>Alerts</h2>
                  <span>{alerts.length || "No"} active</span>
                </div>
                {alerts.length === 0 && (
                  <p className="muted">No inventory, catalog, or order alerts right now.</p>
                )}
                {alerts.map((alert) => (
                  <button
                    className="admin-alert"
                    key={alert.key}
                    onClick={() => setActiveTab(alert.tab)}
                  >
                    <AlertTriangle size={18} />
                    <span>
                      <b>{alert.title}</b>
                      <small>{alert.message}</small>
                    </span>
                  </button>
                ))}
              </section>

              <section className="admin-panel">
                <div className="admin-panel-head">
                  <h2>Product Summary</h2>
                  <button onClick={() => setActiveTab("products")}>Manage</button>
                </div>
                <div className="admin-summary-list">
                  <p><span>Active products</span><b>{activeProducts.length}</b></p>
                  <p><span>Sold products</span><b>{soldProducts.length}</b></p>
                  <p><span>Low stock</span><b>{lowStockProducts.length}</b></p>
                  <p><span>Out of stock</span><b>{outOfStockProducts.length}</b></p>
                  <p><span>Inventory value</span><b>{currency(inventoryValue)}</b></p>
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-head">
                  <h2>Order Summary</h2>
                  <button onClick={() => setActiveTab("orders")}>Manage</button>
                </div>
                <div className="admin-summary-list">
                  {["pending", "processing", "shipped", "delivered", "completed", "cancelled"].map((status) => (
                    <p key={status}>
                      <span>{status}</span>
                      <b>{orders.filter((order) => order.status === status).length}</b>
                    </p>
                  ))}
                  <p><span>Revenue</span><b>{currency(dashboard.revenue)}</b></p>
                </div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-head">
                  <h2>People</h2>
                  <button onClick={() => setActiveTab("customers")}>Manage</button>
                </div>
                <div className="admin-summary-list">
                  <p><span>Customers</span><b>{customerUsers.length}</b></p>
                  <p><span>Admins</span><b>{adminUsers.length}</b></p>
                  <p><span>Subscribers</span><b>{subscribers.length}</b></p>
                  <p><span>Recent signups</span><b>{users.slice(0, 5).length}</b></p>
                </div>
              </section>
            </div>
          </>
        )}
        {activeTab === "products" && (
          <div className="admin-grid">
            <form className="admin-panel" onSubmit={saveProduct}>
              <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>
              <input
                placeholder="Product name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                required
              />
              <input
                placeholder="Brand"
                value={productForm.brand}
                onChange={(e) =>
                  setProductForm({ ...productForm, brand: e.target.value })
                }
              />
              <select
                value={productForm.category_id}
                onChange={(e) => applyCategorySpecs(e.target.value, true)}
                required
              >
                <option value="">Category</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="upload-field">
                Main product image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadAdminImage(e.target.files?.[0], "products", (path) =>
                      setProductForm({ ...productForm, primary_image: path }),
                    )
                  }
                />
              </label>
              {productForm.primary_image && (
                <img
                  className="admin-preview"
                  src={mediaUrl(productForm.primary_image)}
                  alt="Product preview"
                />
              )}
              <label className="upload-field">
                Gallery images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    uploadProductImages(
                      Array.from(e.target.files || []),
                      "gallery_images",
                      "Gallery images",
                    )
                  }
                />
              </label>
              {!!productForm.gallery_images?.length && (
                <div className="admin-detail-image-list">
                  {productForm.gallery_images.map((path, index) => (
                    <div
                      key={`${path}-${index}`}
                      className="admin-detail-image"
                    >
                      <img src={mediaUrl(path)} alt={`Gallery ${index + 1}`} />
                      <span>Gallery image {index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm((current) => ({
                            ...current,
                            gallery_images: current.gallery_images.filter(
                              (_, imageIndex) => imageIndex !== index,
                            ),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                placeholder="Short product summary"
                value={productForm.summary}
                onChange={(e) =>
                  setProductForm({ ...productForm, summary: e.target.value })
                }
              />
              <div className="admin-spec-editor">
                <div className="admin-field-head">
                  <b>Specifications</b>
                  <button
                    type="button"
                    onClick={() =>
                      applyCategorySpecs(productForm.category_id, true)
                    }
                  >
                    Apply category fields
                  </button>
                </div>
                <small>
                  Use only the specs that matter for this item. Empty fields
                  will not show on the product page.
                </small>
                {Object.entries(productForm.specifications || {}).map(
                  ([key, value]) => (
                    <div className="spec-row" key={key}>
                      <label>
                        {key}
                        <input
                          value={value}
                          onChange={(e) => updateSpec(key, e.target.value)}
                          placeholder={`Enter ${key}`}
                        />
                      </label>
                      <button type="button" onClick={() => removeSpec(key)}>
                        Remove
                      </button>
                    </div>
                  ),
                )}
                <div className="spec-row spec-row-new">
                  <input
                    placeholder="Custom spec name"
                    value={newSpec.key}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, key: e.target.value })
                    }
                  />
                  <input
                    placeholder="Custom spec value"
                    value={newSpec.value}
                    onChange={(e) =>
                      setNewSpec({ ...newSpec, value: e.target.value })
                    }
                  />
                  <button type="button" onClick={addSpec}>
                    Add Spec
                  </button>
                </div>
              </div>
              <label className="upload-field">
                Catalog images for Product Details
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    uploadProductImages(
                      Array.from(e.target.files || []),
                      "detail_images",
                      "Catalog images",
                    )
                  }
                />
              </label>
              {!!productForm.detail_images?.length && (
                <div className="admin-detail-image-list">
                  {productForm.detail_images.map((path, index) => (
                    <div
                      key={`${path}-${index}`}
                      className="admin-detail-image"
                    >
                      <img src={mediaUrl(path)} alt={`Catalog ${index + 1}`} />
                      <span>Catalog image {index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm((current) => ({
                            ...current,
                            detail_images: current.detail_images.filter(
                              (_, imageIndex) => imageIndex !== index,
                            ),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                inputMode="decimal"
                placeholder="Price"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                required
              />
              <input
                inputMode="decimal"
                placeholder="Old price"
                value={productForm.old_price}
                onChange={(e) =>
                  setProductForm({ ...productForm, old_price: e.target.value })
                }
              />
              <input
                inputMode="numeric"
                placeholder="Stock"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
              />
              <div className="check-row">
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.is_hot}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        is_hot: e.target.checked,
                      })
                    }
                  />{" "}
                  Hot
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.is_new}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        is_new: e.target.checked,
                      })
                    }
                  />{" "}
                  New
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.is_top_seller}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        is_top_seller: e.target.checked,
                      })
                    }
                  />{" "}
                  Top seller
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.is_sold}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        is_sold: e.target.checked,
                      })
                    }
                  />{" "}
                  Sold
                </label>
              </div>
              <button className="wide-button">
                {editingProductId ? "Save Product" : "Create Product"}
              </button>
              {editingProductId && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setEditingProductId(null);
                    setProductForm(emptyProduct);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
            <div className="admin-panel">
              <h2>Products</h2>
              {products.map((product) => (
                <div className="admin-row product-admin-row" key={product.id}>
                  <img src={mediaUrl(product.primary_image)} alt="" />
                  <span>
                    {product.name}
                    <small>
                      {product.category?.name || "Uncategorized"} •{" "}
                      {currency(product.price)}
                    </small>
                  </span>
                  <b>{product.is_sold ? "Sold" : product.stock}</b>
                  <button onClick={() => editProduct(product)}>Edit</button>
                  <button onClick={() => deleteProduct(product)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "categories" && (
          <div className="admin-grid">
            <form className="admin-panel" onSubmit={saveCategory}>
              <h2>{editingCategoryId ? "Edit Category" : "Add Category"}</h2>
              <input
                placeholder="Category name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                required
              />
              <label className="upload-field">
                Category image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadAdminImage(
                      e.target.files?.[0],
                      "categories",
                      (path) =>
                        setCategoryForm({ ...categoryForm, image: path }),
                    )
                  }
                />
              </label>
              {categoryForm.image && (
                <img
                  className="admin-preview"
                  src={mediaUrl(categoryForm.image)}
                  alt="Category preview"
                />
              )}
              <button className="wide-button">
                {editingCategoryId ? "Save Category" : "Create Category"}
              </button>
              {editingCategoryId && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryForm(emptyCategory);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
            <div className="admin-panel">
              <h2>Categories</h2>
              {categories.map((category) => (
                <div className="admin-row product-admin-row" key={category.id}>
                  <img src={mediaUrl(category.image)} alt="" />
                  <span>
                    {category.name}
                    <small>{category.products_count || 0} products</small>
                  </span>
                  <button onClick={() => editCategory(category)}>Edit</button>
                  <button onClick={() => deleteCategory(category)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "orders" && (
          <div className="admin-panel">
            <h2>Orders</h2>
            {orders.map((order) => (
              <div className="admin-row order-admin-row" key={order.id}>
                <span>
                  <b>{order.order_number}</b>
                  <small>
                    {order.email} • {order.payment_method} •{" "}
                    {order.shipping_method}
                  </small>
                </span>
                <b>{currency(order.total)}</b>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order, e.target.value)}
                >
                  {[
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "completed",
                    "cancelled",
                  ].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
        {activeTab === "customers" && (
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h2>User Management</h2>
              <span>{users.length} account(s)</span>
            </div>
            {users.map((user) => (
              <div className="admin-row user-admin-row" key={user.id}>
                {(() => {
                  const isCurrentUser =
                    String(user.id) === String(store.user.id);
                  return (
                    <>
                      <span>
                        {user.name}
                        <small>
                          {user.email} • Joined{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </small>
                      </span>
                      <select
                        value={user.role}
                        onChange={(event) =>
                          updateUserRole(user, event.target.value)
                        }
                        disabled={isCurrentUser}
                      >
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                      </select>
                      <b>{isCurrentUser ? "Current admin" : user.role}</b>
                      <button
                        onClick={() => deleteUser(user)}
                        disabled={isCurrentUser}
                      >
                        Delete
                      </button>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
        {activeTab === "subscribers" && (
          <div className="admin-panel">
            <h2>Subscribers</h2>
            {subscribers.map((subscriber) => (
              <div className="admin-row" key={subscriber.id}>
                <span>
                  {subscriber.email}
                  <small>
                    {new Date(subscriber.created_at).toLocaleDateString()}
                  </small>
                </span>
                <button onClick={() => deleteSubscriber(subscriber)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
