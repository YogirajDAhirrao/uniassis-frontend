import { forwardRef } from 'react';

/**
 * Labelled form input with optional leading icon and inline error message.
 * Uses .form-input from the academic design system.
 */
const Input = forwardRef(
  ({ label, error, icon: Icon, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--text-base)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`form-input ${Icon ? 'pl-9' : ''} ${error ? 'error' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
