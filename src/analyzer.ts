import fs from 'fs';
import { parse } from 'heapsnapshot-parser';
import { HEAVY_CLOSURE_THRESHOLD, LARGE_ARRAY_THRESHOLD } from '../config';

export interface AnalysisNode {
  name: string;
  type: string;
  self_size: number;
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

  let totalSize = 0;
  for (const n of nodes) {
    totalSize += n.self_size || 0;
  }

  const sorted = [...nodes].sort((a, b) => (b.self_size || 0) - (a.self_size || 0));
  const topNodes = sorted.slice(0, 10).map(n => ({
    name: n.name,
    type: n.type,
    self_size: n.self_size
  }));

  const heavyClosures = nodes
    .filter(n => n.type === 'Closure' && n.self_size > HEAVY_CLOSURE_THRESHOLD)
    .map(n => ({ name: n.name, type: n.type, self_size: n.self_size }));

  const largeArrays = nodes
    .filter(n => /Array|Buffer/.test(n.type) && n.self_size > LARGE_ARRAY_THRESHOLD)
    .map(n => ({ name: n.name, type: n.type, self_size: n.self_size }));

  return {
    totalSize,
    nodeCount: nodes.length,
    topNodes,
    heavyClosures,
    largeArrays
  };
}
