export default function FilterPills({ items = [], active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const on = String(active || "") === String(it.value || "");
        return (
          <button
            key={it.value ?? "all"}
            onClick={() => onChange?.(on ? "" : it.value)}
            className={[
              "px-3 py-1.5 rounded-full text-sm transition border",
              on
                ? "bg-glds-primary text-zinc-900 border-transparent"
                : "bg-white/[.06] border-white/10 hover:bg-white/[.08]"
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}