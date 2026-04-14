import { forwardRef, HTMLAttributes } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: { label: string; href?: string }[];
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, className, ...props }, ref) => {
    return (
      <nav ref={ref} className={`text-sm ${className || ''}`} {...props}>
        <ol className="flex items-center gap-1 flex-wrap">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-600 font-medium">{item.label}</span>
              )}
              {index < items.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const colorClasses = {
  primary: 'bg-primary-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, showLabel = true, color = 'primary', className, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
      <div ref={ref} className={className} {...props}>
        <div className="flex items-center justify-between mb-2">
          {showLabel && (
            <span className="text-sm font-medium text-gray-700">
              {value} / {max}
            </span>
          )}
          <span className="text-sm font-medium text-gray-600">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClasses[color]} transition-all duration-300 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: { label: string; description?: string }[];
  currentStep: number;
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, currentStep, className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-green-600 text-white'
                    : index === currentStep
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-semibold ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-full mx-2 mt-6 transition-all duration-300 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                  style={{ position: 'absolute', top: '20px', left: '50%', right: 0 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';
