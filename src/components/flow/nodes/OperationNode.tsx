/**
 * OperationNode Component
 * Node for operations like AVG, MIN, MAX, etc.
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { IoCalculator, IoTime, IoGitCompare } from 'react-icons/io5';
import type { BaseNodeData } from './BaseNode';
import { ProgramModuleType } from '../../../types/alarm';

// Map module types to display names
const typeNames: Record<number, string> = {
  [ProgramModuleType.AVG]: 'Average',
  [ProgramModuleType.MIN]: 'Minimum',
  [ProgramModuleType.MAX]: 'Maximum',
  [ProgramModuleType.SUBTRACT]: 'Subtract',
  [ProgramModuleType.CMP]: 'Compare',
  [ProgramModuleType.CHG]: 'Change',
  [ProgramModuleType.IFNUL]: 'If Null',
  [ProgramModuleType.TD]: 'Time Diff',
  [ProgramModuleType.COUNT]: 'Count',
};

export const OperationNode = memo(function OperationNode({
  data,
  selected,
}: NodeProps<BaseNodeData>) {
  const typeName = typeNames[data.moduleType] || `Op ${data.moduleType}`;

  // Choose icon based on type
  const getIcon = () => {
    switch (data.moduleType) {
      case ProgramModuleType.TD:
        return <IoTime className="w-4 h-4 text-amber-600" />;
      case ProgramModuleType.CMP:
      case ProgramModuleType.CHG:
        return <IoGitCompare className="w-4 h-4 text-amber-600" />;
      default:
        return <IoCalculator className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[160px] transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } bg-amber-50`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="font-semibold text-sm text-amber-700">{data.label}</span>
      </div>

      {/* Operation Type */}
      <div className="text-xs font-medium text-amber-600 mb-2">{typeName}</div>

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
        className="w-3 h-3 !bg-amber-500 border-2 border-white"
      />
    </div>
  );
});

export default OperationNode;
