import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/contexts/StoreContext";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function ProductDetail() {
  const [location] = useLocation();
  const slug = location.split("/").pop() ?? "";
  const productQuery = trpc.dmart.catalog.bySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const { addToCart, loading } = useStore();
  const [quantity, setQuantity] = useState(1);
  const product = productQuery.data;

  if (productQuery.isLoading) return <main className="container page"><div className="detail-skeleton"><div className="skeleton detail-skeleton-image" /><div><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line wide" /><div className="skeleton skeleton-line" /></div></div></main>;
  if (productQuery.isError || !product) return <main className="container page"><div className="empty"><span className="empty-mark">?</span><h1>Product not found</h1><p>This product may have been removed or is not available right now.</p><Link className="primary" href="/products">Back to the store</Link></div></main>;

  const add = async () => {
    if (product.available) await addToCart(product, quantity);
  };
  return <main className="container page">
    <Link className="back-link" href="/products"><ArrowLeft size={16} aria-hidden="true" /> Back to all products</Link>
    <div className="detail-layout">
      <div className="detail-image"><div className="detail-badge">{product.discount ? `${product.discount}% off` : "Daily value"}</div><img src={product.image} alt={product.name} onError={event => { event.currentTarget.src = product.fallbackImage; }} /></div>
      <div className="detail-copy"><p className="product-category">{product.category}</p><h1>{product.name}</h1><p className="detail-unit">{product.unit} · {product.brand}</p><p className="detail-description">{product.description}</p><div className="detail-price"><strong>{money(product.price)}</strong>{product.originalPrice > product.price && <del>{money(product.originalPrice)}</del>}<span>Inclusive of all taxes</span></div><p className={product.available ? "availability available" : "availability unavailable"}>{product.available ? <><Check size={16} aria-hidden="true" /> {product.stock} available for delivery</> : "Currently unavailable"}</p>{product.available && <div className="detail-purchase"><div className="quantity"><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><b aria-live="polite">{quantity}</b><button type="button" onClick={() => setQuantity(value => Math.min(product.stock, value + 1))} aria-label="Increase quantity"><Plus size={15} /></button></div><button className="primary" type="button" disabled={loading} onClick={add}><ShoppingBag size={18} aria-hidden="true" /> Add to bag</button></div>}<div className="detail-note"><strong>Easy everyday shopping</strong><span>Delivery fee is free above ₹499. Your final total is confirmed at checkout.</span></div></div>
    </div>
  </main>;
}
