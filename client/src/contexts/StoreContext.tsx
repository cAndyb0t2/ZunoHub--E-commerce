import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { CartView, ProductView } from "@shared/zunoApp";
import { trpc } from "@/lib/trpc";

type StoreContextValue = {
  cart: CartView | null;
  cartId: string | null;
  itemCount: number;
  loading: boolean;
  addToCart: (product: ProductView | number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
  wishlist: ProductView[];
  toggleWishlist: (product: ProductView) => void;
  isWishlisted: (productId: number) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_STORAGE_KEY = "zunoApp-cart-id";
const LEGACY_CART_STORAGE_KEY = "dmart-cart-id";
const WISHLIST_STORAGE_KEY = "zunoApp-wishlist";
const LEGACY_WISHLIST_STORAGE_KEY = "dmart-wishlist";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CART_STORAGE_KEY) ?? localStorage.getItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [cart, setCart] = useState<CartView | null>(null);
  const [wishlist, setWishlist] = useState<ProductView[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) ?? localStorage.getItem(LEGACY_WISHLIST_STORAGE_KEY) ?? "[]") as ProductView[];
    } catch {
      return [];
    }
  });
  const cartInput = useMemo(() => (cartId ? { cartId } : undefined), [cartId]);
  const cartQuery = trpc.zunoApp.cart.get.useQuery(cartInput ?? { cartId: "placeholder-cart" }, {
    enabled: Boolean(cartInput),
    retry: 1,
  });
  const addMutation = trpc.zunoApp.cart.addItem.useMutation();
  const updateMutation = trpc.zunoApp.cart.updateItem.useMutation();
  const clearMutation = trpc.zunoApp.cart.clear.useMutation();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Wishlist still works for this session when storage is unavailable.
    }
  }, [wishlist]);

  useEffect(() => {
    if (cartQuery.data === null) {
      setCart(null);
      setCartId(null);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } else if (cartQuery.data) {
      setCart(cartQuery.data);
    }
  }, [cartQuery.data]);

  const rememberCart = (next: CartView) => {
    setCart(next);
    setCartId(next.id);
    try {
      localStorage.setItem(CART_STORAGE_KEY, next.id);
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // Cart still works for this session when localStorage is unavailable.
    }
  };

  const addToCart = async (product: ProductView | number, quantity = 1) => {
    const productId = typeof product === "number" ? product : product.id;
    try {
      const next = await addMutation.mutateAsync({ cartId: cartId ?? undefined, productId, quantity });
      rememberCart(next);
      const name = typeof product === "number" ? "Item" : product.name;
      toast.success(`${name} added to your bag`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add this item");
      throw error;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!cartId) return;
    try {
      const next = await updateMutation.mutateAsync({ cartId, itemId, quantity });
      rememberCart(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your bag");
      throw error;
    }
  };

  const clearCart = async () => {
    if (!cartId) return;
    try {
      const next = await clearMutation.mutateAsync({ cartId });
      rememberCart(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not clear your bag");
      throw error;
    }
  };

  const toggleWishlist = (product: ProductView) => {
    setWishlist(current => current.some(item => item.id === product.id)
      ? current.filter(item => item.id !== product.id)
      : [...current, product]);
  };

  const isWishlisted = (productId: number) => wishlist.some(item => item.id === productId);

  const resetCart = () => {
    setCart(null);
    setCartId(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  };

  return (
    <StoreContext.Provider value={{
      cart,
      cartId,
      itemCount: cart?.itemCount ?? 0,
      loading: cartQuery.isLoading || addMutation.isPending || updateMutation.isPending || clearMutation.isPending,
      addToCart,
      updateQuantity,
      clearCart,
      resetCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
