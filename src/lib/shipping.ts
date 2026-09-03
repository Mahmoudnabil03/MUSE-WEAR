export type ShippingZone = { governorate: string; price: number; free_threshold: number; delivery_days: string };

export const SHIPPING_ZONES: ShippingZone[] = [
  { governorate: "Cairo", price: 59, free_threshold: 999, delivery_days: "1-2 days" },
  { governorate: "Alexandria", price: 59, free_threshold: 999, delivery_days: "1-2 days" },
  { governorate: "Giza", price: 59, free_threshold: 999, delivery_days: "1-2 days" },
  { governorate: "Other", price: 75, free_threshold: 1499, delivery_days: "2-4 days" },
];

export function getShipping(governorate: string, subtotal: number): { price: number; freeThreshold: number; delivery: string } {
  const zone = SHIPPING_ZONES.find((z) => z.governorate === governorate) || SHIPPING_ZONES.find((z) => z.governorate === "Other")!;
  const price = subtotal >= zone.free_threshold ? 0 : zone.price;
  return { price, freeThreshold: zone.free_threshold, delivery: zone.delivery_days };
}
