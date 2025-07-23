import { AnalysisResult, AnalysisNode } from './analyzer';

export interface ComparisonResult {
  sizeDiff: number;
  countDiff: number;
  newTopNodes: AnalysisNode[];
}

export function compareSnapshots(oldSnap: AnalysisResult, newSnap: AnalysisResult): ComparisonResult {
  const sizeDiff = newSnap.totalSize - oldSnap.totalSize;
  const countDiff = newSnap.nodeCount - oldSnap.nodeCount;
  return {
    sizeDiff,
    countDiff,
    newTopNodes: newSnap.topNodes
  };
}
