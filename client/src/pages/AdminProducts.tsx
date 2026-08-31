import { ClipboardList, Package, Save, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const statusOptions = ["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"] as const;
const statusLabel: Record<string, string> = { confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled", pending: "Pending" };
const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

type Draft = { stock: string; price: string; active: boolean };

export default function AdminProducts() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const productsQuery = trpc.dmart.catalog.list.useQuery({}, { enabled: isAdmin });
  const ordersQuery = trpc.dmart.admin.orders.list.useQuery(undefined, { enabled: isAdmin });
  const updateProduct = trpc.dmart.admin.products.update.useMutation();
  const updateOrder = trpc.dmart.admin.orders.updateStatus.useMutation({ onSuccess: () => ordersQuery.refetch() });
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const products = productsQuery.data ?? [];
  const draftFor = (id: number, stock: number, price: number, active: boolean) => drafts[id] ?? { stock: String(stock), price: String(price), active };
  const save = async (id: number, original: { stock: number; price: number; available: boolean }) => {
    const draft = draftFor(id, original.stock, original.price, original.available);
    await updateProduct.mutateAsync({ id, stock: Number(draft.stock), price: Number(draft.price), active: draft.active });
    await productsQuery.refetch();
  };
  const activeCount = useMemo(() => products.filter(product => product.available).length, [products]);
  if (loading) return <main className="container page"><div className="state-card"><div className="spinner" /> Checking store access…</div></main>;
  if (!isAdmin) return <main className="container page"><div className="empty"><ShieldCheck size={36} aria-hidden="true" /><span className="eyebrow">STORE OPERATIONS</span><h1>Admin access required.</h1><p>Sign in with the store owner account to manage catalogue and fulfilment.</p>{user ? <Link className="primary" href="/">Back to storefront</Link> : <button className="primary" onClick={() => startLogin()}>Sign in to continue</button>}</div></main>;
  return <main className="container page admin-page"><div className="page-heading"><span className="eyebrow">STORE OPERATIONS</span><h1>ZunoHub control room</h1><p>Keep the catalogue current and move orders through fulfilment from one quiet workspace.</p></div><div className="admin-stats"><div><Package size={19} aria-hidden="true" /><span><b>{products.length}</b><small>catalogue items</small></span></div><div><ShieldCheck size={19} aria-hidden="true" /><span><b>{activeCount}</b><small>currently available</small></span></div><div><ClipboardList size={19} aria-hidden="true" /><span><b>{ordersQuery.data?.length ?? 0}</b><small>orders recorded</small></span></div></div><section className="admin-section"><div className="admin-section-heading"><div><span className="eyebrow">CATALOGUE</span><h2>Stock and pricing</h2></div><span className="admin-hint">Changes apply to the live storefront.</span></div>{productsQuery.isLoading ? <div className="state-card"><div className="spinner" /> Loading catalogue…</div> : <div className="admin-table"><div className="admin-row admin-header"><span>Product</span><span>Price</span><span>Stock</span><span>Available</span><span>Save</span></div>{products.map(product => { const draft = draftFor(product.id, product.stock, product.price, product.available); return <div className="admin-row" key={product.id}><span><b>{product.name}</b><small>{product.category} · {product.unit}</small></span><input className="admin-input" type="number" min="0" value={draft.price} aria-label={`${product.name} price`} onChange={event => setDrafts(current => ({ ...current, [product.id]: { ...draft, price: event.target.value } }))} /><input className="admin-input" type="number" min="0" value={draft.stock} aria-label={`${product.name} stock`} onChange={event => setDrafts(current => ({ ...current, [product.id]: { ...draft, stock: event.target.value } }))} /><label className="switch-label"><input type="checkbox" checked={draft.active} onChange={event => setDrafts(current => ({ ...current, [product.id]: { ...draft, active: event.target.checked } }))} /><span>{draft.active ? "On" : "Off"}</span></label><button type="button" className="icon-button save-button" onClick={() => save(product.id, product)} disabled={updateProduct.isPending} aria-label={`Save ${product.name}`}><Save size={16} /></button></div>; })}</div>}</section><section className="admin-section"><div className="admin-section-heading"><div><span className="eyebrow">FULFILMENT</span><h2>Recent orders</h2></div><span className="admin-hint">Update a status as the store team works through the order.</span></div>{ordersQuery.isLoading ? <div className="state-card"><div className="spinner" /> Loading orders…</div> : ordersQuery.data?.length ? <div className="admin-orders">{ordersQuery.data.map(order => <div className="admin-order" key={order.id}><div><span className="eyebrow">{order.orderNumber}</span><b>{order.customerName}</b><small>{order.city} · {new Date(order.createdAt).toLocaleDateString("en-IN")}</small></div><span>{money(order.total)}</span><select value={order.status} onChange={event => updateOrder.mutate({ id: order.id, status: event.target.value as typeof statusOptions[number] })} aria-label={`Update ${order.orderNumber} status`}>{statusOptions.map(status => <option value={status} key={status}>{statusLabel[status]}</option>)}</select></div>)}</div> : <div className="state-card"><h3>No orders yet.</h3><p>Confirmed customer orders will appear here.</p></div>}</section></main>;
}
