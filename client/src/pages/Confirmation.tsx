import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Confirmation() {
  let order: { orderNumber?: string; total?: number } | null = null;
  try {
    order = JSON.parse(sessionStorage.getItem("dmart-last-order") ?? "null");
  } catch {
    order = null;
  }
  return <main className="container page confirmation"><div className="confirmation-icon"><CheckCircle2 size={36} aria-hidden="true" /></div><span className="eyebrow">ORDER PLACED</span><h1>Thank you for shopping with us.</h1><p>Your order has been confirmed and the DMart store team will prepare it for delivery in 2–3 days.</p>{order?.orderNumber && <div className="confirmation-number"><span>Order number</span><b>{order.orderNumber}</b>{typeof order.total === "number" && <small>Total {`₹${order.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}</small>}</div>}<div className="confirmation-actions"><Link className="primary" href="/products">Continue shopping <ArrowRight size={17} aria-hidden="true" /></Link><Link className="secondary" href="/orders">View my orders</Link></div></main>;
}
