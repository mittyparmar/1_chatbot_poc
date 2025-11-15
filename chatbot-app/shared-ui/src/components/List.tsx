import React from 'react';

export interface ListItem {
  id: string | number;
  title: string;
  description?: string;
  avatar?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  badge?: string | number;
  meta?: string;
}

export interface ListProps {
  items: ListItem[];
  className?: string;
  variant?: 'default' | 'bordered' | 'unstyled';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  selectable?: boolean;
  bordered?: boolean;
  divided?: boolean;
  striped?: boolean;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  empty?: React.ReactNode;
  renderItem?: (item: ListItem, index: number) => React.ReactNode;
}

export const List: React.FC<ListProps> = ({
  items,
  className = '',
  variant = 'default',
  size = 'md',
  hoverable = true,
  selectable = false,
  bordered = false,
  divided = false,
  striped = false,
  loading = false,
  header,
  footer,
  pagination,
  empty,
  renderItem,
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const renderListItem = (item: ListItem, index: number) => {
    if (renderItem) {
      return renderItem(item, index);
    }

    return (
      <a
        key={item.id}
        href={item.href}
        target={item.target}
        rel={item.rel}
        onClick={item.onClick}
        className={`
          flex items-center p-4 transition-colors duration-200
          ${hoverable ? 'hover:bg-gray-50' : ''}
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${item.selected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
          ${divided ? 'border-b border-gray-200' : ''}
          ${sizeClasses[size]}
        `}
      >
        {/* Avatar */}
        {item.avatar && (
          <div className="flex-shrink-0 mr-4">
            <img
              src={item.avatar}
              alt=""
              className="w-10 h-10 rounded-full"
            />
          </div>
        )}

        {/* Icon */}
        {item.icon && !item.avatar && (
          <div className="flex-shrink-0 mr-4">
            <div className="w-10 h-10 flex items-center justify-center">
              {item.icon}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-medium truncate ${item.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {item.title}
            </h3>
            {item.badge && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <p className={`mt-1 text-sm text-gray-500 truncate ${sizeClasses[size]}`}>
              {item.description}
            </p>
          )}
          {item.meta && (
            <p className={`mt-1 text-xs text-gray-400 ${sizeClasses[size]}`}>
              {item.meta}
            </p>
          )}
        </div>
      </a>
    );
  };

  const listClasses = `
    ${variant === 'bordered' ? 'border border-gray-200 rounded-lg' : ''}
    ${variant === 'unstyled' ? '' : 'bg-white'}
    ${className}
  `;

  return (
    <div className={listClasses}>
      {header && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          {header}
        </div>
      )}

      {loading ? (
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className={`
            ${divided ? 'divide-y divide-gray-200' : ''}
            ${striped ? 'bg-white' : ''}
          `}>
            {items.map((item, index) => renderListItem(item, index))}
          </div>

          {pagination && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
                  {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => pagination.onChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => pagination.onChange(pagination.current + 1)}
                    disabled={pagination.current * pagination.pageSize >= pagination.total}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center">
          {empty || (
            <div className="text-gray-500">
              No items found
            </div>
          )}
        </div>
      )}

      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export interface ListItemProps {
  item: ListItem;
  index?: number;
  className?: string;
  variant?: 'default' | 'bordered' | 'unstyled';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  selectable?: boolean;
  bordered?: boolean;
  divided?: boolean;
  striped?: boolean;
  loading?: boolean;
  renderItem?: (item: ListItem, index: number) => React.ReactNode;
}

export const ListItemComponent: React.FC<ListItemProps> = ({
  item,
  index = 0,
  className = '',
  variant = 'default',
  size = 'md',
  hoverable = true,
  selectable = false,
  bordered = false,
  divided = false,
  striped = false,
  loading = false,
  renderItem,
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (renderItem) {
    return renderItem(item, index);
  }

  return (
    <a
      href={item.href}
      target={item.target}
      rel={item.rel}
      onClick={item.onClick}
      className={`
        flex items-center p-4 transition-colors duration-200
        ${hoverable ? 'hover:bg-gray-50' : ''}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${item.selected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
        ${divided ? 'border-b border-gray-200' : ''}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* Avatar */}
      {item.avatar && (
        <div className="flex-shrink-0 mr-4">
          <img
            src={item.avatar}
            alt=""
            className="w-10 h-10 rounded-full"
          />
        </div>
      )}

      {/* Icon */}
      {item.icon && !item.avatar && (
        <div className="flex-shrink-0 mr-4">
          <div className="w-10 h-10 flex items-center justify-center">
            {item.icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`font-medium truncate ${item.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {item.title}
          </h3>
          {item.badge && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              {item.badge}
            </span>
          )}
        </div>
        {item.description && (
          <p className={`mt-1 text-sm text-gray-500 truncate ${sizeClasses[size]}`}>
            {item.description}
          </p>
        )}
        {item.meta && (
          <p className={`mt-1 text-xs text-gray-400 ${sizeClasses[size]}`}>
            {item.meta}
          </p>
        )}
      </div>
    </a>
  );
};

export default List;