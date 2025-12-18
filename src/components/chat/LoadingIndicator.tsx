/**
 * LoadingIndicator Component
 * Shows a "thinking" animation while waiting for AI response
 */

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = ({ message = 'Analyzing...' }: LoadingIndicatorProps) => {
  return (
    <div className="flex items-start gap-3 p-4">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#248CD0] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-semibold">AI</span>
      </div>

      {/* Loading content */}
      <div className="flex-1">
        <div className="bg-[#F5F7FB] rounded-[20px] px-4 py-3 inline-block">
          <div className="flex items-center gap-2">
            {/* Animated dots */}
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <span className="text-sm text-[#A9A9A9] font-open-sans">{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
