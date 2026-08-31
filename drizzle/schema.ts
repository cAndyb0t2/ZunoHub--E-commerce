import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  unit: varchar("unit", { length: 80 }).notNull(),
  brand: varchar("brand", { length: 120 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  fallbackImageUrl: text("fallbackImageUrl").notNull(),
  priceInPaise: int("priceInPaise").notNull(),
  originalPriceInPaise: int("originalPriceInPaise").notNull(),
  stock: int("stock").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const carts = mysqlTable("carts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId"),
  status: mysqlEnum("status", ["active", "converted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cartItems = mysqlTable(
  "cartItems",
  {
    id: int("id").autoincrement().primaryKey(),
    cartId: varchar("cartId", { length: 64 }).notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    cartProductUnique: unique("cartItems_cartId_productId_unique").on(table.cartId, table.productId),
  }),
);

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 12 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cod", "upi", "card"]).notNull(),
  couponCode: varchar("couponCode", { length: 32 }),
  subtotalInPaise: int("subtotalInPaise").notNull(),
  discountInPaise: int("discountInPaise").notNull(),
  deliveryInPaise: int("deliveryInPaise").notNull(),
  totalInPaise: int("totalInPaise").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"])
    .default("confirmed")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 180 }).notNull(),
  unit: varchar("unit", { length: 80 }).notNull(),
  unitPriceInPaise: int("unitPriceInPaise").notNull(),
  quantity: int("quantity").notNull(),
  lineTotalInPaise: int("lineTotalInPaise").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
