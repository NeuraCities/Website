// src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'primary', className, children }) => {
  const baseStyles = 'inline-flex items-center px-2 py-1 rounded-full text-sm font-medium';
  const variantStyles = variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};

export default Badge; // Ensure you are using default export