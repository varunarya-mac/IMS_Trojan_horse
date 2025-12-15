/**
 * ComparisonNode Component
 * Node for Over/Under threshold comparisons (type 1, 2)
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { IoChevronUp, IoChevronDown } from 'react-icons/io5';
import type { BaseNodeData } from './BaseNode';

export const ComparisonNode = memo(function ComparisonNode({
  data,
  selected,
}: NodeProps<BaseNodeData>) {
  const isOver = data.moduleType === 1;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[160px] transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } ${isOver ? 'bg-red-50' : 'bg-blue-50'}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {isOver ? (
          <IoChevronUp className="w-5 h-5 text-red-600" />
        ) : (
          <IoChevronDown className="w-5 h-5 text-blue-600" />
        )}
        <span
          className={`font-semibold text-sm ${
            isOver ? 'text-red-700' : 'text-blue-700'
          }`}
        >
          {data.label}
        </span>
      </div>

      {/* Comparison Type */}
      <div
        className={`text-xs font-medium mb-2 ${
          isOver ? 'text-red-600' : 'text-blue-600'
        }`}
      >
        {isOver ? '> Over Threshold' : '< Under Threshold'}
      </div>

      {/* Inputs */}
      {data.inputs && data.inputs.length > 0 && (
        <div className="text-xs text-gray-600 mb-1">
          <span className="font-medium">Input:</span>{' '}
          <span className="text-gray-500">{data.inputs.join(', ')}</span>
        </div>
      )}

      {/* Classes (threshold references) */}
      {data.classes && data.classes.length > 0 && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Class:</span>{' '}
          <span className="text-gray-500">{data.classes.join(', ')}</span>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 border-2 border-white ${
          isOver ? '!bg-red-500' : '!bg-blue-500'
        }`}
      />
    </div>
  );
});

export default ComparisonNode;
