import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Buscar…" }) {
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
      />
    </div>
  );
}