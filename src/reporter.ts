import fs from 'fs';
import path from 'path';
import { AnalysisResult } from './analyzer';
import { ComparisonResult } from './comparer';
import { formatBytes } from './utils';

export function writeAnalysis(result: AnalysisResult, outDir: string, baseName: string) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const textLines: string[] = [];
  textLines.push(`Total Size: ${formatBytes(result.totalSize)}`);
  textLines.push(`Node Count: ${result.nodeCount}`);
  textLines.push('Top Nodes:');
  for (const n of result.topNodes) {
    textLines.push(`  ${n.type} ${n.name} - ${formatBytes(n.self_size)}`);
  }
  if (result.heavyClosures.length) {
    textLines.push('Heavy Closures:');
    for (const n of result.heavyClosures) {
      textLines.push(`  ${n.name} - ${formatBytes(n.self_size)}`);
    }
  }
  if (result.largeArrays.length) {
    textLines.push('Large Arrays/Buffers:');
    for (const n of result.largeArrays) {
      textLines.push(`  ${n.type} ${n.name} - ${formatBytes(n.self_size)}`);
    }
  }

  fs.writeFileSync(path.join(outDir, baseName + '.txt'), textLines.join('\n'));
  fs.writeFileSync(
    path.join(outDir, baseName + '.json'),
    JSON.stringify(result, null, 2)
  );
}

export function writeComparison(result: ComparisonResult, outDir: string, baseName: string) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const textLines: string[] = [];
  textLines.push(`Size Difference: ${formatBytes(result.sizeDiff)}`);
  textLines.push(`Node Count Difference: ${result.countDiff}`);

  fs.writeFileSync(path.join(outDir, baseName + '.txt'), textLines.join('\n'));
  fs.writeFileSync(
    path.join(outDir, baseName + '.json'),
    JSON.stringify(result, null, 2)
  );
}
