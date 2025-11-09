'use client';

import type { MouseEvent } from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge as ReactFlowEdge,
  Handle,
  Node as ReactFlowNode,
  NodeTypes,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Node } from '@/utils/types';
import { postJSON } from '@/utils/api';

type Level = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

interface LearningMapProps {
  nodes: Node[];
  edges: Array<{ source: string; target: string }>;
  onNodeClick: (node: Node) => void;
  onExpand?: (parentId: string, children: Node[]) => void;
  onToast?: (message: string) => void;
  levelFilter: Level;
}

type CustomNodeData = Node & {
  color: string;
  isExpanding?: boolean;
  isExpanded?: boolean;
  justExpanded?: boolean;
  isNew?: boolean;
  appearDelay?: number;
  tooltipCount?: number;
  hasCachedChildren?: boolean;
  hasChildren?: boolean;
  childrenVisible?: boolean;
  onViewDetails?: (node: Node) => void;
  onExpand?: (node: Node) => void;
  onToggleChildren?: (node: Node) => void;
};

type CachedChildren = {
  nodes: ReactFlowNode<CustomNodeData>[];
  edges: ReactFlowEdge[];
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
  const nodePayload: Node = {
    id: data.id,
    label: data.label,
    description: data.description,
    subtopic: data.subtopic,
    resources: data.resources,
    level: data.level,
    unverified: data.unverified,
  };

  const accentColor = data.color || '#2563eb';
  const isExpanded = Boolean(data.isExpanded);
  const isExpanding = Boolean(data.isExpanding);
  const isJustExpanded = Boolean(data.justExpanded);
  const hasCachedChildren = Boolean(data.hasCachedChildren);
  const childrenVisible = Boolean(data.childrenVisible);

  const handleCardClick = () => {
    data.onViewDetails?.(nodePayload);
  };

  const handleViewDetails = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    data.onViewDetails?.(nodePayload);
  };

  const handleExpand = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isExpanding && !isExpanded) {
      data.onExpand?.(nodePayload);
    }
  };

  const handleToggleChildren = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    data.onToggleChildren?.(nodePayload);
  };

  const transitionBase = 'opacity 320ms ease-out, transform 320ms ease-out';
  const styleWhenNew = data.isNew
    ? {
        opacity: 0,
        transform: 'translateY(-18px) scale(0.94)',
        transition: transitionBase,
        transitionDelay: `${data.appearDelay ?? 0}ms`,
      }
    : {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
        transition: transitionBase,
      };

  const expandingClasses = isExpanding
    ? 'opacity-70 scale-[0.98] ring-2 ring-green-400/60 animate-pulse'
    : '';
  const expandedClasses = isJustExpanded ? 'node-bounce node-flash' : '';

  const levelBadge = data.level ? (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600 shadow-sm">
        {data.level}
      </span>
    ) : null;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative w-[320px] cursor-pointer overflow-hidden rounded-2xl border px-5 py-4 shadow-md transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl focus-within:-translate-y-1 focus-within:shadow-2xl ${
        isExpanded ? 'ring-2 ring-offset-2 ring-blue-200/60' : ''
      } ${expandingClasses} ${expandedClasses}`}
      style={{
        borderColor: `${accentColor}33`,
        background: isExpanded ? '#f8fbff' : 'rgba(255,255,255,0.95)',
        boxShadow: `0 12px 32px -18px ${accentColor}66`,
        ...styleWhenNew,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition duration-200 ease-out group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${accentColor}20 0%, rgba(255,255,255,0) 100%)`,
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
          {levelBadge}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold leading-snug text-slate-900">
            {data.label}
          </h3>
          <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
            {data.description}
          </p>
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
        {typeof data.tooltipCount === 'number' && data.tooltipCount > 0 && (
          <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 shadow transition-opacity duration-300">
            🌱 Added {data.tooltipCount} concept{data.tooltipCount > 1 ? 's' : ''}
          </div>
        )}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            onClick={handleViewDetails}
          >
            View
          </button>
          {hasCachedChildren ? (
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                isExpanding ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
              onClick={handleToggleChildren}
              disabled={isExpanding}
            >
              {isExpanding ? (
                <span className="flex items-center gap-1">
                  <span className="inline-flex h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {childrenVisible ? 'Collapsing…' : 'Re-expand…'}
                </span>
              ) : childrenVisible ? (
                'Collapse'
              ) : (
                'Re-expand'
              )}
            </button>
          ) : (
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-200 ${
                isExpanding || isExpanded
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              onClick={handleExpand}
              disabled={isExpanding || isExpanded}
            >
              {isExpanding ? (
                <span className="flex items-center gap-1">
                  <span className="inline-flex h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Expanding…
                </span>
              ) : isExpanded ? (
                'Expanded'
              ) : (
                'Expand'
              )}
            </button>
          )}
        </div>
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
): {
  rfNodes: ReactFlowNode<CustomNodeData>[];
  rfEdges: ReactFlowEdge[];
} => {
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
  inDegree.forEach((degree, id) => {
    if (degree === 0) {
      queue.push(id);
    }
  });

  const levels = new Map<string, number>();
  const sorted: Node[] = [];

  while (queue.length) {
    const id = queue.shift()!;
    const node = nodes.find((item) => item.id === id);
    if (!node) {
      continue;
    }
    sorted.push(node);
    const level = levels.get(id) ?? 0;
    graph.get(id)?.forEach((neighbor) => {
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
      const key = node.subtopic ?? node.id;
      const color = colorMap.get(key) ?? SUBTOPIC_PALETTE[0];
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
        },
      });
    });
  });

  if (rfNodes.length === 0) {
    nodes.forEach((node, index) => {
      const key = node.subtopic ?? node.id;
      const color = colorMap.get(key) ?? SUBTOPIC_PALETTE[0];
      rfNodes.push({
        id: node.id,
        type: 'custom',
        position: { x: index * 240, y: 0 },
        data: {
          ...node,
          color,
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

function InnerLearningMap({
  nodes,
  edges,
  onNodeClick,
  onExpand,
  onToast,
  levelFilter,
}: LearningMapProps) {
  const reactFlow = useReactFlow<CustomNodeData>();
  const [flowNodes, setFlowNodes] = useState<ReactFlowNode<CustomNodeData>[]>([]);
  const [flowEdges, setFlowEdges] = useState<ReactFlowEdge[]>([]);
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandingNodes, setExpandingNodes] = useState<Set<string>>(new Set());
  const [recentlyExpanded, setRecentlyExpanded] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<{ nodeId: string; count: number } | null>(null);
  const [childrenCache, setChildrenCache] = useState<Record<string, CachedChildren>>({});
  const [visibleChildMap, setVisibleChildMap] = useState<Record<string, string[]>>({});
  const [filtering, setFiltering] = useState(false);

  const newNodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recentExpandTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandCooldownRef = useRef<Record<string, number>>({});

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

    const { rfNodes, rfEdges } = buildInitialLayout(nodes, edges, paletteMap);
    setFlowNodes(rfNodes);
    setFlowEdges(rfEdges);
    setExpandedNodes(new Set());
    setExpandingNodes(new Set());
    setRecentlyExpanded(new Set());
    setTooltip(null);
    setChildrenCache({});
    setVisibleChildMap({});
    expandCooldownRef.current = {};

    return () => {
      if (newNodeTimeout.current) {
        clearTimeout(newNodeTimeout.current);
        newNodeTimeout.current = null;
      }
      Object.values(recentExpandTimeouts.current).forEach(clearTimeout);
      recentExpandTimeouts.current = {};
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
        tooltipTimeout.current = null;
      }
    };
  }, [nodes, edges]);

  useEffect(() => {
    if (!flowNodes.length) {
      return;
    }
    const timer = setTimeout(() => {
      try {
        reactFlow.fitView({ padding: 0.2, duration: 600 });
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('ReactFlow fitView failed', error);
        }
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [flowNodes.length, reactFlow]);

  const assignColor = useCallback(
    (key: string) => {
      if (colorMap.has(key)) {
        return colorMap.get(key)!;
      }
      const nextColor = SUBTOPIC_PALETTE[colorMap.size % SUBTOPIC_PALETTE.length];
      const updated = new Map(colorMap);
      updated.set(key, nextColor);
      setColorMap(updated);
      return nextColor;
    },
    [colorMap],
  );

  const showToast = useCallback(
    (message: string) => {
      if (onToast) {
        onToast(message);
      }
    },
    [onToast],
  );

  const handleViewDetails = useCallback(
    (nodeData: Node) => {
      onNodeClick(nodeData);
    },
    [onNodeClick],
  );

  const collectDescendantIds = useCallback(
    (parentId: string): string[] => {
      const entry = childrenCache[parentId];
      if (!entry) {
        return [];
      }
      const result: string[] = [];
      const stack = [...entry.nodes];
      while (stack.length) {
        const current = stack.pop()!;
        result.push(current.id);
        const nested = childrenCache[current.id];
        if (nested) {
          stack.push(...nested.nodes);
        }
      }
      return result;
    },
    [childrenCache],
  );

  const collapseChildren = useCallback(
    (parentId: string) => {
      const visibleChildren = visibleChildMap[parentId];
      if (!visibleChildren || visibleChildren.length === 0) {
        return false;
      }

      setChildrenCache((prev) => {
        const entry = prev[parentId];
        if (!entry) {
          return prev;
        }
        const currentById = new Map(flowNodes.map((node) => [node.id, node]));
        const updatedNodes = entry.nodes.map((node) => {
          const current = currentById.get(node.id);
          if (!current) {
            return node;
          }
          return {
            ...current,
            data: {
              ...current.data,
              isNew: false,
              appearDelay: 0,
            },
          };
        });
        return {
          ...prev,
          [parentId]: {
            ...entry,
            nodes: updatedNodes,
          },
        };
      });

      const idsToRemove = new Set(collectDescendantIds(parentId));
      if (idsToRemove.size === 0) {
        return false;
      }

      setFlowNodes((prev) => prev.filter((node) => !idsToRemove.has(node.id)));
      setFlowEdges((prev) =>
        prev.filter(
          (edge) => !idsToRemove.has(edge.source) && !idsToRemove.has(edge.target),
        ),
      );

      setVisibleChildMap((prev) => {
        const next = { ...prev };
        next[parentId] = [];
        idsToRemove.forEach((id) => {
          if (next[id]) {
            next[id] = [];
          }
        });
        return next;
      });

      setRecentlyExpanded((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });

      return true;
    },
    [collectDescendantIds, flowNodes, visibleChildMap],
  );

  const reexpandChildren = useCallback(
    (parentId: string) => {
      const cache = childrenCache[parentId];
      if (!cache) {
        return false;
      }

      let nodesToRestore: ReactFlowNode<CustomNodeData>[] = [];
      setFlowNodes((prevNodes) => {
        const existingIds = new Set(prevNodes.map((node) => node.id));
        nodesToRestore = cache.nodes.filter((node) => !existingIds.has(node.id));
        if (!nodesToRestore.length) {
          return prevNodes;
        }
        const hydrated = nodesToRestore.map((node, index) => ({
          ...node,
          data: {
            ...node.data,
            isNew: true,
            appearDelay: index * 40,
          },
        }));
        return prevNodes.concat(hydrated);
      });

      if (!nodesToRestore.length) {
        return false;
      }

      setFlowEdges((prevEdges) => {
        const existingEdgeIds = new Set(prevEdges.map((edge) => edge.id));
        const edgesToAdd = cache.edges.filter((edge) => !existingEdgeIds.has(edge.id));
        if (!edgesToAdd.length) {
          return prevEdges;
        }
        return prevEdges.concat(edgesToAdd);
      });

      setVisibleChildMap((prev) => ({
        ...prev,
        [parentId]: nodesToRestore.map((node) => node.id),
      }));

      setRecentlyExpanded((prev) => {
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });

      return true;
    },
    [childrenCache],
  );

  const handleExpand = useCallback(
    async (nodeData: Node) => {
      const now = Date.now();
      const lastAttempt = expandCooldownRef.current[nodeData.id] || 0;
      if (now - lastAttempt < 800) {
        return;
      }

      if (expandedNodes.has(nodeData.id) || expandingNodes.has(nodeData.id)) {
        return;
      }

      expandCooldownRef.current[nodeData.id] = now;

      setExpandingNodes((prev) => {
        const next = new Set(prev);
        next.add(nodeData.id);
        return next;
      });

      try {
        const expansion = await postJSON<{ node: string; children: Node[] }>(
          '/api/expand-node',
          { nodeTitle: nodeData.label },
        );
        const children: Node[] = Array.isArray(expansion.children)
          ? expansion.children
          : [];

        if (!children.length) {
          showToast('⚠️ Could not expand this node — try again.');
          setExpandingNodes((prev) => {
            const next = new Set(prev);
            next.delete(nodeData.id);
            return next;
          });
          return;
        }

        let addedChildCount = 0;
        let cachedNodes: ReactFlowNode<CustomNodeData>[] = [];
        let cachedEdges: ReactFlowEdge[] = [];
        let childIdsForParent: string[] = [];

        setFlowNodes((prevNodes) => {
          const parentNode = prevNodes.find((node) => node.id === nodeData.id);
          if (!parentNode) {
            return prevNodes;
          }

          const existingIds = new Set(prevNodes.map((node) => node.id));
          const validChildren = children.filter((child) => !existingIds.has(child.id));
          addedChildCount = validChildren.length;

          if (!validChildren.length) {
            return prevNodes;
          }

          const childCount = validChildren.length;
          const baseX = parentNode.position.x;
          const baseY = parentNode.position.y;
          const horizontalSpacing = 210;
          const verticalOffset = 190;

          const newlyCreatedNodes = validChildren.map((child, index) => {
            const offset = (index - (childCount - 1) / 2) * horizontalSpacing;
            const position = {
              x: baseX + offset,
              y: baseY + verticalOffset,
            };
            const color = assignColor(child.subtopic ?? child.id);

            return {
              id: child.id,
      type: 'custom',
              position,
              data: {
                ...child,
                color,
                isNew: true,
                appearDelay: index * 50,
              },
            } as ReactFlowNode<CustomNodeData>;
          });

          if (newNodeTimeout.current) {
            clearTimeout(newNodeTimeout.current);
          }
          if (validChildren.length) {
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
                }),
              );
            }, 350);
          }

          cachedNodes = newlyCreatedNodes.map((node) => ({
        ...node,
            data: {
              ...node.data,
              isNew: false,
              appearDelay: 0,
      },
    }));
          cachedEdges = validChildren.map((child) => ({
            id: `edge-${nodeData.id}-${child.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            source: nodeData.id,
            target: child.id,
            animated: true,
            type: 'smoothstep',
            style: { stroke: 'rgba(37, 99, 235, 0.35)', strokeWidth: 2.2 },
          }));
          childIdsForParent = newlyCreatedNodes.map((node) => node.id);

          if (onExpand) {
            onExpand(nodeData.id, validChildren);
          }

          return prevNodes
            .map((node) => {
              if (node.id === nodeData.id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    isExpanded: true,
                    justExpanded: true,
                  },
                };
              }
              return node;
            })
            .concat(newlyCreatedNodes);
        });

        if (cachedEdges.length) {
          setFlowEdges((prevEdges) => prevEdges.concat(cachedEdges));
        }

        if (addedChildCount > 0) {
          setChildrenCache((prev) => ({
            ...prev,
            [nodeData.id]: {
              nodes: cachedNodes,
              edges: cachedEdges,
            },
          }));
          setVisibleChildMap((prev) => ({
            ...prev,
            [nodeData.id]: childIdsForParent,
          }));
          setExpandedNodes((prev) => {
            const next = new Set(prev);
            next.add(nodeData.id);
            return next;
          });
          setRecentlyExpanded((prev) => {
            const next = new Set(prev);
            next.add(nodeData.id);
            return next;
          });
          if (recentExpandTimeouts.current[nodeData.id]) {
            clearTimeout(recentExpandTimeouts.current[nodeData.id]);
          }
          recentExpandTimeouts.current[nodeData.id] = setTimeout(() => {
            setRecentlyExpanded((prev) => {
              if (!prev.has(nodeData.id)) {
                return prev;
              }
              const next = new Set(prev);
              next.delete(nodeData.id);
              return next;
            });
            delete recentExpandTimeouts.current[nodeData.id];
          }, 1000);

          setTooltip({ nodeId: nodeData.id, count: addedChildCount });
          if (tooltipTimeout.current) {
            clearTimeout(tooltipTimeout.current);
          }
          tooltipTimeout.current = setTimeout(() => {
            setTooltip(null);
            tooltipTimeout.current = null;
          }, 1600);

          showToast(
            `🌱 Added ${addedChildCount} new concept${addedChildCount > 1 ? 's' : ''} under ${nodeData.label}.`,
          );

          setTimeout(() => {
            try {
              reactFlow.fitView({ padding: 0.2, duration: 800 });
            } catch (error) {
              if (process.env.NODE_ENV !== 'production') {
                console.warn('ReactFlow fitView failed', error);
              }
            }
          }, 80);
        }
      } catch (error) {
        console.error(error);
        showToast('⚠️ Could not expand this node — try again.');
      } finally {
        setExpandingNodes((prev) => {
          const next = new Set(prev);
          next.delete(nodeData.id);
          return next;
        });
      }
    },
    [
      assignColor,
      expandedNodes,
      expandingNodes,
      reactFlow,
      showToast,
      onExpand,
    ],
  );

  const handleToggleChildren = useCallback(
    (node: Node) => {
      const isVisible =
        Boolean(visibleChildMap[node.id]) && visibleChildMap[node.id].length > 0;

      setExpandingNodes((prev) => {
        const next = new Set(prev);
        next.add(node.id);
        return next;
      });

      const finish = () =>
        setExpandingNodes((prev) => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });

      if (isVisible) {
        const collapsed = collapseChildren(node.id);
        if (!collapsed) {
          finish();
          return;
        }
        setTimeout(finish, 180);
      } else {
        const restored = reexpandChildren(node.id);
        if (!restored) {
          finish();
          return;
        }
        setTimeout(() => {
          try {
            reactFlow.fitView({ padding: 0.2, duration: 600 });
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('ReactFlow fitView failed', error);
            }
          }
          finish();
        }, 80);
      }
    },
    [collapseChildren, reexpandChildren, reactFlow, visibleChildMap],
  );

  const enrichedNodes = useMemo(
    () =>
      flowNodes.map((node) => {
        const cachedEntry = childrenCache[node.id];
        const hasCached = Boolean(cachedEntry && cachedEntry.nodes.length > 0);
        const visible =
          Boolean(visibleChildMap[node.id]) && visibleChildMap[node.id].length > 0;

        return {
          ...node,
          data: {
            ...node.data,
            onViewDetails: handleViewDetails,
            onExpand: handleExpand,
            onToggleChildren: hasCached ? handleToggleChildren : undefined,
            isExpanding: expandingNodes.has(node.id),
            isExpanded: expandedNodes.has(node.id),
            justExpanded: recentlyExpanded.has(node.id),
            tooltipCount:
              tooltip && tooltip.nodeId === node.id ? tooltip.count : undefined,
            hasCachedChildren: hasCached,
            hasChildren: hasCached,
            childrenVisible: visible,
          },
        };
      }),
    [
      childrenCache,
      expandingNodes,
      expandedNodes,
      flowNodes,
      handleExpand,
      handleToggleChildren,
      handleViewDetails,
      recentlyExpanded,
      tooltip,
      visibleChildMap,
    ],
  );

  const getLevel = useCallback((node: CustomNodeData): Level => {
    if (node.level && ['Beginner', 'Intermediate', 'Advanced'].includes(node.level)) {
      return node.level as Level;
    }

    const haystack = `${node.description ?? ''} ${node.label ?? ''}`.toLowerCase();

    const beginnerKeywords = [
      'introduction',
      'intro',
      'basics',
      'beginner',
      'getting started',
      'overview',
      'foundation',
    ];
    const advancedKeywords = [
      'advanced',
      'expert',
      'deep dive',
      'specialized',
      'cutting-edge',
      'complex',
    ];

    if (beginnerKeywords.some((kw) => haystack.includes(kw))) {
      return 'Beginner';
    }
    if (advancedKeywords.some((kw) => haystack.includes(kw))) {
      return 'Advanced';
    }
    return 'Intermediate';
  }, []);

  useEffect(() => {
    setFiltering(true);
    const timer = setTimeout(() => setFiltering(false), 180);
    return () => clearTimeout(timer);
  }, [levelFilter]);

  const filteredNodes = useMemo(() => {
    if (levelFilter === 'All') {
      return enrichedNodes;
    }
    return enrichedNodes.filter((node) => getLevel(node.data) === levelFilter);
  }, [enrichedNodes, getLevel, levelFilter]);

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((node) => node.id)),
    [filteredNodes],
  );

  const filteredEdges = useMemo(
    () =>
      levelFilter === 'All'
        ? flowEdges
        : flowEdges.filter(
            (edge) =>
              filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
          ),
    [flowEdges, filteredNodeIds, levelFilter],
  );

  const canvasOpacityClass = filtering ? 'opacity-0' : 'opacity-100';

  return (
    <div className="h-[620px] w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl">
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        attributionPosition="bottom-left"
        minZoom={0.4}
        maxZoom={1.6}
        className={`transition-opacity duration-200 ease-out ${canvasOpacityClass}`}
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
      </ReactFlow>
    </div>
  );
}

export default function LearningMap(props: LearningMapProps) {
  return (
    <ReactFlowProvider>
      <InnerLearningMap {...props} />
    </ReactFlowProvider>
  );
}

