import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { carts, cartItems, products } from "../../drizzle/schema";
import type { CartView } from "../../shared/dmart";
import { getDb } from "../db";
import { ensureCatalogSeeded } from "./catalog";

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

async function ensureCart(cartId?: string, userId?: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const id = cartId || nanoid(24);
  const existing = await db.select().from(carts).where(eq(carts.id, id)).limit(1);
  if (!existing.length) {
    await db.insert(carts).values({ id, userId: userId ?? null, status: "active" });
  }
  return { db, id };
}

export function calculateCartTotals(items: Pick<CartView["items"][number], "quantity" | "price" | "originalPrice" | "lineTotal">[]) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = items.reduce((sum, item) => sum + Math.max(0, item.originalPrice - item.price) * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 40;
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    discount,
    delivery,
    total: subtotal - discount + delivery,
  };
}

async function readCart(db: Db, cartId: string): Promise<CartView> {
  const rows = await db.select({ item: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));
  const items = rows.map(({ item, product }) => ({
    id: item.id,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    unit: product.unit,
    image: product.imageUrl,
    quantity: item.quantity,
    stock: product.stock,
    price: product.priceInPaise / 100,
    originalPrice: product.originalPriceInPaise / 100,
    lineTotal: (product.priceInPaise * item.quantity) / 100,
  }));
  const totals = calculateCartTotals(items);
  return { id: cartId, items, ...totals };
}

export async function getCart(cartId: string) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select({ id: carts.id }).from(carts).where(eq(carts.id, cartId)).limit(1);
  return existing.length ? readCart(db, cartId) : null;
}

export async function addCartItem(input: { cartId?: string; productId: number; quantity: number; userId?: number | null }) {
  await ensureCatalogSeeded();
  const { db, id: cartId } = await ensureCart(input.cartId, input.userId);
  const productRows = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
  const product = productRows[0];
  if (!product || !product.active) throw new Error("This product is no longer available");
  if (product.stock < 1) throw new Error("This product is out of stock");

  const currentRows = await db.select().from(cartItems).where(
    and(eq(cartItems.cartId, cartId), eq(cartItems.productId, input.productId)),
  ).limit(1);
  const current = currentRows[0];
  const nextQuantity = Math.min(product.stock, Math.max(1, (current?.quantity ?? 0) + input.quantity));
  if (current) {
    await db.update(cartItems).set({ quantity: nextQuantity, updatedAt: new Date() }).where(eq(cartItems.id, current.id));
  } else {
    await db.insert(cartItems).values({ cartId, productId: input.productId, quantity: nextQuantity });
  }
  return readCart(db, cartId);
}

export async function setCartItemQuantity(input: { cartId: string; itemId: number; quantity: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select({ item: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(and(eq(cartItems.id, input.itemId), eq(cartItems.cartId, input.cartId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new Error("Cart item not found");
  const nextQuantity = Math.min(row.product.stock, Math.max(0, Math.floor(input.quantity)));
  if (nextQuantity === 0) {
    await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
  } else {
    await db.update(cartItems).set({ quantity: nextQuantity, updatedAt: new Date() }).where(eq(cartItems.id, input.itemId));
  }
  return readCart(db, input.cartId);
}

export async function clearCart(cartId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  return readCart(db, cartId);
}

export async function getCartRows(db: Db, cartId: string) {
  return db.select({ item: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));
}
