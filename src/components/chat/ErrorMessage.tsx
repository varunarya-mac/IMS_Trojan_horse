/**
 * ErrorMessage Component
 * Error display with retry button
 */

import { IoRefreshOutline, IoAlertCircleOutline } from 'react-icons/io5';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="flex items-start gap-3 p-4">
      {/* Error Icon */}
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <IoAlertCircleOutline className="w-5 h-5 text-red-500" />
      </div>

      {/* Error Content */}
      <div className="flex-1">
        <div className="bg-red-50 border border-red-200 rounded-[15px] p-4">
          <p className="text-sm text-red-700 font-open-sans mb-3">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <IoRefreshOutline className="w-4 h-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
