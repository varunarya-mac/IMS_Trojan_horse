/**
 * RecommendationList Component
 * Displays a grid of recommendation cards
 */

import RecommendationCard from './RecommendationCard';
import type { Recommendation } from '@types/chat';

interface RecommendationListProps {
  recommendations: Recommendation[];
  onAction?: (recommendation: Recommendation) => void;
}

const RecommendationList = ({ recommendations, onAction }: RecommendationListProps) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-[#000000] font-open-sans mb-3">
        Recommendations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;
