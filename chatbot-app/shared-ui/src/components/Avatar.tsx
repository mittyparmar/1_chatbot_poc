import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({
  src,
  alt,
  name,
  size = 'md',
  status,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusSizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
  };

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const bgColor = (name: string = '') => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      ref={ref}
      className={`relative inline-flex items-center justify-center rounded-full ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {src ? (
        <>
          <img
            className="h-full w-full rounded-full object-cover"
            src={src}
            alt={alt}
          />
          {status && (
            <span
              className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${statusClasses[status]} ${statusSizeClasses[size]}`}
            />
          )}
        </>
      ) : (
        <>
          <div className={`h-full w-full rounded-full flex items-center justify-center text-white font-medium ${bgColor(name)}`}>
            {getInitials(name)}
          </div>
          {status && (
            <span
              className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${statusClasses[status]} ${statusSizeClasses[size]}`}
            />
          )}
        </>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export { Avatar };