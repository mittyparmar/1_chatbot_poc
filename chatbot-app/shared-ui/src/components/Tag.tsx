import React from 'react';

export interface TagProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'default' | 'rounded' | 'pill';
  closable?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  shape = 'default',
  closable = false,
  onClose,
  onClick,
  checked,
  onChange,
  color,
  backgroundColor,
  borderColor,
  textColor,
  icon,
  prefix,
  suffix,
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-300',
    primary: 'bg-primary-100 text-primary-800 border-primary-300',
    secondary: 'bg-gray-100 text-gray-800 border-gray-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const shapeClasses = {
    default: 'rounded',
    rounded: 'rounded-md',
    pill: 'rounded-full',
  };

  const tagClasses = `
    inline-flex items-center justify-center
    border font-medium
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${shapeClasses[shape]}
    ${checked ? 'ring-2 ring-offset-2 ring-primary-500' : ''}
    ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
    ${closable ? 'pr-1' : ''}
    ${className}
  `;

  const style = {
    color,
    backgroundColor,
    borderColor,
    textColor,
  };

  const renderCloseButton = () => {
    if (!closable) return null;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        className="ml-1 text-current opacity-60 hover:opacity-100 focus:outline-none"
      >
        ×
      </button>
    );
  };

  const renderCheckbox = () => {
    if (onChange === undefined) return null;
    return (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-2"
      />
    );
  };

  const renderIcon = () => {
    if (!icon) return null;
    return <span className="mr-1">{icon}</span>;
  };

  const renderPrefix = () => {
    if (!prefix) return null;
    return <span className="mr-1">{prefix}</span>;
  };

  const renderSuffix = () => {
    if (!suffix) return null;
    return <span className="ml-1">{suffix}</span>;
  };

  return (
    <span className={tagClasses} style={style} onClick={onClick}>
      {renderCheckbox()}
      {renderIcon()}
      {renderPrefix()}
      {children}
      {renderSuffix()}
      {renderCloseButton()}
    </span>
  );
};

export interface TagItemProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'default' | 'rounded' | 'pill';
  closable?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const TagItem: React.FC<TagItemProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  shape = 'default',
  closable = false,
  onClose,
  onClick,
  checked,
  onChange,
  color,
  backgroundColor,
  borderColor,
  textColor,
  icon,
  prefix,
  suffix,
}) => {
  return (
    <Tag
      children={children}
      className={className}
      variant={variant}
      size={size}
      shape={shape}
      closable={closable}
      onClose={onClose}
      onClick={onClick}
      checked={checked}
      onChange={onChange}
      color={color}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      textColor={textColor}
      icon={icon}
      prefix={prefix}
      suffix={suffix}
    />
  );
};

export interface CheckableTagProps {
  children: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'default' | 'rounded' | 'pill';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export const CheckableTag: React.FC<CheckableTagProps> = ({
  children,
  checked,
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  shape = 'default',
  color,
  backgroundColor,
  borderColor,
  textColor,
}) => {
  return (
    <Tag
      children={children}
      checked={checked}
      onChange={onChange}
      className={className}
      variant={variant}
      size={size}
      shape={shape}
      color={color}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      textColor={textColor}
    />
  );
};

export interface TagGroupProps {
  tags: Array<{
    id: string | number;
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    shape?: 'default' | 'rounded' | 'pill';
    closable?: boolean;
    checked?: boolean;
  }>;
  className?: string;
  max?: number;
  closable?: boolean;
  onTagClose?: (id: string | number) => void;
  onTagClick?: (id: string | number) => void;
  onTagChange?: (id: string | number, checked: boolean) => void;
}

export const TagGroup: React.FC<TagGroupProps> = ({
  tags,
  className = '',
  max,
  closable,
  onTagClose,
  onTagClick,
  onTagChange,
}) => {
  const displayTags = max ? tags.slice(0, max) : tags;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTags.map((tag) => (
        <Tag
          key={tag.id}
          children={tag.children}
          variant={tag.variant}
          size={tag.size}
          shape={tag.shape}
          closable={closable || tag.closable}
          onClose={() => onTagClose?.(tag.id)}
          onClick={() => onTagClick?.(tag.id)}
          checked={tag.checked}
          onChange={(checked) => onTagChange?.(tag.id, checked)}
        />
      ))}
      {max && tags.length > max && (
        <Tag variant="secondary" size="sm">
          +{tags.length - max} more
        </Tag>
      )}
    </div>
  );
};

export default Tag;