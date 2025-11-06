'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Node } from '@/utils/types';

interface LearningMapProps {
  nodes: Node[];
  edges: Array<{ source: string; target: string }>;
  onNodeClick: (node: Node) => void;
}

/**
 * Custom node component for learning map nodes
 */
const CustomNode = ({ data }: { data: Node & { onClick?: (node: Node) => void } }) => {
  const handleClick = () => {
    if (data.onClick) {
      const { onClick, ...nodeData } = data;
      data.onClick(nodeData as Node);
    }
  };

  return (
    <div
      className="px-4 py-3 bg-white border-2 border-blue-500 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer min-w-[150px]"
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-semibold text-gray-800 text-sm">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function LearningMap({
  nodes,
  edges,
  onNodeClick,
}: LearningMapProps) {
  // Transform learning map nodes to React Flow nodes
  const reactFlowNodes: ReactFlowNode[] = useMemo(() => {
    // Use a simple layout algorithm (you can enhance this with a proper layout library)
    const nodeMap = new Map<string, { x: number; y: number }>();
    const nodesPerRow = Math.ceil(Math.sqrt(nodes.length));
    const spacing = 200;

    nodes.forEach((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      nodeMap.set(node.id, {
        x: col * spacing + 100,
        y: row * spacing + 100,
      });
    });

    return nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: nodeMap.get(node.id) || { x: 0, y: 0 },
      data: {
        ...node,
        onClick: onNodeClick,
      },
    }));
  }, [nodes, onNodeClick]);

  // Transform edges to React Flow edges
  const reactFlowEdges: ReactFlowEdge[] = useMemo(() => {
    return edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));
  }, [edges]);

  return (
    <div className="w-full h-[600px] border border-gray-200 rounded-lg bg-gray-50">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

