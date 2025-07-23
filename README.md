


## Project Title
**Heapdump Analyzer Tool**

## Overview
The Heapdump Analyzer Tool is a Node.js-based (Typescript) utility designed to parse `.heapsnapshot` files generated from V8 (Node.js) and extract meaningful memory usage data. The tool will identify object types consuming the most memory, track the growth of memory usage over time by comparing snapshots, and help detect potential memory leaks. This tool is primarily used by developers and SREs for debugging and performance tuning.

## Goals
- Automatically parse `.heapsnapshot` files stored in a `/dumps` folder.
- Extract useful data such as:
  - Total memory usage
  - Top object types by count and memory usage
  - Closures retaining large state
  - Arrays and buffers larger than defined thresholds
  - Retainer chains
- Detect memory growth patterns between snapshots.
- Output human-readable reports and machine-readable JSON summaries.

## Architecture

### Directory Structure
```
heapdump-analyzer/
├── dumps/               # Folder containing .heapsnapshot files
├── output/              # Folder for reports and summary JSONs
├── src/
│   ├── index.ts         # Entry point
│   ├── analyzer.ts      # Core analysis logic
│   ├── comparer.ts      # Snapshot comparison logic
│   ├── reporter.ts      # Formatting and output
│   └── utils.ts         # Shared utility functions
├── config.ts            # Thresholds and settings
└── package.json
```

## Key Features

### 1. Snapshot Parsing
- Uses `heapsnapshot-parser` to convert `.heapsnapshot` into a usable data structure.
- Collects and indexes nodes by:
  - Type
  - Name
  - Self size

### 2. Analysis Output
- Top 10 largest objects by `self_size`
- Top user-defined objects and function closures
- Objects with long retainer chains (depth > N)
- Large buffers and arrays (threshold: 50 KB default)
- Closures retaining > 100 KB

### 3. Snapshot Comparison
- Compares two selected snapshots by:
  - Object counts by name/type
  - Total memory usage
  - Differences in large objects, buffers, and closures
- Outputs diffs and growth trends

### 4. Report Generation
- Text summary saved as `.txt`
- JSON summary with metadata, object stats, diffs
- Optional CSV output for import into Excel/Sheets

## Configurability

```ts
// config.ts
export const HEAVY_CLOSURE_THRESHOLD = 100 * 1024; // 100 KB
export const LARGE_ARRAY_THRESHOLD = 50 * 1024;    // 50 KB
export const DEEP_CHAIN_DEPTH = 5;
```

## CLI Interface (optional)
```bash
heapdump-analyzer --analyze dumps/heap-123.heapsnapshot
heapdump-analyzer --compare dumps/heap-123.heapsnapshot dumps/heap-456.heapsnapshot
```

## Future Enhancements
- Visual output (charts via web UI or CLI)
- Integration with Prometheus or OpenTelemetry for alerts
- Auto-tagging of leaks by module or function
- Export to flamegraph-compatible format

## Notes
- The tool does **not** compute `retainedSize` unless dominator tree traversal is implemented.
- Will document the blocking nature of `v8.getHeapSnapshot()` for snapshot producers.

## Target Users
- Node.js backend developers
- Site Reliability Engineers (SREs)
- DevOps and platform engineers

## License
MIT or internal company license

---

_End of Document_
"""

# Save the markdown file
output_path = Path("/mnt/data/heapdump-analyzer-spec.md")
output_path.write_text(markdown_content)

output_path.name
