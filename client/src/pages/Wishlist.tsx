import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { ProductCard } from "@/components/dmart/ProductCard";
import { useStore } from "@/contexts/StoreContext";

export default function Wishlist() {
  const { wishlist } = useStore();
  if (!wishlist.length) return <main className="container page"><div className="empty"><Heart size={34} aria-hidden="true" /><span className="eyebrow">SAVED FOR LATER</span><h1>Your wishlist is waiting.</h1><p>Tap the heart on anything you want to remember for your next shop.</p><Link className="primary" href="/products"><ShoppingBag size={17} aria-hidden="true" /> Browse products</Link></div></main>;
  return <main className="container page"><div className="page-heading"><span className="eyebrow">SAVED FOR LATER</span><h1>Your wishlist</h1><p>{wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved on this device.</p></div><div className="product-grid">{wishlist.map(product => <ProductCard key={product.id} product={product} />)}</div></main>;
}
