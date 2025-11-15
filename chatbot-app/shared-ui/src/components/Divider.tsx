import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick';
  className?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'medium',
  className = '',
  ...props
}, ref) => {
  const orientationStyles = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px',
  };

  const variantStyles = {
    solid: '',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const thicknessStyles = {
    thin: 'border',
    medium: 'border-2',
    thick: 'border-4',
  };

  const baseStyles = `border-gray-200 ${orientationStyles[orientation]} ${variantStyles[variant]} ${thicknessStyles[thickness]}`;

  return (
    <div
      ref={ref}
      className={`${baseStyles} ${className}`}
      {...props}
    />
  );
});

Divider.displayName = 'Divider';

export { Divider };