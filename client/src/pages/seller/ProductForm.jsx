import { useState, useEffect } from "react";
import api from "../../services/api";
import logo from "../../assets/logo.png";

const CATEGORIES = ["food", "handmade", "clothing", "electronics", "other"];

const CATEGORY_ICONS = {
  food: "🍱",
  handmade: "🎨",
  clothing: "👗",
  electronics: "📱",
  other: "📦",
};

const EMPTY = {
  title: "",
  description: "",
  price: "",
  category: "food",
  stock: "",
  apartment: "",
};

const ProductForm = ({ editData, onSuccess, onCancel }) => {
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        price: editData.price || "",
        category: editData.category || "food",
        stock: editData.stock || "",
        apartment: editData.apartment || "",
      });
      setExisting(editData.images || []);
    } else {
      setForm(EMPTY);
      setExisting([]);
    }
    setImages([]);
    setPreviews([]);
  }, [editData]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImagePick = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removePreview = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExisting = (index) => {
    setExisting((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title) return setError("Product title is required");
    if (!form.description) return setError("Description is required");
    if (!form.price) return setError("Price is required");

    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append("images", img));

      if (editData) {
        await api.put(`/api/products/${editData._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Form header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <img src={logo} alt="Mini Bazar" style={s.headerLogo} />
          <div>
            <h2 style={s.headerTitle}>
              {editData ? "Edit product" : "List a new product"}
            </h2>
            <p style={s.headerSub}>
              {editData
                ? "Update your product details below"
                : "Fill in the details to start selling on Mini Bazar"}
            </p>
          </div>
        </div>
        <button style={s.cancelTopBtn} onClick={onCancel}>
          ✕ Cancel
        </button>
      </div>

      <div style={s.body}>
        {/* Left — details */}
        <div style={s.left}>
          {/* Title */}
          <div style={s.field}>
            <label style={s.label}>
              Product title <span style={s.required}>*</span>
            </label>
            <input
              style={s.input}
              name="title"
              placeholder="e.g. Homemade Biryani, Handmade Earrings..."
              value={form.title}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div style={s.field}>
            <label style={s.label}>
              Description <span style={s.required}>*</span>
            </label>
            <textarea
              style={{ ...s.input, height: 100, resize: "vertical" }}
              name="description"
              placeholder="Describe your product — what it is, how it's made, delivery time..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Price + Stock */}
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>
                Price (₹) <span style={s.required}>*</span>
              </label>
              <div style={s.inputPrefix}>
                <span style={s.prefix}>₹</span>
                <input
                  style={{ ...s.input, paddingLeft: 32, marginBottom: 0 }}
                  name="price"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Stock quantity</label>
              <input
                style={s.input}
                name="stock"
                type="number"
                min="0"
                placeholder="e.g. 10"
                value={form.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category */}
          <div style={s.field}>
            <label style={s.label}>Category</label>
            <div style={s.catGrid}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    ...s.catBtn,
                    ...(form.category === cat ? s.catBtnActive : {}),
                  }}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, category: cat }))
                  }
                >
                  <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[cat]}</span>
                  <span style={{ fontSize: 12, marginTop: 4 }}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Apartment */}
          <div style={s.field}>
            <label style={s.label}>Your flat / tower</label>
            <input
              style={s.input}
              name="apartment"
              placeholder="e.g. Tower B, Flat 204"
              value={form.apartment}
              onChange={handleChange}
            />
            <p style={s.hint}>Shown to buyers after they place an order</p>
          </div>
        </div>

        {/* Right — images */}
        <div style={s.right}>
          <label style={s.label}>
            Product photos
            <span style={s.labelSub}> (up to 4 images)</span>
          </label>

          {/* Existing images — edit mode */}
          {existing.length > 0 && (
            <div style={s.imgSection}>
              <p style={s.imgSectionLabel}>Current photos</p>
              <div style={s.imgGrid}>
                {existing.map((url, i) => (
                  <div key={i} style={s.imgWrap}>
                    <img src={url} alt="" style={s.imgThumb} />
                    <button
                      style={s.imgRemove}
                      onClick={() => removeExisting(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image previews */}
          {previews.length > 0 && (
            <div style={s.imgSection}>
              <p style={s.imgSectionLabel}>New photos</p>
              <div style={s.imgGrid}>
                {previews.map((url, i) => (
                  <div key={i} style={s.imgWrap}>
                    <img src={url} alt="" style={s.imgThumb} />
                    <button
                      style={s.imgRemove}
                      onClick={() => removePreview(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload drop area */}
          {existing.length + previews.length < 4 && (
            <label style={s.dropZone}>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImagePick}
              />
              <div style={s.dropIcon}>📷</div>
              <p style={s.dropTitle}>
                {images.length > 0
                  ? `${images.length} photo${images.length > 1 ? "s" : ""} selected`
                  : "Click to upload photos"}
              </p>
              <p style={s.dropHint}>JPG, PNG or WebP · Max 5MB each</p>
            </label>
          )}

          {/* Tips box */}
          <div style={s.tips}>
            <p style={s.tipsTitle}>📸 Photo tips</p>
            <ul style={s.tipsList}>
              <li>Use natural light for best results</li>
              <li>Show the product from multiple angles</li>
              <li>Clean, plain backgrounds work best</li>
              <li>Square photos look best on the listing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        {error && <div style={s.errorBox}>⚠️ {error}</div>}
        <div style={s.footerActions}>
          <button style={s.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button
            style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? editData
                ? "Saving changes..."
                : "Adding product..."
              : editData
                ? "✓ Save changes"
                : "+ Add to Mini Bazar"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RED = "#e53935";
const REDLT = "#ffebee";
const REDDK = "#c62828";

const s = {
  page: {
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    overflow: "hidden",
    maxWidth: 900,
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 28px",
    backgroundColor: RED,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  headerLogo: {
    width: 48,
    height: 48,
    objectFit: "contain",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
  },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" },
  headerSub: {
    margin: "3px 0 0",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  cancelTopBtn: {
    padding: "8px 16px",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },

  // Body
  body: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 0 },
  left: { padding: "24px 28px", borderRight: "1px solid #f5f5f5" },
  right: { padding: "24px 24px", backgroundColor: "#fafafa" },

  // Fields
  field: { marginBottom: 18 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#333",
    marginBottom: 6,
  },
  labelSub: { fontSize: 12, fontWeight: 400, color: "#999" },
  required: { color: RED },
  input: {
    width: "100%",
    padding: "11px 14px",
    fontSize: 14,
    border: "1.5px solid #e8e8e8",
    borderRadius: 9,
    marginBottom: 0,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "sans-serif",
    color: "#333",
    transition: "border-color 0.2s",
  },
  hint: { margin: "5px 0 0", fontSize: 11, color: "#aaa" },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 18,
  },
  inputPrefix: { position: "relative" },
  prefix: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    color: "#999",
    pointerEvents: "none",
  },

  // Category buttons
  catGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 },
  catBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px 4px",
    border: "1.5px solid #e8e8e8",
    borderRadius: 10,
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#555",
    transition: "all 0.15s",
  },
  catBtnActive: { borderColor: RED, backgroundColor: REDLT, color: REDDK },

  // Images
  imgSection: { marginBottom: 14 },
  imgSectionLabel: {
    fontSize: 11,
    color: "#999",
    margin: "0 0 8px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  imgGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 },
  imgWrap: { position: "relative" },
  imgThumb: {
    width: "100%",
    aspectRatio: "1",
    objectFit: "cover",
    borderRadius: 8,
    border: "1px solid #eee",
    display: "block",
  },
  imgRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 9,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  dropZone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: `2px dashed #e0e0e0`,
    borderRadius: 12,
    padding: "28px 16px",
    cursor: "pointer",
    marginBottom: 16,
    transition: "border-color 0.2s",
    backgroundColor: "#fff",
  },
  dropIcon: { fontSize: 32, marginBottom: 8 },
  dropTitle: {
    margin: "0 0 4px",
    fontSize: 14,
    fontWeight: 600,
    color: "#444",
  },
  dropHint: { margin: 0, fontSize: 11, color: "#bbb" },

  // Tips
  tips: {
    backgroundColor: "#fff",
    border: "1px solid #f0f0f0",
    borderRadius: 10,
    padding: "14px 16px",
  },
  tipsTitle: {
    margin: "0 0 8px",
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
  },
  tipsList: {
    margin: 0,
    paddingLeft: 18,
    color: "#888",
    fontSize: 12,
    lineHeight: 1.8,
  },

  // Footer
  footer: {
    padding: "16px 28px",
    borderTop: "1px solid #f0f0f0",
    backgroundColor: "#fff",
  },
  errorBox: {
    backgroundColor: REDLT,
    color: REDDK,
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
    border: `1px solid ${RED}`,
  },
  footerActions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  cancelBtn: {
    padding: "11px 22px",
    backgroundColor: "#fff",
    border: "1.5px solid #ddd",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 14,
    color: "#666",
    fontWeight: 500,
  },
  submitBtn: {
    padding: "11px 28px",
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
};

export default ProductForm;
