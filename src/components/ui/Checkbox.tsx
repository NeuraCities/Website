import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onCheckedChange }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mr-2"
      />
      <label htmlFor={id} className="text-sm text-secondary">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;