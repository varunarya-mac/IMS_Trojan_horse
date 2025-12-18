/**
 * DatapointsTable Component
 * Displays metrics table with trend indicators
 */

import { IoArrowUpOutline, IoArrowDownOutline, IoRemoveOutline } from 'react-icons/io5';
import type { Datapoint } from '../../types/chat';

interface DatapointsTableProps {
  datapoints: Datapoint[];
}

const DatapointsTable = ({ datapoints }: DatapointsTableProps) => {
  if (!datapoints || datapoints.length === 0) {
    return null;
  }

  const getTrendIcon = (trend: Datapoint['trend']) => {
    switch (trend) {
      case 'up':
        return <IoArrowUpOutline className="w-4 h-4 text-red-500" />;
      case 'down':
        return <IoArrowDownOutline className="w-4 h-4 text-green-500" />;
      case 'stable':
        return <IoRemoveOutline className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status?: Datapoint['status']) => {
    switch (status) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-[#EBEBEB]';
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-[#000000] font-open-sans mb-3">
        Key Metrics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {datapoints.map((dp, index) => (
          <div
            key={`${dp.label}-${index}`}
            className={`border rounded-[10px] p-3 ${getStatusStyles(dp.status)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#A9A9A9] font-open-sans truncate">
                {dp.label}
              </span>
              {getTrendIcon(dp.trend)}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-[#000000] font-open-sans">
                {dp.value}
              </span>
              <span className="text-xs text-[#A9A9A9] font-open-sans">
                {dp.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatapointsTable;
