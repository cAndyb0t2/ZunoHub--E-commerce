import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ZUNO_CATEGORIES } from "../../shared/zunoApp";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { addCartItem, clearCart, getCart, setCartItemQuantity } from "./cart";
import { getProductBySlug, listCatalog, updateProductAvailability } from "./catalog";
import { getOrderByNumber, listAllOrders, listCustomerOrders, placeOrder, updateOrderStatus } from "./orders";
import { estimateDelivery } from "./delivery";
import { authorizeMockPayment } from "./payments";

const paymentMethod = z.enum(["cod", "upi", "card"]);
const orderStatus = z.enum(["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"]);

export const zunoAppRouter = router({
  catalog: router({
    categories: publicProcedure.query(() => [...ZUNO_CATEGORIES]),
    list: publicProcedure.input(z.object({ category: z.string().optional(), search: z.string().optional(), priceMin: z.number().min(0).optional(), priceMax: z.number().min(0).optional() }).optional()).query(({ input }) =>
      listCatalog(input),
    ),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
      const product = await getProductBySlug(input.slug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      return product;
    }),
  }),
  delivery: router({
    estimate: publicProcedure.input(z.object({ pincode: z.string() })).query(({ input }) => estimateDelivery(input.pincode)),
  }),
  payment: router({
    mockAuthorize: publicProcedure.input(z.object({
      method: z.enum(["upi", "card"]),
      upiId: z.string().optional(),
      cardNumber: z.string().optional(),
      expiry: z.string().optional(),
      cvv: z.string().optional(),
    })).mutation(({ input }) => authorizeMockPayment(input)),
  }),
  cart: router({
    get: publicProcedure.input(z.object({ cartId: z.string().min(8) })).query(({ input }) => getCart(input.cartId)),
    addItem: publicProcedure.input(z.object({ cartId: z.string().min(8).optional(), productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99).default(1) })).mutation(({ ctx, input }) =>
      addCartItem({ ...input, userId: ctx.user?.id }),
    ),
    updateItem: publicProcedure.input(z.object({ cartId: z.string().min(8), itemId: z.number().int().positive(), quantity: z.number().int().min(0).max(99) })).mutation(({ input }) =>
      setCartItemQuantity(input),
    ),
    clear: publicProcedure.input(z.object({ cartId: z.string().min(8) })).mutation(({ input }) => clearCart(input.cartId)),
  }),
  checkout: router({
    place: publicProcedure.input(z.object({
      cartId: z.string().min(8),
      customerName: z.string().trim().min(2).max(160),
      phone: z.string().trim().min(7).max(30),
      address: z.string().trim().min(5).max(500),
      city: z.string().trim().min(2).max(100),
      pincode: z.string().trim().regex(/^\d{5,6}$/, "Enter a valid pincode"),
      paymentMethod,
      couponCode: z.string().trim().max(32).optional(),
    })).mutation(({ ctx, input }) => placeOrder(input, ctx.user?.id)),
  }),
  orders: router({
    mine: protectedProcedure.query(({ ctx }) => listCustomerOrders(ctx.user.id)),
    byNumber: protectedProcedure.input(z.object({ orderNumber: z.string().min(6).max(40) })).query(async ({ ctx, input }) => {
      const order = await getOrderByNumber(input.orderNumber, ctx.user.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      return order;
    }),
  }),
  admin: router({
    products: router({
      update: adminProcedure.input(z.object({ id: z.number().int().positive(), stock: z.number().int().min(0).optional(), price: z.number().min(0).optional(), active: z.boolean().optional() })).mutation(({ input }) =>
        updateProductAvailability(input.id, input),
      ),
    }),
    orders: router({
      list: adminProcedure.query(() => listAllOrders()),
      updateStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: orderStatus })).mutation(({ input }) =>
        updateOrderStatus(input.id, input.status),
      ),
    }),
  }),
});
