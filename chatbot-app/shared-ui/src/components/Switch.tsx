import React, { useState } from 'react';

export interface SwitchProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'rounded' | 'pill';
  disabled?: boolean;
  label?: string;
  labelPosition?: 'left' | 'right';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  className = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  label,
  labelPosition = 'right',
  color = 'primary',
  required = false,
  error,
  helperText,
}) => {
  const [internalChecked, setInternalChecked] = useState(checked);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newChecked = e.target.checked;
    setInternalChecked(newChecked);
    onChange?.(newChecked);
  };

  const sizeClasses = {
    sm: 'w-10 h-5 text-xs',
    md: 'w-12 h-6 text-sm',
    lg: 'w-14 h-7 text-base',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  const variantClasses = {
    default: 'rounded-md',
    rounded: 'rounded-full',
    pill: 'rounded-full px-1',
  };

  const labelClasses = {
    left: 'mr-3',
    right: 'ml-3',
  };

  return (
    <div className="flex items-center">
      {label && labelPosition === 'left' && (
        <label className={`text-sm font-medium text-gray-700 ${labelClasses[labelPosition]}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative inline-block">
        <input
          type="checkbox"
          checked={internalChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          id={`switch-${Math.random().toString(36).substr(2, 9)}`}
        />
        
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} relative inline-flex items-center cursor-pointer transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
          } ${className}`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
              internalChecked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
          <span
            className={`absolute inset-0 ${colorClasses[color]} transition-opacity ${
              internalChecked ? 'opacity-100' : 'opacity-50'
            }`}
          />
        </div>
      </div>
      
      {label && labelPosition === 'right' && (
        <label className={`text-sm font-medium text-gray-700 ${labelClasses[labelPosition]}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {(error || helperText) && (
        <div className="ml-3">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : helperText ? (
            <p className="text-sm text-gray-500">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export interface SwitchGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'space-x-4' : 'space-y-2',
    md: orientation === 'horizontal' ? 'space-x-6' : 'space-y-4',
    lg: orientation === 'horizontal' ? 'space-x-8' : 'space-y-6',
  };

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export interface SwitchItemProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'rounded' | 'pill';
  disabled?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const SwitchItem: React.FC<SwitchItemProps> = ({
  id,
  label,
  checked = false,
  onChange,
  className = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  color = 'primary',
  required = false,
  error,
  helperText,
}) => {
  return (
    <div className="flex items-center">
      <Switch
        id={id}
        checked={checked}
        onChange={onChange}
        className={className}
        size={size}
        variant={variant}
        disabled={disabled}
        label={label}
        labelPosition="left"
        color={color}
        required={required}
        error={error}
        helperText={helperText}
      />
    </div>
  );
};

export default Switch;