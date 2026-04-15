'use client';

import * as React from 'react';

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, onValueChange, className, ...props }, ref) => (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        ref={ref}
        role="radiogroup"
        className={`space-y-2 ${className || ''}`}
        {...props}
      />
    </RadioGroupContext.Provider>
  )
);

RadioGroup.displayName = 'RadioGroup';

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  id: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, id, className, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);

    return (
      <input
        ref={ref}
        type="radio"
        id={id}
        name="radio-group"
        value={value}
        checked={context.value === value}
        onChange={(e) => context.onValueChange?.(e.target.value)}
        className={`w-4 h-4 text-primary-600 cursor-pointer ${className || ''}`}
        {...props}
      />
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
