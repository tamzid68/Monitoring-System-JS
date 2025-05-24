const express = require('express');
const si = require('systeminformation');
const app = express();
const port = 3000;

app.use(express.static('public'));


app.get('/api/system', async (req, res) => {
    try {
        const cpu = await si.currentLoad();
        const memory = await si.mem();
        const gpu = await si.graphics();
        const processes = await si.processes();

        res.json({
            cpuLoad: cpu.currentLoad.toFixed(2), // % CPU
            memory: {
                total: memory.total,
                used: memory.used,
                percentUsed: ((memory.used / memory.total) * 100).toFixed(2)
            },
            gpu: gpu.controllers[0] || { vendor: "N/A", model: "N/A" },
            processCount: processes.all
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});