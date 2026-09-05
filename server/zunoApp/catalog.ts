import { asc, eq, sql } from "drizzle-orm";
import { products, type Product as ProductRow } from "../../drizzle/schema";
import type { CatalogSort, ProductInformation, ProductView } from "../../shared/zunoApp";
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
  "Chana Dal": "/manus-storage/zunohub-chana-dal_8a6158cf.png",
  "Coconut Water": "/manus-storage/zunohub-coconut-water_742e70af.png",
  "Fresh Mint Toothpaste": "/manus-storage/zunohub-toothpaste_0705a5eb.png",
  "Dish Sponges": "/manus-storage/zunohub-dish-sponges_a8543f83.png",
  "Roasted Cashews": "/manus-storage/zunohub-cashews_cae45ecb.png",
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
  ["Chana Dal", "Groceries", "Clean split chickpeas for hearty dals and snacks", 139, 170, "1 kg", 23],
  ["Coconut Water", "Beverages", "Refreshing coconut water for a naturally light drink", 89, 110, "1 L", 20],
  ["Fresh Mint Toothpaste", "Personal Care", "Fresh mint toothpaste for an everyday clean", 119, 145, "150 g", 27],
  ["Dish Sponges", "Kitchen", "Absorbent scrub sponges for everyday dishwashing", 79, 99, "5 pieces", 32],
  ["Roasted Cashews", "Snacks", "Crunchy roasted cashews for easy snacking", 249, 299, "200 g", 16],
] as const;

const fallbackFor = (name: string) =>
  `https://placehold.co/600x600/eaf5ee/007a33?text=${encodeURIComponent(name)}`;

// Editorial merchandising priority for the "Popular" sort; this is not a rating or review.
const popularityScores: Record<string, number> = {
  "Basmati Rice": 98, "Full Cream Milk": 96, Bananas: 94, "Whole Wheat Flour": 92,
  "Toor Dal": 90, "Sunflower Cooking Oil": 88, "Salted Potato Chips": 86,
  "Daily Care Shampoo": 83, "Roasted Cashews": 81, "Coconut Water": 79,
  "Airtight Storage Containers": 77, "Dishwash Gel": 74,
};

const foodInfo = (
  servingSize: string,
  energy: string,
  protein: string,
  carbohydrates: string,
  fat: string,
  ingredients: string[],
  usageInstructions: string[],
): ProductInformation => ({
  nutritionFacts: { servingSize, energy, protein, carbohydrates, fat },
  ingredients,
  usageInstructions,
  informationNote: "Nutrition values are typical reference values and may vary by pack or preparation.",
});

const generalInfo = (ingredients: string[], usageInstructions: string[]): ProductInformation => ({
  nutritionFacts: { servingSize: "Not applicable", energy: "Not applicable", protein: "Not applicable", carbohydrates: "Not applicable", fat: "Not applicable" },
  ingredients,
  usageInstructions,
  informationNote: "Always check the product label for the latest ingredient and usage information.",
});

export const productInformation: Record<string, ProductInformation> = {
  "Basmati Rice": foodInfo("100 g uncooked", "356 kcal", "7.1 g", "79.8 g", "0.6 g", ["Basmati rice"], ["Rinse before cooking.", "Cook with water according to your preferred texture."]),
  "Whole Wheat Flour": foodInfo("100 g", "340 kcal", "13.2 g", "72.6 g", "2.5 g", ["Whole wheat"], ["Use for rotis, breads, or baking.", "Store sealed in a cool, dry place."]),
  "Toor Dal": foodInfo("100 g dry", "343 kcal", "22.3 g", "62.8 g", "1.7 g", ["Split pigeon peas"], ["Rinse and soak if desired.", "Pressure-cook or simmer until soft."]),
  "Sunflower Cooking Oil": foodInfo("1 tbsp (15 ml)", "124 kcal", "0 g", "0 g", "14 g", ["Refined sunflower oil"], ["Use for sautéing, frying, or everyday cooking.", "Store away from direct sunlight."]),
  "Full Cream Milk": foodInfo("100 ml", "61 kcal", "3.2 g", "4.8 g", "3.3 g", ["Pasteurised toned milk"], ["Refrigerate immediately.", "Use within the recommended period after opening."]),
  "Paneer Cubes": foodInfo("100 g", "265 kcal", "18.3 g", "6.1 g", "20.8 g", ["Milk, acidity regulator"], ["Use in curries, grills, or salads.", "Keep refrigerated."]),
  "Salted Butter": foodInfo("1 tbsp (14 g)", "100 kcal", "0.1 g", "0 g", "11.3 g", ["Cream, salt"], ["Spread or use for cooking and baking.", "Keep refrigerated after opening."]),
  "Black Tea": foodInfo("200 ml brewed", "2 kcal", "0 g", "0.4 g", "0 g", ["Black tea leaves"], ["Steep in hot water for 3–5 minutes.", "Serve plain or with milk."]),
  "Instant Coffee": foodInfo("1 cup prepared", "2 kcal", "0.3 g", "0.4 g", "0 g", ["Instant coffee"], ["Dissolve one teaspoon in hot water.", "Add milk or sugar to taste."]),
  "Mixed Fruit Juice": foodInfo("100 ml", "48 kcal", "0.3 g", "11.2 g", "0.1 g", ["Fruit juice blend, water"], ["Shake well before serving.", "Refrigerate after opening."]),
  "Salted Potato Chips": foodInfo("30 g", "160 kcal", "2 g", "16 g", "10 g", ["Potatoes, edible vegetable oil, salt"], ["Ready to eat.", "Reseal after opening for best crunch."]),
  "Milk Chocolate": foodInfo("25 g", "135 kcal", "1.8 g", "15 g", "7.5 g", ["Sugar, milk solids, cocoa solids, cocoa butter"], ["Ready to eat.", "Store in a cool, dry place."]),
  "Red Apples": foodInfo("100 g", "52 kcal", "0.3 g", "13.8 g", "0.2 g", ["Fresh apples"], ["Wash before eating.", "Enjoy fresh or slice into salads and desserts."]),
  Bananas: foodInfo("100 g", "89 kcal", "1.1 g", "22.8 g", "0.3 g", ["Fresh bananas"], ["Peel before eating.", "Use in smoothies, breakfast bowls, or baking."]),
  "Red Tomatoes": foodInfo("100 g", "18 kcal", "0.9 g", "3.9 g", "0.2 g", ["Fresh tomatoes"], ["Wash before use.", "Use in salads, sauces, or everyday cooking."]),
  "Moong Dal": foodInfo("100 g dry", "347 kcal", "24 g", "63 g", "1.2 g", ["Split green gram"], ["Rinse before cooking.", "Simmer until soft for dal, khichdi, or soups."]),
  Poha: foodInfo("100 g dry", "346 kcal", "7.5 g", "76 g", "1 g", ["Flattened rice"], ["Rinse briefly and drain.", "Cook with vegetables and seasoning for a quick breakfast."]),
  "Green Peas": foodInfo("100 g", "81 kcal", "5.4 g", "14.5 g", "0.4 g", ["Green peas"], ["Cook before serving.", "Add to curries, rice, soups, or snacks."]),
  "Plain Curd": foodInfo("100 g", "61 kcal", "3.5 g", "4.7 g", "3.3 g", ["Milk, active cultures"], ["Keep refrigerated.", "Serve chilled or use in raita and marinades."]),
  "Orange Juice": foodInfo("100 ml", "45 kcal", "0.7 g", "10.4 g", "0.2 g", ["Orange juice"], ["Shake well before serving.", "Refrigerate after opening."]),
  "Masala Oats": foodInfo("40 g serving", "150 kcal", "5 g", "25 g", "3.5 g", ["Oats, spices, vegetables, salt"], ["Add hot water and cook until soft.", "Serve immediately after preparation."]),
  "Chana Dal": foodInfo("100 g dry", "360 kcal", "20.8 g", "60.7 g", "5.6 g", ["Split chickpeas"], ["Rinse and soak if desired.", "Cook until tender for dal, curries, or snacks."]),
  "Coconut Water": foodInfo("100 ml", "19 kcal", "0.7 g", "3.7 g", "0.2 g", ["Coconut water"], ["Serve chilled.", "Refrigerate after opening and consume promptly."]),
  "Roasted Cashews": foodInfo("30 g", "174 kcal", "5.1 g", "9.1 g", "13.9 g", ["Cashews, salt"], ["Ready to eat.", "Store sealed in a cool, dry place."]),
  "Daily Care Shampoo": generalInfo(["Cleansing agents, conditioning agents, fragrance"], ["Apply to wet hair and massage gently.", "Rinse thoroughly and avoid contact with eyes."]),
  "Moisturising Bath Soap": generalInfo(["Soap base, moisturising agents, fragrance"], ["Lather with water and rinse.", "For external use only."]),
  "Laundry Detergent Powder": generalInfo(["Cleaning agents, builders, fragrance"], ["Follow the pack dosage for load size.", "Keep dry and away from children."]),
  "Dishwash Gel": generalInfo(["Cleaning agents, water, fragrance"], ["Apply a small amount to a wet sponge.", "Rinse dishes thoroughly with clean water."]),
  "Airtight Storage Containers": generalInfo(["Food-grade storage material"], ["Wash before first use.", "Use the lid firmly to seal dry goods."]),
  "Baby Wipes": generalInfo(["Water, cleansing agents, moisturising agents"], ["Use on skin as needed.", "Close the pack after each use to retain moisture."]),
  "Garbage Bags": generalInfo(["Polyethylene"], ["Place inside a suitable bin.", "Tie securely before disposal."]),
  "Toilet Cleaner": generalInfo(["Cleaning agents, fragrance"], ["Apply under the rim and leave briefly.", "Brush and flush thoroughly; never mix with other cleaners."]),
  "Kitchen Tissue Roll": generalInfo(["Paper tissue"], ["Tear off as needed for spills and surface cleaning.", "Dispose responsibly after use."]),
  "Dish Sponges": generalInfo(["Foam sponge, abrasive fibre"], ["Use with dishwash liquid on wet surfaces.", "Rinse and air-dry after use."]),
};

const defaultInformation = (row: ProductRow): ProductInformation =>
  row.category === "Groceries" || row.category === "Dairy & Bakery" || row.category === "Beverages" || row.category === "Snacks" || row.category === "Fruits & Vegetables"
    ? foodInfo("100 g / 100 ml reference", "See pack", "See pack", "See pack", "See pack", [row.name], ["Prepare or consume according to the pack directions.", "Store as indicated on the product label."])
    : generalInfo([row.name], ["Use according to the pack directions."]);

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
    popularityScore: popularityScores[row.name] ?? 50,
    createdAt: row.createdAt.getTime(),
    information: productInformation[row.name] ?? defaultInformation(row),
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

export function sortCatalogProducts(items: ProductView[], sort: CatalogSort = "featured") {
  return [...items].sort((left, right) => {
    if (sort === "popular") return right.popularityScore - left.popularityScore || left.name.localeCompare(right.name);
    if (sort === "newest") return right.createdAt - left.createdAt || left.name.localeCompare(right.name);
    if (sort === "discount") return right.discount - left.discount || left.name.localeCompare(right.name);
    return left.name.localeCompare(right.name);
  });
}

export async function listCatalog(options?: { category?: string; search?: string; priceMin?: number; priceMax?: number; sort?: CatalogSort }) {
  await ensureCatalogSeeded();
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.name));
  const category = options?.category?.trim().toLowerCase();
  const search = options?.search?.trim().toLowerCase();
  const priceMin = options?.priceMin;
  const priceMax = options?.priceMax;
  const sort = options?.sort ?? "featured";
  const filtered = rows
    .filter(row => !category || category === "all" || row.category.toLowerCase() === category)
    .filter(row => !search || `${row.name} ${row.category} ${row.description} ${row.brand}`.toLowerCase().includes(search))
    .filter(row => priceMin === undefined || row.priceInPaise >= priceMin * 100)
    .filter(row => priceMax === undefined || row.priceInPaise <= priceMax * 100)
    .map(normalizeProduct);
  return sortCatalogProducts(filtered, sort);
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
