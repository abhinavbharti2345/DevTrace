import {
  Background,
  Controls,
  Edge,
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

// Custom React Flow Node Component
interface CodeModuleNodeData extends Record<string, unknown> {
  node: GraphNode;
  isHighlighted: boolean;
  isSelected: boolean;
}

const roleColors: Record<FileRole, string> = {
  route: 'text-primary bg-primary/10 border-primary/30',
  service: 'text-tertiary bg-tertiary/10 border-tertiary/30',
  util: 'text-on-surface-variant bg-surface-variant border-outline-variant',
  model: 'text-secondary bg-secondary/10 border-secondary/30',
  test: 'text-secondary bg-secondary-container/20 border-secondary/40',
  component: 'text-primary bg-primary-container/20 border-primary/30',
  config: 'text-outline bg-surface-container-highest border-outline-variant',
};

const CodeModuleNode = memo(({ data }: NodeProps<Node<CodeModuleNodeData>>) => {
  const { node, isHighlighted, isSelected } = data;

  let borderStyle = 'border-outline-variant';
  let bgStyle = 'bg-surface-container';

  if (isSelected) {
    borderStyle = 'border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/10';
    bgStyle = 'bg-surface-container-high';
  } else if (isHighlighted) {
    borderStyle = 'border-secondary ring-2 ring-secondary/40 shadow-lg shadow-secondary/10';
    bgStyle = 'bg-surface-container-high';
  }

  return (
    <div
      className={`p-3 rounded-lg border ${borderStyle} ${bgStyle} hover:border-primary/50 text-left font-sans select-none shadow-md cursor-pointer transition-all w-[260px] relative`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-2.5 !h-2.5 !border-2 !border-surface -top-1.5"
      />

      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span
          className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border font-semibold ${
            roleColors[node.role] || roleColors.service
          }`}
        >
          {node.role}
        </span>
        <span className="font-mono text-[10px] text-outline">
          {node.importersCount} in / {node.importsCount} out
        </span>
      </div>

      <div className="font-mono text-xs text-on-surface font-semibold truncate" title={node.label}>
        {node.label}
      </div>
      <div className="text-[10px] text-outline font-mono truncate mt-0.5" title={node.path}>
        {node.path}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-secondary !w-2.5 !h-2.5 !border-2 !border-surface -bottom-1.5"
      />
    </div>
  );
});

CodeModuleNode.displayName = 'CodeModuleNode';

const nodeTypes = {
  codeModule: CodeModuleNode,
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
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // 1. Filter nodes based on role and search query
  const filteredGraphNodes = useMemo(() => {
    return index.nodes.filter((node) => {
      if (roleFilter !== 'all' && node.role !== roleFilter) return false;
      if (searchFilter && !node.path.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [index.nodes, roleFilter, searchFilter]);

  // 2. Intelligent Tiered Architectural Layering Layout
  const initialNodes: Node<CodeModuleNodeData>[] = useMemo(() => {
    // Categorize nodes into architectural layers
    const tiers: Record<number, GraphNode[]> = {
      0: [], // Routes / Entrypoints
      1: [], // Services / Controllers
      2: [], // Models / Schemas
      3: [], // Shared Utilities
      4: [], // Tests
    };

    for (const node of filteredGraphNodes) {
      if (node.isTest) {
        tiers[4].push(node);
      } else if (node.role === 'route' || node.label.includes('index.') || node.role === 'component') {
        tiers[0].push(node);
      } else if (node.role === 'service') {
        tiers[1].push(node);
      } else if (node.role === 'model') {
        tiers[2].push(node);
      } else {
        tiers[3].push(node);
      }
    }

    const colWidth = 320;
    const rowHeight = 160;
    const layoutNodes: Node<CodeModuleNodeData>[] = [];

    // Find maximum tier count for centering
    const maxNodesInTier = Math.max(
      ...Object.values(tiers).map((t) => t.length),
      1
    );

    Object.entries(tiers).forEach(([tierStr, tierNodes]) => {
      const tierIndex = parseInt(tierStr, 10);
      const tierCount = tierNodes.length;
      const offsetX = ((maxNodesInTier - tierCount) * colWidth) / 2 + 60;

      tierNodes.forEach((node, colIndex) => {
        const x = offsetX + colIndex * colWidth;
        const y = tierIndex * rowHeight + 40;

        layoutNodes.push({
          id: node.id,
          type: 'codeModule',
          position: { x, y },
          data: {
            node,
            isHighlighted: highlightedNodes.includes(node.id),
            isSelected: selectedNodeId === node.id,
          },
        });
      });
    });

    return layoutNodes;
  }, [filteredGraphNodes, highlightedNodes, selectedNodeId]);

  // 3. Generate smooth curved edges with styled arrows
  const initialEdges: Edge[] = useMemo(() => {
    const validNodeIds = new Set(filteredGraphNodes.map((n) => n.id));

    return index.edges
      .filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
      .map((e) => {
        const isHighlighted =
          highlightedNodes.includes(e.source) && highlightedNodes.includes(e.target);

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: isHighlighted,
          style: {
            stroke: isHighlighted ? '#79daa6' : '#353a40',
            strokeWidth: isHighlighted ? 2.5 : 1.2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isHighlighted ? '#79daa6' : '#7895b2',
            width: 10,
            height: 10,
          },
        };
      });
  }, [index.edges, filteredGraphNodes, highlightedNodes]);

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
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">hub</span>
          <span className="text-xs font-semibold text-on-surface">Tiered Architectural DAG</span>
          <span className="font-mono text-[11px] text-outline">
            ({filteredGraphNodes.length} modules, {initialEdges.length} connections)
          </span>
        </div>

        {/* Filter chips & Search */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter files..."
            className="bg-surface-container-high border border-outline-variant rounded px-2.5 py-1 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary w-40 font-mono"
          />

          <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded border border-outline-variant text-[11px] font-mono">
            {['all', 'route', 'service', 'model', 'util', 'test'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-2 py-0.5 rounded uppercase transition-colors ${
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_e, node) => setSelectedNodeId(node.id)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#272a2e" gap={24} size={1} />
          <Controls />
        </ReactFlow>

        {/* Node Detail Drawer (Floating on right side) */}
        {selectedNode && selectedNodeFile && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-surface-container-low border border-outline-variant rounded-lg p-4 shadow-xl flex flex-col justify-between overflow-y-auto z-20 font-sans">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    description
                  </span>
                  <span className="font-mono text-xs font-semibold text-on-surface truncate">
                    {selectedNode.label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-outline hover:text-on-surface"
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
                  Imports ({selectedNodeFile.imports.length})
                </span>
                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                  {selectedNodeFile.imports.map((imp) => (
                    <div
                      key={imp.source}
                      className="font-mono text-[11px] text-primary truncate bg-surface-container p-1 rounded"
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
                  Callers / Dependents ({selectedNode.importersCount})
                </span>
                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                  {(index.reverseAdjacency[selectedNode.path] || []).map((caller) => (
                    <div
                      key={caller}
                      onClick={() => setSelectedNodeId(caller)}
                      className="font-mono text-[11px] text-secondary hover:underline truncate bg-surface-container p-1 rounded cursor-pointer"
                    >
                      {caller}
                    </div>
                  ))}
                  {selectedNode.importersCount === 0 && (
                    <span className="text-xs text-outline font-sans">No downstream callers</span>
                  )}
                </div>
              </div>

              {/* Exported Symbols */}
              <div>
                <span className="text-[10px] uppercase font-mono text-outline">
                  Symbols ({selectedNodeFile.symbols.length})
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedNodeFile.symbols.map((sym) => (
                    <span
                      key={sym.name}
                      className="font-mono text-[10px] text-tertiary bg-surface-container-highest px-1.5 py-0.5 rounded border border-outline-variant"
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
                className="w-full inline-flex items-center justify-center gap-1.5 bg-primary-container text-on-primary-container hover:brightness-110 font-medium text-xs py-2 rounded transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">difference</span>
                <span>Analyze BlastRadius</span>
              </button>
              <button
                onClick={() => onSelectFile(selectedNode.path)}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs py-2 rounded border border-outline-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">code</span>
                <span>View Full Source</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
