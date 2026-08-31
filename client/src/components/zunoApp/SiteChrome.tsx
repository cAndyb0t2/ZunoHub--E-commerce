import { MapPin, Search, ShoppingBag, UserRound } from "lucide-react";
import { FormEvent, useDeferredValue, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useStore } from "@/contexts/StoreContext";
import { CartPanel } from "@/components/zunoApp/CartPanel";
import { trpc } from "@/lib/trpc";

export function SiteHeader() {
  const [, navigate] = useLocation();
  const { itemCount } = useStore();
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const suggestionInput = useMemo(() => ({ search: deferredQuery.trim() }), [deferredQuery]);
  const suggestionsQuery = trpc.zunoApp.catalog.list.useQuery(suggestionInput, { enabled: searchFocused && suggestionInput.search.length >= 2 });

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    setSearchFocused(false);
    navigate(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
  };

  return <>
    <div className="topbar">Everyday value, delivered with care <span>Free delivery above ₹499</span></div>
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="ZunoHub home"><span className="brand-mark">Z</span><span>ZunoHub</span></Link>
        <div className="search-wrap">
          <form className="search-form" onSubmit={submitSearch} role="search">
            <Search size={18} aria-hidden="true" />
            <input value={query} onChange={event => setQuery(event.target.value)} onFocus={() => setSearchFocused(true)} placeholder="Search essentials, snacks, fresh produce..." aria-label="Search products" aria-autocomplete="list" aria-controls="search-suggestions" />
            <button type="submit">Search</button>
          </form>
          {searchFocused && query.trim().length >= 2 && <div id="search-suggestions" className="search-suggestions" role="listbox" aria-label="Product suggestions">{suggestionsQuery.isLoading ? <span className="suggestion-state">Finding products…</span> : suggestionsQuery.data?.length ? suggestionsQuery.data.slice(0, 5).map(product => <Link role="option" href={`/product/${product.slug}`} key={product.id} onClick={() => setSearchFocused(false)}><span>{product.name}</span><small>{product.category} · ₹{product.price.toLocaleString("en-IN")}</small></Link>) : <span className="suggestion-state">No matching products. Press Search to see all results.</span>}</div>}
        </div>
        <div className="header-actions">
          <button type="button" className="location-button" onClick={() => navigate("/about")}><MapPin size={18} aria-hidden="true" /><span>Deliver to<br /><b>Choose location</b></span></button>
          <button type="button" className="account-button" onClick={() => startLogin()}><UserRound size={19} aria-hidden="true" /><span>Sign in</span></button>
          <button type="button" className="bag-button" aria-label={`Shopping bag with ${itemCount} items`} aria-expanded={cartOpen} onClick={() => setCartOpen(true)}><ShoppingBag size={20} aria-hidden="true" /><span>Bag</span>{itemCount > 0 && <b className="bag-count">{itemCount}</b>}</button>
        </div>
      </div>
      <nav className="category-bar" aria-label="Main navigation"><div className="container category-nav"><Link href="/products">Shop all</Link><Link href="/products/Groceries">Groceries</Link><Link href="/products/Fruits%20%26%20Vegetables">Fresh produce</Link><Link href="/products/Dairy%20%26%20Bakery">Dairy & bakery</Link><Link href="/products/Snacks">Snacks</Link><Link href="/about">About ZunoHub</Link></div></nav>
    </header>
    <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
  </>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-grid"><div><Link href="/" className="brand footer-brand"><span className="brand-mark">Z</span><span>ZunoHub</span></Link><p>Good food, good prices, and the everyday essentials your home relies on.</p></div><div><h2>Shop</h2><Link href="/products">All products</Link><Link href="/products/Groceries">Groceries</Link><Link href="/products/Snacks">Snacks</Link></div><div><h2>Help</h2><Link href="/about">About ZunoHub</Link><Link href="/orders">Your orders</Link><Link href="/admin/products">Store operations</Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} ZunoHub storefront</span><span>Prices shown in Indian Rupees</span></div></footer>;
}
