export default function Card({ 
  children, 
  hover = false,
  className = "",
  ...props 
}) {
  return (
    <div
      className={`
        bg-glds-paper border border-white/20 rounded-2xl p-card
        shadow-card
        transition-all duration-normal
        ${hover ? "hover:bg-glds-paperLight hover:shadow-card-hover hover:border-white/30 cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
