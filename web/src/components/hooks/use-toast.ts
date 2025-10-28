import * as React from "react";

type ToastAction = {
  altText?: string;
  onClick?: () => void;
  label?: React.ReactNode;
};

export type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastAction;
  duration?: number; // ms
};

type ToastState = {
  toasts: ToasterToast[];
};

type ToastActionType =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 350;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return `t_${count}`;
}

const listeners = new Set<(state: ToastState) => void>();
let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastActionType) {
  const toasts = memoryState.toasts.slice();

  switch (action.type) {
    case "ADD_TOAST": {
      toasts.push(action.toast);
      // limita cantidad
      while (toasts.length > TOAST_LIMIT) {
        toasts.shift();
      }
      break;
    }
    case "DISMISS_TOAST": {
      if (action.toastId) {
        const i = toasts.findIndex((t) => t.id === action.toastId);
        if (i !== -1) {
          // marcar para remover luego
          const t = toasts[i];
          toasts[i] = { ...t, duration: t.duration ?? TOAST_REMOVE_DELAY };
        }
      } else {
        for (let i = 0; i < toasts.length; i++) {
          const t = toasts[i];
          toasts[i] = { ...t, duration: t.duration ?? TOAST_REMOVE_DELAY };
        }
      }
      break;
    }
    case "REMOVE_TOAST": {
      if (action.toastId) {
        const i = toasts.findIndex((t) => t.id === action.toastId);
        if (i !== -1) toasts.splice(i, 1);
      } else {
        toasts.length = 0;
      }
      break;
    }
  }

  memoryState = { toasts };
  listeners.forEach((l) => l(memoryState));
}

export function toast(opts: Omit<ToasterToast, "id">) {
  const id = genId();
  const t: ToasterToast = {
    id,
    title: opts.title,
    description: opts.description,
    action: opts.action,
    duration: opts.duration,
  };
  dispatch({ type: "ADD_TOAST", toast: t });
  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    remove: () => dispatch({ type: "REMOVE_TOAST", toastId: id }),
  };
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    remove: (toastId?: string) => dispatch({ type: "REMOVE_TOAST", toastId }),
  };
}