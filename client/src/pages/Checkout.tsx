import { ArrowLeft, CheckCircle2, CreditCard, MapPin, Smartphone } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useStore } from "@/contexts/StoreContext";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { cart, cartId, resetCart } = useStore();
  const placeMutation = trpc.dmart.checkout.place.useMutation();
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card">("cod");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ customerName: user?.name ?? "", phone: "", address: "", city: "", pincode: "" });

  const couponPreview = useMemo(() => {
    const code = coupon.trim().toUpperCase();
    if (code === "DMART10" && cart && cart.subtotal >= 399) return Math.min(Math.round((cart.subtotal + cart.delivery) * 0.1), 150);
    if (code === "SAVE50" && cart && cart.subtotal >= 599) return 50;
    return 0;
  }, [cart, coupon]);
  const total = cart ? cart.total - couponPreview : 0;
  if (!cart?.items.length) return <main className="container page"><div className="empty"><h1>Your cart is empty</h1><p>Add a few essentials before checking out.</p><Link className="primary" href="/products">Shop now</Link></div></main>;

  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if ((code === "DMART10" && cart.subtotal >= 399) || (code === "SAVE50" && cart.subtotal >= 599)) setCouponMessage(`Applied. You save ${money(couponPreview)} at checkout.`);
    else setCouponMessage("Use DMART10 above ₹399 or SAVE50 above ₹599.");
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartId) return;
    setError("");
    try {
      const order = await placeMutation.mutateAsync({ cartId, ...form, paymentMethod, couponCode: coupon.trim() || undefined });
      sessionStorage.setItem("dmart-last-order", JSON.stringify(order));
      resetCart();
      navigate(`/order-confirmation?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not place your order. Please try again.");
    }
  };

  return <main className="container page"><Link className="back-link" href="/cart"><ArrowLeft size={16} aria-hidden="true" /> Back to cart</Link><div className="page-heading"><span className="eyebrow">ALMOST THERE</span><h1>Checkout</h1><p>Your details are used only to deliver this order.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><h2><MapPin size={20} aria-hidden="true" /> Delivery address</h2><label>Full name<input value={form.customerName} onChange={event => update("customerName", event.target.value)} autoComplete="name" required /></label><label>Phone number<input value={form.phone} onChange={event => update("phone", event.target.value)} type="tel" inputMode="tel" autoComplete="tel" required /></label><label>Address<textarea value={form.address} onChange={event => update("address", event.target.value)} autoComplete="street-address" rows={3} required /></label><div className="two-col"><label>City<input value={form.city} onChange={event => update("city", event.target.value)} autoComplete="address-level2" required /></label><label>Pincode<input value={form.pincode} onChange={event => update("pincode", event.target.value)} inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5,6}" required /></label></div><h2><CreditCard size={20} aria-hidden="true" /> Payment preference</h2><div className="payment-options"><label className={paymentMethod === "cod" ? "selected" : ""}><input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /><span>Cash on delivery<small>Pay when your order arrives</small></span></label><label className={paymentMethod === "upi" ? "selected" : ""}><input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /><span><Smartphone size={16} aria-hidden="true" /> UPI<small>Payment preference recorded for fulfilment</small></span></label><label className={paymentMethod === "card" ? "selected" : ""}><input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /><span>Credit or debit card<small>No card details are stored by DMart</small></span></label></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary full" disabled={placeMutation.isPending}>{placeMutation.isPending ? "Placing your order…" : `Place order · ${money(total)}`}</button></form><aside className="summary checkout-summary"><h2>Order summary</h2>{cart.items.map(item => <p key={item.id}>{item.name} <span>× {item.quantity}</span><b>{money(item.lineTotal)}</b></p>)}<div className="coupon-box"><label htmlFor="coupon">Have a coupon?</label><div><input id="coupon" value={coupon} onChange={event => setCoupon(event.target.value)} placeholder="Enter code" /><button type="button" onClick={applyCoupon}>Apply</button></div><small>{couponMessage || "Try DMART10 or SAVE50"}</small></div><p>Items subtotal <b>{money(cart.subtotal)}</b></p>{couponPreview > 0 && <p>Coupon saving <b className="green">− {money(couponPreview)}</b></p>}<p>Delivery <b>{cart.delivery ? money(cart.delivery) : "FREE"}</b></p><hr /><h3>Total <b>{money(total)}</b></h3><div className="safe-note"><CheckCircle2 size={17} aria-hidden="true" /> Your order is confirmed by the DMart store team.</div></aside></div></main>;
}
