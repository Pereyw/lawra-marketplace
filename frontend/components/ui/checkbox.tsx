'use client';

import { CheckIcon } from '@heroicons/react/24/solid';

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ id, checked, onCheckedChange, className = '' }: CheckboxProps) {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors ${
          checked
            ? 'bg-primary-600 border-primary-600'
            : 'border-gray-300 bg-white hover:border-primary-400'
        }`}
      >
        {checked && <CheckIcon className="w-3 h-3 fill-white" />}
      </div>
    </label>
  );
}