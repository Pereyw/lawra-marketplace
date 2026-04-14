import { HTMLAttributes, forwardRef } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type?: AlertType;
  title?: string;
  onClose?: () => void;
  closable?: boolean;
}

const typeConfig = {
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: Info,
    text: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: CheckCircle,
    text: 'text-green-800',
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    icon: AlertTriangle,
    text: 'text-yellow-800',
    iconColor: 'text-yellow-600',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: AlertCircle,
    text: 'text-red-800',
    iconColor: 'text-red-600',
  },
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ type = 'info', title, children, onClose, closable = true, className, ...props }, ref) => {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        className={`flex gap-4 px-4 py-4 rounded-lg border ${config.bg} ${config.text} animate-slideInUp ${className || ''}`}
        {...props}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
        {closable && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:opacity-75 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
