import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  name: string;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, name, className, endIcon, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="relative">
          <input
            id={name}
            name={name}
            ref={ref}
            className={`px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-colors w-full
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30' 
                : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 hover:border-gray-400 dark:hover:border-gray-500'
              }
              ${className}
            `}
            {...props}
          />
          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {endIcon}
            </div>
          )}
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
