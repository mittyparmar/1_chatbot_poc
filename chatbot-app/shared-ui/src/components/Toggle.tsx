import React, { useState } from 'react';

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  labelPosition?: 'left' | 'right';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled = false,
  className = '',
  size = 'md',
  label,
  labelPosition = 'right',
  variant = 'default',
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = () => {
    if (!disabled) {
      const newChecked = !isChecked;
      setIsChecked(newChecked);
      onChange?.(newChecked);
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-5',
    md: 'w-11 h-6',
    lg: 'w-12 h-7',
  };

  const dotSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variantClasses = {
    default: isChecked ? 'bg-primary-600' : 'bg-gray-200',
    primary: isChecked ? 'bg-primary-600' : 'bg-gray-200',
    success: isChecked ? 'bg-green-600' : 'bg-gray-200',
    warning: isChecked ? 'bg-yellow-600' : 'bg-gray-200',
    error: isChecked ? 'bg-red-600' : 'bg-gray-200',
  };

  const baseClasses = 'relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out';
  
  const toggleClasses = [
    baseClasses,
    sizeClasses[size],
    disabled ? 'bg-gray-300 cursor-not-allowed' : variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  const dotClasses = [
    'inline-block rounded-full bg-white transition-transform duration-200 ease-in-out transform',
    dotSizeClasses[size],
    isChecked ? 'translate-x-5' : 'translate-x-1',
    disabled ? '' : 'shadow-sm'
  ].filter(Boolean).join(' ');

  const labelClasses = 'ml-2 text-sm font-medium text-gray-700';

  return (
    <div className="flex items-center">
      {label && labelPosition === 'left' && (
        <span className={labelClasses}>
          {label}
        </span>
      )}
      
      <button
        type="button"
        className={toggleClasses}
        onClick={handleChange}
        disabled={disabled}
        role="switch"
        aria-checked={isChecked}
      >
        <span className={dotClasses} />
      </button>
      
      {label && labelPosition === 'right' && (
        <span className={labelClasses}>
          {label}
        </span>
      )}
    </div>
  );
};

export default Toggle;