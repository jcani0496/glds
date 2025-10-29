import { Bell } from "lucide-react";
import { useState } from "react";

export default function NotificationBell() {
  const [hasNew, setHasNew] = useState(false);

  return (
    <button
      aria-label="Notificaciones"
      onClick={() => setHasNew(false)}
      className="relative grid place-items-center w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
    >
      <Bell className="w-5 h-5 text-white/90" />
      {hasNew && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-glds-primary ring-2 ring-black/70" />
      )}
    </button>
  );
}
