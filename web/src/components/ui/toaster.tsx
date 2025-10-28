import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss, remove } = useToast();

  React.useEffect(() => {
    // remove toasts marcados para cerrar tras su duración
    const timers = toasts.map((t) => {
      if (!t.duration) return null as any;
      return setTimeout(() => remove(t.id), t.duration);
    });
    return () => {
      timers.forEach((tmr) => tmr && clearTimeout(tmr));
    };
  }, [toasts, remove]);

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description }) => (
        <Toast key={id} onOpenChange={(open) => (!open ? dismiss(id) : null)}>
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
          <ToastClose onClick={() => dismiss(id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}