import { ArrowLeft, MapPin, PackageCheck, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { OrderTracker } from "@/components/zunoApp/OrderTracker";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const statusLabel: Record<string, string> = { confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled", pending: "Pending" };

export default function OrderTracking() {
  const [location] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const routePath = typeof window === "undefined" ? location : window.location.pathname;
  const orderNumber = decodeURIComponent(routePath.split("/").filter(Boolean).pop() ?? "");
  const orderQuery = trpc.zunoApp.orders.byNumber.useQuery({ orderNumber }, { enabled: isAuthenticated && orderNumber.length > 0 });
  if (loading) return <main className="container page"><div className="state-card"><div className="spinner" /> Checking your account…</div></main>;
  if (!isAuthenticated) return <main className="container page"><div className="empty"><PackageCheck size={34} aria-hidden="true" /><h1>Sign in to track this order.</h1><p>Order tracking is private to your ZunoHub account.</p><button className="primary" onClick={() => startLogin()}>Sign in <ShoppingBag size={17} aria-hidden="true" /></button></div></main>;
  if (orderQuery.isLoading) return <main className="container page"><div className="state-card"><div className="spinner" /> Loading order tracking…</div></main>;
  if (orderQuery.isError || !orderQuery.data) return <main className="container page"><Link className="back-link" href="/orders"><ArrowLeft size={16} aria-hidden="true" /> Back to orders</Link><div className="empty"><span className="empty-mark">?</span><h1>Order not found</h1><p>We could not find this order in your account.</p><Link className="primary" href="/orders">Return to order history</Link></div></main>;
  const order = orderQuery.data;
  return <main className="container page"><Link className="back-link" href="/orders"><ArrowLeft size={16} aria-hidden="true" /> Back to order history</Link><div className="tracking-heading"><div><span className="eyebrow">ORDER {order.orderNumber}</span><h1>{statusLabel[order.status] ?? "Order status"}</h1><p>Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p></div><span className={`status status-${order.status}`}>{statusLabel[order.status] ?? order.status}</span></div><div className="tracking-layout"><section className="tracking-card"><h2>Delivery progress</h2><OrderTracker status={order.status} /></section><aside className="tracking-card delivery-summary"><h2><MapPin size={18} aria-hidden="true" /> Delivery details</h2><p><b>{order.customerName}</b><br />{order.address}<br />{order.city} · {order.pincode}<br />{order.phone}</p><hr /><p>Payment <b>{order.paymentMethod === "cod" ? "Cash on delivery" : "Payment recorded"}</b></p><p>Total <b>{money(order.total)}</b></p></aside></div><section className="tracking-card tracking-items"><h2>Items in this order</h2>{order.items.map(item => <div key={`${order.id}-${item.productId}`}><span>{item.name}<small>{item.unit} · quantity {item.quantity}</small></span><b>{money(item.lineTotal)}</b></div>)}</section></main>;
}
