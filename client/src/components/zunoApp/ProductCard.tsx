import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import type { ProductView } from "@shared/zunoApp";
import { useStore } from "@/contexts/StoreContext";

function money(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function ProductCard({ product }: { product: ProductView }) {
  const { addToCart, loading, toggleWishlist, isWishlisted } = useStore();
  const handleAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (product.available) await addToCart(product);
  };

  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-card-link" aria-label={`View ${product.name}`}>
        <div className="product-image">
          <span className="product-badge">{product.discount ? `${product.discount}% off` : "Daily value"}</span>
          <button type="button" className={`icon-button wishlist-button ${isWishlisted(product.id) ? "wishlisted" : ""}`} aria-label={isWishlisted(product.id) ? `Remove ${product.name} from wishlist` : `Save ${product.name}`} aria-pressed={isWishlisted(product.id)} onClick={event => { event.preventDefault(); event.stopPropagation(); toggleWishlist(product); }}>
            <Heart size={18} fill={isWishlisted(product.id) ? "currentColor" : "none"} aria-hidden="true" />
          </button>
          <img src={product.image} alt="" onError={event => { event.currentTarget.src = product.fallbackImage; }} />
        </div>
        <div className="product-copy">
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <p className="product-unit">{product.unit} · {product.available ? `${product.stock} available` : "Currently unavailable"}</p>
          <div className="product-price-row">
            <div>
              <strong>{money(product.price)}</strong>
              {product.originalPrice > product.price && <del>{money(product.originalPrice)}</del>}
            </div>
            <button type="button" className="add-button" disabled={!product.available || loading} onClick={handleAdd} aria-label={product.available ? `Add ${product.name} to bag` : `${product.name} is unavailable`}>
              <ShoppingBag size={17} aria-hidden="true" />
              <span>{product.available ? "Add" : "Out"}</span>
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductSkeleton() {
  return <div className="product-card skeleton-card" aria-hidden="true"><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line wide" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>;
}
