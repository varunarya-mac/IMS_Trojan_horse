/**
 * SeverityNode Component
 * Node for severity output (type 18)
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { IoWarning } from 'react-icons/io5';
import type { BaseNodeData } from './BaseNode';

export const SeverityNode = memo(function SeverityNode({
  data,
  selected,
}: NodeProps<BaseNodeData>) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[160px] transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } bg-orange-50`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <IoWarning className="w-5 h-5 text-orange-600" />
        <span className="font-semibold text-sm text-orange-700">{data.label}</span>
      </div>

      {/* Type Label */}
      <div className="text-xs font-medium text-orange-600 mb-2">Severity Output</div>

      {/* Inputs */}
      {data.inputs && data.inputs.length > 0 && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Inputs:</span>
          <div className="ml-2 text-gray-500">
            {data.inputs.map((input, i) => (
              <div key={i}>{input}</div>
            ))}
          </div>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
      />
    </div>
  );
});

export default SeverityNode;
