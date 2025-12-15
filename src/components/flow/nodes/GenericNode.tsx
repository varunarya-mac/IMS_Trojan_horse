/**
 * GenericNode Component
 * Fallback node for unrecognized module types
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { IoCube } from 'react-icons/io5';
import type { BaseNodeData } from './BaseNode';

export const GenericNode = memo(function GenericNode({
  data,
  selected,
}: NodeProps<BaseNodeData>) {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[150px] transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } bg-gray-50`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <IoCube className="w-4 h-4 text-gray-600" />
        <span className="font-semibold text-sm text-gray-700">{data.label}</span>
      </div>

      {/* Node Type Badge */}
      <div className="text-xs text-gray-500 mb-2">Type: {data.moduleType}</div>

      {/* Inputs */}
      {data.inputs && data.inputs.length > 0 && (
        <div className="text-xs text-gray-600 mb-1">
          <span className="font-medium">Inputs:</span>
          <div className="ml-2 text-gray-500">
            {data.inputs.map((input, i) => (
              <div key={i}>{input}</div>
            ))}
          </div>
        </div>
      )}

      {/* Classes */}
      {data.classes && data.classes.length > 0 && (
        <div className="text-xs text-gray-600 mb-1">
          <span className="font-medium">Classes:</span>
          <div className="ml-2 text-gray-500">
            {data.classes.map((cls, i) => (
              <div key={i}>{cls}</div>
            ))}
          </div>
        </div>
      )}

      {/* Parameters */}
      {data.parameters && data.parameters.length > 0 && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Params:</span>
          <div className="ml-2 text-gray-500">
            {data.parameters.map((param, i) => (
              <div key={i}>{param}</div>
            ))}
          </div>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-500 border-2 border-white"
      />
    </div>
  );
});

export default GenericNode;
