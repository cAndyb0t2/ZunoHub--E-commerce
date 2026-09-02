export function welcomeToastKey(openId: string) {
  return `zunohub-welcomed-${openId}`;
}

export function shouldShowWelcomeToast(isAuthenticated: boolean, openId: string | undefined, alreadyWelcomed: boolean) {
  return Boolean(isAuthenticated && openId && !alreadyWelcomed);
}

export function normalizeProfileName(value: string) {
  const name = value.trim();
  if (name.length < 2) throw new Error("Please enter at least 2 characters for your name.");
  return name.slice(0, 160);
}

export function formatMockCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

export function formatMockExpiry(value: string) {
  return value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
}


export function profileUpdateFeedback(kind: "success" | "error", message?: string) {
  return kind === "success"
    ? { title: "Profile details updated", description: "Your ZunoHub account is up to date." }
    : { title: message || "We could not update your profile.", description: undefined };
}

export function canStartMockPayment(method: "cod" | "upi" | "card", phase: "idle" | "processing") {
  return method !== "cod" && phase === "idle";
}

export function mockPaymentButtonLabel(phase: "idle" | "processing", method: "upi" | "card") {
  if (phase === "processing") return "Authorising securely…";
  return method === "upi" ? "Simulate UPI payment" : "Simulate card payment";
}
