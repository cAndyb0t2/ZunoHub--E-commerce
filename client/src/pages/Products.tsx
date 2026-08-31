import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ProductCard, ProductSkeleton } from "@/components/dmart/ProductCard";
import { trpc } from "@/lib/trpc";

export default function Products() {
  const [location, navigate] = useLocation();
  const [categoryPart, queryPart = ""] = location.split("?");
  const category = decodeURIComponent(categoryPart.split("/")[2] ?? "");
  const params = new URLSearchParams(queryPart);
  const initialSearch = params.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const input = useMemo(() => ({ category: category || undefined, search: initialSearch || undefined }), [category, initialSearch]);
  const productsQuery = trpc.dmart.catalog.list.useQuery(input);
  const categoriesQuery = trpc.dmart.catalog.categories.useQuery();
  const products = productsQuery.data ?? [];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = search.trim();
    navigate(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
  };

  const title = category ? category : initialSearch ? `Results for “${initialSearch}”` : "All products";
  return <main className="container page">
    <div className="page-heading catalogue-heading"><div><span className="eyebrow">THE ZUNOHUB AISLES</span><h1>{title}</h1><p>{products.length ? `${products.length} everyday essentials to choose from.` : "Find the everyday essentials your home needs."}</p></div><form className="catalogue-search" onSubmit={submitSearch}><Search size={17} aria-hidden="true" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the store" aria-label="Search the store" /><button type="submit">Go</button></form></div>
    <div className="catalogue-toolbar"><div className="category-chips"><Link className={!category ? "active" : ""} href="/products">All</Link>{(categoriesQuery.data ?? []).map(item => <Link className={category.toLowerCase() === item.toLowerCase() ? "active" : ""} href={`/products/${encodeURIComponent(item)}`} key={item}>{item}</Link>)}</div><span className="filter-label"><SlidersHorizontal size={16} aria-hidden="true" /> Live catalogue</span></div>
    {productsQuery.isLoading ? <div className="product-grid">{Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}</div> : productsQuery.isError ? <div className="state-card"><h2>The catalogue is taking a moment.</h2><p>We could not reach the store catalogue. Please try again.</p><button className="secondary" onClick={() => productsQuery.refetch()}>Try again</button></div> : products.length ? <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty"><span className="empty-mark">⌕</span><h2>No products found</h2><p>Try another search or browse all the aisles.</p><Link className="primary" href="/products">Show all products</Link></div>}
  </main>;
}
