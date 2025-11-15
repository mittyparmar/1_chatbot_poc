import React from 'react';

export interface ResultProps {
  status: 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Result: React.FC<ResultProps> = ({
  status,
  title,
  subTitle,
  extra,
  icon,
  className = '',
  style,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: icon || (
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || 'Success',
          subTitle: subTitle || 'Your operation completed successfully',
          color: 'text-green-500',
        };
      case 'error':
        return {
          icon: icon || (
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || 'Error',
          subTitle: subTitle || 'Something went wrong',
          color: 'text-red-500',
        };
      case 'info':
        return {
          icon: icon || (
            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || 'Information',
          subTitle: subTitle || 'Please check the information',
          color: 'text-blue-500',
        };
      case 'warning':
        return {
          icon: icon || (
            <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          title: title || 'Warning',
          subTitle: subTitle || 'Please check the information',
          color: 'text-yellow-500',
        };
      case '404':
        return {
          icon: icon || (
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || '404',
          subTitle: subTitle || 'Sorry, the page you visited does not exist',
          color: 'text-gray-500',
        };
      case '403':
        return {
          icon: icon || (
            <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          title: title || '403',
          subTitle: subTitle || 'Sorry, you are not authorized to access this page',
          color: 'text-yellow-500',
        };
      case '500':
        return {
          icon: icon || (
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || '500',
          subTitle: subTitle || 'Sorry, something went wrong',
          color: 'text-red-500',
        };
      default:
        return {
          icon: icon || (
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || 'Result',
          subTitle: subTitle || 'No additional information',
          color: 'text-gray-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`} style={style}>
      <div className={config.color}>
        {config.icon}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        {config.title}
      </h2>
      <p className="mt-2 text-gray-500">
        {config.subTitle}
      </p>
      {extra && (
        <div className="mt-6">
          {extra}
        </div>
      )}
    </div>
  );
};

export interface ResultItemProps {
  status: 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ResultItem: React.FC<ResultItemProps> = ({
  status,
  title,
  subTitle,
  extra,
  icon,
  className = '',
  style,
}) => {
  return (
    <Result
      status={status}
      title={title}
      subTitle={subTitle}
      extra={extra}
      icon={icon}
      className={className}
      style={style}
    />
  );
};

export interface SuccessResultProps {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const SuccessResult: React.FC<SuccessResultProps> = ({
  title,
  subTitle,
  extra,
  icon,
  className = '',
  style,
}) => {
  return (
    <Result
      status="success"
      title={title}
      subTitle={subTitle}
      extra={extra}
      icon={icon}
      className={className}
      style={style}
    />
  );
};

export interface ErrorResultProps {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ErrorResult: React.FC<ErrorResultProps> = ({
  title,
  subTitle,
  extra,
  icon,
  className = '',
  style,
}) => {
  return (
    <Result
      status="error"
      title={title}
      subTitle={subTitle}
      extra={extra}
      icon={icon}
      className={className}
      style={style}
    />
  );
};

export interface InfoResultProps {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const InfoResult: React.FC<InfoResultProps> = ({
  title,
  subTitle,
  extra,
  icon,
  className = '',
  style,
}) => {
  return (
    <Result
      status="info"
      title={title}
      subTitle={subTitle}
      extra={extra}
      icon={icon}
      className={className}
      style={style}
    />
  );
};

export interface WarningResultProps {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const WarningResult: React.FC<WarningResultProps> = ({
  title,
  subTitle,
  extra,
  icon,
  className = '',
  style,
}) => {
  return (
    <Result
      status="warning"
      title={title}
      subTitle={subTitle}
      extra={extra}
      icon={icon}
      className={className}
      style={style}
    />
  );
};

export default Result;