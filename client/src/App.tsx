import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { StoreProvider } from "@/contexts/StoreContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SiteFooter, SiteHeader } from "@/components/zunoApp/SiteChrome";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import About from "@/pages/About";
import Auth from "@/pages/Auth";
import Orders from "@/pages/Orders";
import OrderTracking from "@/pages/OrderTracking";
import Confirmation from "@/pages/Confirmation";
import AdminProducts from "@/pages/AdminProducts";
import Wishlist from "@/pages/Wishlist";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/products" component={Products} />
    <Route path="/products/:category" component={Products} />
    <Route path="/product/:slug" component={ProductDetail} />
    <Route path="/cart" component={Cart} />
    <Route path="/checkout" component={Checkout} />
    <Route path="/orders" component={Orders} />
    <Route path="/orders/:orderNumber" component={OrderTracking} />
    <Route path="/wishlist" component={Wishlist} />
    <Route path="/order-confirmation" component={Confirmation} />
    <Route path="/login" component={() => <Auth />} />
    <Route path="/signup" component={() => <Auth signup />} />
    <Route path="/about" component={About} />
    <Route path="/admin/products" component={AdminProducts} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><StoreProvider><Toaster /><SiteHeader /><Router /><SiteFooter /></StoreProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
