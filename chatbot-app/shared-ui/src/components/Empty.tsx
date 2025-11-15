import React from 'react';

export interface EmptyProps {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  imageStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const Empty: React.FC<EmptyProps> = ({
  className = '',
  image,
  description = 'No data available',
  children,
  imageStyle,
  style,
}) => {
  const defaultImage = (
    <div className="text-gray-400">
      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
  );

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`} style={style}>
      <div style={imageStyle}>
        {image || defaultImage}
      </div>
      <p className="mt-4 text-gray-500 text-sm">
        {description}
      </p>
      {children}
    </div>
  );
};

export interface EmptyItemProps {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  imageStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const EmptyItem: React.FC<EmptyItemProps> = ({
  className = '',
  image,
  description = 'No data available',
  children,
  imageStyle,
  style,
}) => {
  return (
    <Empty
      className={className}
      image={image}
      description={description}
      children={children}
      imageStyle={imageStyle}
      style={style}
    />
  );
};

export interface EmptyStateProps {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  imageStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className = '',
  image,
  description = 'No data available',
  children,
  imageStyle,
  style,
}) => {
  return (
    <Empty
      className={className}
      image={image}
      description={description}
      children={children}
      imageStyle={imageStyle}
      style={style}
    />
  );
};

export interface EmptyListProps {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  imageStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const EmptyList: React.FC<EmptyListProps> = ({
  className = '',
  image,
  description = 'No items found',
  children,
  imageStyle,
  style,
}) => {
  return (
    <Empty
      className={className}
      image={image}
      description={description}
      children={children}
      imageStyle={imageStyle}
      style={style}
    />
  );
};

export interface EmptySearchProps {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  imageStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const EmptySearch: React.FC<EmptySearchProps> = ({
  className = '',
  image,
  description = 'No results found',
  children,
  imageStyle,
  style,
}) => {
  return (
    <Empty
      className={className}
      image={image}
      description={description}
      children={children}
      imageStyle={imageStyle}
      style={style}
    />
  );
};

export interface EmptyPageProps {
  className?: string;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  imageStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const EmptyPage: React.FC<EmptyPageProps> = ({
  className = '',
  image,
  description = 'This page is empty',
  children,
  imageStyle,
  style,
}) => {
  return (
    <Empty
      className={className}
      image={image}
      description={description}
      children={children}
      imageStyle={imageStyle}
      style={style}
    />
  );
};

export default Empty;