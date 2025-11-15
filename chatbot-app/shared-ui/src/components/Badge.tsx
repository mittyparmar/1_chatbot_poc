import React from 'react';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
  variant = 'default',
  size = 'md',
  rounded = false,
  dot = false,
  children,
  className = '',
  ...props
}, ref) => {
  const variantStyles = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-purple-100 text-purple-800',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };

  const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';

  const baseStyles = `inline-flex items-center font-medium ${roundedStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <span ref={ref} className={baseStyles} {...props}>
      {dot && (
        <span className={`mr-1.5 h-2 w-2 rounded-full ${variantStyles[variant].replace('bg-', 'bg-').replace('text-', '')}`} />
      )}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export { Badge };