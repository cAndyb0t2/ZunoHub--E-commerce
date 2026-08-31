import { nanoid } from "nanoid";
import type { MockPaymentInput, MockPaymentResult } from "../../shared/zunoApp";

export function authorizeMockPayment(input: MockPaymentInput): MockPaymentResult {
  if (input.method === "upi") {
    if (!input.upiId?.trim() || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(input.upiId.trim())) {
      return { status: "failed", method: "upi", message: "Enter a valid demo UPI ID, such as shopper@zunobank." };
    }
  }

  if (input.method === "card") {
    const cardNumber = input.cardNumber?.replace(/\s/g, "") ?? "";
    const expiry = input.expiry?.trim() ?? "";
    const cvv = input.cvv?.trim() ?? "";
    if (!/^\d{16}$/.test(cardNumber) || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvv)) {
      return { status: "failed", method: "card", message: "Enter valid demo card details: 16 digits, MM/YY, and 3–4 digit CVV." };
    }
  }

  const transactionId = `ZUNO-${input.method.toUpperCase()}-${nanoid(10).toUpperCase().replace(/[^A-Z0-9]/g, "X")}`;
  return {
    status: "success",
    method: input.method,
    transactionId,
    message: "Mock payment approved for testing. No money was charged.",
  };
}
