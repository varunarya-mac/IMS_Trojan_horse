/**
 * LabelNode Component
 * Node for input/output variables (type 0)
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { IoCodeWorking } from 'react-icons/io5';
import type { BaseNodeData } from './BaseNode';

export const LabelNode = memo(function LabelNode({
  data,
  selected,
}: NodeProps<BaseNodeData>) {
  const isInput = data.label.startsWith('$');
  const isOutput = data.label.startsWith('%');

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[140px] transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } ${isInput ? 'bg-emerald-50' : isOutput ? 'bg-purple-50' : 'bg-gray-50'}`}
    >
      {/* Input Handle (only for non-input nodes) */}
      {!isInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2">
        <IoCodeWorking
          className={`w-4 h-4 ${
            isInput
              ? 'text-emerald-600'
              : isOutput
              ? 'text-purple-600'
              : 'text-gray-600'
          }`}
        />
        <span
          className={`font-mono font-semibold text-sm ${
            isInput
              ? 'text-emerald-700'
              : isOutput
              ? 'text-purple-700'
              : 'text-gray-700'
          }`}
        >
          {data.label}
        </span>
      </div>

      {/* Type Label */}
      <div className="text-xs text-gray-500 mt-1">
        {isInput ? 'Input Variable' : isOutput ? 'Output Variable' : 'Variable'}
      </div>

      {/* Output Handle (only for input nodes) */}
      {isInput && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-emerald-500 border-2 border-white"
        />
      )}
    </div>
  );
});

export default LabelNode;
