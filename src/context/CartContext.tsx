"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  type ReactNode,
} from "react";

// =====================================================================
// Cart item shape — one line item in the cart
// =====================================================================
export interface CartItem {
  /** Unique line key (productId + colorId + size + design + closure combination) */
  key: string;
  productId: string;
  productSlug: string;
  productName: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  size: string;
  quantity: number;
  price: number;
  currency: string;
  image: string;
  // Optional — only present for products that expose these (e.g. Al-Raqi)
  designId?: string;
  designName?: string;
  closureId?: string;
  closureName?: string;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
}

type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD"; item: Omit<CartItem, "key"> }
  | { type: "REMOVE"; key: string }
  | { type: "UPDATE_QUANTITY"; key: string; quantity: number }
  | { type: "CLEAR" };

const STORAGE_KEY = "waqar_cart_v1";

function makeKey(
  productId: string,
  colorId: string,
  size: string,
  designId?: string,
  closureId?: string
) {
  // Variants with different designs/closures are separate cart lines
  return [productId, colorId, size, designId ?? "", closureId ?? ""].join("__");
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, hydrated: true };
    case "ADD": {
      const key = makeKey(
        action.item.productId,
        action.item.colorId,
        action.item.size,
        action.item.designId,
        action.item.closureId
      );
      const existing = state.items.find((i) => i.key === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, key }],
      };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.key !== action.key) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === action.key ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

// =====================================================================
// Context API
// =====================================================================
interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });
  const [open, setOpen] = useReducerOpenState();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      dispatch({ type: "HYDRATE", items });
    } catch {
      dispatch({ type: "HYDRATE", items: [] });
    }
  }, []);

  // Persist to localStorage on every change (after hydration)
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore quota errors
    }
  }, [state.items, state.hydrated]);

  const totalItems = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );
  const totalPrice = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [state.items]
  );

  const value: CartContextValue = {
    items: state.items,
    hydrated: state.hydrated,
    totalItems,
    totalPrice,
    isOpen: open,
    setOpen,
    addItem: (item) => {
      dispatch({ type: "ADD", item });
      setOpen(true); // Auto-open drawer when adding
    },
    removeItem: (key) => dispatch({ type: "REMOVE", key }),
    updateQuantity: (key, quantity) =>
      dispatch({ type: "UPDATE_QUANTITY", key, quantity }),
    clearCart: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Tiny hook for drawer open state — avoids extra useState noise above
function useReducerOpenState() {
  const [open, set] = useReducer(
    (_: boolean, next: boolean) => next,
    false
  );
  return [open, set] as const;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
