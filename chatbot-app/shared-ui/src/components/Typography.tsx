import React from 'react';

export interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  type?: 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  color?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  className = '',
  type = 'body',
  variant = 'default',
  size = 'md',
  weight = 'normal',
  align = 'left',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  color,
  style,
  as,
}) => {
  const typeClasses = {
    title: 'text-2xl font-bold',
    heading: 'text-xl font-semibold',
    subheading: 'text-lg font-medium',
    body: 'text-base',
    caption: 'text-sm',
    label: 'text-sm font-medium',
  };

  const variantClasses = {
    default: 'text-gray-900',
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    xxl: 'text-2xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const decorationClasses = {
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  };

  const truncateClass = truncate ? 'truncate' : '';

  const classes = `
    ${typeClasses[type]}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${weightClasses[weight]}
    ${alignClasses[align]}
    ${italic ? decorationClasses.italic : ''}
    ${underline ? decorationClasses.underline : ''}
    ${strikethrough ? decorationClasses.strikethrough : ''}
    ${truncateClass}
    ${className}
  `;

  const Component = as || (type === 'title' ? 'h1' : type === 'heading' ? 'h2' : type === 'subheading' ? 'h3' : 'p');

  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  );
};

export interface TypographyItemProps {
  children: React.ReactNode;
  className?: string;
  type?: 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  color?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const TypographyItem: React.FC<TypographyItemProps> = ({
  children,
  className = '',
  type = 'body',
  variant = 'default',
  size = 'md',
  weight = 'normal',
  align = 'left',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  color,
  style,
  as,
}) => {
  return (
    <Typography
      children={children}
      className={className}
      type={type}
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      italic={italic}
      underline={underline}
      strikethrough={strikethrough}
      truncate={truncate}
      color={color}
      style={style}
      as={as}
    />
  );
};

export interface TitleProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  color?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Title: React.FC<TitleProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  weight = 'bold',
  align = 'left',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  color,
  style,
  as,
}) => {
  return (
    <Typography
      children={children}
      className={className}
      type="title"
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      italic={italic}
      underline={underline}
      strikethrough={strikethrough}
      truncate={truncate}
      color={color}
      style={style}
      as={as}
    />
  );
};

export interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  color?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  weight = 'semibold',
  align = 'left',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  color,
  style,
  as,
}) => {
  return (
    <Typography
      children={children}
      className={className}
      type="heading"
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      italic={italic}
      underline={underline}
      strikethrough={strikethrough}
      truncate={truncate}
      color={color}
      style={style}
      as={as}
    />
  );
};

export interface SubheadingProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  color?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Subheading: React.FC<SubheadingProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  weight = 'medium',
  align = 'left',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  color,
  style,
  as,
}) => {
  return (
    <Typography
      children={children}
      className={className}
      type="subheading"
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      italic={italic}
      underline={underline}
      strikethrough={strikethrough}
      truncate={truncate}
      color={color}
      style={style}
      as={as}
    />
  );
};

export interface BodyProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  color?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Body: React.FC<BodyProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  weight = 'normal',
  align = 'left',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  color,
  style,
  as,
}) => {
  return (
    <Typography
      children={children}
      className={className}
      type="body"
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      italic={italic}
      underline={underline}
      strikethrough={strikethrough}
      truncate={truncate}
      color={color}
      style={style}
      as={as}
    />
  );
};

export interface CaptionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  color?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'sm',
  weight = 'normal',
  align = 'left',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  color,
  style,
  as,
}) => {
  return (
    <Typography
      children={children}
      className={className}
      type="caption"
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      italic={italic}
      underline={underline}
      strikethrough={strikethrough}
      truncate={truncate}
      color={color}
      style={style}
      as={as}
    />
  );
};

export interface LabelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
  color?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Label: React.FC<LabelProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'sm',
  weight = 'medium',
  align = 'left',
  italic = false,
  underline = false,
  strikethrough = false,
  truncate = false,
  color,
  style,
  as,
}) => {
  return (
    <Typography
      children={children}
      className={className}
      type="label"
      variant={variant}
      size={size}
      weight={weight}
      align={align}
      italic={italic}
      underline={underline}
      strikethrough={strikethrough}
      truncate={truncate}
      color={color}
      style={style}
      as={as}
    />
  );
};

export default Typography;