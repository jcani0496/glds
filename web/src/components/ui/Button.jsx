import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  primary: `
    bg-glds-primary hover:bg-glds-primaryHover active:bg-glds-primaryDark
    text-black font-semibold
    shadow-glow hover:shadow-glow-hover active:shadow-glow-active
    border-2 border-transparent
  `,
  secondary: `
    bg-glds-paper hover:bg-glds-paperLight active:bg-glds-paperHover
    text-primary hover:text-primary
    border-2 border-white/20 hover:border-white/30
    shadow-card hover:shadow-card-hover
  `,
  outline: `
    bg-transparent hover:bg-white/5 active:bg-white/10
    text-secondary hover:text-primary
    border-2 border-white/20 hover:border-glds-primary/50
  `,
  ghost: `
    bg-transparent hover:bg-white/5 active:bg-white/10
    text-secondary hover:text-primary
    border-2 border-transparent
  `,
  success: `
    bg-glds-success hover:bg-glds-successDark
    text-white font-semibold
    border-2 border-transparent
    shadow-card hover:shadow-card-hover
  `,
  danger: `
    bg-glds-error hover:bg-glds-errorDark
    text-white font-semibold
    border-2 border-transparent
    shadow-card hover:shadow-card-hover
  `,
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
  xl: "px-8 py-4 text-lg rounded-2xl",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          ${buttonVariants[variant]}
          ${buttonSizes[size]}
          transition-all duration-normal
          focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary 
          focus-visible:ring-offset-2 focus-visible:ring-offset-glds-bg
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          active:scale-95 motion-safe:transition-transform
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
