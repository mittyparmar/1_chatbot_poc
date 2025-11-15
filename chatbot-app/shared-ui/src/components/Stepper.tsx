import React from 'react';

export interface Step {
  id: string | number;
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'error';
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  tooltip?: string;
}

export interface StepperProps {
  steps: Step[];
  current?: number;
  className?: string;
  variant?: 'default' | 'vertical' | 'navigation';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  lineType?: 'solid' | 'dashed' | 'dotted';
  clickable?: boolean;
  onChange?: (step: Step, index: number) => void;
  direction?: 'horizontal' | 'vertical';
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  current = 0,
  className = '',
  variant = 'default',
  size = 'md',
  color = 'primary',
  lineType = 'solid',
  clickable = false,
  onChange,
  direction = 'horizontal',
}) => {
  const colorClasses = {
    primary: 'bg-primary-500 border-primary-500 text-primary-500',
    secondary: 'bg-gray-500 border-gray-500 text-gray-500',
    success: 'bg-green-500 border-green-500 text-green-500',
    warning: 'bg-yellow-500 border-yellow-500 text-yellow-500',
    error: 'bg-red-500 border-red-500 text-red-500',
    info: 'bg-blue-500 border-blue-500 text-blue-500',
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const lineTypeClasses = {
    solid: 'border-l-2',
    dashed: 'border-l-2 border-dashed',
    dotted: 'border-l-2 border-dotted',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'error':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const renderStep = (step: Step, index: number) => {
    const isCurrent = index === current;
    const isCompleted = index < current || step.status === 'completed';
    const isError = step.status === 'error';
    const isDisabled = step.disabled;
    const status = step.status || (index < current ? 'completed' : 'pending');

    const stepClasses = `
      relative flex items-center
      ${direction === 'vertical' ? 'flex-col items-start' : 'flex-row'}
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : clickable ? 'cursor-pointer' : ''}
      ${sizeClasses[size]}
    `;

    const stepNumberClasses = `
      flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center
      ${isCompleted ? colorClasses[getStatusColor(status)] : colorClasses[color]}
      ${isCurrent ? 'ring-4 ring-blue-200' : ''}
      ${sizeClasses[size]}
    `;

    const lineClasses = `
      absolute ${direction === 'vertical' ? 'top-8 left-4' : 'left-8 top-4'}
      h-full ${lineTypeClasses[lineType]}
      ${index < current ? colorClasses[getStatusColor(status)] : colorClasses[color]}
    `;

    return (
      <div key={step.id} className={stepClasses}>
        {/* Step Line */}
        {index < steps.length - 1 && (
          <div className={lineClasses} style={{ width: direction === 'vertical' ? '2px' : '100%' }} />
        )}

        {/* Step Content */}
        <div
          className={`
            flex items-center ${direction === 'vertical' ? 'mb-6' : 'mr-8'}
            ${clickable && !isDisabled ? 'hover:bg-gray-50 p-2 rounded-lg' : ''}
          `}
          onClick={() => {
            if (!isDisabled && clickable) {
              onChange?.(step, index);
            }
          }}
        >
          {/* Step Number */}
          <div className={stepNumberClasses}>
            {isCompleted ? (
              <span className="text-white">✓</span>
            ) : isError ? (
              <span className="text-white">✕</span>
            ) : (
              <span className="text-white">{index + 1}</span>
            )}
          </div>

          {/* Step Text */}
          <div className={`ml-3 ${direction === 'vertical' ? 'text-center' : ''}`}>
            <h3 className={`font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
              {step.title}
            </h3>
            {step.description && (
              <p className={`text-sm ${isCurrent ? 'text-gray-600' : 'text-gray-500'}`}>
                {step.description}
              </p>
            )}
          </div>

          {/* Step Icon */}
          {step.icon && (
            <div className={`ml-2 ${direction === 'vertical' ? 'mt-2' : ''}`}>
              {step.icon}
            </div>
          )}
        </div>
      </div>
    );
  };

  const stepperClasses = `
    ${direction === 'vertical' ? 'space-y-4' : 'space-x-4'}
    ${lineTypeClasses[lineType]}
    ${colorClasses[color]}
    ${className}
  `;

  return (
    <div className={stepperClasses}>
      {steps.map((step, index) => renderStep(step, index))}
    </div>
  );
};

export interface StepperItemProps {
  steps: Step[];
  current?: number;
  className?: string;
  variant?: 'default' | 'vertical' | 'navigation';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  lineType?: 'solid' | 'dashed' | 'dotted';
  clickable?: boolean;
  onChange?: (step: Step, index: number) => void;
  direction?: 'horizontal' | 'vertical';
}

export const StepperItem: React.FC<StepperItemProps> = ({
  steps,
  current = 0,
  className = '',
  variant = 'default',
  size = 'md',
  color = 'primary',
  lineType = 'solid',
  clickable = false,
  onChange,
  direction = 'horizontal',
}) => {
  return (
    <Stepper
      steps={steps}
      current={current}
      className={className}
      variant={variant}
      size={size}
      color={color}
      lineType={lineType}
      clickable={clickable}
      onChange={onChange}
      direction={direction}
    />
  );
};

export interface WizardProps {
  steps: Step[];
  current?: number;
  onComplete?: () => void;
  onStepChange?: (step: Step, index: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export const Wizard: React.FC<WizardProps> = ({
  steps,
  current = 0,
  onComplete,
  onStepChange,
  className = '',
  size = 'md',
  color = 'primary',
}) => {
  const handleStepChange = (step: Step, index: number) => {
    onStepChange?.(step, index);
  };

  const renderStepContent = () => {
    const step = steps[current];
    if (!step) return null;

    return (
      <div className="mt-6 p-6 bg-white rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">{step.title}</h2>
        <p className="text-gray-600 mb-6">{step.description}</p>
        <div className="flex justify-between">
          <button
            disabled={current === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex space-x-3">
            {current < steps.length - 1 ? (
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <Stepper
        steps={steps}
        current={current}
        size={size}
        color={color}
        onChange={handleStepChange}
        clickable={true}
      />
      {renderStepContent()}
    </div>
  );
};

export default Stepper;