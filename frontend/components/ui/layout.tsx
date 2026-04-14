import { HTMLAttributes, forwardRef } from 'react';

export interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  (
    {
      cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
      gap = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const gridClass = `grid ${
      cols.xs ? `grid-cols-${cols.xs}` : 'grid-cols-1'
    } ${cols.sm ? `sm:grid-cols-${cols.sm}` : 'sm:grid-cols-1'} ${
      cols.md ? `md:grid-cols-${cols.md}` : ''
    } ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''} ${
      cols.xl ? `xl:grid-cols-${cols.xl}` : ''
    } ${gapClasses[gap]}`;

    return (
      <div
        ref={ref}
        className={`grid ${gapClasses[gap]} grid-cols-${cols.xs || 1} sm:grid-cols-${cols.sm || cols.xs || 1} md:grid-cols-${cols.md || cols.sm || 1} lg:grid-cols-${cols.lg || cols.md || 1} xl:grid-cols-${cols.xl || cols.lg || 1} ${className || ''}`}
        {...props}
      />
    );
  }
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', className, ...props }, ref) => (
    <div
      ref={ref}
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className || ''}`}
      {...props}
    />
  )
);

Container.displayName = 'Container';

export interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  centered?: boolean;
}

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ padded = true, centered = false, className, ...props }, ref) => (
    <section
      ref={ref}
      className={`w-full ${padded ? 'py-12 sm:py-16 lg:py-20' : ''} ${
        centered ? 'text-center' : ''
      } ${className || ''}`}
      {...props}
    />
  )
);

Section.displayName = 'Section';
