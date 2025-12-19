/**
 * AssistantMessage Component
 * Full assistant response with recommendations, summary, graph, and datapoints
 */

import RecommendationList from './RecommendationList';
import DatapointsTable from './DatapointsTable';
import GraphDisplay from './GraphDisplay';
import type { Message, Recommendation } from '@types/chat';
import { isProcessingMessage } from '@types/chat';

/**
 * Processing Indicator Component
 * Shows animated dots while waiting for AI response
 */
const ProcessingIndicator = () => (
  <div className="flex items-center gap-1 py-2">
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-[#248CD0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="text-sm text-[#A9A9A9] font-open-sans ml-2">
      Analyzing your request...
    </span>
  </div>
);

interface AssistantMessageProps {
  message: Message;
  onRecommendationAction?: (recommendation: Recommendation) => void;
}

const AssistantMessage = ({ message, onRecommendationAction }: AssistantMessageProps) => {
  const { summaryData, graphImageId, content } = message;

  // Check if this message is still being processed
  const isProcessing = isProcessingMessage(content);
  return (
    <div className="flex items-start gap-3 p-4">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#248CD0] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-semibold">AI</span>
      </div>

      {/* Message content */}
      <div className="flex-1 max-w-[85%]">
        {/* Processing State - Show indicator while waiting for AI response */}
        {isProcessing ? (
          <div className="bg-[#F5F7FB] rounded-[20px] px-4 py-3">
            <ProcessingIndicator />
          </div>
        ) : (
          <>
            {/* Recommendations Section */}
            {summaryData?.recommendations && summaryData.recommendations.length > 0 && (
              <RecommendationList
                recommendations={summaryData.recommendations}
                onAction={onRecommendationAction}
              />
            )}

            {/* Summary Text */}
            {summaryData?.summary && (
              <div className="mb-4 bg-[#F5F7FB] rounded-[20px] px-4 py-3">
                <p className="text-sm text-[#000000] font-open-sans whitespace-pre-wrap">
                  {summaryData.summary}
                </p>
              </div>
            )}

            {/* Fallback to content if no summary */}
            {!summaryData?.summary && content && (
              <div className="mb-4 bg-[#F5F7FB] rounded-[20px] px-4 py-3">
                <p className="text-sm text-[#000000] font-open-sans whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            )}

            {/* Graph Display */}
            {graphImageId && (
              <GraphDisplay
                graphImageId={graphImageId}
                graphConfig={summaryData?.graphConfig}
              />
            )}

            {/* Datapoints Table */}
            {summaryData?.datapoints && summaryData.datapoints.length > 0 && (
              <DatapointsTable datapoints={summaryData.datapoints} />
            )}

            {/* Error state */}
            {message.contentType === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-[15px] p-4">
                <p className="text-sm text-red-700 font-open-sans">
                  {content || 'An error occurred while processing your request.'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Timestamp */}
        <div className="flex justify-start mt-1">
          <span className="text-xs text-[#A9A9A9] font-open-sans">
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                {new Date(message.$createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {message.processingTime && (
                  <span className="ml-2">
                    • {(message.processingTime / 1000).toFixed(1)}s
                  </span>
                )}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;
