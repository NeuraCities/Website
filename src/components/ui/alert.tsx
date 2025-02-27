import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className }) => {
  return (
    <div className={`p-4 mb-4 text-sm text-white bg-cta rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertProps> = ({ children }) => {
  return <div>{children}</div>;
};