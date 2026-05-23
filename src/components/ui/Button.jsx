import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Variant → CSS class mapping.
 * Uses the btn-* classes defined in index.css.
 */
const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  icon:      'btn-ghost !px-2 !py-2',
};

const sizes = {
  sm: 'text-xs !px-3 !py-1.5',
  md: '',
  lg: 'text-base !px-6 !py-3',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
