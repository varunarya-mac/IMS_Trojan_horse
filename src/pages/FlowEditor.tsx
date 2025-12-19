/**
 * FlowEditor Page
 * Visual flow editor using React Flow for alarm patterns
 */

import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAlarmPattern, useUpdateAlarmPattern } from '../hooks/useAlarms';
import {
  LabelNode,
  ComparisonNode,
  OperationNode,
  SeverityNode,
  GenericNode,
  type BaseNodeData,
} from '../components/flow/nodes';
import { ConfigSidebar, FlowToolbar } from '../components/flow';
import { ProgramModuleType, type ProgramModule } from '@types/alarm';
import { getLayoutedElements, areNodesCongested } from '../utils/layoutUtils';

// Define custom node types
const nodeTypes: NodeTypes = {
  labelNode: LabelNode,
  comparisonNode: ComparisonNode,
  operationNode: OperationNode,
  severityNode: SeverityNode,
  genericNode: GenericNode,
};

// Map module type to React Flow node type
function getNodeType(moduleType: number): string {
  switch (moduleType) {
    case ProgramModuleType.LABEL:
      return 'labelNode';
    case ProgramModuleType.OVER:
    case ProgramModuleType.UNDER:
      return 'comparisonNode';
    case ProgramModuleType.AVG:
    case ProgramModuleType.MIN:
    case ProgramModuleType.MAX:
    case ProgramModuleType.SUBTRACT:
    case ProgramModuleType.CMP:
    case ProgramModuleType.CHG:
    case ProgramModuleType.IFNUL:
    case ProgramModuleType.TD:
    case ProgramModuleType.COUNT:
      return 'operationNode';
    case ProgramModuleType.SEV:
      return 'severityNode';
    default:
      return 'genericNode';
  }
}

// Convert ProgramModule to React Flow Node
function moduleToNode(module: ProgramModule, index: number): Node<BaseNodeData> {
  return {
    id: `node-${index}`,
    type: getNodeType(module.type),
    position: { x: module.x, y: module.y },
    data: {
      label: module.name,
      moduleType: module.type,
      inputs: module.inputs || [],
      classes: module.classes || [],
      parameters: module.parameters || [],
    },
  };
}

// Convert React Flow Node back to ProgramModule
function nodeToModule(node: Node<BaseNodeData>): ProgramModule {
  return {
    type: node.data.moduleType,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    name: node.data.label,
    // Filter out empty strings when saving to backend
    inputs: (node.data.inputs || []).filter((s) => s.trim()),
    classes: (node.data.classes || []).filter((s) => s.trim()),
    parameters: (node.data.parameters || []).filter((s) => s.trim()),
  };
}

// Create edges based on input references
function createEdgesFromNodes(nodes: Node<BaseNodeData>[]): Edge[] {
  const edges: Edge[] = [];
  const nodeByName = new Map(nodes.map((n) => [n.data.label, n.id]));

  nodes.forEach((node) => {
    if (node.data.inputs) {
      node.data.inputs.forEach((input, i) => {
        const sourceId = nodeByName.get(input);
        if (sourceId) {
          edges.push({
            id: `edge-${sourceId}-${node.id}-${i}`,
            source: sourceId,
            target: node.id,
            animated: true,
            style: { stroke: '#94a3b8' },
          });
        }
      });
    }
  });

  return edges;
}

export function FlowEditor() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const isNewFlow = key === 'new';

  // Fetch alarm pattern if not new
  const { data: alarmData, isLoading } = useAlarmPattern(
    isNewFlow ? null : key || null
  );

  // Mutation for saving
  const updateMutation = useUpdateAlarmPattern();

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<BaseNodeData> | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize nodes from alarm data
  useEffect(() => {
    if (alarmData?.alarmPattern?.programModules) {
      const initialNodes = alarmData.alarmPattern.programModules.map(moduleToNode);
      const initialEdges = createEdgesFromNodes(initialNodes);

      // Check if nodes are congested and apply auto-layout if needed
      if (initialNodes.length > 5 || areNodesCongested(initialNodes)) {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          initialNodes,
          initialEdges,
          'LR' // Left-to-right layout
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } else {
        // Use original positions for small, non-congested layouts
        setNodes(initialNodes);
        setEdges(initialEdges);
      }

      setHasChanges(false);
    } else if (isNewFlow) {
      // Start with empty canvas for new flow
      setNodes([]);
      setEdges([]);
      setHasChanges(false);
    }
  }, [alarmData, isNewFlow, setNodes, setEdges]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
      setHasChanges(true);
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<BaseNodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Handle node position change
  const onNodeDragStop = useCallback(() => {
    setHasChanges(true);
  }, []);

  // Update node data
  const handleUpdateNode = useCallback(
    (nodeId: string, data: Partial<BaseNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
      // Update selected node
      setSelectedNode((prev) =>
        prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...data } } : prev
      );
      setHasChanges(true);
    },
    [setNodes]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      setSelectedNode(null);
      setHasChanges(true);
    },
    [setNodes, setEdges]
  );

  // Add new node
  const handleAddNode = useCallback(
    (type: number) => {
      const newId = `node-${Date.now()}`;
      const newNode: Node<BaseNodeData> = {
        id: newId,
        type: getNodeType(type),
        position: { x: 200, y: 200 },
        data: {
          label: `New ${type === 0 ? '$variable' : 'Node'}`,
          moduleType: type,
          inputs: [],
          classes: [],
          parameters: [],
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setHasChanges(true);
    },
    [setNodes]
  );

  // Clear all nodes
  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to remove all nodes?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setHasChanges(true);
    }
  }, [setNodes, setEdges]);

  // Auto-layout nodes
  const handleAutoLayout = useCallback(() => {
    setNodes((nds) => {
      setEdges((eds) => {
        const { edges: layoutedEdges } = getLayoutedElements(
          nds,
          eds,
          'LR' // Left-to-right layout
        );
        setEdges(layoutedEdges);
        return layoutedEdges;
      });
      const { nodes: layoutedNodesResult } = getLayoutedElements(
        nds,
        edges,
        'LR'
      );
      setHasChanges(true);
      return layoutedNodesResult;
    });
  }, [setNodes, setEdges, edges]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!key || isNewFlow) {
      // TODO: Handle new flow creation
      alert('Creating new flows is not yet implemented');
      return;
    }

    const programModules = nodes.map(nodeToModule);

    try {
      await updateMutation.mutateAsync({
        alarmPatternKey: key,
        data: {
          programModules,
          changeDescription: 'Updated flow via visual editor',
        },
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save changes. Please try again.');
    }
  }, [key, isNewFlow, nodes, updateMutation]);

  // Navigate back
  const handleBack = useCallback(() => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/explore');
      }
    } else {
      navigate('/explore');
    }
  }, [hasChanges, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1D2441]"></div>
      </div>
    );
  }

  const title = isNewFlow
    ? 'New Alarm Flow'
    : alarmData?.alarmPattern?.alarmId || 'Alarm Flow';
  const version = alarmData?.alarmPattern?.version || 1;

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <FlowToolbar
        title={title}
        version={version}
        hasChanges={hasChanges}
        isSaving={updateMutation.isPending}
        onSave={handleSave}
        onBack={handleBack}
        onAddNode={handleAddNode}
        onClearAll={handleClearAll}
        onAutoLayout={handleAutoLayout}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#94a3b8', strokeWidth: 2 },
            }}
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'labelNode':
                    return '#10b981';
                  case 'comparisonNode':
                    return '#ef4444';
                  case 'operationNode':
                    return '#f59e0b';
                  case 'severityNode':
                    return '#f97316';
                  default:
                    return '#6b7280';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />

            {/* Empty State */}
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="bg-white rounded-lg shadow-lg p-6 mt-20 text-center">
                  <p className="text-gray-600 mb-4">
                    No nodes yet. Use the "Add Node" button to get started.
                  </p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Config Sidebar */}
        {selectedNode && (
          <ConfigSidebar
            selectedNode={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>
    </div>
  );
}

export default FlowEditor;
