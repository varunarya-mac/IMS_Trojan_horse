/**
 * Layout Utilities
 * Auto-layout functions for React Flow nodes using Dagre
 */

import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

// Node dimensions
const NODE_WIDTH = 200;
const NODE_HEIGHT = 120;

/**
 * Automatically layout nodes using Dagre algorithm
 * This prevents node congestion by calculating optimal positions
 */
export function getLayoutedElements<T>(
  nodes: Node<T>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR'
): { nodes: Node<T>[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction, // TB = top-bottom, LR = left-right
    nodesep: 100, // Horizontal spacing between nodes
    ranksep: 150, // Vertical spacing between ranks
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        // Center the node at the calculated position
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Check if nodes are congested (overlapping or too close)
 */
export function areNodesCongested<T>(nodes: Node<T>[]): boolean {
  const MIN_DISTANCE = 150; // Minimum distance between nodes

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];

      const dx = node1.position.x - node2.position.x;
      const dy = node1.position.y - node2.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MIN_DISTANCE) {
        return true;
      }
    }
  }

  return false;
}
