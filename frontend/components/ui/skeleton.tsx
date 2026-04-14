import { HTMLAttributes, forwardRef } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'rect', width, height, count = 1, className, ...props }, ref) => {
    const skeletons = Array.from({ length: count });
    const baseClass = 'skeleton-animate';
    
    let variantClass = '';
    
    switch (variant) {
      case 'circle':
        variantClass = 'rounded-full';
        break;
      case 'text':
        variantClass = 'rounded h-4 mb-2 w-full';
        break;
      case 'rect':
      default:
        variantClass = 'rounded-lg';
        break;
    }

    const style = {
      width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
      height: height ? (typeof height === 'number' ? `${height}px` : height) : variant === 'text' ? '16px' : '20px',
    };

    if (count > 1) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {skeletons.map((_, i) => (
            <div
              key={i}
              className={`${baseClass} ${variantClass} ${className || ''}`}
              style={style}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${baseClass} ${variantClass} ${className || ''}`}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export function SkeletonCard() {
  return (
    <div className="card-modern space-y-4">
      <Skeleton variant="rect" height={200} />
      <div className="space-y-3">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
        <div className="pt-4 flex gap-2">
          <Skeleton variant="rect" width="60%" height={40} />
          <Skeleton variant="rect" width="40%" height={40} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="space-y-4">
      <Skeleton variant="rect" height={300} className="rounded-xl" />
      <div className="space-y-2 px-2">
        <Skeleton variant="text" count={2} />
        <Skeleton variant="text" width="60%" />
        <div className="pt-2 flex items-center gap-2">
          <Skeleton variant="rect" width={20} height={20} />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}
