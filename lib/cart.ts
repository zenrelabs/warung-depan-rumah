const KEY = "ekasir_cart";

export type CartLine = { id: number; qty: number };

export function getCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCart(cart: CartLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function clearCart() {
  setCart([]);
}

export function changeCartQty(id: number, delta: number): CartLine[] {
  const cart = getCart();
  const existing = cart.find((c) => c.id === id);
  let next: CartLine[];
  if (existing) {
    const newQty = existing.qty + delta;
    next =
      newQty <= 0
        ? cart.filter((c) => c.id !== id)
        : cart.map((c) => (c.id === id ? { ...c, qty: newQty } : c));
  } else if (delta > 0) {
    next = [...cart, { id, qty: 1 }];
  } else {
    next = cart;
  }
  setCart(next);
  return next;
}

const MY_ORDERS_KEY = "ekasir_my_orders";

export function getMyOrderIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MY_ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveMyOrderId(id: string) {
  if (typeof window === "undefined") return;
  const ids = getMyOrderIds();
  if (!ids.includes(id)) {
    ids.unshift(id);
    localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(ids.slice(0, 30)));
  }
}
