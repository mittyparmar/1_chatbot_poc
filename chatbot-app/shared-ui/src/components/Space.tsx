import React from 'react';

export interface SpaceProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  split?: React.ReactNode;
  children?: React.ReactNode;
}

export const Space: React.FC<SpaceProps> = ({
  className = '',
  size = 'md',
  direction = 'horizontal',
  align = 'center',
  justify = 'start',
  wrap = false,
  split,
  children,
}) => {
  const sizeClasses = {
    xs: 'space-x-1 space-y-1',
    sm: 'space-x-2 space-y-2',
    md: 'space-x-4 space-y-4',
    lg: 'space-x-6 space-y-6',
    xl: 'space-x-8 space-y-8',
    xxl: 'space-x-12 space-y-12',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    baseline: 'items-baseline',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const directionClasses = direction === 'horizontal' ? 'flex-row' : 'flex-col';

  const spaceClasses = `
    flex
    ${directionClasses}
    ${alignClasses[align]}
    ${justifyClasses[justify]}
    ${wrap ? 'flex-wrap' : ''}
    ${sizeClasses[size]}
    ${className}
  `;

  const childrenArray = React.Children.toArray(children);

  if (split) {
    return (
      <div className={spaceClasses}>
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childrenArray.length - 1 && (
              <span className="text-gray-400">
                {split}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={spaceClasses}>
      {children}
    </div>
  );
};

export interface SpaceItemProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  split?: React.ReactNode;
  children?: React.ReactNode;
}

export const SpaceItem: React.FC<SpaceItemProps> = ({
  className = '',
  size = 'md',
  direction = 'horizontal',
  align = 'center',
  justify = 'start',
  wrap = false,
  split,
  children,
}) => {
  return (
    <Space
      className={className}
      size={size}
      direction={direction}
      align={align}
      justify={justify}
      wrap={wrap}
      split={split}
      children={children}
    />
  );
};

export interface HSpaceProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  align?: 'start' | 'center' | 'end' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  split?: React.ReactNode;
  children?: React.ReactNode;
}

export const HSpace: React.FC<HSpaceProps> = ({
  className = '',
  size = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  split,
  children,
}) => {
  return (
    <Space
      className={className}
      size={size}
      direction="horizontal"
      align={align}
      justify={justify}
      wrap={wrap}
      split={split}
      children={children}
    />
  );
};

export interface VSpaceProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  align?: 'start' | 'center' | 'end' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  split?: React.ReactNode;
  children?: React.ReactNode;
}

export const VSpace: React.FC<VSpaceProps> = ({
  className = '',
  size = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  split,
  children,
}) => {
  return (
    <Space
      className={className}
      size={size}
      direction="vertical"
      align={align}
      justify={justify}
      wrap={wrap}
      split={split}
      children={children}
    />
  );
};

export default Space;