import { ArrowRight, PackageCheck, Truck } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { OrderTracker } from "@/components/zunoApp/OrderTracker";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const statusLabel: Record<string, string> = { confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled", pending: "Pending" };

export default function Orders() {
  const { isAuthenticated, loading } = useAuth();
  const ordersQuery = trpc.zunoApp.orders.mine.useQuery(undefined, { enabled: isAuthenticated });
  if (loading) return <main className="container page"><div className="state-card"><div className="spinner" /> Checking your account…</div></main>;
  if (!isAuthenticated) return <main className="container page"><div className="empty"><PackageCheck size={34} aria-hidden="true" /><span className="eyebrow">MY ZUNOHUB</span><h1>Sign in to see your orders.</h1><p>Your order history and delivery tracking are private to your account.</p><button className="primary" onClick={() => startLogin()}>Sign in <ArrowRight size={17} aria-hidden="true" /></button></div></main>;
  return <main className="container page"><div className="page-heading"><span className="eyebrow">MY ZUNOHUB</span><h1>Orders & tracking</h1><p>Review past purchases and follow each delivery from confirmation to doorstep.</p></div>{ordersQuery.isLoading ? <div className="state-card"><div className="spinner" /> Loading your orders…</div> : ordersQuery.isError ? <div className="state-card"><h2>We could not load your orders.</h2><button className="secondary" onClick={() => ordersQuery.refetch()}>Try again</button></div> : ordersQuery.data?.length ? <div className="order-history-list">{ordersQuery.data.map(order => <article className="order-history-card" key={order.id}><div className="order-card-head"><div><span className="eyebrow">{order.orderNumber}</span><h2>{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</h2></div><span className={`status status-${order.status}`}>{statusLabel[order.status] ?? order.status}</span></div><OrderTracker status={order.status} /><div className="order-items">{order.items.slice(0, 3).map(item => <span key={`${order.id}-${item.productId}`}>{item.name} × {item.quantity}</span>)}{order.items.length > 3 && <span>+ {order.items.length - 3} more items</span>}</div><div className="order-card-foot"><span><Truck size={15} aria-hidden="true" /> {order.paymentMethod === "cod" ? "Cash on delivery" : "Payment recorded"}</span><b>{money(order.total)}</b></div><Link className="track-order-link" href={`/orders/${encodeURIComponent(order.orderNumber)}`}>View tracking <ArrowRight size={15} aria-hidden="true" /></Link></article>)}</div> : <div className="empty"><PackageCheck size={34} aria-hidden="true" /><h2>No orders yet.</h2><p>Your confirmed purchases and delivery updates will appear here.</p><Link className="primary" href="/products">Start shopping <ArrowRight size={17} aria-hidden="true" /></Link></div>}</main>;
}
