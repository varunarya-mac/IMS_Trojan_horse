/**
 * FlowToolbar Component
 * Toolbar for the flow editor with save, add, and other actions
 */

import { useState, useRef } from 'react';
import {
  IoSave,
  IoAdd,
  IoArrowBack,
  IoTrash,
  IoRefresh,
  IoChevronDown,
} from 'react-icons/io5';
import { ProgramModuleType } from '../../types/alarm';

interface FlowToolbarProps {
  title: string;
  version: number;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onBack: () => void;
  onAddNode: (type: number) => void;
  onClearAll: () => void;
}

const nodeTypes = [
  { type: ProgramModuleType.LABEL, name: 'Label (Input/Output)' },
  { type: ProgramModuleType.OVER, name: 'Over Threshold (>)' },
  { type: ProgramModuleType.UNDER, name: 'Under Threshold (<)' },
  { type: ProgramModuleType.AVG, name: 'Average' },
  { type: ProgramModuleType.MIN, name: 'Minimum' },
  { type: ProgramModuleType.MAX, name: 'Maximum' },
  { type: ProgramModuleType.SUBTRACT, name: 'Subtract' },
  { type: ProgramModuleType.CMP, name: 'Compare' },
  { type: ProgramModuleType.IFNUL, name: 'If Null' },
  { type: ProgramModuleType.SEV, name: 'Severity' },
  { type: ProgramModuleType.TD, name: 'Time Difference' },
  { type: ProgramModuleType.COUNT, name: 'Count' },
];

export function FlowToolbar({
  title,
  version,
  hasChanges,
  isSaving,
  onSave,
  onBack,
  onAddNode,
  onClearAll,
}: FlowToolbarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAddNode = (type: number) => {
    onAddNode(type);
    setShowAddMenu(false);
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <IoArrowBack className="w-5 h-5 text-gray-600" />
        </button>

        <div>
          <h1 className="font-semibold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500">
            Version {version} {hasChanges && '(unsaved changes)'}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Add Node Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <IoAdd className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Add Node</span>
            <IoChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-80 overflow-y-auto">
              {nodeTypes.map((node) => (
                <button
                  key={node.type}
                  onClick={() => handleAddNode(node.type)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {node.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear All */}
        <button
          onClick={onClearAll}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Clear all nodes"
        >
          <IoTrash className="w-5 h-5 text-gray-500" />
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            hasChanges && !isSaving
              ? 'bg-[#1D2441] text-white hover:bg-[#2a3456]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <IoRefresh className="w-4 h-4 animate-spin" />
          ) : (
            <IoSave className="w-4 h-4" />
          )}
          <span className="text-sm">{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
}

export default FlowToolbar;
