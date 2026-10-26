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
import React, { memo, useEffect, useMemo, useState } from 'react';
import { CodebaseIndex, FileRole, GraphNode } from '../types/index.js';

interface CodeModuleNodeData extends Record<string, unknown> {
  node: GraphNode;
  isHighlighted: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  isNeighbor: boolean;
}

const roleGlowColors: Record<FileRole, { dot: string; glow: string; badge: string; text: string }> = {
  route: {
    dot: 'bg-sky-400',
    glow: 'shadow-[0_0_10px_rgba(56,189,248,0.5)]',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    text: 'text-sky-300',
  },
  service: {
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_10px_rgba(251,191,36,0.5)]',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    text: 'text-amber-300',
  },
  model: {
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_10px_rgba(52,211,153,0.5)]',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    text: 'text-emerald-300',
  },
  util: {
    dot: 'bg-indigo-400',
    glow: 'shadow-[0_0_10px_rgba(129,140,248,0.5)]',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    text: 'text-indigo-300',
  },
  test: {
    dot: 'bg-teal-400',
    glow: 'shadow-[0_0_10px_rgba(45,212,191,0.5)]',
    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    text: 'text-teal-300',
  },
  component: {
    dot: 'bg-cyan-400',
    glow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    text: 'text-cyan-300',
  },
  config: {
    dot: 'bg-slate-400',
    glow: 'shadow-[0_0_8px_rgba(148,163,184,0.4)]',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    text: 'text-slate-300',
  },
};

// Obsidian-Style Organic Pill Node
const ObsidianNode = memo(({ data }: NodeProps<Node<CodeModuleNodeData>>) => {
  const { node, isHighlighted, isSelected, isDimmed, isNeighbor } = data;
  const theme = roleGlowColors[node.role] || roleGlowColors.service;

  let containerClasses =
    'bg-surface-container/90 backdrop-blur-md border border-outline-variant/70 hover:border-primary/80 opacity-100';

  if (isSelected) {
    containerClasses =
      'bg-surface-container-high border-primary ring-2 ring-primary/60 shadow-[0_0_22px_rgba(172,202,233,0.45)] scale-105 z-30 opacity-100';
  } else if (isHighlighted) {
    containerClasses =
      'bg-surface-container-high border-secondary ring-2 ring-secondary/60 shadow-[0_0_22px_rgba(121,218,166,0.45)] scale-105 z-20 opacity-100';
  } else if (isNeighbor) {
    containerClasses =
      'bg-surface-container-high border-primary/80 ring-1 ring-primary/40 shadow-[0_0_15px_rgba(172,202,233,0.3)] z-10 opacity-100';
  } else if (isDimmed) {
    containerClasses =
      'bg-surface-container/40 border-outline-variant/30 opacity-25 blur-[0.2px] hover:opacity-100 hover:blur-0';
  }

  return (
    <div
      className={`px-3 py-1.5 rounded-full ${containerClasses} text-left font-sans select-none cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-lg group relative min-w-[170px] max-w-[240px]`}
    >
      {/* Centered Invisible Handles: Guarantees Direct Obsidian Ray Connections From Center */}
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

      {/* Obsidian glowing dot */}
      <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} ${theme.glow} shrink-0`} />

      {/* Label and Path */}
      <div className="min-w-0 flex-1">
        <div className="font-mono text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
          {node.label}
        </div>
        <div className="text-[10px] text-outline font-mono truncate leading-none mt-0.5">
          {node.importersCount} in • {node.importsCount} out
        </div>
      </div>

      {/* Role Badge */}
      <span
        className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-full border ${theme.badge} shrink-0`}
      >
        {node.role.slice(0, 4)}
      </span>
    </div>
  );
});

ObsidianNode.displayName = 'ObsidianNode';

// Obsidian Direct Straight Edge (Constellation Vectors connecting node perimeters directly)
const ObsidianStraightEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd }: EdgeProps) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return null;

    const ux = dx / dist;
    const uy = dy / dist;

    // Approximate pill intersection boundary (pill width ~190, height ~38)
    const rx = 92;
    const ry = 18;
    const angle = Math.atan2(uy, ux);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nodeRadius = (rx * ry) / Math.sqrt((ry * cos) ** 2 + (rx * sin) ** 2) + 2;

    const sx = sourceX + ux * nodeRadius;
    const sy = sourceY + uy * nodeRadius;
    const tx = targetX - ux * nodeRadius;
    const ty = targetY - uy * nodeRadius;

    const finalSx = dist > nodeRadius * 2 ? sx : sourceX;
    const finalSy = dist > nodeRadius * 2 ? sy : sourceY;
    const finalTx = dist > nodeRadius * 2 ? tx : targetX;
    const finalTy = dist > nodeRadius * 2 ? ty : targetY;

    const edgePath = `M ${finalSx} ${finalSy} L ${finalTx} ${finalTy}`;

    return <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />;
  }
);
ObsidianStraightEdge.displayName = 'ObsidianStraightEdge';

// Obsidian Fluid Curved Arc Edge (Gentle organic chord arc, zero boxy loops)
const ObsidianCurvedEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd }: EdgeProps) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return null;

    const ux = dx / dist;
    const uy = dy / dist;

    const rx = 92;
    const ry = 18;
    const angle = Math.atan2(uy, ux);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nodeRadius = (rx * ry) / Math.sqrt((ry * cos) ** 2 + (rx * sin) ** 2) + 2;

    const sx = sourceX + ux * nodeRadius;
    const sy = sourceY + uy * nodeRadius;
    const tx = targetX - ux * nodeRadius;
    const ty = targetY - uy * nodeRadius;

    // Subtle organic arc deflection
    const perpX = -uy * Math.min(dist * 0.1, 30);
    const perpY = ux * Math.min(dist * 0.1, 30);
    const cx = (sx + tx) / 2 + perpX;
    const cy = (sy + ty) / 2 + perpY;

    const edgePath = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;

    return <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />;
  }
);
ObsidianCurvedEdge.displayName = 'ObsidianCurvedEdge';

const nodeTypes = {
  obsidian: ObsidianNode,
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
  const [layoutMode, setLayoutMode] = useState<'obsidian' | 'tiered'>('obsidian');
  const [edgeStyle, setEdgeStyle] = useState<'straight' | 'curved'>('straight');

  // Currently focused node (hovered takes precedence, then selected)
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

  // Connected nodes map for Obsidian spotlight
  const connectedNeighbors = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const neighbors = new Set<string>([activeNodeId]);
    index.edges.forEach((e) => {
      if (e.source === activeNodeId) neighbors.add(e.target);
      if (e.target === activeNodeId) neighbors.add(e.source);
    });
    return neighbors;
  }, [activeNodeId, index.edges]);

  // Generate Node Layout (Obsidian Constellation vs Tiered)
  const initialNodes: Node<CodeModuleNodeData>[] = useMemo(() => {
    const total = filteredGraphNodes.length;
    if (total === 0) return [];

    if (layoutMode === 'obsidian') {
      // Obsidian Organic Radial Constellation Layout
      const centerX = 520;
      const centerY = 400;

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

      const layout: Node<CodeModuleNodeData>[] = [];

      const placeInCircle = (nodes: GraphNode[], radius: number, angleOffset = 0) => {
        nodes.forEach((n, i) => {
          const angle = angleOffset + (i / Math.max(nodes.length, 1)) * 2 * Math.PI;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * (radius * 0.85); // widescreen aspect ratio

          const isSelected = selectedNodeId === n.id;
          const isHighlighted = highlightedNodes.includes(n.id);
          const isNeighbor = activeNodeId !== null && connectedNeighbors.has(n.id);
          const isDimmed = activeNodeId !== null && !connectedNeighbors.has(n.id);

          layout.push({
            id: n.id,
            type: 'obsidian',
            position: { x, y },
            data: {
              node: n,
              isHighlighted,
              isSelected,
              isDimmed,
              isNeighbor,
            },
          });
        });
      };

      placeInCircle(innerOrbit, 190, 0);
      placeInCircle(midOrbit, 370, Math.PI / 6);
      placeInCircle(outerOrbit, 540, Math.PI / 4);

      return layout;
    } else {
      // Tiered Architectural Layout
      const tiers: Record<number, GraphNode[]> = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
      };

      for (const node of filteredGraphNodes) {
        if (node.isTest) tiers[4].push(node);
        else if (node.role === 'route' || node.label.includes('index.')) tiers[0].push(node);
        else if (node.role === 'service') tiers[1].push(node);
        else if (node.role === 'model') tiers[2].push(node);
        else tiers[3].push(node);
      }

      const colWidth = 270;
      const rowHeight = 150;
      const layout: Node<CodeModuleNodeData>[] = [];
      const maxNodesInTier = Math.max(...Object.values(tiers).map((t) => t.length), 1);

      Object.entries(tiers).forEach(([tierStr, tierNodes]) => {
        const tierIndex = parseInt(tierStr, 10);
        const offsetX = ((maxNodesInTier - tierNodes.length) * colWidth) / 2 + 50;

        tierNodes.forEach((node, colIndex) => {
          const x = offsetX + colIndex * colWidth;
          const y = tierIndex * rowHeight + 40;

          const isSelected = selectedNodeId === node.id;
          const isHighlighted = highlightedNodes.includes(node.id);
          const isNeighbor = activeNodeId !== null && connectedNeighbors.has(node.id);
          const isDimmed = activeNodeId !== null && !connectedNeighbors.has(node.id);

          layout.push({
            id: node.id,
            type: 'obsidian',
            position: { x, y },
            data: {
              node,
              isHighlighted,
              isSelected,
              isDimmed,
              isNeighbor,
            },
          });
        });
      });

      return layout;
    }
  }, [filteredGraphNodes, highlightedNodes, selectedNodeId, layoutMode, activeNodeId, connectedNeighbors]);

  // Obsidian Direct Constellation Edges (Zero boxiness, pure direct connections)
  const initialEdges: Edge[] = useMemo(() => {
    const validNodeIds = new Set(filteredGraphNodes.map((n) => n.id));

    return index.edges
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
          ? 'rgba(120, 149, 178, 0.1)'
          : 'rgba(120, 149, 178, 0.35)';

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: edgeStyle === 'straight' ? 'obsidianStraight' : 'obsidianCurved',
          animated: isProminent,
          style: {
            stroke: edgeColor,
            strokeWidth: isProminent ? 2.2 : isDimmed ? 0.8 : 1.2,
            filter: isProminent
              ? isBlastRadiusHighlighted
                ? 'drop-shadow(0 0 6px rgba(121, 218, 166, 0.8))'
                : 'drop-shadow(0 0 6px rgba(172, 202, 233, 0.8))'
              : 'none',
            opacity: isDimmed ? 0.2 : 1,
            transition: 'all 0.2s ease',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 7,
            height: 7,
          },
        };
      });
  }, [index.edges, filteredGraphNodes, highlightedNodes, activeNodeId, edgeStyle]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Selected node details
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

          {/* Layout Mode Switcher */}
          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg border border-outline-variant text-[11px] font-mono">
            <button
              onClick={() => setLayoutMode('obsidian')}
              className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1 ${
                layoutMode === 'obsidian'
                  ? 'bg-primary-container text-on-primary-container font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">scatter_plot</span>
              <span>Constellation</span>
            </button>
            <button
              onClick={() => setLayoutMode('tiered')}
              className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1 ${
                layoutMode === 'tiered'
                  ? 'bg-primary-container text-on-primary-container font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">schema</span>
              <span>Tiered Tree</span>
            </button>
          </div>

          {/* Connection Style Switcher (Direct Obsidian Straight vs Curved Arc) */}
          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg border border-outline-variant text-[11px] font-mono">
            <button
              onClick={() => setEdgeStyle('straight')}
              title="Obsidian direct straight-line connections"
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                edgeStyle === 'straight'
                  ? 'bg-secondary-container text-on-secondary-container font-medium shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">show_chart</span>
              <span>Obsidian Links</span>
            </button>
            <button
              onClick={() => setEdgeStyle('curved')}
              title="Smooth gentle arc connections"
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                edgeStyle === 'curved'
                  ? 'bg-secondary-container text-on-secondary-container font-medium shadow-sm'
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
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#272a2e" gap={28} size={1} />
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
