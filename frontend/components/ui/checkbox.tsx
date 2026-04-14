import { Checkbox as HeadlessCheckbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ id, checked, onCheckedChange, className = '' }: CheckboxProps) {
  return (
    <HeadlessCheckbox
      id={id}
      checked={checked}
      onChange={onCheckedChange}
      className={`group size-4 rounded border border-gray-300 bg-white data-[checked]:bg-primary-600 data-[checked]:border-primary-600 ${className}`}
    >
      <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
    </HeadlessCheckbox>
  );
}