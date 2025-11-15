import React from 'react';

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  time: string | Date;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  dot?: React.ReactNode;
  pending?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  variant?: 'default' | 'alternate' | 'card';
  size?: 'sm' | 'md' | 'lg';
  mode?: 'left' | 'right' | 'alternate';
  pending?: boolean;
  lineType?: 'solid' | 'dashed' | 'dotted';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  last?: boolean;
  showDot?: boolean;
  dotSize?: 'sm' | 'md' | 'lg';
  onItemClick?: (item: TimelineItem) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  className = '',
  variant = 'default',
  size = 'md',
  mode = 'left',
  pending = false,
  lineType = 'solid',
  color = 'primary',
  last = false,
  showDot = true,
  dotSize = 'md',
  onItemClick,
}) => {
  const colorClasses = {
    primary: 'bg-primary-500 border-primary-500',
    secondary: 'bg-gray-500 border-gray-500',
    success: 'bg-green-500 border-green-500',
    warning: 'bg-yellow-500 border-yellow-500',
    error: 'bg-red-500 border-red-500',
    info: 'bg-blue-500 border-blue-500',
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const dotSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const lineTypeClasses = {
    solid: 'border-l-2',
    dashed: 'border-l-2 border-dashed',
    dotted: 'border-l-2 border-dotted',
  };

  const renderTimelineItem = (item: TimelineItem, index: number) => {
    const isAlternate = mode === 'alternate' && index % 2 === 1;
    const isRight = mode === 'right' || isAlternate;
    const isLast = index === items.length - 1;

    return (
      <div
        key={item.id}
        className={`
          relative flex ${isRight ? 'flex-row-reverse' : 'flex-row'}
          ${variant === 'card' ? 'mb-4' : 'mb-6'}
          ${item.onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        `}
        onClick={item.onClick}
      >
        {/* Timeline Line */}
        {!isLast && (
          <div
            className={`
              absolute ${isRight ? 'right-6' : 'left-6'} top-6
              h-full ${lineTypeClasses[lineType]}
              ${colorClasses[color]}
            `}
            style={{ top: '24px' }}
          />
        )}

        {/* Timeline Dot */}
        {showDot && (
          <div
            className={`
              flex-shrink-0 w-12 h-12 flex items-center justify-center
              ${isRight ? 'justify-end pr-2' : 'justify-start pl-2'}
            `}
          >
            <div
              className={`
                ${dotSizeClasses[dotSize]}
                rounded-full border-2 ${item.color ? colorClasses[item.color] : colorClasses[color]}
                ${item.pending ? 'bg-gray-300' : ''}
                ${item.active ? 'ring-4 ring-blue-200' : ''}
                flex items-center justify-center
              `}
            >
              {item.dot || (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </div>
          </div>
        )}

        {/* Timeline Content */}
        <div
          className={`
            flex-1 min-w-0 ${isRight ? 'text-right pr-4' : 'text-left pl-4'}
            ${variant === 'card' ? 'bg-white p-4 rounded-lg shadow-sm border' : ''}
          `}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium ${sizeClasses[size]} ${item.pending ? 'text-gray-500' : 'text-gray-900'}`}>
              {item.title}
            </h3>
            <span className={`text-sm ${item.pending ? 'text-gray-400' : 'text-gray-500'}`}>
              {typeof item.time === 'string' ? item.time : new Date(item.time).toLocaleString()}
            </span>
          </div>
          {item.description && (
            <p className={`text-sm ${item.pending ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.description}
            </p>
          )}
          {item.icon && (
            <div className={`mt-2 ${isRight ? 'text-right' : 'text-left'}`}>
              {item.icon}
            </div>
          )}
        </div>
      </div>
    );
  };

  const timelineClasses = `
    ${lineTypeClasses[lineType]}
    ${colorClasses[color]}
    ${className}
  `;

  return (
    <div className={`relative ${timelineClasses}`}>
      {items.map((item, index) => renderTimelineItem(item, index))}
    </div>
  );
};

export interface TimelineItemProps {
  item: TimelineItem;
  index?: number;
  className?: string;
  variant?: 'default' | 'alternate' | 'card';
  size?: 'sm' | 'md' | 'lg';
  mode?: 'left' | 'right' | 'alternate';
  pending?: boolean;
  lineType?: 'solid' | 'dashed' | 'dotted';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  last?: boolean;
  showDot?: boolean;
  dotSize?: 'sm' | 'md' | 'lg';
  onItemClick?: (item: TimelineItem) => void;
}

export const TimelineItemComponent: React.FC<TimelineItemProps> = ({
  item,
  index = 0,
  className = '',
  variant = 'default',
  size = 'md',
  mode = 'left',
  pending = false,
  lineType = 'solid',
  color = 'primary',
  last = false,
  showDot = true,
  dotSize = 'md',
  onItemClick,
}) => {
  const colorClasses = {
    primary: 'bg-primary-500 border-primary-500',
    secondary: 'bg-gray-500 border-gray-500',
    success: 'bg-green-500 border-green-500',
    warning: 'bg-yellow-500 border-yellow-500',
    error: 'bg-red-500 border-red-500',
    info: 'bg-blue-500 border-blue-500',
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const dotSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const lineTypeClasses = {
    solid: 'border-l-2',
    dashed: 'border-l-2 border-dashed',
    dotted: 'border-l-2 border-dotted',
  };

  const isAlternate = mode === 'alternate' && index % 2 === 1;
  const isRight = mode === 'right' || isAlternate;

  return (
    <div
      className={`
        relative flex ${isRight ? 'flex-row-reverse' : 'flex-row'}
        ${variant === 'card' ? 'mb-4' : 'mb-6'}
        ${item.onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        ${className}
      `}
      onClick={item.onClick}
    >
      {/* Timeline Line */}
      {!last && (
        <div
          className={`
            absolute ${isRight ? 'right-6' : 'left-6'} top-6
            h-full ${lineTypeClasses[lineType]}
            ${colorClasses[color]}
          `}
          style={{ top: '24px' }}
        />
      )}

      {/* Timeline Dot */}
      {showDot && (
        <div
          className={`
            flex-shrink-0 w-12 h-12 flex items-center justify-center
            ${isRight ? 'justify-end pr-2' : 'justify-start pl-2'}
          `}
        >
          <div
            className={`
              ${dotSizeClasses[dotSize]}
              rounded-full border-2 ${item.color ? colorClasses[item.color] : colorClasses[color]}
              ${item.pending ? 'bg-gray-300' : ''}
              ${item.active ? 'ring-4 ring-blue-200' : ''}
              flex items-center justify-center
            `}
          >
            {item.dot || (
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div
        className={`
          flex-1 min-w-0 ${isRight ? 'text-right pr-4' : 'text-left pl-4'}
          ${variant === 'card' ? 'bg-white p-4 rounded-lg shadow-sm border' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-medium ${sizeClasses[size]} ${item.pending ? 'text-gray-500' : 'text-gray-900'}`}>
            {item.title}
          </h3>
          <span className={`text-sm ${item.pending ? 'text-gray-400' : 'text-gray-500'}`}>
            {typeof item.time === 'string' ? item.time : new Date(item.time).toLocaleString()}
          </span>
        </div>
        {item.description && (
          <p className={`text-sm ${item.pending ? 'text-gray-400' : 'text-gray-600'}`}>
            {item.description}
          </p>
        )}
        {item.icon && (
          <div className={`mt-2 ${isRight ? 'text-right' : 'text-left'}`}>
            {item.icon}
          </div>
        )}
      </div>
    </div>
  );
};

export interface OrderTimelineProps {
  order: {
    id: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
  };
  className?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  order,
  className = '',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': return 'primary';
      case 'shipped': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Pending';
      case 'confirmed': return 'Order Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const timelineItems = [
    {
      id: 'created',
      title: 'Order Created',
      description: `Order #${order.id} was created`,
      time: order.createdAt,
      color: getStatusColor(order.status),
      active: order.status !== 'pending',
    },
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      description: 'Payment confirmed and order accepted',
      time: order.updatedAt,
      color: getStatusColor(order.status),
      active: order.status !== 'pending' && order.status !== 'confirmed',
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'Your order is being prepared',
      time: order.updatedAt,
      color: getStatusColor(order.status),
      active: order.status !== 'pending' && order.status !== 'confirmed' && order.status !== 'processing',
    },
    {
      id: 'shipped',
      title: 'Shipped',
      description: 'Order has been shipped',
      time: order.updatedAt,
      color: getStatusColor(order.status),
      active: order.status !== 'pending' && order.status !== 'confirmed' && order.status !== 'processing' && order.status !== 'shipped',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Order delivered successfully',
      time: order.updatedAt,
      color: getStatusColor(order.status),
      active: order.status !== 'delivered',
    },
  ];

  return (
    <Timeline
      items={timelineItems.map(item => ({ ...item, color: item.color as any }))}
      className={className}
      variant="card"
      size="md"
      mode="left"
      color={getStatusColor(order.status)}
    />
  );
};

export default Timeline;