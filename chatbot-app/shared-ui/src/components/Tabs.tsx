import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline' | 'card';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  justify?: 'start' | 'center' | 'end' | 'between';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab,
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  justify = 'start',
  fullWidth = false,
  disabled = false,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab || defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    if (disabled) return;
    setInternalActiveTab(tabId);
    onChange?.(tabId);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    default: 'border-b-2 border-gray-200',
    pills: 'bg-gray-100 rounded-lg',
    underline: 'border-b border-gray-300',
    card: 'bg-white shadow-sm rounded-lg',
  };

  const orientationClasses = orientation === 'horizontal'
    ? 'flex flex-col'
    : 'flex flex-row h-full';

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  const activeTabContent = tabs.find(tab => tab.id === (activeTab || internalActiveTab))?.content;

  return (
    <div className={`w-full ${orientationClasses} ${className}`}>
      <div
        className={`flex ${orientation === 'horizontal' ? justifyClasses[justify] : 'flex-col'} ${
          fullWidth ? 'w-full' : ''
        } ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === (activeTab || internalActiveTab);
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              disabled={disabled || tab.disabled}
              className={`
                relative flex items-center px-4 py-2 font-medium transition-colors
                ${orientation === 'horizontal' ? 'border-b-2' : 'border-r-2'}
                ${
                  isActive
                    ? variant === 'default'
                      ? 'border-primary-500 text-primary-600'
                      : variant === 'pills'
                      ? 'bg-primary-600 text-white'
                      : variant === 'underline'
                      ? 'border-primary-500 text-primary-600'
                      : 'bg-primary-50 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                ${tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${sizeClasses[size]}
              `}
            >
              {tab.icon && (
                <span className="mr-2 flex-shrink-0">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4">
        {activeTabContent}
      </div>
    </div>
  );
};

export interface TabItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underline' | 'card';
}

export const TabItem: React.FC<TabItemProps> = ({
  id,
  label,
  icon,
  disabled = false,
  badge,
  content,
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        className={`
          relative flex items-center px-4 py-2 font-medium transition-colors
          border-b-2
          border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${sizeClasses[size]}
        `}
      >
        {icon && (
          <span className="mr-2 flex-shrink-0">
            {icon}
          </span>
        )}
        <span>{label}</span>
        {badge && (
          <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full">
            {badge}
          </span>
        )}
      </button>
      <div className="mt-4">
        {content}
      </div>
    </div>
  );
};

export interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  id,
  children,
  className = '',
  active = false,
}) => {
  return (
    <div
      id={`tabpanel-${id}`}
      className={`${active ? '' : 'hidden'} ${className}`}
    >
      {children}
    </div>
  );
};

export default Tabs;