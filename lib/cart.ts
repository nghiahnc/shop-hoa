export type CartItem = { productId: number; quantity: number };
const key = "moc-hoa-cart-v1";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => Number.isSafeInteger(x.productId) && Number.isSafeInteger(x.quantity) && x.quantity > 0 && x.quantity <= 20);
  } catch { return []; }
}
export function saveCart(items: CartItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event("moc-hoa-cart"));
}
export function addCart(productId: number, quantity = 1) {
  const items = readCart();
  const found = items.find((item) => item.productId === productId);
  if (found) found.quantity = Math.min(20, found.quantity + quantity);
  else items.push({ productId, quantity });
  saveCart(items);
}
export function clearCart() { saveCart([]); }
