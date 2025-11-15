import React, { useState } from 'react';

export interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  variant?: 'default' | 'star' | 'heart' | 'thumbs';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
  readonly?: boolean;
  max?: number;
  allowHalf?: boolean;
  showValue?: boolean;
  precision?: number;
  tooltips?: string[];
  clearable?: boolean;
  onHover?: (value: number) => void;
  onLeave?: () => void;
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  color = 'primary',
  disabled = false,
  readonly = false,
  max = 5,
  allowHalf = false,
  showValue = false,
  precision = 1,
  tooltips,
  clearable = false,
  onHover,
  onLeave,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const colorClasses = {
    primary: 'text-yellow-400',
    secondary: 'text-gray-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handleClick = (rating: number) => {
    if (disabled || readonly) return;
    
    if (clearable && value === rating) {
      onChange?.(0);
    } else {
      onChange?.(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (disabled || readonly) return;
    setHoverValue(rating);
    onHover?.(rating);
  };

  const handleMouseLeave = () => {
    if (disabled || readonly) return;
    setHoverValue(0);
    onLeave?.();
  };

  const renderStar = (index: number) => {
    const ratingValue = index + 1;
    const isFilled = hoverValue ? ratingValue <= hoverValue : ratingValue <= value;
    const isHalf = allowHalf && !isFilled && ratingValue - 0.5 <= value;

    return (
      <div
        key={index}
        className={`
          cursor-pointer transition-colors duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
        onClick={() => handleClick(ratingValue)}
        onMouseEnter={() => handleMouseEnter(ratingValue)}
        onMouseLeave={handleMouseLeave}
      >
        {isHalf ? (
          <div className="relative">
            <span className="opacity-30">★</span>
            <span className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
              ★
            </span>
          </div>
        ) : (
          <span>{isFilled ? '★' : '☆'}</span>
        )}
      </div>
    );
  };

  const renderHeart = (index: number) => {
    const ratingValue = index + 1;
    const isFilled = hoverValue ? ratingValue <= hoverValue : ratingValue <= value;

    return (
      <div
        key={index}
        className={`
          cursor-pointer transition-all duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
        onClick={() => handleClick(ratingValue)}
        onMouseEnter={() => handleMouseEnter(ratingValue)}
        onMouseLeave={handleMouseLeave}
      >
        {isFilled ? '❤️' : '🤍'}
      </div>
    );
  };

  const renderThumbs = (index: number) => {
    const ratingValue = index + 1;
    const isFilled = hoverValue ? ratingValue <= hoverValue : ratingValue <= value;

    return (
      <div
        key={index}
        className={`
          cursor-pointer transition-all duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
        onClick={() => handleClick(ratingValue)}
        onMouseEnter={() => handleMouseEnter(ratingValue)}
        onMouseLeave={handleMouseLeave}
      >
        {isFilled ? '👍' : '👎'}
      </div>
    );
  };

  const renderDefault = (index: number) => {
    const ratingValue = index + 1;
    const isFilled = hoverValue ? ratingValue <= hoverValue : ratingValue <= value;

    return (
      <div
        key={index}
        className={`
          cursor-pointer transition-all duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
        onClick={() => handleClick(ratingValue)}
        onMouseEnter={() => handleMouseEnter(ratingValue)}
        onMouseLeave={handleMouseLeave}
      >
        {isFilled ? '●' : '○'}
      </div>
    );
  };

  const renderRating = () => {
    const rating = [];
    for (let i = 0; i < max; i++) {
      switch (variant) {
        case 'star':
          rating.push(renderStar(i));
          break;
        case 'heart':
          rating.push(renderHeart(i));
          break;
        case 'thumbs':
          rating.push(renderThumbs(i));
          break;
        default:
          rating.push(renderDefault(i));
      }
    }
    return rating;
  };

  const displayValue = allowHalf ? Math.round(value * precision) / precision : Math.round(value);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {renderRating()}
      {showValue && (
        <span className={`ml-2 ${sizeClasses[size]} font-medium text-gray-700`}>
          {displayValue.toFixed(precision)}
        </span>
      )}
      {tooltips && tooltips.length > 0 && (
        <span className={`ml-2 ${sizeClasses[size]} text-gray-500`}>
          {tooltips[Math.floor(displayValue) - 1] || ''}
        </span>
      )}
    </div>
  );
};

export interface RatingItemProps {
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  variant?: 'default' | 'star' | 'heart' | 'thumbs';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
  readonly?: boolean;
  max?: number;
  allowHalf?: boolean;
  showValue?: boolean;
  precision?: number;
  tooltips?: string[];
  clearable?: boolean;
  onHover?: (value: number) => void;
  onLeave?: () => void;
}

export const RatingItem: React.FC<RatingItemProps> = ({
  value = 0,
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  color = 'primary',
  disabled = false,
  readonly = false,
  max = 5,
  allowHalf = false,
  showValue = false,
  precision = 1,
  tooltips,
  clearable = false,
  onHover,
  onLeave,
}) => {
  return (
    <Rating
      value={value}
      onChange={onChange}
      className={className}
      variant={variant}
      size={size}
      color={color}
      disabled={disabled}
      readonly={readonly}
      max={max}
      allowHalf={allowHalf}
      showValue={showValue}
      precision={precision}
      tooltips={tooltips}
      clearable={clearable}
      onHover={onHover}
      onLeave={onLeave}
    />
  );
};

export interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
  readonly?: boolean;
  max?: number;
  allowHalf?: boolean;
  showValue?: boolean;
  precision?: number;
  tooltips?: string[];
  clearable?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  className = '',
  size = 'md',
  color = 'primary',
  disabled = false,
  readonly = false,
  max = 5,
  allowHalf = false,
  showValue = false,
  precision = 1,
  tooltips,
  clearable = false,
}) => {
  return (
    <Rating
      value={value}
      onChange={onChange}
      className={className}
      variant="star"
      size={size}
      color={color}
      disabled={disabled}
      readonly={readonly}
      max={max}
      allowHalf={allowHalf}
      showValue={showValue}
      precision={precision}
      tooltips={tooltips}
      clearable={clearable}
    />
  );
};

export interface HeartRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
  readonly?: boolean;
  max?: number;
  showValue?: boolean;
  clearable?: boolean;
}

export const HeartRating: React.FC<HeartRatingProps> = ({
  value = 0,
  onChange,
  className = '',
  size = 'md',
  color = 'primary',
  disabled = false,
  readonly = false,
  max = 5,
  showValue = false,
  clearable = false,
}) => {
  return (
    <Rating
      value={value}
      onChange={onChange}
      className={className}
      variant="heart"
      size={size}
      color={color}
      disabled={disabled}
      readonly={readonly}
      max={max}
      showValue={showValue}
      clearable={clearable}
    />
  );
};

export default Rating;