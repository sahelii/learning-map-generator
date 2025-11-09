'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge as ReactFlowEdge,
  Handle,
  MiniMap,
  Node as ReactFlowNode,
  NodeTypes,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Node } from '@/utils/types';

interface LearningMapProps {
  nodes: Node[];
  edges: Array<{ source: string; target: string }>;
  onNodeClick: (node: Node) => void;
  onExpand?: (parentId: string, children: Node[]) => void;
  onToast?: (message: string) => void;
}

type CustomNodeData = Node & {
  color: string;
  isExpanding?: boolean;
  isExpanded?: boolean;
  isNew?: boolean;
  onClick?: (node: Node) => void;
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

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  const handleClick = () => {
    if (data.onClick) {
      const { onClick, isExpanded, isExpanding, isNew, color, ...payload } =
        data;
      onClick(payload as Node);
    }
  };

  const accentColor = data.color || '#2563eb';

  return (
    <div
      onClick={handleClick}
      className={`group relative w-[320px] cursor-pointer overflow-hidden rounded-2xl border px-5 py-4 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${
        data.isExpanded ? 'ring-2 ring-offset-2 ring-blue-200/60' : ''
      } ${data.isNew ? 'node-pop' : ''}`}
      style={{
        borderColor: `${accentColor}33`,
        background: data.isExpanded ? '#f8fbff' : 'rgba(255,255,255,0.95)',
        boxShadow: `0 10px 34px -14px ${accentColor}55`,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${accentColor}18 0%, rgba(255,255,255,0) 100%)`,
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
        <div className="flex items-center justify-between">
          {data.subtopic && (
            <span
              className="inline-flex items-center rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
              style={{ color: accentColor }}
            >
              {data.subtopic}
            </span>
          )}
          {data.isExpanding && (
            <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold leading-snug text-slate-900">
            {data.label}
          </h3>
          <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
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

const buildInitialLayout = (
  nodes: Node[],
  edges: Array<{ source: string; target: string }>,
  colorMap: Map<string, string>,
  onNodeClick: (node: Node) => void
) => {
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();

  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    graph.set(node.id, []);
  });

  edges.forEach(({ source, target }) => {
    graph.get(source)?.push(target);
    inDegree.set(target, (inDegree.get(target) || 0) + 1);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const levels: Map<string, number> = new Map();
  const sorted: Node[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const level = levels.get(current) ?? 0;
    const currentNode = nodes.find((node) => node.id === current);
    if (currentNode) {
      sorted.push(currentNode);
    }
    graph.get(current)?.forEach((neighbor) => {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if ((inDegree.get(neighbor) || 0) === 0) {
        queue.push(neighbor);
        levels.set(neighbor, level + 1);
      }
    });
  }

  const spacingX = 360;
  const spacingY = 210;
  const nodesByLevel = new Map<number, Node[]>();

  sorted.forEach((node) => {
    const level = levels.get(node.id) ?? 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  });

  const rfNodes: ReactFlowNode<CustomNodeData>[] = [];
  nodesByLevel.forEach((levelNodes, level) => {
    const totalWidth = (levelNodes.length - 1) * spacingX;
    levelNodes.forEach((node, index) => {
      const color =
        colorMap.get(node.subtopic ?? node.id) ?? SUBTOPIC_PALETTE[0];
      rfNodes.push({
        id: node.id,
        type: 'custom',
        position: {
          x: index * spacingX - totalWidth / 2,
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

  if (rfNodes.length === 0) {
    nodes.forEach((node, index) => {
      const color =
        colorMap.get(node.subtopic ?? node.id) ?? SUBTOPIC_PALETTE[0];
      rfNodes.push({
        id: node.id,
        type: 'custom',
        position: { x: index * 240, y: 0 },
        data: {
          ...node,
          color,
          onClick: onNodeClick,
        },
      });
    });
  }

  const rfEdges: ReactFlowEdge[] = edges.map((edge, index) => ({
    id: `edge-${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    animated: true,
    type: 'smoothstep',
    style: { stroke: 'rgba(51, 65, 85, 0.35)', strokeWidth: 2.2 },
  }));

  return { rfNodes, rfEdges };
};

export default function LearningMap({
  nodes,
  edges,
  onNodeClick,
  onExpand,
  onToast,
}: LearningMapProps) {
  const [flowNodes, setFlowNodes] = useState<ReactFlowNode<CustomNodeData>[]>(
    []
  );
  const [flowEdges, setFlowEdges] = useState<ReactFlowEdge[]>([]);
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const newNodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const paletteMap = new Map<string, string>();
    let index = 0;
    nodes.forEach((node) => {
      const key = node.subtopic ?? node.id;
      if (!paletteMap.has(key)) {
        paletteMap.set(key, SUBTOPIC_PALETTE[index % SUBTOPIC_PALETTE.length]);
        index += 1;
      }
    });
    setColorMap(paletteMap);

    const { rfNodes, rfEdges } = buildInitialLayout(
      nodes,
      edges,
      paletteMap,
      onNodeClick
    );
    setFlowNodes(rfNodes);
    setFlowEdges(rfEdges);
    setExpandedNodes(new Set());

    return () => {
      if (newNodeTimeout.current) {
        clearTimeout(newNodeTimeout.current);
      }
    };
  }, [nodes, edges, onNodeClick]);

  const assignColor = useCallback(
    (key: string) => {
      if (colorMap.has(key)) {
        return colorMap.get(key)!;
      }
      const nextColor =
        SUBTOPIC_PALETTE[colorMap.size % SUBTOPIC_PALETTE.length];
      const updated = new Map(colorMap);
      updated.set(key, nextColor);
      setColorMap(updated);
      return nextColor;
    },
    [colorMap]
  );

  const showToast = useCallback(
    (message: string) => {
      if (onToast) {
        onToast(message);
      }
    },
    [onToast]
  );

  const updateNodeState = useCallback(
    (nodeId: string, updater: (data: CustomNodeData) => CustomNodeData) => {
      setFlowNodes((prev) =>
        prev.map((node) => {
          if (node.id !== nodeId) {
            return node;
          }
          return {
            ...node,
            data: updater(node.data),
          };
        })
      );
    },
    []
  );

  const handleNodeSelect = useCallback(
    async (nodeData: Node) => {
      onNodeClick(nodeData);

      if (expandedNodes.has(nodeData.id)) {
        return;
      }

      updateNodeState(nodeData.id, (data) => ({
        ...data,
        isExpanding: true,
      }));

      try {
        const response = await fetch('http://localhost:3001/api/expand-node', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nodeTitle: nodeData.label }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            payload.error || 'Unable to expand this node right now.'
          );
        }

        const expansion = await response.json();
        const children: Node[] = Array.isArray(expansion.children)
          ? expansion.children
          : [];

        if (!children.length) {
          showToast('Could not expand — try again.');
          return;
        }

        setFlowNodes((prevNodes) => {
          const parentNode = prevNodes.find((node) => node.id === nodeData.id);
          if (!parentNode) {
            return prevNodes;
          }

          const existingIds = new Set(prevNodes.map((node) => node.id));
          const validChildren = children.filter(
            (child) => !existingIds.has(child.id)
          );

          if (!validChildren.length) {
            return prevNodes.map((node) => {
              if (node.id === nodeData.id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    isExpanding: false,
                    isExpanded: false,
                  },
                };
              }
              return node;
            });
          }

          const childCount = validChildren.length;
          const baseX = parentNode.position.x;
          const baseY = parentNode.position.y;
          const horizontalSpacing = 200;
          const verticalOffset = 190;

          const additionalNodes = validChildren.map((child, index) => {
            const offset =
              (index - (childCount - 1) / 2) * horizontalSpacing;
            const position = {
              x: baseX + offset,
              y: baseY + verticalOffset,
            };
            const color = assignColor(child.id);

            return {
              id: child.id,
              type: 'custom',
              position,
              data: {
                ...child,
                color,
                isNew: true,
                onClick: handleNodeSelect,
              },
            } as ReactFlowNode<CustomNodeData>;
          });

          if (newNodeTimeout.current) {
            clearTimeout(newNodeTimeout.current);
          }
          newNodeTimeout.current = setTimeout(() => {
            setFlowNodes((current) =>
              current.map((node) => {
                if (validChildren.some((child) => child.id === node.id)) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      isNew: false,
                    },
                  };
                }
                return node;
              })
            );
          }, 400);

          setFlowEdges((prevEdges) => [
            ...prevEdges,
            ...validChildren.map((child) => ({
              id: `edge-${nodeData.id}-${child.id}-${Date.now()}`,
              source: nodeData.id,
              target: child.id,
              animated: true,
              type: 'smoothstep',
              style: { stroke: 'rgba(37, 99, 235, 0.35)', strokeWidth: 2.2 },
            })),
          ]);

          if (onExpand) {
            onExpand(nodeData.id, validChildren);
          }

          const nextExpanded = new Set(expandedNodes);
          nextExpanded.add(nodeData.id);
          setExpandedNodes(nextExpanded);

          return prevNodes
            .map((node) => {
              if (node.id === nodeData.id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    isExpanding: false,
                    isExpanded: true,
                  },
                };
              }
              return node;
            })
            .concat(additionalNodes);
        });
      } catch (error) {
        console.error(error);
        showToast('Could not expand — try again.');
        updateNodeState(nodeData.id, (data) => ({
          ...data,
          isExpanding: false,
        }));
      }
    },
    [assignColor, expandedNodes, onExpand, onNodeClick, showToast, updateNodeState]
  );

  useEffect(() => {
    setFlowNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onClick: handleNodeSelect,
        },
      }))
    );
  }, [handleNodeSelect]);

  return (
    <div className="h-[620px] w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
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
            ((node?.data as CustomNodeData)?.color as string | undefined) ??
            '#2563eb'
          }
          nodeColor={(node) =>
            ((node?.data as CustomNodeData)?.color as string | undefined) ??
            '#2563eb'
          }
          className="rounded-xl border border-slate-200 bg-white/90 shadow-lg"
        />
      </ReactFlow>
    </div>
  );
}
