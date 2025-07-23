import { program } from 'commander';
import path from 'path';
import { analyzeSnapshot } from './analyzer';
import { compareSnapshots } from './comparer';
import { writeAnalysis, writeComparison } from './reporter';
import { startServer } from './server';

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

program
  .command('serve <analysisJson>')
  .description('Serve web UI for an analysis JSON file')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .action((analysisJson, options) => {
    const port = parseInt(options.port, 10);
    startServer(analysisJson, port);
  });

program.parse();
