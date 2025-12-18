/**
 * BaseNode Component
 * Base component for all custom React Flow nodes
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

export interface BaseNodeData {
  label: string;
  moduleType: number;
  inputs?: string[];
  classes?: string[];
  parameters?: string[];
  outputs?: string[];
}

interface BaseNodeProps extends NodeProps<BaseNodeData> {
  color: string;
  bgColor: string;
  icon?: React.ReactNode;
}

export const BaseNode = memo(function BaseNode({
  data,
  selected,
  color,
  bgColor,
  icon,
}: BaseNodeProps) {
  const hasInputs = data.inputs && data.inputs.length > 0;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[150px] transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {icon && <span style={{ color }}>{icon}</span>}
        <span className="font-semibold text-sm" style={{ color }}>
          {data.label}
        </span>
      </div>

      {/* Node Type Badge */}
      <div className="text-xs text-gray-500 mb-2">
        Type: {data.moduleType}
      </div>

      {/* Inputs */}
      {hasInputs && (
        <div className="text-xs text-gray-600 mb-1">
          <span className="font-medium">Inputs:</span>
          <div className="ml-2">
            {data.inputs!.map((input, i) => (
              <div key={i} className="text-gray-500">{input}</div>
            ))}
          </div>
        </div>
      )}

      {/* Classes */}
      {data.classes && data.classes.length > 0 && (
        <div className="text-xs text-gray-600 mb-1">
          <span className="font-medium">Classes:</span>
          <div className="ml-2">
            {data.classes.map((cls, i) => (
              <div key={i} className="text-gray-500">{cls}</div>
            ))}
          </div>
        </div>
      )}

      {/* Parameters */}
      {data.parameters && data.parameters.length > 0 && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Params:</span>
          <div className="ml-2">
            {data.parameters.map((param, i) => (
              <div key={i} className="text-gray-500">{param}</div>
            ))}
          </div>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

export default BaseNode;
