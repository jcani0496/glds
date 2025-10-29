const badgeVariants = {
  featured: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  new: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  popular: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  eco: "bg-green-500/20 text-green-300 border-green-500/40",
  available: "bg-green-500/20 text-green-300 border-green-500/40",
  lowStock: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  onOrder: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  comingSoon: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  default: "bg-white/10 text-secondary border-white/20",
};

export default function Badge({ 
  children, 
  variant = "default", 
  icon: Icon,
  className = "" 
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full
        text-xs font-bold border
        ${badgeVariants[variant]}
        transition-colors duration-normal
        ${className}
      `}
    >
      {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
      {children}
    </span>
  );
}
