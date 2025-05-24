const express = require('express');
const si = require('systeminformation');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.static('public'));
const DATA_PATH = path.join(__dirname, 'data.json');

// Serve JSON metrics for Grafana
app.get('/metrics', async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const gpu = await si.graphics();
    const time = new Date().toISOString();

    const metrics = {
      time,
      cpuLoadPercent: cpu.currentLoad.toFixed(1),
      totalMemGB: (mem.total / (1024 ** 3)).toFixed(2),
      usedMemGB: (mem.used / (1024 ** 3)).toFixed(2),
      memUsagePercent: ((mem.used / mem.total) * 100).toFixed(1),
      gpuName: gpu.controllers[0]?.model || 'Unknown',
      gpuUsagePercent: gpu.controllers[0]?.utilizationGpu || 0, // <-- GPU usage %
    };

    // Read existing data
    let data = [];
    if (fs.existsSync(DATA_PATH)) {
      const fileContent = fs.readFileSync(DATA_PATH);
      try {
        const parsed = JSON.parse(fileContent);
        data = Array.isArray(parsed) ? parsed : [];
      } catch {
        data = [];
      }
    }
    // Append new metrics
    data.push(metrics);
    // Keep only the last 100 records (optional)
    if (data.length > 100) data.shift();

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(PORT, () => console.log(`Metrics API running at http://localhost:${PORT}/metrics`));
