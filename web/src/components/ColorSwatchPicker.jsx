// web/src/components/ColorSwatchPicker.jsx
import { useId } from "react";
import { Check } from "lucide-react";

/**
 * options: [{id, name, hex}]
 * value:   number|null (id seleccionado)
 * onChange(id)
 */
export default function ColorSwatchPicker({ options = [], value, onChange }) {
  const groupId = useId();

  if (!options.length) {
    return (
      <div className="text-xs opacity-70" aria-live="polite">
        Sin colores definidos
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={`${groupId}-label`}>
      {options.map((c) => {
        const selected = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.name}
            onClick={() => onChange?.(c.id)}
            className={`relative w-8 h-8 rounded-full border transition
              ${selected ? "ring-2 ring-glds-primary" : "ring-0"}
              ${c.hex ? "" : "bg-white/10"}
            `}
            style={c.hex ? { background: c.hex, borderColor: "rgba(255,255,255,.25)" } : {}}
            title={c.name}
          >
            {selected && (
              <span className="absolute inset-0 grid place-items-center">
                <Check className="w-4 h-4 text-black/80 mix-blend-plus-lighter" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}