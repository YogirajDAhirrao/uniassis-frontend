import './Card.css';

export default function Card({
  children,
  variant = 'default',
  compact = false,
  className = '',
  ...props
}) {
  const classes = [
    'card',
    variant === 'glass' && 'card-glass',
    variant === 'interactive' && 'card-interactive',
    variant === 'highlighted' && 'card-highlighted',
    compact && 'card-compact',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
