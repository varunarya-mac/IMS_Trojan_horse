/**
 * RecommendationCard Component
 * Displays a single recommendation with priority badge and action button
 */

import type { Recommendation } from '@types/chat';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAction?: (recommendation: Recommendation) => void;
}

const RecommendationCard = ({ recommendation, onAction }: RecommendationCardProps) => {
  const getPriorityStyles = () => {
    switch (recommendation.priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = () => {
    switch (recommendation.category) {
      case 'maintenance':
        return '🔧';
      case 'configuration':
        return '⚙️';
      case 'monitoring':
        return '📊';
      case 'immediate':
        return '⚠️';
      default:
        return '📋';
    }
  };

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-[15px] p-4 hover:shadow-md transition-shadow">
      {/* Header with priority badge */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon()}</span>
          <h4 className="font-semibold text-[#000000] font-open-sans text-sm">
            {recommendation.title}
          </h4>
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityStyles()}`}
        >
          {recommendation.priority.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-[#666666] font-open-sans mb-3 line-clamp-3">
        {recommendation.description}
      </p>

      {/* Action button */}
      {recommendation.actionLabel && (
        <button
          onClick={() => onAction?.(recommendation)}
          className="px-4 py-1.5 bg-[#248CD0] text-white text-xs font-semibold rounded-full hover:bg-[#1a7ab8] transition-colors"
        >
          {recommendation.actionLabel}
        </button>
      )}
    </div>
  );
};

export default RecommendationCard;
