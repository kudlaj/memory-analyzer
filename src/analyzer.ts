import fs from 'fs';
import { parse } from 'heapsnapshot-parser';
import { HEAVY_CLOSURE_THRESHOLD, LARGE_ARRAY_THRESHOLD } from '../config';

const RETAINED_SIZE_EDGE_TYPES = new Set(['context', 'element', 'property', 'hidden']);

function computeRetainedSizes(nodes: any[]): number[] {
  const rootIndex = nodes.findIndex((n: any) => n.type === 'synthetic' && n.name === '(GC roots)');
  const root = rootIndex !== -1 ? rootIndex : 0;

  const preds: number[][] = Array.from({ length: nodes.length }, () => []);
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node || !node.references) continue;
    for (const ref of node.references) {
      if (ref.toNodeIndex == null) continue;
      if (RETAINED_SIZE_EDGE_TYPES.has(ref.type)) {
        preds[ref.toNodeIndex].push(i);
      }
    }
  }

  const idom: number[] = new Array(nodes.length).fill(-1);
  idom[root] = root;

  const order: number[] = [];
  const visited = new Array(nodes.length).fill(false);
  (function dfs(idx: number) {
    visited[idx] = true;
    const node = nodes[idx];
    if (node && node.references) {
      for (const ref of node.references) {
        if (RETAINED_SIZE_EDGE_TYPES.has(ref.type) && !visited[ref.toNodeIndex]) {
          dfs(ref.toNodeIndex);
        }
      }
    }
    order.push(idx);
  })(root);

  const rpo = order.reverse();

  const intersect = (b1: number, b2: number): number => {
    let finger1 = b1;
    let finger2 = b2;
    while (finger1 !== finger2) {
      while (finger1 > finger2) finger1 = idom[finger1];
      while (finger2 > finger1) finger2 = idom[finger2];
    }
    return finger1;
  };

  let changed = true;
  while (changed) {
    changed = false;
    for (const n of rpo) {
      if (n === root) continue;
      let newIdom: number | null = null;
      for (const p of preds[n]) {
        if (idom[p] !== -1) {
          newIdom = newIdom === null ? p : intersect(p, newIdom);
        }
      }
      if (newIdom !== null && idom[n] !== newIdom) {
        idom[n] = newIdom;
        changed = true;
      }
    }
  }

  const children: number[][] = Array.from({ length: nodes.length }, () => []);
  for (let i = 0; i < idom.length; i++) {
    const dom = idom[i];
    if (i !== root && dom !== -1) {
      children[dom].push(i);
    }
  }

  const retained: number[] = new Array(nodes.length).fill(0);
  const calc = (idx: number): number => {
    let size = nodes[idx].self_size || 0;
    for (const c of children[idx]) {
      size += calc(c);
    }
    retained[idx] = size;
    return size;
  };
  calc(root);

  return retained;
}

export interface AnalysisNode {
  name: string;
  type: string;
  self_size: number;
  retained_size?: number;
}

export interface AnalysisResult {
  totalSize: number;
  nodeCount: number;
  topNodes: AnalysisNode[];
  heavyClosures: AnalysisNode[];
  largeArrays: AnalysisNode[];
}

export function analyzeSnapshot(snapshotPath: string): AnalysisResult {
  const snapshotData = fs.readFileSync(snapshotPath, 'utf8');
  const snapshot = parse(snapshotData) as any;
  const nodes: any[] = snapshot.nodes || [];
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].index = i;
  }

  const retainedSizes = computeRetainedSizes(nodes);

  let totalSize = 0;
  for (const n of nodes) {
    totalSize += n.self_size || 0;
  }

  const sorted = [...nodes].sort((a, b) => (b.self_size || 0) - (a.self_size || 0));
  const topNodes = sorted.slice(0, 10).map(n => ({
    name: n.name,
    type: n.type,
    self_size: n.self_size,
    retained_size: retainedSizes[n.index]
  }));

  const heavyClosures = nodes
    .filter(n => n.type === 'Closure' && n.self_size > HEAVY_CLOSURE_THRESHOLD)
    .map(n => ({
      name: n.name,
      type: n.type,
      self_size: n.self_size,
      retained_size: retainedSizes[n.index]
    }));

  const largeArrays = nodes
    .filter(n => /Array|Buffer/.test(n.type) && n.self_size > LARGE_ARRAY_THRESHOLD)
    .map(n => ({
      name: n.name,
      type: n.type,
      self_size: n.self_size,
      retained_size: retainedSizes[n.index]
    }));

  return {
    totalSize,
    nodeCount: nodes.length,
    topNodes,
    heavyClosures,
    largeArrays
  };
}
