import React from 'react';

export interface SpinProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  spinning?: boolean;
  delay?: number;
  tip?: string;
  indicator?: React.ReactNode;
  wrapperClassName?: string;
  children?: React.ReactNode;
}

export const Spin: React.FC<SpinProps> = ({
  className = '',
  size = 'md',
  spinning = true,
  delay = 0,
  tip,
  indicator,
  wrapperClassName = '',
  children,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const defaultIndicator = (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-500 ${sizeClasses[size]}`} />
  );

  const renderSpin = () => {
    if (!spinning) return null;

    const spinContent = (
      <div className={`flex items-center justify-center ${className}`}>
        {indicator || defaultIndicator}
        {tip && (
          <span className="ml-2 text-sm text-gray-600">
            {tip}
          </span>
        )}
      </div>
    );

    if (delay > 0) {
      return (
        <div className={wrapperClassName}>
          {spinContent}
        </div>
      );
    }

    return spinContent;
  };

  if (children) {
    return (
      <div className={`relative ${wrapperClassName}`}>
        {children}
        {spinning && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            {renderSpin()}
          </div>
        )}
      </div>
    );
  }

  return renderSpin();
};

export interface SpinItemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  spinning?: boolean;
  delay?: number;
  tip?: string;
  indicator?: React.ReactNode;
  wrapperClassName?: string;
  children?: React.ReactNode;
}

export const SpinItem: React.FC<SpinItemProps> = ({
  className = '',
  size = 'md',
  spinning = true,
  delay = 0,
  tip,
  indicator,
  wrapperClassName = '',
  children,
}) => {
  return (
    <Spin
      className={className}
      size={size}
      spinning={spinning}
      delay={delay}
      tip={tip}
      indicator={indicator}
      wrapperClassName={wrapperClassName}
      children={children}
    />
  );
};

export interface SpinButtonProps {
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  delay?: number;
  tip?: string;
  indicator?: React.ReactNode;
  children?: React.ReactNode;
}

export const SpinButton: React.FC<SpinButtonProps> = ({
  loading = false,
  className = '',
  size = 'md',
  delay = 0,
  tip,
  indicator,
  children,
}) => {
  return (
    <Spin
      spinning={loading}
      size={size}
      delay={delay}
      tip={tip}
      indicator={indicator}
      className={className}
    >
      {children}
    </Spin>
  );
};

export interface SpinPageProps {
  spinning?: boolean;
  tip?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  delay?: number;
  indicator?: React.ReactNode;
  children?: React.ReactNode;
}

export const SpinPage: React.FC<SpinPageProps> = ({
  spinning = true,
  tip,
  size = 'md',
  delay = 0,
  indicator,
  children,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spin
        spinning={spinning}
        size={size}
        delay={delay}
        tip={tip}
        indicator={indicator}
        className="flex flex-col items-center"
      >
        {children}
      </Spin>
    </div>
  );
};

export interface SpinCardProps {
  spinning?: boolean;
  tip?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  delay?: number;
  indicator?: React.ReactNode;
  children?: React.ReactNode;
}

export const SpinCard: React.FC<SpinCardProps> = ({
  spinning = true,
  tip,
  size = 'md',
  delay = 0,
  indicator,
  children,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <Spin
        spinning={spinning}
        size={size}
        delay={delay}
        tip={tip}
        indicator={indicator}
        className="flex justify-center py-8"
      >
        {children}
      </Spin>
    </div>
  );
};

export default Spin;