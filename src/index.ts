import { program } from 'commander';
import path from 'path';
import { analyzeSnapshot } from './analyzer';
import { compareSnapshots } from './comparer';
import { writeAnalysis, writeComparison } from './reporter';

program
  .name('heapdump-analyzer')
  .description('Analyze Node.js heap snapshots');

program
  .command('analyze <snapshot>')
  .description('Analyze a heap snapshot')
  .action((snapshot) => {
    const result = analyzeSnapshot(snapshot);
    const baseName = path.basename(snapshot, path.extname(snapshot));
    writeAnalysis(result, path.join('output'), baseName);
    console.log('Analysis written for', snapshot);
  });

program
  .command('compare <oldSnapshot> <newSnapshot>')
  .description('Compare two heap snapshots')
  .action((oldSnapshot, newSnapshot) => {
    const oldRes = analyzeSnapshot(oldSnapshot);
    const newRes = analyzeSnapshot(newSnapshot);
    const comparison = compareSnapshots(oldRes, newRes);
    const baseName = path.basename(newSnapshot, path.extname(newSnapshot)) + '-diff';
    writeComparison(comparison, path.join('output'), baseName);
    console.log('Comparison written for snapshots');
  });

program.parse();
