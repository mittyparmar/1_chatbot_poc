import React from 'react';

export interface ProgressProps {
  percent?: number;
  className?: string;
  variant?: 'line' | 'circle' | 'dashboard';
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'success' | 'warning' | 'error' | 'active';
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  width?: number;
  format?: (percent: number) => React.ReactNode;
  children?: React.ReactNode;
}

export const Progress: React.FC<ProgressProps> = ({
  percent = 0,
  className = '',
  variant = 'line',
  size = 'md',
  status = 'default',
  showInfo = true,
  strokeColor,
  trailColor,
  strokeWidth,
  width,
  format,
  children,
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const statusColors = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    active: 'bg-blue-500 animate-pulse',
  };

  const trailColorClass = trailColor || 'bg-gray-200';
  const strokeColorClass = strokeColor || statusColors[status];

  const formatPercent = (percent: number) => {
    if (format) {
      return format(percent);
    }
    return `${Math.round(percent)}%`;
  };

  const renderLineProgress = () => {
    return (
      <div className={`w-full ${sizeClasses[size]} ${trailColorClass} rounded-full overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} ${strokeColorClass} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  };

  const renderCircleProgress = () => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={width || 100}
          height={width || 100}
          className="transform -rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={trailColor || '#e5e7eb'}
            strokeWidth={strokeWidth || 8}
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor || strokeColorClass.replace('bg-', '')}
            strokeWidth={strokeWidth || 8}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        {showInfo && (
          <div className="absolute text-sm font-medium text-gray-700">
            {formatPercent(percent)}
          </div>
        )}
      </div>
    );
  };

  const renderDashboardProgress = () => {
    return (
      <div className="relative">
        <div className={`w-full ${sizeClasses[size]} ${trailColorClass} rounded-full overflow-hidden`}>
          <div
            className={`${sizeClasses[size]} ${strokeColorClass} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
        {showInfo && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-gray-700">
            {formatPercent(percent)}
          </div>
        )}
      </div>
    );
  };

  const renderProgress = () => {
    switch (variant) {
      case 'circle':
        return renderCircleProgress();
      case 'dashboard':
        return renderDashboardProgress();
      default:
        return renderLineProgress();
    }
  };

  return (
    <div className={className}>
      {renderProgress()}
      {children}
    </div>
  );
};

export interface ProgressItemProps {
  percent?: number;
  className?: string;
  variant?: 'line' | 'circle' | 'dashboard';
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'success' | 'warning' | 'error' | 'active';
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  width?: number;
  format?: (percent: number) => React.ReactNode;
  children?: React.ReactNode;
}

export const ProgressItem: React.FC<ProgressItemProps> = ({
  percent = 0,
  className = '',
  variant = 'line',
  size = 'md',
  status = 'default',
  showInfo = true,
  strokeColor,
  trailColor,
  strokeWidth,
  width,
  format,
  children,
}) => {
  return (
    <Progress
      percent={percent}
      className={className}
      variant={variant}
      size={size}
      status={status}
      showInfo={showInfo}
      strokeColor={strokeColor}
      trailColor={trailColor}
      strokeWidth={strokeWidth}
      width={width}
      format={format}
      children={children}
    />
  );
};

export interface LineProgressProps {
  percent?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'success' | 'warning' | 'error' | 'active';
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  format?: (percent: number) => React.ReactNode;
  children?: React.ReactNode;
}

export const LineProgress: React.FC<LineProgressProps> = ({
  percent = 0,
  className = '',
  size = 'md',
  status = 'default',
  showInfo = true,
  strokeColor,
  trailColor,
  strokeWidth,
  format,
  children,
}) => {
  return (
    <Progress
      percent={percent}
      className={className}
      variant="line"
      size={size}
      status={status}
      showInfo={showInfo}
      strokeColor={strokeColor}
      trailColor={trailColor}
      strokeWidth={strokeWidth}
      format={format}
      children={children}
    />
  );
};

export interface CircleProgressProps {
  percent?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'success' | 'warning' | 'error' | 'active';
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  width?: number;
  format?: (percent: number) => React.ReactNode;
  children?: React.ReactNode;
}

export const CircleProgress: React.FC<CircleProgressProps> = ({
  percent = 0,
  className = '',
  size = 'md',
  status = 'default',
  showInfo = true,
  strokeColor,
  trailColor,
  strokeWidth,
  width,
  format,
  children,
}) => {
  return (
    <Progress
      percent={percent}
      className={className}
      variant="circle"
      size={size}
      status={status}
      showInfo={showInfo}
      strokeColor={strokeColor}
      trailColor={trailColor}
      strokeWidth={strokeWidth}
      width={width}
      format={format}
      children={children}
    />
  );
};

export interface StepsProgressProps {
  current?: number;
  total?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'success' | 'warning' | 'error' | 'active';
  showInfo?: boolean;
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  format?: (percent: number) => React.ReactNode;
  children?: React.ReactNode;
}

export const StepsProgress: React.FC<StepsProgressProps> = ({
  current = 0,
  total = 1,
  className = '',
  size = 'md',
  status = 'default',
  showInfo = true,
  strokeColor,
  trailColor,
  strokeWidth,
  format,
  children,
}) => {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <Progress
      percent={percent}
      className={className}
      variant="line"
      size={size}
      status={status}
      showInfo={showInfo}
      strokeColor={strokeColor}
      trailColor={trailColor}
      strokeWidth={strokeWidth}
      format={format}
      children={children}
    />
  );
};

export default Progress;