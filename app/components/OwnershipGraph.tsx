'use client';

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import NameShuffle from './NameShuffle';
import type { Entity, OwnershipEdge } from '@/lib/types';

const X_POSITIONS: Record<string, number> = {
  property: 0,
  llc: 300,
  mailing_address: 620,
  human: 900,
  registered_agent: 900,
};

const NODE_ACCENT: Record<string, { border: string; text: string; label: string }> = {
  property: { border: 'border-l-blue-500', text: 'text-blue-400', label: 'property' },
  llc: { border: 'border-l-purple-500', text: 'text-purple-400', label: 'LLC' },
  human: { border: 'border-l-orange-500', text: 'text-orange-400', label: 'individual' },
  registered_agent: { border: 'border-l-zinc-500', text: 'text-zinc-400', label: 'reg. agent' },
  mailing_address: { border: 'border-l-cyan-500', text: 'text-cyan-400', label: 'mailing addr' },
};

interface NodeData {
  label: string;
  entity: Entity;
  subline?: string;
}

function DossierNode({ data }: NodeProps<NodeData>) {
  const accent = NODE_ACCENT[data.entity.type] ?? NODE_ACCENT.llc;
  const isHighRisk =
    data.entity.type === 'human' && (data.entity.cross_property_count ?? 0) >= 5;

  return (
    <div
      className={`dossier-node-inner min-w-[180px] bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden ${
        isHighRisk ? 'ring-1 ring-orange-500/30 human-node-glow' : ''
      }`}
    >
      <div className={`border-l-2 ${accent.border} px-4 py-3`}>
        <p className={`text-[10px] font-medium ${accent.text} mb-1`}>{accent.label}</p>
        <div className="font-sans text-sm text-zinc-100 leading-tight tracking-tight">
          <NameShuffle name={data.label} />
        </div>
        {data.subline && (
          <p className="font-mono text-[10px] text-zinc-500 mt-1">{data.subline}</p>
        )}
      </div>
    </div>
  );
}

const NODE_TYPES = { dossier: DossierNode };

function buildNodes(entities: Entity[]): Node<NodeData>[] {
  const byType: Record<string, Entity[]> = {};
  for (const e of entities) {
    (byType[e.type] ??= []).push(e);
  }

  const hasMhub = (byType['mailing_address'] ?? []).length > 0;
  const llcs = byType['llc'] ?? [];

  return entities.map((entity) => {
    const sameType = byType[entity.type] ?? [];
    const idx = sameType.indexOf(entity);
    const total = sameType.length;

    let x = X_POSITIONS[entity.type] ?? 300;
    let y = (idx - (total - 1) / 2) * 110 + 200;

    if (entity.type === 'llc' && hasMhub) {
      x = 300;
      y = (idx - (llcs.length - 1) / 2) * 100 + 200;
    } else if (entity.type === 'llc' && llcs.length > 2) {
      x = 300 + idx * 280;
    }

    if (entity.type === 'mailing_address') {
      y = 200;
    }

    if (entity.type === 'human') {
      x = hasMhub ? 950 : 900;
    }

    const subline =
      entity.cross_property_count !== undefined && entity.cross_property_count >= 2
        ? `Owns ${entity.cross_property_count} properties`
        : undefined;

    return {
      id: entity.id,
      type: 'dossier',
      position: { x, y },
      data: { label: entity.name, entity, subline },
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
    style: { stroke: '#3f3f46', strokeWidth: 1.5, strokeDasharray: '4 4' },
    labelStyle: {
      fill: '#71717a',
      fontSize: 10,
      fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
    },
    labelBgStyle: { fill: '#09090b', fillOpacity: 0.9 },
    labelBgPadding: [4, 6] as [number, number],
    labelBgBorderRadius: 2,
  }));
}

interface OwnershipGraphProps {
  entities: Entity[];
  edges: OwnershipEdge[];
}

export default function OwnershipGraph({ entities, edges }: OwnershipGraphProps) {
  const nodes = useMemo(() => buildNodes(entities), [entities]);
  const rfEdges = useMemo(() => buildEdges(edges), [edges]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.react-flow__node',
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.dossier-node-inner',
        { scale: 0.85 },
        {
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
      gsap.fromTo(
        '.react-flow__edge',
        { opacity: 0 },
        { opacity: 1, duration: 0.4, delay: 0.5, stagger: 0.04, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [nodes]);

  return (
    <div ref={containerRef} className="w-full h-[420px] overflow-hidden border border-zinc-900 rounded-xl bg-zinc-950/50">
      <ReactFlow
        nodes={nodes}
        edges={rfEdges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#18181b" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
