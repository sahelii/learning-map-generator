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
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Node } from '@/utils/types';

/**
 * Custom Node Component
 */
const CustomNode = ({
  data,
}: {
  data: Node & { color: string; onClick?: (node: Node) => void };
}) => {
  const handleClick = () => {
    if (data.onClick) {
      const { onClick, ...nodeData } = data;
      data.onClick(nodeData as Node);
    }
  };

  const accentColor = data.color || '#2563eb';

  return (
    <div
      className="group relative w-[360px] cursor-pointer overflow-hidden rounded-2xl border bg-white/95 px-5 py-4 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        borderColor: `${accentColor}33`,
        boxShadow: `0 8px 32px -10px ${accentColor}55`,
      }}
      onClick={handleClick}
    >
      <div
        className="absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15 0%, rgba(255,255,255,0) 100%)`,
        }}
      />
      <div className="relative z-10 space-y-3">
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: accentColor,
            border: `2px solid ${accentColor}`,
            width: 10,
            height: 10,
          }}
        />
        {data.subtopic && (
          <span
            className="inline-flex items-center rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
            style={{ color: accentColor }}
          >
            {data.subtopic}
          </span>
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
            {data.label}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
            {data.description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accentColor }}
          />
          View more
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: accentColor,
            border: `2px solid ${accentColor}`,
            width: 10,
            height: 10,
          }}
        />
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const SUBTOPIC_PALETTE = [
  '#2563eb',
  '#7c3aed',
  '#0ea5e9',
  '#f97316',
  '#10b981',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#f59e0b',
];

export default function LearningMap({
  nodes,
  edges,
  onNodeClick,
}: {
  nodes: Node[];
  edges: Array<{ source: string; target: string }>;
  onNodeClick: (node: Node) => void;
}) {
  /**
   * Assign subtopic colors
   */
  const subtopicColorMap = useMemo(() => {
    const map = new Map<string, string>();
    let colorIndex = 0;
    nodes.forEach((node) => {
      const key = node.subtopic ?? node.id;
      if (!map.has(key)) {
        map.set(key, SUBTOPIC_PALETTE[colorIndex % SUBTOPIC_PALETTE.length]);
        colorIndex++;
      }
    });
    return map;
  }, [nodes]);

  /**
   * --- TOPOLOGICAL SORT (Kahn’s Algorithm) ---
   */
  const sortedNodes = useMemo(() => {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    // Initialize maps
    nodes.forEach((n) => {
      inDegree.set(n.id, 0);
      graph.set(n.id, []);
    });

    // Build graph and in-degree count
    edges.forEach(({ source, target }) => {
      graph.get(source)?.push(target);
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    });

    // Find all nodes with no dependencies (roots)
    const queue: string[] = [];
    inDegree.forEach((deg, nodeId) => {
      if (deg === 0) queue.push(nodeId);
    });

    const result: Node[] = [];
    const levels: Map<string, number> = new Map();

    // BFS + level assignment
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLevel = levels.get(current) || 0;
      const currentNode = nodes.find((n) => n.id === current);
      if (currentNode) {
        result.push(currentNode);
      }
      graph.get(current)?.forEach((neighbor) => {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
          levels.set(neighbor, currentLevel + 1);
        }
      });
    }

    // Return both sorted list & level map
    return { result, levels };
  }, [nodes, edges]);

  /**
   * --- Compute Node Positions ---
   */
  const reactFlowNodes: ReactFlowNode[] = useMemo(() => {
  const spacingX = 420; // ⬅ more breathing space horizontally
  const spacingY = 220; // ⬅ slightly more vertical space

  const nodesByLevel = new Map<number, Node[]>();
  sortedNodes.result.forEach((node) => {
    const level = sortedNodes.levels.get(node.id) || 0;
    if (!nodesByLevel.has(level)) nodesByLevel.set(level, []);
    nodesByLevel.get(level)!.push(node);
  });

  const flowNodes: ReactFlowNode[] = [];
  nodesByLevel.forEach((levelNodes, level) => {
    const totalWidth = (levelNodes.length - 1) * spacingX;
    levelNodes.forEach((node, i) => {
      const color =
        subtopicColorMap.get(node.subtopic ?? node.id) ?? SUBTOPIC_PALETTE[0];
      flowNodes.push({
        id: node.id,
        type: 'custom',
        position: {
          x: i * spacingX - totalWidth / 2, // horizontally centered per row
          y: level * spacingY,
        },
        data: {
          ...node,
          color,
          onClick: onNodeClick,
        },
      });
    });
  });

  return flowNodes;
}, [sortedNodes, onNodeClick, subtopicColorMap]);


  /**
   * --- Transform Edges ---
   */
  const reactFlowEdges: ReactFlowEdge[] = useMemo(() => {
    return edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      type: 'smoothstep',
      style: { stroke: 'rgba(51, 65, 85, 0.35)', strokeWidth: 2.2 },
    }));
  }, [edges]);

  /**
   * --- Render ---
   */
  return (
    <div className="h-[620px] w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        attributionPosition="bottom-left"
        minZoom={0.4}
        maxZoom={1.6}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#cbd5f5"
          gap={26}
          size={1}
        />
        <Controls
          className="rounded-full bg-white/90 shadow-lg"
          position="bottom-right"
        />
        <MiniMap
          nodeStrokeColor={(node) =>
            (node?.data?.color as string | undefined) ?? '#2563eb'
          }
          nodeColor={(node) =>
            (node?.data?.color as string | undefined) ?? '#2563eb'
          }
          className="rounded-xl border border-slate-200 bg-white/90 shadow-lg"
        />
      </ReactFlow>
    </div>
  );
}
