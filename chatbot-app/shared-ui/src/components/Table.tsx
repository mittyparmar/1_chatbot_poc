import React from 'react';

export interface TableColumn {
  key: string;
  title: string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
}

export interface TableRow {
  [key: string]: any;
}

export interface TableProps {
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
  variant?: 'default' | 'striped' | 'bordered' | 'hover';
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  empty?: React.ReactNode;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  rowKey?: string | ((record: TableRow) => string);
  onRowClick?: (record: TableRow, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (key: string, value: any) => void;
  selectedRowKeys?: string[];
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    onChange?: (selectedRowKeys: string[]) => void;
  };
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  className = '',
  variant = 'default',
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  loading = false,
  empty,
  pagination,
  scroll,
  rowKey,
  onRowClick,
  onSort,
  onFilter,
  selectedRowKeys,
  rowSelection,
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getRowKey = (record: TableRow, index: number) => {
    if (rowKey) {
      return typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
    }
    return index;
  };

  const renderSortIcon = (column: TableColumn) => {
    if (!column.sortable) return null;
    return (
      <span className="ml-1 opacity-50">
        ▲
      </span>
    );
  };

  const renderFilterIcon = (column: TableColumn) => {
    if (!column.filterable) return null;
    return (
      <span className="ml-1 opacity-50">
        ⚙️
      </span>
    );
  };

  const renderHeader = () => {
    return (
      <thead className="bg-gray-50">
        <tr>
          {rowSelection && (
            <th className="px-4 py-3 text-left">
              <input
                type={rowSelection.type || 'checkbox'}
                onChange={(e) => {
                  if (rowSelection.onChange) {
                    if (e.target.checked) {
                      const keys = data.map((_, index) => getRowKey(_, index).toString());
                      rowSelection.onChange(keys);
                    } else {
                      rowSelection.onChange([]);
                    }
                  }
                }}
              />
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key}
              className={`
                px-4 py-3 font-medium text-gray-700
                ${column.align === 'center' ? 'text-center' : ''}
                ${column.align === 'right' ? 'text-right' : ''}
                ${column.className || ''}
                ${column.fixed === 'left' ? 'sticky left-0 bg-white z-10' : ''}
                ${column.fixed === 'right' ? 'sticky right-0 bg-white z-10' : ''}
              `}
              style={{ width: column.width }}
              onClick={() => column.sortable && onSort?.(column.key, 'asc')}
            >
              <div className="flex items-center">
                {column.title}
                {renderSortIcon(column)}
                {renderFilterIcon(column)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="text-center py-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (data.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="text-center py-8">
              {empty || (
                <div className="text-gray-500">
                  No data available
                </div>
              )}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {data.map((record, index) => {
          const key = getRowKey(record, index);
          const isSelected = selectedRowKeys?.includes(key.toString());
          
          return (
            <tr
              key={key}
              className={`
                ${striped && index % 2 === 0 ? 'bg-gray-50' : ''}
                ${hoverable ? 'hover:bg-gray-100' : ''}
                ${isSelected ? 'bg-blue-50' : ''}
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRowClick?.(record, index)}
            >
              {rowSelection && (
                <td className="px-4 py-3">
                  <input
                    type={rowSelection.type || 'checkbox'}
                    checked={isSelected}
                    onChange={(e) => {
                      if (rowSelection.onChange) {
                        const currentKeys = selectedRowKeys || [];
                        if (e.target.checked) {
                          rowSelection.onChange([...currentKeys, key.toString()]);
                        } else {
                          rowSelection.onChange(currentKeys.filter(k => k !== key.toString()));
                        }
                      }
                    }}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`
                    px-4 py-3
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                    ${column.className || ''}
                    ${column.fixed === 'left' ? 'sticky left-0 bg-white z-10' : ''}
                    ${column.fixed === 'right' ? 'sticky right-0 bg-white z-10' : ''}
                  `}
                >
                  {column.render
                    ? column.render(record[column.key], record, index)
                    : record[column.key]
                  }
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    );
  };

  const tableClasses = `
    ${sizeClasses[size]}
    ${bordered ? 'border border-gray-200' : ''}
    ${className}
  `;

  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${tableClasses}`}>
        {renderHeader()}
        {renderBody()}
      </table>
      
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
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
      )}
    </div>
  );
};

export interface TableItemProps {
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
  variant?: 'default' | 'striped' | 'bordered' | 'hover';
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  empty?: React.ReactNode;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  rowKey?: string | ((record: TableRow) => string);
  onRowClick?: (record: TableRow, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (key: string, value: any) => void;
  selectedRowKeys?: string[];
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    onChange?: (selectedRowKeys: string[]) => void;
  };
}

export const TableItem: React.FC<TableItemProps> = ({
  columns,
  data,
  className = '',
  variant = 'default',
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  loading = false,
  empty,
  pagination,
  scroll,
  rowKey,
  onRowClick,
  onSort,
  onFilter,
  selectedRowKeys,
  rowSelection,
}) => {
  return (
    <Table
      columns={columns}
      data={data}
      className={className}
      variant={variant}
      size={size}
      bordered={bordered}
      striped={striped}
      hoverable={hoverable}
      loading={loading}
      empty={empty}
      pagination={pagination}
      scroll={scroll}
      rowKey={rowKey}
      onRowClick={onRowClick}
      onSort={onSort}
      onFilter={onFilter}
      selectedRowKeys={selectedRowKeys}
      rowSelection={rowSelection}
    />
  );
};

export default Table;