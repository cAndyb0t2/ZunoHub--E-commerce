import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cartItems, carts, orderItems, orders, products } from "../../drizzle/schema";
import type { CheckoutInput, OrderStatus, OrderView } from "../../shared/dmart";
import { getDb } from "../db";
import { getCartRows } from "./cart";

function calculateCoupon(subtotalInPaise: number, deliveryInPaise: number, code?: string) {
  const normalized = code?.trim().toUpperCase();
  const beforeCoupon = subtotalInPaise + deliveryInPaise;
  if (normalized === "DMART10" && subtotalInPaise >= 39900) {
    return { code: normalized, discount: Math.min(Math.round(beforeCoupon * 0.1), 15000) };
  }
  if (normalized === "SAVE50" && subtotalInPaise >= 59900) {
    return { code: normalized, discount: 5000 };
  }
  if (normalized) throw new Error("That coupon is not valid for this order");
  return { code: null, discount: 0 };
}

function toOrderView(row: typeof orders.$inferSelect, items: typeof orderItems.$inferSelect[]): OrderView {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    phone: row.phone,
    address: row.address,
    city: row.city,
    pincode: row.pincode,
    paymentMethod: row.paymentMethod,
    subtotal: row.subtotalInPaise / 100,
    discount: row.discountInPaise / 100,
    delivery: row.deliveryInPaise / 100,
    total: row.totalInPaise / 100,
    status: row.status as OrderStatus,
    createdAt: row.createdAt.getTime(),
    items: items.map(item => ({
      productId: item.productId,
      name: item.productName,
      unit: item.unit,
      quantity: item.quantity,
      price: item.unitPriceInPaise / 100,
      lineTotal: item.lineTotalInPaise / 100,
    })),
  };
}

async function hydrateOrders(rows: typeof orders.$inferSelect[]) {
  const db = await getDb();
  if (!db || !rows.length) return [] as OrderView[];
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map(row => row.id)));
  return rows.map(row => toOrderView(row, items.filter(item => item.orderId === row.id)));
}

export async function placeOrder(input: CheckoutInput, userId?: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await getCartRows(db, input.cartId);
  if (!rows.length) throw new Error("Your cart is empty");

  const subtotalInPaise = rows.reduce((sum, row) => sum + row.product.priceInPaise * row.item.quantity, 0);
  const deliveryInPaise = subtotalInPaise === 0 || subtotalInPaise >= 49900 ? 0 : 4000;
  const coupon = calculateCoupon(subtotalInPaise, deliveryInPaise, input.couponCode);
  const totalInPaise = subtotalInPaise - coupon.discount + deliveryInPaise;
  const orderNumber = `DM${Date.now().toString().slice(-8)}${nanoid(4).toUpperCase()}`;

  const order = await db.transaction(async tx => {
    for (const row of rows) {
      const stockUpdate = await tx.update(products)
        .set({ stock: sql`${products.stock} - ${row.item.quantity}`, updatedAt: new Date() })
        .where(sql`${products.id} = ${row.product.id} AND ${products.active} = true AND ${products.stock} >= ${row.item.quantity}`);
      if (stockUpdate[0]?.affectedRows !== 1) {
        throw new Error(`${row.product.name} is no longer available in the requested quantity`);
      }
    }

    const [created] = await tx.insert(orders).values({
      orderNumber,
      userId: userId ?? null,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      pincode: input.pincode.trim(),
      paymentMethod: input.paymentMethod,
      couponCode: coupon.code,
      subtotalInPaise,
      discountInPaise: coupon.discount,
      deliveryInPaise,
      totalInPaise,
      status: "confirmed",
    });
    const orderId = Number(created.insertId);
    await tx.insert(orderItems).values(rows.map(row => ({
      orderId,
      productId: row.product.id,
      productName: row.product.name,
      unit: row.product.unit,
      unitPriceInPaise: row.product.priceInPaise,
      quantity: row.item.quantity,
      lineTotalInPaise: row.product.priceInPaise * row.item.quantity,
    })));
    await tx.update(carts).set({ status: "converted", updatedAt: new Date() }).where(eq(carts.id, input.cartId));
    await tx.delete(cartItems).where(eq(cartItems.cartId, input.cartId));
    const createdRows = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    return createdRows[0];
  });

  const [result] = await hydrateOrders([order]);
  return result;
}

export async function getOrderByNumber(orderNumber: string, userId?: number | null, isAdmin = false) {
  const db = await getDb();
  if (!db) return undefined;
  const filters = isAdmin || !userId
    ? eq(orders.orderNumber, orderNumber)
    : and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId));
  const rows = await db.select().from(orders).where(filters).limit(1);
  const [result] = await hydrateOrders(rows);
  return result;
}

export async function listCustomerOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  return hydrateOrders(rows);
}

export async function listAllOrders() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return hydrateOrders(rows);
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const [result] = await hydrateOrders(rows);
  return result;
}

export { calculateCoupon };
