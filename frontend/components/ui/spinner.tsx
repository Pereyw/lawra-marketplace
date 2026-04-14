import { HTMLAttributes, forwardRef } from 'react';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  fullscreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

const colorClasses = {
  primary: 'border-primary-600 border-t-primary-200',
  secondary: 'border-secondary-600 border-t-secondary-200',
  white: 'border-white border-t-gray-200',
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', fullscreen = false, className, ...props }, ref) => {
    const spinner = (
      <div
        ref={ref}
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className || ''}`}
        {...props}
      />
    );

    if (fullscreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          {spinner}
        </div>
      );
    }

    return spinner;
  }
);

Spinner.displayName = 'Spinner';

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg z-10">
      <Spinner size="lg" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export function InlineSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 justify-center py-4">
      <Spinner size="sm" />
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
}
