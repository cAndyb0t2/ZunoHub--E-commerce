import { Check, Circle, Package, Truck } from "lucide-react";
import type { OrderStatus } from "@shared/zunoApp";

const steps: Array<{ status: Exclude<OrderStatus, "pending" | "cancelled">; label: string; description: string }> = [
  { status: "confirmed", label: "Order confirmed", description: "Your order is confirmed and being prepared." },
  { status: "packed", label: "Packed", description: "Your items are packed and ready to leave." },
  { status: "out_for_delivery", label: "Out for delivery", description: "Your ZunoHub order is on its way." },
  { status: "delivered", label: "Delivered", description: "Your order has reached its destination." },
];

export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") return <div className="order-tracker cancelled" role="status"><span className="tracker-icon"><Circle size={13} aria-hidden="true" /></span><div><b>Order cancelled</b><p>This order will not be delivered.</p></div></div>;
  const currentIndex = Math.max(0, steps.findIndex(step => step.status === status));
  return <ol className="order-tracker" aria-label="Order delivery progress">{steps.map((step, index) => { const complete = index <= currentIndex; const current = index === currentIndex; return <li className={complete ? "complete" : ""} key={step.status}><span className="tracker-icon">{complete ? <Check size={14} aria-hidden="true" /> : index === 1 ? <Package size={14} aria-hidden="true" /> : index === 2 ? <Truck size={14} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}</span><div><b>{step.label}{current && <span className="sr-only">, current status</span>}</b><p>{step.description}</p></div></li>; })}</ol>;
}
