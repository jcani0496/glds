import { forwardRef } from "react";

const inputVariants = {
  default: `
    bg-glds-paper border-white/20
    focus:border-glds-primary focus:ring-glds-primary
  `,
  error: `
    bg-glds-paper border-glds-error
    focus:border-glds-error focus:ring-glds-error
  `,
  success: `
    bg-glds-paper border-glds-success
    focus:border-glds-success focus:ring-glds-success
  `,
};

const Input = forwardRef(
  (
    {
      label,
      error,
      success,
      required = false,
      helperText,
      className = "",
      ...props
    },
    ref
  ) => {
    const variant = error ? "error" : success ? "success" : "default";
    const id = props.id || props.name;

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
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          className={`
            w-full px-4 py-2.5 rounded-lg
            border-2 ${inputVariants[variant]}
            text-primary placeholder:text-muted
            transition-all duration-normal
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

Input.displayName = "Input";

export default Input;
