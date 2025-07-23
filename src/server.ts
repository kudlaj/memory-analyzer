import express from 'express';
import fs from 'fs';
import { AnalysisResult } from './analyzer';

export function startServer(jsonPath: string, port: number = 3000) {
  const app = express();

  app.get('/data', (_req, res) => {
    const data: AnalysisResult = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    res.json(data);
  });

  app.get('/', (_req, res) => {
    res.send(`<!doctype html>
<html>
<head>
  <title>Heap Analysis</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>Top Nodes</h1>
  <canvas id="chart"></canvas>
  <script>
    fetch('/data').then(r => r.json()).then(data => {
      const ctx = document.getElementById('chart').getContext('2d');
      const labels = data.topNodes.map(n => n.name);
      const sizes = data.topNodes.map(n => n.self_size);
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Self Size',
            data: sizes,
            backgroundColor: 'rgba(75, 192, 192, 0.5)'
          }]
        }
      });
    });
  </script>
</body>
</html>`);
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
