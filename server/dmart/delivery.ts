import type { DeliveryEstimate } from "../../shared/dmart";

function addBusinessDays(start: Date, days: number) {
  const result = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const weekday = result.getDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return result.getTime();
}

export function estimateDelivery(pincode: string, now = new Date()): DeliveryEstimate {
  const normalized = pincode.trim();
  if (!/^\d{6}$/.test(normalized)) {
    return { pincode: normalized, eligible: false, message: "Enter a valid 6-digit pin code." };
  }
  if (normalized === "000000" || normalized.startsWith("9")) {
    return { pincode: normalized, eligible: false, message: "Delivery is not available in this pin code yet." };
  }

  const variation = Number(normalized.slice(-2)) % 3;
  const minDate = addBusinessDays(now, 2 + variation);
  const maxDate = addBusinessDays(now, 4 + variation);
  return {
    pincode: normalized,
    eligible: true,
    minDate,
    maxDate,
    message: "Delivery available to this pin code.",
  };
}
