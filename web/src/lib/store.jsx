// web/src/lib/store.jsx
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartCtx = createContext();

const initial = (() => {
  try {
    const raw = localStorage.getItem("glds_cart_v2");
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
})();

function itemKey({ id, name, color, customization }) {
  // Un ítem es único por producto + color + marcaje (aunque no haya id)
  return `${id || name}|${color || ""}|${customization || ""}`;
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const payload = { ...action.payload };
      const key = itemKey(payload);
      const qty = Math.max(1, Number(payload.qty || 1));
      const items = state.items.slice();
      const idx = items.findIndex((it) => (it.key || itemKey(it)) === key);

      if (idx >= 0) {
        items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + qty };
      } else {
        items.push({
          key,
          id: payload.id || null,
          name: payload.name,
          sku: payload.sku || null,
          image_url: payload.image_url || null,
          color: payload.color || null,
          customization: payload.customization || null,
          qty,
        });
      }
      return { ...state, items };
    }

    case "UPDATE_QTY": {
      const { key, id, color, customization, qty } = action.payload;
      const k = key || itemKey({ id, color, customization });
      const items = state.items.map((it) =>
        (it.key || itemKey(it)) === k ? { ...it, qty: Math.max(1, Number(qty || 1)) } : it
      );
      return { ...state, items };
    }

    case "REMOVE": {
      const { key, id, color, customization } = action.payload;
      const k = key || itemKey({ id, color, customization });
      const items = state.items.filter((it) => (it.key || itemKey(it)) !== k);
      return { ...state, items };
    }

    case "CLEAR":
      return { ...state, items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    try {
      localStorage.setItem("glds_cart_v2", JSON.stringify(state));
    } catch {}
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}