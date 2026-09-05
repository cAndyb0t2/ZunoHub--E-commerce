import { ArrowLeft, CalendarDays, Check, CircleAlert, ListChecks, Minus, Plus, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/contexts/StoreContext";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const dateLabel = (value: number) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function ProductDetail() {
  const [location] = useLocation();
  const slug = location.split("/").pop() ?? "";
  const productQuery = trpc.zunoApp.catalog.bySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const { addToCart, loading } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [checkedPincode, setCheckedPincode] = useState("");
  const product = productQuery.data;
  const deliveryQuery = trpc.zunoApp.delivery.estimate.useQuery({ pincode: checkedPincode }, { enabled: checkedPincode.length > 0, retry: false });

  if (productQuery.isLoading) return <main className="container page"><div className="detail-skeleton"><div className="skeleton detail-skeleton-image" /><div><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line wide" /><div className="skeleton skeleton-line" /></div></div></main>;
  if (productQuery.isError || !product) return <main className="container page"><div className="empty"><span className="empty-mark">?</span><h1>Product not found</h1><p>This product may have been removed or is not available right now.</p><Link className="primary" href="/products">Back to the store</Link></div></main>;

  const add = async () => {
    if (product.available) await addToCart(product, quantity);
  };
  const checkDelivery = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckedPincode(pincode.trim());
  };
  return <main className="container page">
    <Link className="back-link" href="/products"><ArrowLeft size={16} aria-hidden="true" /> Back to all products</Link>
    <div className="detail-layout">
      <div className="detail-image"><div className="detail-badge">{product.discount ? `${product.discount}% off` : "Daily value"}</div><img src={product.image} alt={product.name} onError={event => { event.currentTarget.src = product.fallbackImage; }} /></div>
      <div className="detail-copy"><p className="product-category">{product.category}</p><h1>{product.name}</h1><p className="detail-unit">{product.unit} · {product.brand}</p><p className="detail-description">{product.description}</p><div className="detail-price"><strong>{money(product.price)}</strong>{product.originalPrice > product.price && <del>{money(product.originalPrice)}</del>}<span>Inclusive of all taxes</span></div><p className={product.available ? "availability available" : "availability unavailable"}>{product.available ? <><Check size={16} aria-hidden="true" /> {product.stock} available for delivery</> : "Currently unavailable"}</p>{product.available && <div className="detail-purchase"><div className="quantity"><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><b aria-live="polite">{quantity}</b><button type="button" onClick={() => setQuantity(value => Math.min(product.stock, value + 1))} aria-label="Increase quantity"><Plus size={15} /></button></div><button className="primary" type="button" disabled={loading} onClick={add}><ShoppingBag size={18} aria-hidden="true" /> Add to bag</button></div>}
        <form className="delivery-checker" onSubmit={checkDelivery}><label htmlFor="delivery-pincode"><CalendarDays size={17} aria-hidden="true" /> Check delivery to your pin code</label><div><input id="delivery-pincode" value={pincode} onChange={event => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" pattern="[0-9]{6}" placeholder="Enter 6-digit pin code" aria-describedby="delivery-help" required /><button type="submit" className="secondary"><Search size={15} aria-hidden="true" /> Check</button></div><small id="delivery-help">Estimated dates are calculated for planning and may change with local availability.</small>{deliveryQuery.isFetching && <p className="delivery-result" role="status">Checking delivery availability…</p>}{deliveryQuery.data && !deliveryQuery.isFetching && <p className={`delivery-result ${deliveryQuery.data.eligible ? "available" : "unavailable"}`} role="status">{deliveryQuery.data.eligible && deliveryQuery.data.minDate && deliveryQuery.data.maxDate ? <>Delivery available. Estimated <strong>{dateLabel(deliveryQuery.data.minDate)} – {dateLabel(deliveryQuery.data.maxDate)}</strong> to {deliveryQuery.data.pincode}.</> : deliveryQuery.data.message}</p>}</form>
        <div className="detail-note"><strong>Easy everyday shopping</strong><span>Delivery fee is free above ₹499. Your final total is confirmed at checkout.</span></div></div>
    </div>
    <section className="product-information" aria-labelledby="product-information-title">
      <div className="product-information-heading"><span className="eyebrow">KNOW YOUR PICK</span><h2 id="product-information-title">Product information</h2><p>{product.information.informationNote}</p></div>
      <div className="product-information-grid">
        <article className="information-card nutrition-card"><div className="information-card-heading"><CircleAlert size={18} aria-hidden="true" /><h3>Nutrition facts</h3></div><p className="information-muted">Serving size: {product.information.nutritionFacts.servingSize}</p><dl className="nutrition-list"><div><dt>Energy</dt><dd>{product.information.nutritionFacts.energy}</dd></div><div><dt>Protein</dt><dd>{product.information.nutritionFacts.protein}</dd></div><div><dt>Carbohydrates</dt><dd>{product.information.nutritionFacts.carbohydrates}</dd></div><div><dt>Fat</dt><dd>{product.information.nutritionFacts.fat}</dd></div></dl></article>
        <article className="information-card"><div className="information-card-heading"><CircleAlert size={18} aria-hidden="true" /><h3>Ingredients</h3></div><ul className="information-list">{product.information.ingredients.map(item => <li key={item}>{item}</li>)}</ul></article>
        <article className="information-card"><div className="information-card-heading"><ListChecks size={18} aria-hidden="true" /><h3>How to use</h3></div><ol className="information-list">{product.information.usageInstructions.map(item => <li key={item}>{item}</li>)}</ol></article>
      </div>
    </section>
  </main>;
}
