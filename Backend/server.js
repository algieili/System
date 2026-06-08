const express = require("express");
const cors    = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* ── GET /api/machines ── */
app.get("/api/machines", async (req, res) => {
  const { data, error } = await supabase.from("machines").select("*");
  if (error) return res.status(500).json({ error: error.message });

  // Convert array to object keyed by id
  const result = {};
  data.forEach(m => {
    result[m.id] = {
      id: m.id, machineId: m.machine_id, name: m.name,
      taskSize: m.task_size, bandwidth: m.bandwidth,
      processingTime: m.processing_time, queueLength: m.queue_length,
      cpuUtilization: m.cpu_utilization, memoryUsage: m.memory_usage,
      transmissionDelay: m.transmission_delay,
      energyConsumption: m.energy_consumption,
      throughput: m.throughput, avgLatency: m.avg_latency,
      category: m.category, taskType: m.task_type
    };
  });
  res.json(result);
});

/* ── POST /api/gbfs ── */
app.post("/api/gbfs", (req, res) => {
  const m = req.body.machine;
  const latency     = +(m.avgLatency * 0.90 + m.transmissionDelay * 0.5 + Math.random() * 3).toFixed(2);
  const throughput  = +(m.throughput  * 0.88 + Math.random() * 1).toFixed(2);
  const energy      = +(m.energyConsumption * 0.90 + Math.random() * 0.1).toFixed(2);
  const utilization = +(m.cpuUtilization * 0.88 + Math.random() * 3).toFixed(2);
  const time        = +(latency + m.transmissionDelay).toFixed(2);
  const remark      = latency < 80 ? "Excellent" : latency < 100 ? "Good" : "Moderate";
  res.json({ latency, throughput, energy, utilization, time, remark });
});

/* ── POST /api/pso ── */
app.post("/api/pso", (req, res) => {
  const m = req.body.machine;
  const latency     = +(m.avgLatency * 0.82 + m.transmissionDelay * 0.4 + Math.random() * 3).toFixed(2);
  const throughput  = +(m.throughput  * 0.95 + Math.random() * 1).toFixed(2);
  const energy      = +(m.energyConsumption * 0.82 + Math.random() * 0.1).toFixed(2);
  const utilization = +(m.cpuUtilization * 0.80 + Math.random() * 3).toFixed(2);
  const time        = +(latency + m.transmissionDelay * 0.9).toFixed(2);
  const remark      = latency < 80 ? "Excellent" : latency < 100 ? "Good" : "Moderate";
  res.json({ latency, throughput, energy, utilization, time, remark });
});

/* ── POST /api/offload ── */
app.post("/api/offload", async (req, res) => {
  const { machineId, taskSize, algorithm, targetServer, gbfsLatency, psoLatency } = req.body;
  const measuredLatency = +(Math.min(gbfsLatency, psoLatency) * (0.95 + Math.random() * 0.1)).toFixed(2);

  // Save to Supabase
  const { error } = await supabase.from("simulation_logs").insert({
    machine_id: machineId, task_size: taskSize,
    algorithm, target_server: targetServer,
    gbfs_latency: gbfsLatency, pso_latency: psoLatency,
    measured_latency: measuredLatency, status: "success"
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: "success", measuredLatency });
});

app.listen(3001, () => console.log("Server running on port 3001"));
