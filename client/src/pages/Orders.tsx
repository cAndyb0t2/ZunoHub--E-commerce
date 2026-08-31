import { ArrowRight, PackageCheck } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const statusLabel: Record<string, string> = { confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled", pending: "Pending" };

export default function Orders() {
  const { isAuthenticated, loading } = useAuth();
  const ordersQuery = trpc.dmart.orders.mine.useQuery(undefined, { enabled: isAuthenticated });
  if (loading) return <main className="container page"><div className="state-card"><div className="spinner" /> Checking your account…</div></main>;
  if (!isAuthenticated) return <main className="container page"><div className="empty"><PackageCheck size={34} aria-hidden="true" /><span className="eyebrow">MY DMART</span><h1>Sign in to see your orders.</h1><p>Your order history is private to your account.</p><button className="primary" onClick={() => startLogin()}>Sign in <ArrowRight size={17} aria-hidden="true" /></button></div></main>;
  return <main className="container page"><div className="page-heading"><span className="eyebrow">MY DMART</span><h1>Your orders</h1><p>A simple view of your DMart purchase history.</p></div>{ordersQuery.isLoading ? <div className="state-card"><div className="spinner" /> Loading your orders…</div> : ordersQuery.isError ? <div className="state-card"><h2>We could not load your orders.</h2><button className="secondary" onClick={() => ordersQuery.refetch()}>Try again</button></div> : ordersQuery.data?.length ? <div className="order-list">{ordersQuery.data.map(order => <article className="order-card" key={order.id}><div className="order-card-head"><div><span className="eyebrow">{order.orderNumber}</span><h2>{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</h2></div><span className={`status status-${order.status}`}>{statusLabel[order.status] ?? order.status}</span></div><div className="order-items">{order.items.map(item => <span key={`${order.id}-${item.productId}`}>{item.name} × {item.quantity}</span>)}</div><div className="order-card-foot"><span>{order.paymentMethod === "cod" ? "Cash on delivery" : "Payment preference recorded"}</span><b>{money(order.total)}</b></div></article>)}</div> : <div className="empty"><PackageCheck size={34} aria-hidden="true" /><h2>No orders yet.</h2><p>Your confirmed orders will appear here.</p><Link className="primary" href="/products">Start shopping <ArrowRight size={17} aria-hidden="true" /></Link></div>}</main>;
}
