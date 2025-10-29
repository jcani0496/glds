import { forwardRef } from "react";

const Textarea = forwardRef(
  (
    {
      label,
      error,
      success,
      required = false,
      helperText,
      className = "",
      rows = 4,
      ...props
    },
    ref
  ) => {
    const variant = error ? "error" : success ? "success" : "default";
    const id = props.id || props.name;

    const variantStyles = {
      default: "border-white/20 focus:border-glds-primary focus:ring-glds-primary",
      error: "border-glds-error focus:border-glds-error focus:ring-glds-error",
      success: "border-glds-success focus:border-glds-success focus:ring-glds-success",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold mb-2 text-secondary"
          >
            {label}
            {required && (
              <span className="text-glds-error ml-1" aria-label="requerido">
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-glds-paper border-2 ${variantStyles[variant]}
            text-primary placeholder:text-muted
            transition-all duration-normal resize-none
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-glds-bg
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-glds-paper/50
            ${className}
          `}
          {...props}
        />
        {error && (
          <p
            id={`${id}-error`}
            className="mt-1.5 text-sm text-glds-error"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${id}-helper`} className="mt-1.5 text-sm text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
