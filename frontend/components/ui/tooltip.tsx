import { ReactNode, useState } from 'react';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-4 border-gray-950 border-x-4 border-x-transparent',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-4 border-gray-950 border-x-4 border-x-transparent',
    left: 'left-[-4px] top-1/2 -translate-y-1/2 border-l-4 border-gray-950 border-y-4 border-y-transparent',
    right: 'right-[-4px] top-1/2 -translate-y-1/2 border-r-4 border-gray-950 border-y-4 border-y-transparent',
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-950 rounded-lg whitespace-nowrap pointer-events-none animate-scaleIn ${positionClasses[position]}`}
        >
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}

export function TooltipIconButton({
  icon: Icon,
  tooltip,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Tooltip content={tooltip}>
      <button
        onClick={onClick}
        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${className || ''}`}
      >
        <Icon className="w-5 h-5" />
      </button>
    </Tooltip>
  );
}
