import {
  Background,
  BaseEdge,
  Controls,
  Edge,
  EdgeProps,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  SimulationNodeDatum,
} from 'd3-force';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { CodebaseIndex, FileRole, GraphNode } from '../types/index.js';

interface CodeModuleNodeData extends Record<string, unknown> {
  node: GraphNode;
  isHighlighted: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  isNeighbor: boolean;
  nodeStyle: 'orbs' | 'pills';
}

const roleGlowColors: Record<
  FileRole,
  { dot: string; glow: string; badge: string; text: string; hex: string }
> = {
  route: {
    dot: 'bg-sky-400',
    glow: 'shadow-[0_0_12px_rgba(56,189,248,0.7)]',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    text: 'text-sky-300',
    hex: '#38bdf8',
  },
  service: {
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_12px_rgba(251,191,36,0.7)]',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    text: 'text-amber-300',
    hex: '#fbbf24',
  },
  model: {
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.7)]',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    text: 'text-emerald-300',
    hex: '#34d399',
  },
  util: {
    dot: 'bg-indigo-400',
    glow: 'shadow-[0_0_12px_rgba(129,140,248,0.7)]',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    text: 'text-indigo-300',
    hex: '#818cf8',
  },
  test: {
    dot: 'bg-teal-400',
    glow: 'shadow-[0_0_12px_rgba(45,212,191,0.7)]',
    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    text: 'text-teal-300',
    hex: '#2dd4bf',
  },
  component: {
    dot: 'bg-cyan-400',
    glow: 'shadow-[0_0_12px_rgba(34,211,238,0.7)]',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    text: 'text-cyan-300',
    hex: '#22d3ee',
  },
  config: {
    dot: 'bg-slate-400',
    glow: 'shadow-[0_0_10px_rgba(148,163,184,0.5)]',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    text: 'text-slate-300',
    hex: '#94a3b8',
  },
};

// 1. True Obsidian Starfield Orb Node (Fully draggable with grab cursors)
const ObsidianOrbNode = memo(({ data }: NodeProps<Node<CodeModuleNodeData>>) => {
  const { node, isHighlighted, isSelected, isDimmed, isNeighbor } = data;
  const theme = roleGlowColors[node.role] || roleGlowColors.service;

  // Connection degree determines node mass/radius
  const degree = node.importersCount + node.importsCount;
  const orbDiameter = Math.max(20, Math.min(38, 20 + degree * 2));

  let containerClasses =
    'relative flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing group p-2';
  if (isDimmed) {
    containerClasses += ' opacity-25 blur-[0.3px] hover:opacity-100 hover:blur-0 transition-all';
  } else {
    containerClasses += ' opacity-100 transition-all';
  }

  return (
    <div className={containerClasses}>
      {/* Centered Invisible Handles for Direct 360-degree Radial Vectors */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, pointerEvents: 'none' }}
        className="!w-0 !h-0 !border-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, pointerEvents: 'none' }}
        className="!w-0 !h-0 !border-0"
      />

      {/* Obsidian Glowing Circular Core */}
      <div
        style={{
          width: `${orbDiameter}px`,
          height: `${orbDiameter}px`,
        }}
        className={`rounded-full ${theme.dot} transition-all duration-200 relative flex items-center justify-center pointer-events-none ${
          isSelected
            ? 'ring-4 ring-primary shadow-[0_0_24px_rgba(172,202,233,0.95)] scale-125 z-30'
            : isHighlighted
            ? 'ring-4 ring-secondary shadow-[0_0_24px_rgba(121,218,166,0.95)] scale-125 z-20'
            : isNeighbor
            ? 'ring-2 ring-primary/80 shadow-[0_0_18px_rgba(172,202,233,0.7)] scale-110 z-10'
            : `${theme.glow} group-hover:scale-125 group-hover:ring-2 group-hover:ring-white/80`
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm" />
      </div>

      {/* Floating Monospace Label */}
      <div className="mt-1.5 flex flex-col items-center pointer-events-none">
        <span
          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md backdrop-blur-md transition-all shadow-sm ${
            isSelected
              ? 'text-primary bg-surface-container-high/95 border border-primary/60 scale-105'
              : isHighlighted
              ? 'text-secondary bg-surface-container-high/95 border border-secondary/60 scale-105'
              : isNeighbor
              ? 'text-primary-container bg-surface-container/95 border border-outline-variant/70'
              : 'text-on-surface/90 bg-surface/80 border border-outline-variant/30 group-hover:text-primary group-hover:border-primary/50'
          }`}
        >
          {node.label}
        </span>
        <span className="text-[10px] text-outline font-mono mt-0.5 opacity-65 group-hover:opacity-100">
          {node.importersCount} in • {node.importsCount} out
        </span>
      </div>
    </div>
  );
});
ObsidianOrbNode.displayName = 'ObsidianOrbNode';

// 2. Obsidian Pill Node (Optional Expanded Mode, fully draggable)
const ObsidianPillNode = memo(({ data }: NodeProps<Node<CodeModuleNodeData>>) => {
  const { node, isHighlighted, isSelected, isDimmed, isNeighbor } = data;
  const theme = roleGlowColors[node.role] || roleGlowColors.service;

  let containerClasses =
    'px-3.5 py-2 rounded-full backdrop-blur-md border border-outline-variant/70 hover:border-primary/80 select-none cursor-grab active:cursor-grabbing transition-all duration-200 flex items-center gap-2 shadow-lg group relative min-w-[170px] max-w-[240px]';

  if (isSelected) {
    containerClasses +=
      ' bg-surface-container-high border-primary ring-2 ring-primary/60 shadow-[0_0_22px_rgba(172,202,233,0.45)] scale-105 z-30 opacity-100';
  } else if (isHighlighted) {
    containerClasses +=
      ' bg-surface-container-high border-secondary ring-2 ring-secondary/60 shadow-[0_0_22px_rgba(121,218,166,0.45)] scale-105 z-20 opacity-100';
  } else if (isNeighbor) {
    containerClasses +=
      ' bg-surface-container-high border-primary/80 ring-1 ring-primary/40 shadow-[0_0_15px_rgba(172,202,233,0.3)] z-10 opacity-100';
  } else if (isDimmed) {
    containerClasses +=
      ' bg-surface-container/40 border-outline-variant/30 opacity-25 blur-[0.2px] hover:opacity-100 hover:blur-0';
  } else {
    containerClasses += ' bg-surface-container/90 opacity-100';
  }

  return (
    <div className={containerClasses}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, pointerEvents: 'none' }}
        className="!w-0 !h-0 !border-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0, pointerEvents: 'none' }}
        className="!w-0 !h-0 !border-0"
      />

      <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} ${theme.glow} shrink-0 pointer-events-none`} />

      <div className="min-w-0 flex-1 pointer-events-none">
        <div className="font-mono text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
          {node.label}
        </div>
        <div className="text-[10px] text-outline font-mono truncate leading-none mt-0.5">
          {node.importersCount} in • {node.importsCount} out
        </div>
      </div>

      <span
        className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-full border ${theme.badge} shrink-0 pointer-events-none`}
      >
        {node.role.slice(0, 4)}
      </span>
    </div>
  );
});
ObsidianPillNode.displayName = 'ObsidianPillNode';

// Obsidian Direct Straight Edge
const ObsidianStraightEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd }: EdgeProps) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return null;

    const ux = dx / dist;
    const uy = dy / dist;

    const sourceOffset = 18;
    const targetOffset = 22;

    const sx = sourceX + ux * sourceOffset;
    const sy = sourceY + uy * sourceOffset;
    const tx = targetX - ux * targetOffset;
    const ty = targetY - uy * targetOffset;

    const finalSx = dist > sourceOffset + targetOffset ? sx : sourceX;
    const finalSy = dist > sourceOffset + targetOffset ? sy : sourceY;
    const finalTx = dist > sourceOffset + targetOffset ? tx : targetX;
    const finalTy = dist > sourceOffset + targetOffset ? ty : targetY;

    const edgePath = `M ${finalSx} ${finalSy} L ${finalTx} ${finalTy}`;

    return <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />;
  }
);
ObsidianStraightEdge.displayName = 'ObsidianStraightEdge';

// Obsidian Organic Curved Arc Edge
const ObsidianCurvedEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd }: EdgeProps) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return null;

    const ux = dx / dist;
    const uy = dy / dist;

    const sourceOffset = 18;
    const targetOffset = 22;

    const sx = sourceX + ux * sourceOffset;
    const sy = sourceY + uy * sourceOffset;
    const tx = targetX - ux * targetOffset;
    const ty = targetY - uy * targetOffset;

    const perpX = -uy * Math.min(dist * 0.12, 32);
    const perpY = ux * Math.min(dist * 0.12, 32);
    const cx = (sx + tx) / 2 + perpX;
    const cy = (sy + ty) / 2 + perpY;

    const edgePath = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;

    return <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />;
  }
);
ObsidianCurvedEdge.displayName = 'ObsidianCurvedEdge';

const nodeTypes = {
  obsidianOrb: ObsidianOrbNode,
  obsidianPill: ObsidianPillNode,
};

const edgeTypes = {
  obsidianStraight: ObsidianStraightEdge,
  obsidianCurved: ObsidianCurvedEdge,
};

interface DependencyGraphViewProps {
  index: CodebaseIndex;
  highlightedNodes?: string[];
  onSelectFile: (filePath: string) => void;
  onTriggerBlastRadius: (filePath: string) => void;
}

interface D3SimNode extends SimulationNodeDatum {
  id: string;
  graphNode: GraphNode;
}

interface D3SimLink {
  source: string | D3SimNode;
  target: string | D3SimNode;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  index,
  highlightedNodes = [],
  onSelectFile,
  onTriggerBlastRadius,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'force' | 'constellation'>('force');
  const [nodeDisplay, setNodeDisplay] = useState<'orbs' | 'pills'>('orbs');
  const [edgeStyle, setEdgeStyle] = useState<'straight' | 'curved'>('straight');
  const [reseedTrigger, setReseedTrigger] = useState<number>(0);

  const activeNodeId = hoveredNodeId || selectedNodeId;

  // Filter nodes
  const filteredGraphNodes = useMemo(() => {
    return index.nodes.filter((node) => {
      if (roleFilter !== 'all' && node.role !== roleFilter) return false;
      if (searchFilter && !node.path.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [index.nodes, roleFilter, searchFilter]);

  // Connected neighbors for spotlight
  const connectedNeighbors = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const neighbors = new Set<string>([activeNodeId]);
    index.edges.forEach((e) => {
      if (e.source === activeNodeId) neighbors.add(e.target);
      if (e.target === activeNodeId) neighbors.add(e.source);
    });
    return neighbors;
  }, [activeNodeId, index.edges]);

  // Dynamic D3 Force Simulation (Real Obsidian Physics)
  const computedPositions = useMemo(() => {
    if (filteredGraphNodes.length === 0) return new Map<string, { x: number; y: number }>();

    const positions = new Map<string, { x: number; y: number }>();

    if (layoutMode === 'force') {
      const validNodeIds = new Set(filteredGraphNodes.map((n) => n.id));
      const simNodes: D3SimNode[] = filteredGraphNodes.map((n, i) => {
        const angle = (i / filteredGraphNodes.length) * 2 * Math.PI;
        return {
          id: n.id,
          graphNode: n,
          x: 520 + Math.cos(angle) * 240,
          y: 360 + Math.sin(angle) * 200,
        };
      });

      const simLinks: D3SimLink[] = index.edges
        .filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
        .map((e) => ({
          source: e.source,
          target: e.target,
        }));

      const simulation = forceSimulation(simNodes)
        .force(
          'link',
          forceLink(simLinks)
            .id((d: any) => d.id)
            .distance(170)
            .strength(0.8)
        )
        .force('charge', forceManyBody().strength(-600).distanceMax(700))
        .force('collide', forceCollide().radius(75).iterations(2))
        .force('center', forceCenter(520, 360))
        .stop();

      for (let i = 0; i < 150; ++i) {
        simulation.tick();
      }

      simNodes.forEach((sn) => {
        positions.set(sn.id, { x: sn.x || 520, y: sn.y || 360 });
      });
    } else {
      // Radial Constellation
      const centerX = 520;
      const centerY = 360;
      const innerOrbit: GraphNode[] = [];
      const midOrbit: GraphNode[] = [];
      const outerOrbit: GraphNode[] = [];

      filteredGraphNodes.forEach((node) => {
        if (node.role === 'service' || node.role === 'model') {
          innerOrbit.push(node);
        } else if (node.role === 'route' || node.role === 'util') {
          midOrbit.push(node);
        } else {
          outerOrbit.push(node);
        }
      });

      const placeInCircle = (nodes: GraphNode[], radius: number, angleOffset = 0) => {
        nodes.forEach((n, i) => {
          const angle = angleOffset + (i / Math.max(nodes.length, 1)) * 2 * Math.PI;
          positions.set(n.id, {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * (radius * 0.8),
          });
        });
      };

      placeInCircle(innerOrbit, 180, 0);
      placeInCircle(midOrbit, 360, Math.PI / 6);
      placeInCircle(outerOrbit, 520, Math.PI / 4);
    }

    return positions;
  }, [filteredGraphNodes, index.edges, layoutMode, reseedTrigger]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CodeModuleNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 1. Initial Position Assignment (Only runs on layoutMode change, filter change, or reseed)
  useEffect(() => {
    const initialNodesList: Node<CodeModuleNodeData>[] = filteredGraphNodes.map((node) => {
      const pos = computedPositions.get(node.id) || { x: 520, y: 360 };
      const isSelected = selectedNodeId === node.id;
      const isHighlighted = highlightedNodes.includes(node.id);
      const isNeighbor = activeNodeId !== null && connectedNeighbors.has(node.id);
      const isDimmed = activeNodeId !== null && !connectedNeighbors.has(node.id);

      return {
        id: node.id,
        type: nodeDisplay === 'orbs' ? 'obsidianOrb' : 'obsidianPill',
        position: pos,
        data: {
          node,
          isHighlighted,
          isSelected,
          isDimmed,
          isNeighbor,
          nodeStyle: nodeDisplay,
        },
      };
    });

    setNodes(initialNodesList);
  }, [computedPositions, layoutMode, setNodes]);

  // 2. State/Hover/Display Sync: Preserves current user-dragged node.position!
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((n) => {
        const isSelected = selectedNodeId === n.id;
        const isHighlighted = highlightedNodes.includes(n.id);
        const isNeighbor = activeNodeId !== null && connectedNeighbors.has(n.id);
        const isDimmed = activeNodeId !== null && !connectedNeighbors.has(n.id);
        const targetType = nodeDisplay === 'orbs' ? 'obsidianOrb' : 'obsidianPill';

        // Don't produce new object if nothing changed
        if (
          n.type === targetType &&
          n.data.isSelected === isSelected &&
          n.data.isHighlighted === isHighlighted &&
          n.data.isNeighbor === isNeighbor &&
          n.data.isDimmed === isDimmed &&
          n.data.nodeStyle === nodeDisplay
        ) {
          return n;
        }

        return {
          ...n,
          type: targetType,
          data: {
            ...n.data,
            isSelected,
            isHighlighted,
            isNeighbor,
            isDimmed,
            nodeStyle: nodeDisplay,
          },
        };
      })
    );
  }, [selectedNodeId, activeNodeId, highlightedNodes, connectedNeighbors, nodeDisplay, setNodes]);

  // 3. Edges Sync
  useEffect(() => {
    const validNodeIds = new Set(filteredGraphNodes.map((n) => n.id));

    const newEdges: Edge[] = index.edges
      .filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
      .map((e) => {
        const isBlastRadiusHighlighted =
          highlightedNodes.includes(e.source) && highlightedNodes.includes(e.target);
        const isConnectedToActive =
          activeNodeId !== null && (e.source === activeNodeId || e.target === activeNodeId);
        const isProminent = isConnectedToActive || isBlastRadiusHighlighted;
        const isDimmed = activeNodeId !== null && !isProminent;

        const edgeColor = isBlastRadiusHighlighted
          ? '#79daa6'
          : isConnectedToActive
          ? '#accae9'
          : isDimmed
          ? 'rgba(120, 149, 178, 0.08)'
          : 'rgba(120, 149, 178, 0.32)';

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: edgeStyle === 'straight' ? 'obsidianStraight' : 'obsidianCurved',
          animated: isProminent,
          style: {
            stroke: edgeColor,
            strokeWidth: isProminent ? 2.2 : isDimmed ? 0.7 : 1.2,
            filter: isProminent
              ? isBlastRadiusHighlighted
                ? 'drop-shadow(0 0 6px rgba(121, 218, 166, 0.8))'
                : 'drop-shadow(0 0 6px rgba(172, 202, 233, 0.8))'
              : 'none',
            opacity: isDimmed ? 0.18 : 1,
            transition: 'all 0.2s ease',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 6,
            height: 6,
          },
        };
      });

    setEdges(newEdges);
  }, [index.edges, filteredGraphNodes, highlightedNodes, activeNodeId, edgeStyle, setEdges]);

  const selectedNode = index.nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeFile = selectedNodeId ? index.files[selectedNodeId] : null;

  return (
    <div className="h-[calc(100vh-52px)] flex flex-col font-sans select-none relative overflow-hidden">
      {/* Top Controls Bar */}
      <div className="h-12 bg-surface-container-low border-b border-outline-variant px-4 flex items-center justify-between gap-3 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">hub</span>
            <span className="text-xs font-semibold text-on-surface">Obsidian Knowledge Graph</span>
          </div>

          {/* Physics Simulation Switcher */}
          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg border border-outline-variant text-[11px] font-mono">
            <button
              onClick={() => setLayoutMode('force')}
              title="Natural Physics Force Simulation (Organic clustering)"
              className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1 ${
                layoutMode === 'force'
                  ? 'bg-primary-container text-on-primary-container font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">bubble_chart</span>
              <span>Obsidian Physics</span>
            </button>
            <button
              onClick={() => setLayoutMode('constellation')}
              title="Concentric Orbital Constellation"
              className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1 ${
                layoutMode === 'constellation'
                  ? 'bg-primary-container text-on-primary-container font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">scatter_plot</span>
              <span>Constellation</span>
            </button>
          </div>

          {/* Reset Physics / Reseed */}
          <button
            onClick={() => setReseedTrigger((prev) => prev + 1)}
            title="Re-balance physics and reset node positions"
            className="px-2 py-1 rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface text-[11px] font-mono flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[13px]">restart_alt</span>
            <span>Reset Physics</span>
          </button>

          {/* Node Appearance Switcher (Orbs vs Pills) */}
          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg border border-outline-variant text-[11px] font-mono">
            <button
              onClick={() => setNodeDisplay('orbs')}
              title="True Obsidian Glowing Orbs"
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                nodeDisplay === 'orbs'
                  ? 'bg-secondary-container text-on-secondary-container font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">lens</span>
              <span>Obsidian Orbs</span>
            </button>
            <button
              onClick={() => setNodeDisplay('pills')}
              title="Detailed Badged Pills"
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                nodeDisplay === 'pills'
                  ? 'bg-secondary-container text-on-secondary-container font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">view_agenda</span>
              <span>Pills</span>
            </button>
          </div>

          {/* Link Connection Style Switcher */}
          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg border border-outline-variant text-[11px] font-mono">
            <button
              onClick={() => setEdgeStyle('straight')}
              title="Obsidian direct straight laser links"
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                edgeStyle === 'straight'
                  ? 'bg-surface-bright text-primary font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">show_chart</span>
              <span>Laser Links</span>
            </button>
            <button
              onClick={() => setEdgeStyle('curved')}
              title="Gentle organic curved arcs"
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                edgeStyle === 'curved'
                  ? 'bg-surface-bright text-primary font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">gesture</span>
              <span>Curved Arcs</span>
            </button>
          </div>
        </div>

        {/* Filter chips & Search */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search notes / files..."
            className="bg-surface-container-high border border-outline-variant rounded-full px-3 py-1 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary w-40 font-mono"
          />

          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-full border border-outline-variant text-[11px] font-mono">
            {['all', 'route', 'service', 'model', 'util', 'test'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-2.5 py-0.5 rounded-full uppercase transition-colors ${
                  roleFilter === role
                    ? 'bg-surface-container-highest text-primary font-medium'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-surface">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_e, node) => setSelectedNodeId(node.id)}
          onNodeMouseEnter={(_e, node) => setHoveredNodeId(node.id)}
          onNodeMouseLeave={() => setHoveredNodeId(null)}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setHoveredNodeId(null);
          }}
          fitView
          fitViewOptions={{ padding: 0.25 }}
        >
          <Background color="#1c2024" gap={28} size={1} />
          <Controls />
        </ReactFlow>

        {/* Selected Node Details Floating Drawer */}
        {selectedNode && selectedNodeFile && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-surface-container-low/95 backdrop-blur-md border border-outline-variant rounded-xl p-4 shadow-2xl flex flex-col justify-between overflow-y-auto z-20 font-sans">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_#accae9]" />
                  <span className="font-mono text-xs font-semibold text-on-surface truncate">
                    {selectedNode.label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-outline">Path</span>
                <p className="font-mono text-xs text-on-surface break-all">{selectedNode.path}</p>
              </div>

              {/* Direct Dependencies */}
              <div>
                <span className="text-[10px] uppercase font-mono text-outline">
                  Links Out ({selectedNodeFile.imports.length})
                </span>
                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                  {selectedNodeFile.imports.map((imp) => (
                    <div
                      key={imp.source}
                      className="font-mono text-[11px] text-primary truncate bg-surface-container p-1.5 rounded-lg"
                    >
                      {imp.source}
                    </div>
                  ))}
                  {selectedNodeFile.imports.length === 0 && (
                    <span className="text-xs text-outline font-sans">No local imports</span>
                  )}
                </div>
              </div>

              {/* Dependents / Callers */}
              <div>
                <span className="text-[10px] uppercase font-mono text-outline">
                  Backlinks / Inbound ({selectedNode.importersCount})
                </span>
                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                  {(index.reverseAdjacency[selectedNode.path] || []).map((caller) => (
                    <div
                      key={caller}
                      onClick={() => setSelectedNodeId(caller)}
                      className="font-mono text-[11px] text-secondary hover:underline truncate bg-surface-container p-1.5 rounded-lg cursor-pointer"
                    >
                      {caller}
                    </div>
                  ))}
                  {selectedNode.importersCount === 0 && (
                    <span className="text-xs text-outline font-sans">No backlinks</span>
                  )}
                </div>
              </div>

              {/* Exported Symbols */}
              <div>
                <span className="text-[10px] uppercase font-mono text-outline">
                  Exports ({selectedNodeFile.symbols.length})
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedNodeFile.symbols.map((sym) => (
                    <span
                      key={sym.name}
                      className="font-mono text-[10px] text-tertiary bg-surface-container-highest px-2 py-0.5 rounded-full border border-outline-variant"
                    >
                      {sym.kind} {sym.name}
                    </span>
                  ))}
                  {selectedNodeFile.symbols.length === 0 && (
                    <span className="text-xs text-outline font-sans">No symbols defined</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-outline-variant space-y-2">
              <button
                onClick={() => onTriggerBlastRadius(selectedNode.path)}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-primary-container text-on-primary-container hover:brightness-110 font-medium text-xs py-2 rounded-lg transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[15px]">difference</span>
                <span>Trace BlastRadius</span>
              </button>
              <button
                onClick={() => onSelectFile(selectedNode.path)}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs py-2 rounded-lg border border-outline-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">code</span>
                <span>Open File</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
