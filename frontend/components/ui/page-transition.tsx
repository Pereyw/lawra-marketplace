'use client';

import { ReactNode, useEffect, useState } from 'react';

export interface PageTransitionProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  duration?: number;
  delay?: number;
}

const animationMap = {
  up: 'animate-slideInUp',
  down: 'animate-slideInDown',
  left: 'animate-slideInLeft',
  right: 'animate-slideInRight',
  scale: 'animate-scaleIn',
};

/**
 * PageTransition wrapper component for smooth page animations
 * @example
 * <PageTransition direction="up">
 *   <YourComponent />
 * </PageTransition>
 */
export function PageTransition({
  children,
  direction = 'up',
  duration = 400,
  delay = 0,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${isVisible ? animationMap[direction] : 'opacity-0'}`}
      style={{
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Container for staggered animations on list items
 */
export function StaggerContainer({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <div
      style={{
        '--stagger-delay': `${delay}ms`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Individual item that animates with stagger effect
 */
export function StaggerItem({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) {
  return (
    <div
      className="stagger-item"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Fade in component with customizable options
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 500,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={isVisible ? 'animate-fadeIn' : 'opacity-0'}
      style={{
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Bounce animation wrapper
 */
export function BounceIn({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={isVisible ? 'animate-bounce-gentle' : 'opacity-0'}>
      {children}
    </div>
  );
}

/**
 * Pop in animation wrapper (scale + rotate)
 */
export function PopIn({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={isVisible ? 'animate-popIn' : 'opacity-0'}>
      {children}
    </div>
  );
}
