import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, iconPosition = 'left', className = '', ...props }, ref) => {
    const baseInputStyles =
      'w-full px-4 py-3 font-open-sans text-base border border-[#EBEBEB] rounded-[10px] bg-white text-[#000000] placeholder-[#A9A9A9] focus:outline-none focus:ring-2 focus:ring-[#248CD0] focus:border-transparent transition-all duration-200';

    const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';
    const iconPaddingLeft = icon && iconPosition === 'left' ? 'pl-12' : '';
    const iconPaddingRight = icon && iconPosition === 'right' ? 'pr-12' : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-semibold text-[#000000] font-open-sans">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A9A9A9]">{icon}</span>
          )}
          <input
            ref={ref}
            className={`${baseInputStyles} ${errorStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A9A9A9]">{icon}</span>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500 font-open-sans">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
