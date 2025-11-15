import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  group?: string;
}

export interface SelectProps {
  options: SelectOption[];
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
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxSelected?: number;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  error,
  helperText,
  searchable = false,
  clearable = false,
  multiple = false,
  maxSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(value ? [value] : []);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleOptionClick = (optionValue: string) => {
    if (disabled) return;

    let newSelectedValues: string[];
    
    if (multiple) {
      if (selectedValues.includes(optionValue)) {
        newSelectedValues = selectedValues.filter(v => v !== optionValue);
      } else {
        if (maxSelected && selectedValues.length >= maxSelected) {
          return;
        }
        newSelectedValues = [...selectedValues, optionValue];
      }
    } else {
      newSelectedValues = [optionValue];
      setIsOpen(false);
    }

    setSelectedValues(newSelectedValues);
    onChange?.(multiple ? newSelectedValues.join(',') : optionValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValues([]);
    onChange?.('');
  };

  const getSelectedLabels = () => {
    if (multiple) {
      return selectedValues.map(v => {
        const option = options.find(opt => opt.value === v);
        return option ? option.label : '';
      }).filter(Boolean);
    } else {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option ? option.label : '';
    }
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedOptions = filteredOptions.reduce((groups, option) => {
    const group = option.group || 'default';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(option);
    return groups;
  }, {} as Record<string, SelectOption[]>);

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

  return (
    <div className="w-full" ref={selectRef}>
      <div
        className={`relative ${className}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div
          className={`w-full px-3 py-2 border rounded-md cursor-pointer transition-colors ${
            variantClasses[variant]
          } ${sizeClasses[size]} ${errorClasses} ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {selectedValues.length === 0 ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : (
                <span className={`${sizeClasses[size]} text-gray-900`}>
                  {multiple ? `${selectedValues.length} selected` : getSelectedLabels()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {clearable && selectedValues.length > 0 && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={handleClear}
                >
                  ×
                </button>
              )}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {searchable && (
              <div className="p-2 border-b">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto">
              {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  {group !== 'default' && (
                    <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                      {group}
                    </div>
                  )}
                  {groupOptions.map((option, index) => {
                    const isSelected = selectedValues.includes(option.value);
                    const isHighlighted = highlightedIndex === index;
                    
                    return (
                      <div
                        key={option.value}
                        className={`px-3 py-2 cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                        } ${isHighlighted ? 'bg-gray-100' : ''} ${
                          option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleOptionClick(option.value)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseLeave={() => setHighlightedIndex(-1)}
                      >
                        <div className="flex items-center justify-between">
                          <span className={sizeClasses[size]}>{option.label}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
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

export interface SelectProps {
  options: SelectOption[];
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
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxSelected?: number;
}

export default Select;