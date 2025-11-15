import React, { useState } from 'react';

export interface RadioOption {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  variant?: 'default' | 'button' | 'card';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  required?: boolean;
  name?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  orientation = 'vertical',
  disabled = false,
  required = false,
  name,
  label,
  error,
  helperText,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (optionValue: string) => {
    if (disabled) return;
    setInternalValue(optionValue);
    onChange?.(optionValue);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const orientationClasses = orientation === 'horizontal'
    ? 'flex flex-row space-x-4'
    : 'flex flex-col space-y-2';

  const renderDefaultRadio = (option: RadioOption) => (
    <label
      key={option.id}
      className={`flex items-center space-x-2 cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={internalValue === option.value}
        onChange={() => handleChange(option.value)}
        disabled={disabled || option.disabled}
        className="text-primary-600 focus:ring-primary-500"
      />
      <span className={`${sizeClasses[size]} ${option.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
        {option.label}
      </span>
      {option.description && (
        <span className="text-sm text-gray-500">
          {option.description}
        </span>
      )}
    </label>
  );

  const renderButtonRadio = (option: RadioOption) => (
    <button
      key={option.id}
      type="button"
      onClick={() => handleChange(option.value)}
      disabled={disabled || option.disabled}
      className={`px-4 py-2 rounded-md border transition-colors ${
        internalValue === option.value
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      } ${
        disabled || option.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer'
      } ${sizeClasses[size]}`}
    >
      {option.label}
    </button>
  );

  const renderCardRadio = (option: RadioOption) => (
    <div
      key={option.id}
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        internalValue === option.value
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${
        disabled || option.disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-50'
      }`}
      onClick={() => handleChange(option.value)}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-4 h-4 rounded-full border-2 ${
          internalValue === option.value
            ? 'border-primary-600 bg-primary-600'
            : 'border-gray-300'
        }`} />
        <div>
          <div className={`font-medium ${sizeClasses[size]} ${
            option.disabled ? 'text-gray-400' : 'text-gray-900'
          }`}>
            {option.label}
          </div>
          {option.description && (
            <div className="text-sm text-gray-500">
              {option.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRadio = (option: RadioOption) => {
    switch (variant) {
      case 'button':
        return renderButtonRadio(option);
      case 'card':
        return renderCardRadio(option);
      default:
        return renderDefaultRadio(option);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`${orientationClasses} ${className}`}>
        {options.map(renderRadio)}
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
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

export interface RadioProps {
  id: string;
  name?: string;
  value: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  label,
  checked = false,
  disabled = false,
  onChange,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <label
      htmlFor={id}
      className={`flex items-center space-x-2 cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
      } ${className}`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        disabled={disabled}
        className="text-primary-600 focus:ring-primary-500"
      />
      <span className={`${sizeClasses[size]} ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
        {label}
      </span>
    </label>
  );
};

export default RadioGroup;