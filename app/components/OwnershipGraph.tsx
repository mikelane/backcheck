'use client';

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Building2, Home, User, Briefcase, MapPin } from 'lucide-react';
import type { Entity, OwnershipEdge } from '@/lib/types';

const X_POSITIONS: Record<string, number> = {
  property: 0,
  llc: 300,
  mailing_address: 620,
  human: 900,
  registered_agent: 900,
};

const NODE_STYLES: Record<string, { border: string; bg: string; icon: React.ReactNode }> = {
  property: {
    border: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    icon: <Home size={14} />,
  },
  llc: {
    border: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    icon: <Building2 size={14} />,
  },
  human: {
    border: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    icon: <User size={14} />,
  },
  registered_agent: {
    border: '#6b7280',
    bg: 'rgba(107,114,128,0.12)',
    icon: <Briefcase size={14} />,
  },
  mailing_address: {
    border: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    icon: <MapPin size={14} />,
  },
};

function buildNodes(entities: Entity[]): Node[] {
  // Group entities by type to assign y positions within each column
  const byType: Record<string, Entity[]> = {};
  for (const e of entities) {
    (byType[e.type] ??= []).push(e);
  }

  const hasMhub = (byType['mailing_address'] ?? []).length > 0;

  // When a mailing_address hub is present, sibling LLCs fan vertically around it.
  // The primary LLC (index 0) sits at center; siblings fan out below it.
  const llcs = byType['llc'] ?? [];

  return entities.map((entity) => {
    const style = NODE_STYLES[entity.type] ?? NODE_STYLES.llc;
    const sameType = byType[entity.type] ?? [];
    const idx = sameType.indexOf(entity);
    const total = sameType.length;

    let x = X_POSITIONS[entity.type] ?? 300;
    let y = (idx - (total - 1) / 2) * 110 + 200;

    if (entity.type === 'llc' && hasMhub) {
      // All LLCs at same x; fan vertically with 100px spacing
      x = 300;
      y = (idx - (llcs.length - 1) / 2) * 100 + 200;
    } else if (entity.type === 'llc' && llcs.length > 2) {
      x = 300 + idx * 280;
    }

    if (entity.type === 'mailing_address') {
      // Center the hub vertically in the LLC fan
      y = 200;
    }

    if (entity.type === 'human') {
      // Humans go furthest right
      x = hasMhub ? 950 : 900;
    }

    const isHighRisk =
      entity.type === 'human' && (entity.cross_property_count ?? 0) >= 5;

    return {
      id: entity.id,
      position: { x, y },
      data: { label: entity.name, entity },
      style: {
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        borderRadius: '12px',
        padding: '10px 14px',
        color: '#f4f4f5',
        fontSize: '12px',
        fontFamily: 'ui-monospace, monospace',
        fontWeight: 600,
        minWidth: '180px',
        maxWidth: '220px',
        boxShadow: isHighRisk
          ? '0 0 18px 4px rgba(249,115,22,0.35)'
          : undefined,
        animation: 'node-reveal 0.5s ease-out forwards',
      },
      className: isHighRisk ? 'human-node-glow' : '',
    };
  });
}

function buildEdges(edges: OwnershipEdge[]): Edge[] {
  return edges.map((e, i) => ({
    id: `edge-${i}`,
    source: e.from,
    target: e.to,
    label: e.relationship,
    animated: true,
    style: { stroke: '#52525b', strokeWidth: 2 },
    labelStyle: {
      fill: '#71717a',
      fontSize: 10,
      fontFamily: 'ui-monospace, monospace',
    },
    labelBgStyle: { fill: '#09090b', fillOpacity: 0.9 },
    labelBgPadding: [4, 6] as [number, number],
    labelBgBorderRadius: 4,
  }));
}

interface OwnershipGraphProps {
  entities: Entity[];
  edges: OwnershipEdge[];
}

export default function OwnershipGraph({ entities, edges }: OwnershipGraphProps) {
  const nodes = buildNodes(entities);
  const rfEdges = buildEdges(edges);

  return (
    <div className="w-full h-[420px] rounded-xl overflow-hidden border border-zinc-800">
      <ReactFlow
        nodes={nodes}
        edges={rfEdges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#27272a" gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
