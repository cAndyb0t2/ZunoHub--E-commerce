import { ArrowRight, ChevronRight, Leaf, PackageCheck, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { ProductCard, ProductSkeleton } from "@/components/dmart/ProductCard";
import { trpc } from "@/lib/trpc";

const categoryIcons = ["◈", "✦", "○", "⌁", "✚", "◇", "▦", "✿", "⬡", "◌"];

export default function Home() {
  const productsQuery = trpc.dmart.catalog.list.useQuery({});
  const categoriesQuery = trpc.dmart.catalog.categories.useQuery();
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return <>
    <section className="hero container">
      <div className="hero-copy">
        <span className="eyebrow">THE EVERYDAY STORE</span>
        <h1>Good food.<br /><b>Good prices.</b></h1>
        <p>Stock up on trusted essentials, fresh produce, and little treats for less.</p>
        <Link className="primary" href="/products">Shop all products <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <div className="hero-art" aria-label="Up to 30 percent off on daily essentials">
        <img src="/manus-storage/dmart-hero_f4a3b3ca.png" alt="" />
        <span>UP TO</span><strong>30%</strong><small>OFF ON DAILY ESSENTIALS</small>
      </div>
    </section>

    <section className="trust-strip" aria-label="DMart benefits">
      <div><PackageCheck size={21} aria-hidden="true" /><span><b>Reliable delivery</b><small>Essentials to your door</small></span></div>
      <div><Leaf size={21} aria-hidden="true" /><span><b>Everyday freshness</b><small>Carefully selected products</small></span></div>
      <div><ShieldCheck size={21} aria-hidden="true" /><span><b>Simple checkout</b><small>No surprises at the end</small></span></div>
    </section>

    <main className="container">
      <section className="section">
        <div className="section-title"><div><span className="eyebrow">BROWSE THE AISLES</span><h2>Shop by category</h2></div><Link href="/products">View all <ChevronRight size={16} aria-hidden="true" /></Link></div>
        {categories.length ? <div className="category-grid">{categories.map((category, index) => <Link href={`/products/${encodeURIComponent(category)}`} key={category}><span aria-hidden="true">{categoryIcons[index % categoryIcons.length]}</span><b>{category}</b><small>Explore aisle <ArrowRight size={13} aria-hidden="true" /></small></Link>)}</div> : <div className="inline-state">Categories are loading…</div>}
      </section>

      <section className="section">
        <div className="section-title"><div><span className="eyebrow">START HERE</span><h2>Fresh picks for you</h2></div><Link href="/products">View all <ChevronRight size={16} aria-hidden="true" /></Link></div>
        {productsQuery.isLoading ? <div className="product-grid">{Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)}</div> : productsQuery.isError ? <div className="state-card"><h3>We could not load the catalogue.</h3><p>Refresh the page or try again in a moment.</p><button className="secondary" onClick={() => productsQuery.refetch()}>Try again</button></div> : products.length ? <div className="product-grid">{products.slice(0, 6).map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="state-card"><h3>The store is getting ready.</h3><p>There are no products available yet. Please check back soon.</p></div>}
      </section>

      <section className="strip"><div><span>WEEKEND VALUE</span><h2>Make every meal<br />a little more special.</h2><p>Practical essentials, thoughtfully priced for everyday living.</p></div><Link className="light-button" href="/products/Snacks">Explore snacks <ArrowRight size={17} aria-hidden="true" /></Link></section>

      <section className="section compact-section">
        <div className="section-title"><div><span className="eyebrow">KEEP EXPLORING</span><h2>More for your home</h2></div></div>
        {products.length > 6 && <div className="product-grid">{products.slice(6, 12).map(product => <ProductCard key={product.id} product={product} />)}</div>}
      </section>
    </main>
  </>;
}
