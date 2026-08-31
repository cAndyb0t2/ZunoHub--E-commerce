import { ArrowLeft, CheckCircle2, CreditCard, MapPin, ShieldCheck, Smartphone } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useStore } from "@/contexts/StoreContext";
import { trpc } from "@/lib/trpc";
import type { MockPaymentResult } from "@shared/dmart";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { cart, cartId, resetCart } = useStore();
  const placeMutation = trpc.dmart.checkout.place.useMutation();
  const paymentMutation = trpc.dmart.payment.mockAuthorize.useMutation();
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card">("cod");
  const [paymentResult, setPaymentResult] = useState<MockPaymentResult | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [error, setError] = useState("");
  const [mockPayment, setMockPayment] = useState({ upiId: "", cardNumber: "", expiry: "", cvv: "" });
  const [form, setForm] = useState({ customerName: user?.name ?? "", phone: "", address: "", city: "", pincode: "" });

  const couponPreview = useMemo(() => {
    const code = coupon.trim().toUpperCase();
    if (code === "ZUNO10" && cart && cart.subtotal >= 399) return Math.min(Math.round((cart.subtotal + cart.delivery) * 0.1), 150);
    if (code === "SAVE50" && cart && cart.subtotal >= 599) return 50;
    return 0;
  }, [cart, coupon]);
  const total = cart ? cart.total - couponPreview : 0;
  if (!cart?.items.length) return <main className="container page"><div className="empty"><h1>Your cart is empty</h1><p>Add a few essentials before checking out.</p><Link className="primary" href="/products">Shop now</Link></div></main>;

  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const changePayment = (method: "cod" | "upi" | "card") => { setPaymentMethod(method); setPaymentResult(null); setPaymentError(""); };
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if ((code === "ZUNO10" && cart.subtotal >= 399) || (code === "SAVE50" && cart.subtotal >= 599)) setCouponMessage(`Applied. You save ${money(couponPreview)} at checkout.`);
    else setCouponMessage("Use ZUNO10 above ₹399 or SAVE50 above ₹599.");
  };
  const simulatePayment = async () => {
    if (paymentMethod === "cod") return;
    setPaymentError("");
    setPaymentResult(null);
    const result = await paymentMutation.mutateAsync({ method: paymentMethod, ...mockPayment });
    setPaymentResult(result);
    if (result.status === "failed") setPaymentError(result.message);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartId) return;
    if (paymentMethod !== "cod" && paymentResult?.status !== "success") {
      setPaymentError("Complete the mock payment step before placing this order.");
      return;
    }
    setError("");
    try {
      const order = await placeMutation.mutateAsync({ cartId, ...form, paymentMethod, couponCode: coupon.trim() || undefined });
      sessionStorage.setItem("zuno-last-order", JSON.stringify(order));
      resetCart();
      navigate(`/order-confirmation?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not place your order. Please try again.");
    }
  };

  return <main className="container page"><Link className="back-link" href="/cart"><ArrowLeft size={16} aria-hidden="true" /> Back to bag</Link><div className="page-heading"><span className="eyebrow">ALMOST THERE</span><h1>Checkout</h1><p>Your details are used only to deliver this order.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><h2><MapPin size={20} aria-hidden="true" /> Delivery address</h2><label>Full name<input value={form.customerName} onChange={event => update("customerName", event.target.value)} autoComplete="name" required /></label><label>Phone number<input value={form.phone} onChange={event => update("phone", event.target.value)} type="tel" inputMode="tel" autoComplete="tel" required /></label><label>Address<textarea value={form.address} onChange={event => update("address", event.target.value)} autoComplete="street-address" rows={3} required /></label><div className="two-col"><label>City<input value={form.city} onChange={event => update("city", event.target.value)} autoComplete="address-level2" required /></label><label>Pin code<input value={form.pincode} onChange={event => update("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5,6}" required /></label></div><h2><CreditCard size={20} aria-hidden="true" /> Payment</h2><div className="payment-options"><label className={paymentMethod === "cod" ? "selected" : ""}><input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => changePayment("cod")} /><span>Cash on delivery<small>Pay when your order arrives</small></span></label><label className={paymentMethod === "upi" ? "selected" : ""}><input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => changePayment("upi")} /><span><Smartphone size={16} aria-hidden="true" /> UPI<small>Simulated payment for testing only</small></span></label><label className={paymentMethod === "card" ? "selected" : ""}><input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => changePayment("card")} /><span><CreditCard size={16} aria-hidden="true" /> Card<small>Simulated payment; no money is charged</small></span></label></div>{paymentMethod === "upi" && <div className="mock-payment"><label htmlFor="upi-id">Demo UPI ID<input id="upi-id" value={mockPayment.upiId} onChange={event => setMockPayment(current => ({ ...current, upiId: event.target.value }))} placeholder="demo@zunobank" autoComplete="off" /></label><button type="button" className="secondary" onClick={simulatePayment} disabled={paymentMutation.isPending}>{paymentMutation.isPending ? "Checking…" : "Simulate UPI payment"}</button></div>}{paymentMethod === "card" && <div className="mock-payment"><label htmlFor="card-number">Demo card number<input id="card-number" value={mockPayment.cardNumber} onChange={event => setMockPayment(current => ({ ...current, cardNumber: event.target.value.replace(/\D/g, "").slice(0, 16) }))} placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="off" /></label><div className="two-col"><label htmlFor="card-expiry">Expiry<input id="card-expiry" value={mockPayment.expiry} onChange={event => setMockPayment(current => ({ ...current, expiry: event.target.value }))} placeholder="12/30" inputMode="numeric" autoComplete="off" /></label><label htmlFor="card-cvv">CVV<input id="card-cvv" value={mockPayment.cvv} onChange={event => setMockPayment(current => ({ ...current, cvv: event.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="123" inputMode="numeric" autoComplete="off" /></label></div><button type="button" className="secondary" onClick={simulatePayment} disabled={paymentMutation.isPending}>{paymentMutation.isPending ? "Checking…" : "Simulate card payment"}</button></div>}{paymentResult?.status === "success" && <div className="payment-success" role="status"><CheckCircle2 size={17} aria-hidden="true" /><span>{paymentResult.message}<small>Transaction: {paymentResult.transactionId}</small></span></div>}{paymentError && <div className="form-error" role="alert">{paymentError}</div>}{error && <div className="form-error" role="alert">{error}</div>}<button className="primary full" disabled={placeMutation.isPending || paymentMutation.isPending}>{placeMutation.isPending ? "Placing your order…" : `Place order · ${money(total)}`}</button></form><aside className="summary checkout-summary"><h2>Order summary</h2>{cart.items.map(item => <p key={item.id}>{item.name} <span>× {item.quantity}</span><b>{money(item.lineTotal)}</b></p>)}<div className="coupon-box"><label htmlFor="coupon">Have a coupon?</label><div><input id="coupon" value={coupon} onChange={event => setCoupon(event.target.value)} placeholder="Enter code" /><button type="button" onClick={applyCoupon}>Apply</button></div><small>{couponMessage || "Try ZUNO10 or SAVE50"}</small></div><p>Items subtotal <b>{money(cart.subtotal)}</b></p>{couponPreview > 0 && <p>Coupon saving <b className="green">− {money(couponPreview)}</b></p>}<p>Delivery <b>{cart.delivery ? money(cart.delivery) : "FREE"}</b></p><hr /><h3>Total <b>{money(total)}</b></h3><div className="safe-note"><ShieldCheck size={17} aria-hidden="true" /> Demo payments are simulated; checkout never stores real card data.</div></aside></div></main>;
}
