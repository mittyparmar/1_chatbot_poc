import React, { useState, useRef, useEffect } from 'react';

export interface TextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  rows?: number;
  maxRows?: number;
  minRows?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
  showCharCount?: boolean;
  label?: string;
  labelPosition?: 'top' | 'left' | 'floating';
}

export const Textarea: React.FC<TextareaProps> = ({
  value = '',
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  placeholder,
  disabled = false,
  required = false,
  error,
  helperText,
  rows = 3,
  maxRows,
  minRows,
  maxLength,
  minLength,
  resize = 'vertical',
  autoResize = false,
  showCharCount = false,
  label,
  labelPosition = 'top',
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [internalValue, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    outlined: 'border-2 border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    filled: 'border-transparent bg-gray-100 focus:bg-white focus:border-primary-500 focus:ring-primary-500',
  };

  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const charCount = internalValue.length;
  const charCountExceeded = maxLength && charCount > maxLength;

  const renderLabel = () => {
    if (!label) return null;

    const labelClasses = {
      top: 'block text-sm font-medium text-gray-700 mb-2',
      left: 'block text-sm font-medium text-gray-700 mr-2',
      floating: 'absolute left-3 top-2 text-sm text-gray-500 transition-all pointer-events-none',
    };

    const floatingLabelClasses = isFocused || internalValue
      ? 'text-xs -top-6 text-primary-600'
      : '';

    return (
      <label className={`${labelClasses[labelPosition]} ${labelPosition === 'floating' ? floatingLabelClasses : ''}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  };

  return (
    <div className="w-full">
      {labelPosition === 'top' && renderLabel()}
      
      {labelPosition === 'left' && (
        <div className="flex">
          {renderLabel()}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={internalValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              rows={rows}
              maxLength={maxLength}
              minLength={minLength}
              className={`
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${errorClasses}
                ${resizeClasses[resize]}
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-text'}
                w-full px-3 py-2 border rounded-md transition-colors
                focus:outline-none focus:ring-2 focus:ring-opacity-50
                ${className}
              `}
            />
          </div>
        </div>
      )}
      
      {labelPosition === 'floating' && (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            maxLength={maxLength}
            minLength={minLength}
            className={`
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${errorClasses}
              ${resizeClasses[resize]}
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-text'}
              w-full px-3 py-2 border rounded-md transition-colors
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              ${className}
            `}
          />
          {renderLabel()}
        </div>
      )}
      
      {(error || helperText || showCharCount) && (
        <div className="mt-1 flex justify-between items-center">
          <div>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : helperText ? (
              <p className="text-sm text-gray-500">{helperText}</p>
            ) : null}
          </div>
          {showCharCount && (
            <p className={`text-sm ${
              charCountExceeded ? 'text-red-600' : 'text-gray-500'
            }`}>
              {charCount}{maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export interface TextareaGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export const TextareaGroup: React.FC<TextareaGroupProps> = ({
  children,
  className = '',
  orientation = 'vertical',
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    md: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
    lg: orientation === 'horizontal' ? 'space-x-6' : 'space-y-6',
  };

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export interface TextareaItemProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  rows?: number;
  maxRows?: number;
  minRows?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
  showCharCount?: boolean;
  labelPosition?: 'top' | 'left' | 'floating';
}

export const TextareaItem: React.FC<TextareaItemProps> = ({
  label,
  value,
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  placeholder,
  disabled = false,
  required = false,
  error,
  helperText,
  rows,
  maxRows,
  minRows,
  maxLength,
  minLength,
  resize,
  autoResize,
  showCharCount,
  labelPosition = 'top',
}) => {
  return (
    <Textarea
      value={value}
      onChange={onChange}
      className={className}
      variant={variant}
      size={size}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      error={error}
      helperText={helperText}
      rows={rows}
      maxRows={maxRows}
      minRows={minRows}
      maxLength={maxLength}
      minLength={minLength}
      resize={resize}
      autoResize={autoResize}
      showCharCount={showCharCount}
      label={label}
      labelPosition={labelPosition}
    />
  );
};

export default Textarea;