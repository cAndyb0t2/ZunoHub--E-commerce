export const ZUNO_CATEGORIES = [
  "Groceries",
  "Fruits & Vegetables",
  "Dairy & Bakery",
  "Beverages",
  "Snacks",
  "Personal Care",
  "Home Care",
  "Baby Care",
  "Kitchen",
  "Cleaning",
] as const;

export type ZunoCategory = (typeof ZUNO_CATEGORIES)[number];

export type CatalogSort = "featured" | "popular" | "newest" | "discount";

export type NutritionFacts = {
  servingSize: string;
  energy: string;
  protein: string;
  carbohydrates: string;
  fat: string;
};

export type ProductInformation = {
  nutritionFacts: NutritionFacts;
  ingredients: string[];
  usageInstructions: string[];
  informationNote: string;
};

export type ProductView = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  brand: string;
  image: string;
  fallbackImage: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  available: boolean;
  popularityScore: number;
  createdAt: number;
  information: ProductInformation;
};

export type CartItemView = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  unit: string;
  image: string;
  quantity: number;
  stock: number;
  price: number;
  originalPrice: number;
  lineTotal: number;
};

export type CartView = {
  id: string;
  items: CartItemView[];
  itemCount: number;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderItemView = {
  productId: number;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type OrderView = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  paymentMethod: "cod" | "upi" | "card";
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
  items: OrderItemView[];
};

export type CheckoutInput = {
  cartId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  paymentMethod: "cod" | "upi" | "card";
  couponCode?: string;
};

export type DeliveryEstimate = {
  pincode: string;
  eligible: boolean;
  minDate?: number;
  maxDate?: number;
  message: string;
};

export type MockPaymentResult = {
  status: "success" | "failed";
  transactionId?: string;
  message: string;
  method: "upi" | "card";
};

export type MockPaymentInput = {
  method: "upi" | "card";
  upiId?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
};
