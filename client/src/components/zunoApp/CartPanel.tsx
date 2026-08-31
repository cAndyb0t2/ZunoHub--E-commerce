import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/contexts/StoreContext";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function CartPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, loading, updateQuantity } = useStore();
  if (!open) return null;
  return <div className="cart-panel-layer" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="cart-panel" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="cart-panel-header"><div><span className="eyebrow">YOUR BAG</span><h2>Shopping bag</h2></div><button className="panel-close" type="button" onClick={onClose} aria-label="Close shopping bag"><X size={20} /></button></div>
      {loading && !cart ? <div className="panel-state"><div className="spinner" /> Loading your bag…</div> : !cart?.items.length ? <div className="panel-state"><ShoppingBag size={30} aria-hidden="true" /><h3>Your bag is empty</h3><p>Add a few essentials and they’ll appear here.</p><Link className="primary" href="/products" onClick={onClose}>Start shopping</Link></div> : <>
        <div className="panel-items">{cart.items.map(item => <div className="panel-item" key={item.id}><img src={item.image} alt="" /><div className="panel-item-copy"><b>{item.name}</b><small>{item.unit} · {money(item.price)}</small><div className="quantity"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name}`}><Minus size={13} /></button><b aria-live="polite">{item.quantity}</b><button type="button" disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name}`}><Plus size={13} /></button></div></div><strong>{money(item.lineTotal)}</strong></div>)}</div>
        <div className="panel-summary"><p>Items subtotal <b>{money(cart.subtotal)}</b></p><p>Delivery <b>{cart.delivery ? money(cart.delivery) : "FREE"}</b></p><hr /><h3>Total <b>{money(cart.total)}</b></h3><Link className="primary full" href="/checkout" onClick={onClose}>Checkout <ArrowRight size={16} aria-hidden="true" /></Link><Link className="panel-cart-link" href="/cart" onClick={onClose}>View full bag</Link></div>
      </>}
    </aside>
  </div>;
}
