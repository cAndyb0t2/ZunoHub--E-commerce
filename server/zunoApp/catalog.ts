import { asc, eq, sql } from "drizzle-orm";
import { products, type Product as ProductRow } from "../../drizzle/schema";
import type { ProductView } from "../../shared/zunoApp";
import { getDb } from "../db";

const imageMap: Record<string, string> = {
  "Basmati Rice": "https://m.media-amazon.com/images/I/615ZbWhbSOL.jpg",
  "Whole Wheat Flour": "https://m.media-amazon.com/images/I/71n0P5QeaqL.jpg",
  "Toor Dal": "https://m.media-amazon.com/images/I/616cmH1SFVL.jpg",
  "Sunflower Cooking Oil": "https://m.media-amazon.com/images/I/716cD0319+L.jpg",
  "Full Cream Milk": "https://m.media-amazon.com/images/I/71PBkDK851L.jpg",
  "Paneer Cubes": "https://i2.wp.com/www.vegrecipesofindia.com/wp-content/uploads/2020/11/how-to-make-paneer-1152x1536.jpg",
  "Salted Butter": "https://m.media-amazon.com/images/I/71Jr6Vg6v4L.jpg",
  "Black Tea": "https://m.media-amazon.com/images/I/71eY1d-pIQL.jpg",
  "Instant Coffee": "https://m.media-amazon.com/images/I/81IOREuqQUL.jpg",
  "Mixed Fruit Juice": "https://m.media-amazon.com/images/I/81g5u2Bx7DL.jpg",
  "Salted Potato Chips": "https://m.media-amazon.com/images/I/81HE3ENpRtL.jpg",
  "Milk Chocolate": "https://m.media-amazon.com/images/I/81YKWsQH4lL.jpg",
  "Daily Care Shampoo": "https://m.media-amazon.com/images/I/61uXa+Q3+mL.jpg",
  "Moisturising Bath Soap": "https://m.media-amazon.com/images/I/41c+OcVwMCL.jpg",
  "Laundry Detergent Powder": "https://m.media-amazon.com/images/I/61hx-ExBRhL.jpg",
  "Dishwash Gel": "https://m.media-amazon.com/images/I/71hKr7k+58L.jpg",
  "Red Apples": "https://m.media-amazon.com/images/I/51u+iD8u5vL.jpg",
  Bananas: "https://m.media-amazon.com/images/I/815sdIw6vBL.jpg",
  "Red Tomatoes": "https://m.media-amazon.com/images/I/71r3LttJzFL.jpg",
  "Airtight Storage Containers": "https://m.media-amazon.com/images/I/71VQsyzN2KS.jpg",
  "Baby Wipes": "https://m.media-amazon.com/images/I/71sblnSN7fL.jpg",
  "Garbage Bags": "https://m.media-amazon.com/images/I/61fn1xtHO4L.jpg",
};

export const catalogSeed = [
  ["Basmati Rice", "Groceries", "Long-grain basmati rice for everyday meals", 499, 599, "5 kg", 22],
  ["Whole Wheat Flour", "Groceries", "Freshly milled flour for rotis and breads", 245, 290, "5 kg", 17],
  ["Toor Dal", "Groceries", "Protein-rich split pigeon peas for dal", 169, 205, "1 kg", 19],
  ["Sunflower Cooking Oil", "Groceries", "Light cooking oil for daily meals", 149, 175, "1 L", 31],
  ["Full Cream Milk", "Dairy & Bakery", "Rich and creamy dairy milk", 34, 38, "500 ml", 42],
  ["Paneer Cubes", "Dairy & Bakery", "Soft cottage cheese cubes for curries and snacks", 119, 145, "200 g", 18],
  ["Salted Butter", "Dairy & Bakery", "Smooth salted table butter", 265, 300, "500 g", 24],
  ["Black Tea", "Beverages", "Aromatic tea leaves for a bright cup", 185, 220, "500 g", 20],
  ["Instant Coffee", "Beverages", "Bold, balanced instant coffee", 299, 360, "200 g", 16],
  ["Mixed Fruit Juice", "Beverages", "Refreshing fruit blend in a ready-to-drink pack", 99, 120, "1 L", 30],
  ["Salted Potato Chips", "Snacks", "Classic salted potato chips in a crunchy packet", 35, 40, "150 g", 47],
  ["Milk Chocolate", "Snacks", "Creamy milk chocolate for sharing", 149, 180, "250 g", 25],
  ["Daily Care Shampoo", "Personal Care", "Gentle shampoo for regular hair care", 179, 225, "650 ml", 15],
  ["Moisturising Bath Soap", "Personal Care", "Moisturising soap bar for daily bathing", 99, 120, "4 x 100 g", 35],
  ["Laundry Detergent Powder", "Home Care", "Powerful detergent powder for everyday laundry", 299, 360, "2 kg", 23],
  ["Dishwash Gel", "Home Care", "Dishwash gel that cuts grease with ease", 125, 150, "750 ml", 20],
  ["Red Apples", "Fruits & Vegetables", "Crisp, naturally sweet apples", 169, 210, "1 kg", 28],
  ["Bananas", "Fruits & Vegetables", "Fresh ripe bananas", 59, 70, "1 kg", 49],
  ["Red Tomatoes", "Fruits & Vegetables", "Farm-picked juicy tomatoes", 49, 65, "1 kg", 36],
  ["Airtight Storage Containers", "Kitchen", "Airtight containers for pantry storage", 399, 499, "6 pieces", 14],
  ["Baby Wipes", "Baby Care", "Gentle fragrance-free wipes for everyday use", 149, 180, "80 wipes", 18],
  ["Garbage Bags", "Cleaning", "Strong leak-proof garbage bags for daily cleanup", 99, 125, "30 bags", 12],
  ["Moong Dal", "Groceries", "Light, versatile lentils for everyday cooking", 145, 175, "1 kg", 21],
  ["Poha", "Groceries", "Flattened rice for quick breakfasts and snacks", 72, 90, "1 kg", 26],
  ["Green Peas", "Fruits & Vegetables", "Sweet frozen green peas for quick meals", 139, 165, "500 g", 20],
  ["Plain Curd", "Dairy & Bakery", "Creamy plain curd for meals and snacks", 65, 80, "400 g", 24],
  ["Orange Juice", "Beverages", "Bright citrus juice for a refreshing break", 109, 135, "1 L", 18],
  ["Masala Oats", "Snacks", "Savory oats with a warm spice blend", 119, 145, "400 g", 22],
  ["Toilet Cleaner", "Cleaning", "Fresh, effective cleaner for bathroom care", 99, 125, "500 ml", 19],
  ["Kitchen Tissue Roll", "Kitchen", "Absorbent tissue rolls for everyday cleanup", 129, 160, "4 rolls", 17],
] as const;

const fallbackFor = (name: string) =>
  `https://placehold.co/600x600/eaf5ee/007a33?text=${encodeURIComponent(name)}`;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function normalizeProduct(row: ProductRow): ProductView {
  const discount = row.originalPriceInPaise > row.priceInPaise
    ? Math.round((1 - row.priceInPaise / row.originalPriceInPaise) * 100)
    : 0;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    unit: row.unit,
    brand: row.brand,
    image: row.imageUrl,
    fallbackImage: row.fallbackImageUrl,
    price: row.priceInPaise / 100,
    originalPrice: row.originalPriceInPaise / 100,
    discount,
    stock: row.stock,
    available: row.active && row.stock > 0,
  };
}

export async function ensureCatalogSeeded() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ slug: products.slug }).from(products);
  const existingSlugs = new Set(existing.map(row => row.slug));
  const missing = catalogSeed.filter(([name]) => !existingSlugs.has(slugify(name)));
  if (!missing.length) return;

  try {
    await db.insert(products).values(
      missing.map(([name, category, description, price, originalPrice, unit, stock]) => ({
        slug: slugify(name), name, category, description, unit, brand: "ZunoHub selection",
        imageUrl: imageMap[name] ?? fallbackFor(name), fallbackImageUrl: fallbackFor(name),
        priceInPaise: price * 100, originalPriceInPaise: originalPrice * 100, stock, active: true,
      })),
    );
  } catch (error) {
    // A concurrent request may have inserted the same missing rows already.
    if (!String(error).toLowerCase().includes("duplicate")) throw error;
  }
}

export async function listCatalog(options?: { category?: string; search?: string; priceMin?: number; priceMax?: number }) {
  await ensureCatalogSeeded();
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.name));
  const category = options?.category?.trim().toLowerCase();
  const search = options?.search?.trim().toLowerCase();
  const priceMin = options?.priceMin;
  const priceMax = options?.priceMax;
  return rows
    .filter(row => !category || category === "all" || row.category.toLowerCase() === category)
    .filter(row => !search || `${row.name} ${row.category} ${row.description} ${row.brand}`.toLowerCase().includes(search))
    .filter(row => priceMin === undefined || row.priceInPaise >= priceMin * 100)
    .filter(row => priceMax === undefined || row.priceInPaise <= priceMax * 100)
    .map(normalizeProduct);
}

export async function getProductBySlug(slug: string) {
  await ensureCatalogSeeded();
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ? normalizeProduct(rows[0]) : undefined;
}

export async function getProductRow(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0];
}

export async function updateProductAvailability(id: number, values: { stock?: number; active?: boolean; price?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(products).set({
    ...(values.stock === undefined ? {} : { stock: Math.max(0, Math.floor(values.stock)) }),
    ...(values.active === undefined ? {} : { active: values.active }),
    ...(values.price === undefined ? {} : { priceInPaise: Math.round(values.price * 100) }),
    updatedAt: new Date(),
  }).where(eq(products.id, id));
  return getProductRow(id);
}

export async function decrementStock(db: Awaited<ReturnType<typeof getDb>>, id: number, quantity: number) {
  if (!db) throw new Error("Database is not available");
  const result = await db.update(products)
    .set({ stock: sql`${products.stock} - ${quantity}`, updatedAt: new Date() })
    .where(sql`${products.id} = ${id} AND ${products.active} = true AND ${products.stock} >= ${quantity}`);
  return result[0]?.affectedRows === 1;
}
