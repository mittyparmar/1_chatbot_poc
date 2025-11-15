import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'avatar';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
  rows?: number;
  spacing?: string | number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  rows = 1,
  spacing = 16,
  style,
}) => {
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
  };

  const baseClasses = `
    bg-gray-300 rounded
    ${animationClasses[animation]}
    ${className}
  `;

  const renderSkeleton = () => {
    const styleProps: React.CSSProperties = {
      width,
      height,
      ...style,
    };

    switch (variant) {
      case 'text':
        return (
          <div
            className={`${baseClasses} bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] animate-shimmer`}
            style={styleProps}
          />
        );
      case 'rect':
        return (
          <div
            className={baseClasses}
            style={styleProps}
          />
        );
      case 'circle':
        return (
          <div
            className={`${baseClasses} rounded-full`}
            style={{
              width: width || '40px',
              height: height || '40px',
              ...style,
            }}
          />
        );
      case 'avatar':
        return (
          <div
            className={`${baseClasses} rounded-full`}
            style={{
              width: width || '40px',
              height: height || '40px',
              ...style,
            }}
          />
        );
      default:
        return (
          <div
            className={baseClasses}
            style={styleProps}
          />
        );
    }
  };

  if (rows > 1) {
    return (
      <div className="space-y-2" style={{ gap: spacing }}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            {renderSkeleton()}
          </div>
        ))}
      </div>
    );
  }

  return renderSkeleton();
};

export interface SkeletonItemProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'avatar';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
  rows?: number;
  spacing?: string | number;
  style?: React.CSSProperties;
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  rows = 1,
  spacing = 16,
  style,
}) => {
  return (
    <Skeleton
      className={className}
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      rows={rows}
      spacing={spacing}
      style={style}
    />
  );
};

export interface SkeletonAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animation?: 'pulse' | 'wave';
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  className = '',
  size = 'md',
  animation = 'pulse',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} ${className}`}
      variant="circle"
      animation={animation}
    />
  );
};

export interface SkeletonTextProps {
  className?: string;
  lines?: number;
    width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
  spacing?: string | number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  className = '',
  lines = 1,
  width,
  height,
  animation = 'pulse',
  spacing = 16,
}) => {
  return (
    <Skeleton
      className={className}
      variant="text"
      width={width}
      height={height}
      animation={animation}
      rows={lines}
      spacing={spacing}
    />
  );
};

export interface SkeletonCardProps {
  className?: string;
  avatar?: boolean;
  title?: boolean;
  description?: boolean;
  lines?: number;
  animation?: 'pulse' | 'wave';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  avatar = true,
  title = true,
  description = true,
  lines = 3,
  animation = 'pulse',
}) => {
  return (
    <div className={`p-4 ${className}`}>
      {avatar && <SkeletonAvatar className="mb-4" />}
      {title && <SkeletonText className="mb-3" height="20px" />}
      {description && (
        <SkeletonText
          className="mb-2"
          height="16px"
          lines={lines}
          spacing="8px"
        />
      )}
    </div>
  );
};

export interface SkeletonListProps {
  className?: string;
  items?: number;
  avatar?: boolean;
  title?: boolean;
  description?: boolean;
  animation?: 'pulse' | 'wave';
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  className = '',
  items = 3,
  avatar = true,
  title = true,
  description = true,
  animation = 'pulse',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonCard
          key={index}
          avatar={avatar}
          title={title}
          description={description}
          animation={animation}
        />
      ))}
    </div>
  );
};

export default Skeleton;