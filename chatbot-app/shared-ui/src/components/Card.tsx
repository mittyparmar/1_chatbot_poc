import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}, ref) => {
  const baseStyles = `
    bg-white
    rounded-xl
    transition-all
    duration-200
    ease-in-out
  `;

  const variantStyles = {
    default: `
      border border-gray-200
      shadow-sm
      hover:shadow-md
      hover:-translate-y-0.5
    `,
    outlined: `
      border-2 border-gray-300
      shadow-none
      hover:border-gray-400
      hover:shadow-sm
    `,
    elevated: `
      border border-gray-200
      shadow-lg
      hover:shadow-xl
      hover:-translate-y-1
    `,
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export { Card };