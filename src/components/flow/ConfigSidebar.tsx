/**
 * ConfigSidebar Component
 * Right sidebar for configuring selected node properties
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { IoClose, IoTrash } from 'react-icons/io5';
import type { Node } from 'reactflow';
import type { BaseNodeData } from './nodes/BaseNode';

interface ConfigSidebarProps {
  selectedNode: Node<BaseNodeData> | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: Partial<BaseNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function ConfigSidebar({
  selectedNode,
  onClose,
  onUpdateNode,
  onDeleteNode,
}: ConfigSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousNodeIdRef = useRef<string | null>(null);

  // Slide in animation - only when a different node is selected
  useEffect(() => {
    if (sidebarRef.current && selectedNode) {
      // Only animate if this is a different node than before
      if (previousNodeIdRef.current !== selectedNode.id) {
        gsap.fromTo(
          sidebarRef.current,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        previousNodeIdRef.current = selectedNode.id;
      }
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const { data } = selectedNode;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNode(selectedNode.id, { label: e.target.value });
  };

  const handleInputsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Split by newline but don't filter while typing to preserve empty lines
    const inputs = e.target.value.split('\n');
    onUpdateNode(selectedNode.id, { inputs });
  };

  const handleClassesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Split by newline but don't filter while typing to preserve empty lines
    const classes = e.target.value.split('\n');
    onUpdateNode(selectedNode.id, { classes });
  };

  const handleParametersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Split by newline but don't filter while typing to preserve empty lines
    const parameters = e.target.value.split('\n');
    onUpdateNode(selectedNode.id, { parameters });
  };

  return (
    <div
      ref={sidebarRef}
      className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">Configuration</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <IoClose className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* General Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">GENERAL</h3>

          {/* Label */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Label</label>
            <input
              type="text"
              value={data.label}
              onChange={handleLabelChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <input
              type="text"
              placeholder="Auto-generated"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />
          </div>
        </div>

        {/* Parameters Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">PARAMETERS</h3>

          {/* Inputs */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Inputs (one per line)
            </label>
            <textarea
              value={data.inputs?.join('\n') || ''}
              onChange={handleInputsChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="$variable_name"
            />
          </div>

          {/* Classes */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Classes (one per line)
            </label>
            <textarea
              value={data.classes?.join('\n') || ''}
              onChange={handleClassesChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="class_name"
            />
          </div>

          {/* Parameters */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Parameters (one per line)
            </label>
            <textarea
              value={data.parameters?.join('\n') || ''}
              onChange={handleParametersChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="parameter_value"
            />
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
        >
          <IoTrash className="w-4 h-4" />
          Delete Node
        </button>
      </div>
    </div>
  );
}

export default ConfigSidebar;
