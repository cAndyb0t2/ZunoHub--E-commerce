import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ProductCard, ProductSkeleton } from "@/components/zunoApp/ProductCard";
import { trpc } from "@/lib/trpc";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest arrivals" },
  { value: "discount", label: "Biggest discount" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];
const isSortValue = (value: string): value is SortValue => sortOptions.some(option => option.value === value);

const priceOptions = [
  { value: "", label: "Any price", min: undefined, max: undefined },
  { value: "under-100", label: "Under ₹100", min: undefined, max: 100 },
  { value: "100-300", label: "₹100 – ₹300", min: 100, max: 300 },
  { value: "300-500", label: "₹300 – ₹500", min: 300, max: 500 },
  { value: "500-plus", label: "₹500 and above", min: 500, max: undefined },
] as const;

function productsUrl(category = "", search = "", price = "", sort = "featured") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (price) params.set("price", price);
  if (sort && sort !== "featured") params.set("sort", sort);
  const path = category ? `/products/${encodeURIComponent(category)}` : "/products";
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export default function Products() {
  const [location, navigate] = useLocation();
  const categoryPart = location.split("?")[0];
  const category = decodeURIComponent(categoryPart.split("/")[2] ?? "");
  const queryPart = typeof window === "undefined" ? "" : window.location.search.slice(1);
  const params = new URLSearchParams(queryPart);
  const initialSearch = params.get("search") ?? "";
  const selectedPrice = params.get("price") ?? "";
  const requestedSort = params.get("sort") ?? "";
  const selectedSort: SortValue = isSortValue(requestedSort) ? requestedSort : "featured";
  const [search, setSearch] = useState(initialSearch);
  const [priceFilter, setPriceFilter] = useState(selectedPrice);
  const [sort, setSort] = useState(selectedSort);
  useEffect(() => { setSearch(initialSearch); setPriceFilter(selectedPrice); setSort(selectedSort); }, [initialSearch, selectedPrice, selectedSort]);
  const selectedRange = priceOptions.find(option => option.value === selectedPrice) ?? priceOptions[0];
  const input = useMemo(() => ({ category: category || undefined, search: initialSearch || undefined, priceMin: selectedRange.min, priceMax: selectedRange.max, sort: selectedSort }), [category, initialSearch, selectedRange.min, selectedRange.max, selectedSort]);
  const productsQuery = trpc.zunoApp.catalog.list.useQuery(input);
  const categoriesQuery = trpc.zunoApp.catalog.categories.useQuery();
  const products = productsQuery.data ?? [];

  const clearSearch = () => { setSearch(""); navigate(productsUrl(category, "", priceFilter, sort)); };
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(productsUrl(category, search.trim(), priceFilter, sort));
  };
  const updatePrice = (value: string) => { setPriceFilter(value); navigate(productsUrl(category, search.trim(), value, sort)); };
  const updateSort = (value: string) => { if (!isSortValue(value)) return; setSort(value); navigate(productsUrl(category, search.trim(), priceFilter, value)); };
  const hasFilters = Boolean(category || initialSearch || selectedPrice || selectedSort !== "featured");
  const title = category ? category : initialSearch ? `Results for “${initialSearch}”` : "All products";
  return <main className="container page">
    <div className="page-heading catalogue-heading"><div><span className="eyebrow">THE ZUNOHUB AISLES</span><h1>{title}</h1><p>{products.length ? `${products.length} everyday essentials to choose from.` : "Find the everyday essentials your home needs."}</p></div><form className="catalogue-search catalogue-search-prominent" onSubmit={submitSearch}><Search size={17} aria-hidden="true" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search rice, snacks, cleaning…" aria-label="Search the catalogue" autoComplete="off" />{search && <button type="button" className="search-clear" onClick={clearSearch} aria-label="Clear catalogue search"><X size={15} aria-hidden="true" /></button>}<button type="submit">Search</button></form></div>
    <div className="catalogue-toolbar"><div className="category-chips"><Link className={!category ? "active" : ""} href={productsUrl("", initialSearch, selectedPrice, selectedSort)}>All</Link>{(categoriesQuery.data ?? []).map(item => <Link className={category.toLowerCase() === item.toLowerCase() ? "active" : ""} href={productsUrl(item, initialSearch, selectedPrice, selectedSort)} key={item}>{item}</Link>)}</div><div className="catalogue-filters"><label><SlidersHorizontal size={16} aria-hidden="true" /><span className="sr-only">Filter by price</span><select value={priceFilter} onChange={event => updatePrice(event.target.value)} aria-label="Filter by price"><option value="">Any price</option>{priceOptions.slice(1).map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select><select value={sort} onChange={event => updateSort(event.target.value)} aria-label="Sort products">{sortOptions.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>{hasFilters && <Link className="clear-filters" href="/products"><X size={14} aria-hidden="true" /> Clear filters</Link>}</div></div>
    {productsQuery.isLoading ? <div className="product-grid">{Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}</div> : productsQuery.isError ? <div className="state-card"><h2>The catalogue is taking a moment.</h2><p>We could not reach the store catalogue. Please try again.</p><button className="secondary" onClick={() => productsQuery.refetch()}>Try again</button></div> : products.length ? <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty"><span className="empty-mark">⌕</span><h2>No products found</h2><p>Try another search, price range, or browse all the aisles.</p><Link className="primary" href="/products">Show all products</Link></div>}
  </main>;
}
