import { Link } from "react-router-dom";
import { useRef, useState } from "react";

export default function InteractiveHoverButton({
  to,
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    if (disabled) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const base = `
    relative group overflow-hidden rounded-xl px-6 py-3 font-bold text-sm
    transition-all duration-normal will-change-transform
    focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
    focus-visible:ring-offset-2 focus-visible:ring-offset-glds-bg
    active:scale-95 motion-safe:transition-transform
    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
  `;

  const styles = {
    primary: `
      bg-glds-primary hover:bg-glds-primaryHover active:bg-glds-primaryDark
      text-black shadow-glow hover:shadow-glow-hover
      border-2 border-transparent
    `,
    outline: `
      bg-transparent hover:bg-white/5 active:bg-white/10
      text-secondary hover:text-primary
      border-2 border-white/20 hover:border-glds-primary/50
    `,
    secondary: `
      bg-glds-paper hover:bg-glds-paperLight active:bg-glds-paperHover
      text-primary border-2 border-white/20 hover:border-white/30
      shadow-card hover:shadow-card-hover
    `,
  };

  const Overlay = (
    <span
      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100
                 motion-safe:transition-opacity motion-safe:duration-normal"
      style={{
        background: `radial-gradient(160px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,.25), transparent 60%)`,
      }}
      aria-hidden="true"
    />
  );

  const Inner = <span className="relative z-10">{children}</span>;

  if (to) {
    return (
      <Link
        ref={ref}
        to={to}
        onMouseMove={onMove}
        className={`${base} ${styles[variant]} ${className}`}
        aria-disabled={disabled}
      >
        {Overlay}
        {Inner}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {Overlay}
      {Inner}
    </button>
  );
}