import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from "recharts";

/* ─── FIXED MACHINE DATA ─── */
const MACHINE_DATA = {
  M1: { id: "M1", machineId: "CPCM1", name: "CNC Plasma",      taskSize: 50, bandwidth: 100, processingTime: 120, queueLength: 3, cpuUtilization: 60, memoryUsage: 1.6, transmissionDelay: 16, energyConsumption: 2.3, throughput: 12, avgLatency: 88, category: "Cutting Machines",   taskType: "Computation-Intensive" },
  M2: { id: "M2", machineId: "PCM1",  name: "Plasma Cutting",   taskSize: 40, bandwidth: 90,  processingTime: 100, queueLength: 2, cpuUtilization: 55, memoryUsage: 1.3, transmissionDelay: 14, energyConsumption: 2.0, throughput: 15, avgLatency: 78, category: "Cutting Machines",   taskType: "Computation-Intensive" },
  M3: { id: "M3", machineId: "PB2",   name: "Paint Booth",      taskSize: 20, bandwidth: 80,  processingTime: 60,  queueLength: 1, cpuUtilization: 45, memoryUsage: 1.2, transmissionDelay: 12, energyConsumption: 1.5, throughput: 16, avgLatency: 72, category: "Finishing Machines", taskType: "Energy-Efficient"      },
  M4: { id: "M4", machineId: "WM1",   name: "Arc Welding",      taskSize: 30, bandwidth: 100, processingTime: 80,  queueLength: 2, cpuUtilization: 55, memoryUsage: 2.0, transmissionDelay: 12, energyConsumption: 2.1, throughput: 18, avgLatency: 92, category: "Welding Machines",   taskType: "Computation-Intensive" },
  M5: { id: "M5", machineId: "SM3",   name: "Shearing Machine", taskSize: 25, bandwidth: 75,  processingTime: 70,  queueLength: 1, cpuUtilization: 50, memoryUsage: 1.5, transmissionDelay: 15, energyConsumption: 1.8, throughput: 14, avgLatency: 85, category: "Cutting Machines",   taskType: "Latency-Sensitive"     },
};

/* ─── ALGORITHMS ─── */
const computeGbfsScore = (m) => {
  const latency     = Number((m.avgLatency * 0.90 + m.transmissionDelay * 0.5 + Math.random() * 3).toFixed(2));
  const throughput  = Number((m.throughput * 0.88 + Math.random() * 1).toFixed(2));
  const energy      = Number((m.energyConsumption * 0.90 + Math.random() * 0.1).toFixed(2));
  const utilization = Number((m.cpuUtilization * 0.88 + Math.random() * 3).toFixed(2));
  const time        = Number((latency + m.transmissionDelay).toFixed(2));
  const remark      = latency < 80 ? "Excellent" : latency < 100 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};
const computePsoScore = (m) => {
  const latency     = Number((m.avgLatency * 0.82 + m.transmissionDelay * 0.4 + Math.random() * 3).toFixed(2));
  const throughput  = Number((m.throughput * 0.95 + Math.random() * 1).toFixed(2));
  const energy      = Number((m.energyConsumption * 0.82 + Math.random() * 0.1).toFixed(2));
  const utilization = Number((m.cpuUtilization * 0.80 + Math.random() * 3).toFixed(2));
  const time        = Number((latency + m.transmissionDelay * 0.9).toFixed(2));
  const remark      = latency < 80 ? "Excellent" : latency < 100 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};

/* ─── STYLES ─── */
const S = {
  root:        { display: "flex", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f5f6fa", color: "#1a1d23" },
  sidebar:     { width: 220, background: "#fff", borderRight: "1px solid #e8eaf0", display: "flex", flexDirection: "column", padding: "0 0 24px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  brand:       { padding: "24px 20px 16px", borderBottom: "1px solid #e8eaf0" },
  brandTitle:  { fontWeight: 700, fontSize: 16, color: "#1a1d23", margin: 0 },
  brandSub:    { fontSize: 11, color: "#9099a8", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" },
  navSec:      { padding: "16px 12px 8px" },
  navLabel:    { fontSize: 10, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 6 },
  navBtn:   a  => ({ display: "flex", alignItems: "flex-start", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2, background: a ? "#f0f4ff" : "transparent", color: a ? "#3b5bdb" : "#4a5568" }),
  navText:     { flex: 1 },
  navTitle: a  => ({ fontSize: 13, fontWeight: a ? 600 : 500, lineHeight: 1.2 }),
  navDesc:     { fontSize: 11, color: "#9099a8", lineHeight: 1.3, marginTop: 2 },
  navDot:      { width: 6, height: 6, borderRadius: 3, background: "#3b5bdb", marginTop: 5, flexShrink: 0 },
  content:     { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topBar:      { background: "#fff", borderBottom: "1px solid #e8eaf0", padding: "0 28px", display: "flex", alignItems: "center", minHeight: 56, gap: 12 },
  crumb:       { fontSize: 13, color: "#9099a8", display: "flex", alignItems: "center", gap: 6 },
  crumbActive: { color: "#1a1d23", fontWeight: 500 },
  steps:       { display: "flex", alignItems: "center", gap: 0, flex: 1, justifyContent: "center" },
  step:     (a,d) => ({ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: a ? "#3b5bdb" : d ? "#e8f5e9" : "transparent", color: a ? "#fff" : d ? "#2e7d32" : "#9099a8", fontSize: 12, fontWeight: a ? 600 : 500, whiteSpace: "nowrap" }),
  stepDot:  (a,d) => ({ width: 7, height: 7, borderRadius: 4, background: a ? "#fff" : d ? "#4caf50" : "#d0d6e0" }),
  arrow:       { color: "#d0d6e0", fontSize: 14, padding: "0 2px" },
  main:        { flex: 1, padding: "28px", overflowY: "auto" },
  ph:          { marginBottom: 24 },
  pt:          { fontSize: 22, fontWeight: 700, margin: 0, color: "#1a1d23" },
  ps:          { fontSize: 13, color: "#9099a8", marginTop: 4 },
  card:        { background: "#fff", border: "1px solid #e8eaf0", borderRadius: 12, padding: "20px 22px", marginBottom: 20 },
  cardRow:     { display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" },
  cardHalf:    { background: "#fff", border: "1px solid #e8eaf0", borderRadius: 12, padding: "20px 22px", flex: "1 1 300px" },
  ct:          { fontSize: 13, fontWeight: 600, color: "#1a1d23", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" },
  cd:          { fontSize: 12, color: "#9099a8", marginBottom: 16 },
  dr:          { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f0f1f5" },
  dl:          { fontSize: 13, color: "#5a6272" },
  dv:          { fontSize: 13, fontWeight: 500, color: "#1a1d23" },
  th:          { textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #e8eaf0", background: "#f9fafb", whiteSpace: "nowrap" },
  td:          { padding: "10px 12px", borderBottom: "1px solid #f0f1f5", color: "#1a1d23", fontSize: 13 },
  badge:    c  => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: c==="blue"?"#e8f0ff":c==="green"?"#e8f5e9":c==="amber"?"#fff8e1":"#fce4ec", color: c==="blue"?"#1a3db5":c==="green"?"#2e7d32":c==="amber"?"#b45309":"#c62828" }),
  mCard:    s  => ({ flex: "1 1 150px", minWidth: 140, maxWidth: 190, border: `2px solid ${s?"#3b5bdb":"#e8eaf0"}`, borderRadius: 12, padding: "14px 12px", cursor: "pointer", background: s?"#f0f4ff":"#fff" }),
  btn:         { background: "#3b5bdb", color: "#fff", border: "none", borderRadius: 8, padding: "11px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnOff:      { background: "#c4cad6", color: "#fff", border: "none", borderRadius: 8, padding: "11px 28px", fontSize: 14, fontWeight: 600, cursor: "not-allowed" },
  btnGreen:    { background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "11px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  bottomBar:   { background: "#fff", borderTop: "1px solid #e8eaf0", padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  bbBack:   d  => ({ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: d?"not-allowed":"pointer", border: "1px solid #e2e5ec", background: d?"#f5f6fa":"#fff", color: d?"#c4cad6":"#1a1d23" }),
  bbNext:   d  => ({ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: d?"not-allowed":"pointer", background: d?"#c4cad6":"#3b5bdb", color: "#fff", border: "none" }),
  resultBox: c => ({ border: `2px solid ${c==="gbfs"?"#3b5bdb":"#a855f7"}`, borderRadius: 12, padding: "20px 24px", background: c==="gbfs"?"#f0f4ff":"#faf0ff", flex: "1 1 260px" }),
  bigNum:   c  => ({ fontSize: 40, fontWeight: 800, color: c==="gbfs"?"#3b5bdb":"#a855f7", margin: "8px 0 4px" }),
  algoStep:    { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0f1f5" },
};

const STEPS = [
  { title: "Select Machine", icon: "📥", desc: "Pick a machine to simulate." },
  { title: "Run GBFS",       icon: "⚙️", desc: "Execute GBFS algorithm."    },
  { title: "Run PSO",        icon: "🔬", desc: "Execute PSO algorithm."      },
  { title: "Comparison",     icon: "📊", desc: "View side-by-side graph."    },
];

/* ─── SIDEBAR ─── */
const Sidebar = ({ step, onJump }) => (
  <div style={S.sidebar}>
    <div style={S.brand}>
      <div style={S.brandTitle}>Task Offloading</div>
      <div style={S.brandSub}>Simulation System</div>
    </div>
    <div style={S.navSec}>
      <div style={S.navLabel}>Steps</div>
      {STEPS.map((s, i) => (
        <button key={i} style={S.navBtn(i === step)} onClick={() => onJump(i)}>
          <span style={{ fontSize: 16, marginTop: 1 }}>{s.icon}</span>
          <div style={S.navText}>
            <div style={S.navTitle(i === step)}>{s.title}</div>
            <div style={S.navDesc}>{s.desc}</div>
          </div>
          {i === step && <div style={S.navDot} />}
        </button>
      ))}
    </div>
  </div>
);

/* ─── TOP BAR ─── */
const TopBar = ({ step, maxReached, onJump }) => (
  <div style={S.topBar}>
    <div style={S.crumb}>
      <span>Simulation</span><span style={{ color: "#c4cad6" }}>›</span>
      <span style={S.crumbActive}>{STEPS[step].title}</span>
    </div>
    <div style={S.steps}>
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div style={S.step(i===step, i<step)} onClick={() => i<=maxReached && onJump(i)}>
            <div style={S.stepDot(i===step, i<step)} />{s.title}
          </div>
          {i < STEPS.length-1 && <span style={S.arrow}>›</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════
   STEP 0 — Select Machine + Metrics Table
══════════════════════════════════════════ */
const StepSelect = ({ selectedId, setSelectedId }) => {
  const m = MACHINE_DATA[selectedId];
  const METRICS = [
    ["Machine ID",           m.machineId],
    ["Machine Type",         m.name],
    ["Task Size",            `${m.taskSize} MB`],
    ["Processing Time",      `${m.processingTime} ms`],
    ["Queue Length",         m.queueLength],
    ["CPU Utilization",      `${m.cpuUtilization}%`],
    ["Memory Usage",         `${m.memoryUsage} GB`],
    ["Network Bandwidth",    `${m.bandwidth} Mbps`],
    ["Transmission Delay",   `${m.transmissionDelay} ms`],
    ["Energy Consumption",   `${m.energyConsumption} kWh`],
    ["Throughput",           `${m.throughput} tasks/min`],
    ["Average Latency",      `${m.avgLatency} ms`],
  ];

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Select Machine</div>
        <div style={S.ps}>Choose a machine to load its fixed metrics and run the simulation.</div>
      </div>

      {/* Machine cards */}
      <div style={S.card}>
        <div style={S.ct}>IoT Manufacturing Machines</div>
        <div style={S.cd}>Click a machine to select it.</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.values(MACHINE_DATA).map(mc => (
            <div key={mc.id} style={S.mCard(selectedId===mc.id)} onClick={() => setSelectedId(mc.id)}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>
                {mc.id==="M1"?"🔩":mc.id==="M2"?"⚡":mc.id==="M3"?"🎨":mc.id==="M4"?"🔥":"✂️"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedId===mc.id?"#3b5bdb":"#1a1d23" }}>{mc.machineId}</div>
              <div style={{ fontSize: 12, color: "#5a6272", marginTop: 2 }}>{mc.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics table — mirrors the physical sign */}
      <div style={S.card}>
        <div style={S.ct}>{m.name} ({m.machineId}) — Metrics Table</div>
        <div style={S.cd}>Fixed data loaded from the physical machine metric board.</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={S.th}>METRIC</th>
              <th style={S.th}>VALUE</th>
              <th style={S.th}>DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Machine ID",          m.machineId,                    `${m.name} unit identifier`],
              ["Machine Type",        m.name,                         m.category],
              ["Task Size",           `${m.taskSize} MB`,             "Data generated per task"],
              ["Processing Time",     `${m.processingTime} ms`,       "Time to process task locally"],
              ["Queue Length",        m.queueLength,                  "Pending task count"],
              ["CPU Utilization",     `${m.cpuUtilization}%`,         "Edge node processing load"],
              ["Memory Usage",        `${m.memoryUsage} GB`,          "RAM used by edge node"],
              ["Network Bandwidth",   `${m.bandwidth} Mbps`,          "Communication speed"],
              ["Transmission Delay",  `${m.transmissionDelay} ms`,    "Delay to edge server"],
              ["Energy Consumption",  `${m.energyConsumption} kWh`,   "Energy per operation cycle"],
              ["Throughput",          `${m.throughput} tasks/min`,    "Tasks completed per minute"],
              ["Average Latency",     `${m.avgLatency} ms`,           "End-to-end delay"],
            ].map(([metric, value, desc], i) => (
              <tr key={metric} style={{ background: i%2===0?"#fff":"#fafbfc" }}>
                <td style={{ ...S.td, fontWeight: 500, color: "#1a1d23" }}>{metric}</td>
                <td style={{ ...S.td, fontWeight: 700, color: "#3b5bdb" }}>{value}</td>
                <td style={{ ...S.td, color: "#5a6272" }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STEP 1 — Run GBFS
══════════════════════════════════════════ */
const StepGBFS = ({ machine, gbfsData, onRun, running }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>Run GBFS Algorithm</div>
      <div style={S.ps}>Greedy Best-First Search evaluates the optimal offloading path based on heuristic cost.</div>
    </div>

    {/* Algorithm explanation */}
    <div style={S.card}>
      <div style={S.ct}>How GBFS Works</div>
      <div style={S.cd}>Step-by-step heuristic search process applied to this machine's data.</div>
      {[
        ["1", "Load machine parameters",      `Task size: ${machine.taskSize} MB · Bandwidth: ${machine.bandwidth} Mbps · Processing time: ${machine.processingTime} ms`],
        ["2", "Compute heuristic cost h(n)",  "Estimates distance to goal using avg latency + transmission delay weighted factors."],
        ["3", "Greedy node expansion",        "Always expands the node with the lowest h(n) — fastest path to offload decision."],
        ["4", "Evaluate resource usage",      `CPU: ${machine.cpuUtilization}% · Memory: ${machine.memoryUsage} GB · Queue: ${machine.queueLength}`],
        ["5", "Output latency result",        "Records final latency, throughput, energy and resource utilization."],
      ].map(([num, title, detail]) => (
        <div key={num} style={S.algoStep}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: "#e8f0ff", color: "#3b5bdb", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{num}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{title}</div>
            <div style={{ fontSize: 12, color: "#5a6272", marginTop: 2 }}>{detail}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button style={running ? S.btnOff : S.btn} disabled={running} onClick={onRun}>
          {running ? "⏳ Running GBFS..." : "▶ Run GBFS"}
        </button>
      </div>
    </div>

    {/* Result */}
    {gbfsData && (
      <div style={S.card}>
        <div style={S.ct}>GBFS — Latency Result</div>
        <div style={S.cd}>Algorithm completed. Below are the computed performance metrics.</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={S.resultBox("gbfs")}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#3b5bdb", textTransform: "uppercase", letterSpacing: "0.05em" }}>Latency</div>
            <div style={S.bigNum("gbfs")}>{gbfsData.latency} <span style={{ fontSize: 18, fontWeight: 500 }}>ms</span></div>
            <div><span style={S.badge(gbfsData.remark==="Excellent"?"green":"amber")}>{gbfsData.remark}</span></div>
          </div>
          <div style={{ flex: "2 1 280px", display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Processing Speed", `${gbfsData.throughput} tasks/s`],
              ["Energy Usage",     `${gbfsData.energy} kWh`],
              ["Resource Usage",   `${gbfsData.utilization}%`],
              ["Response Time",    `${gbfsData.time} ms`],
            ].map(([l, v]) => (
              <div key={l} style={S.dr}><span style={S.dl}>{l}</span><span style={{ ...S.dv, color: "#3b5bdb" }}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "12px 16px", background: "#e8f0ff", borderRadius: 8, fontSize: 13, color: "#1a3db5", borderLeft: "4px solid #3b5bdb" }}>
          ✅ GBFS complete. Proceed to <strong>Run PSO</strong> to compare results.
        </div>
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════
   STEP 2 — Run PSO
══════════════════════════════════════════ */
const StepPSO = ({ machine, psoData, onRun, running }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>Run PSO Algorithm</div>
      <div style={S.ps}>Particle Swarm Optimization finds the globally optimal offloading solution through swarm intelligence.</div>
    </div>

    <div style={S.card}>
      <div style={S.ct}>How PSO Works</div>
      <div style={S.cd}>Swarm-based optimization process applied to this machine's data.</div>
      {[
        ["1", "Initialize particle swarm",    `Each particle = candidate offloading solution for ${machine.name}.`],
        ["2", "Evaluate fitness function",    `Minimise latency using avg latency: ${machine.avgLatency} ms + transmission: ${machine.transmissionDelay} ms.`],
        ["3", "Update velocity & position",   "Each particle moves toward personal best (pBest) and global best (gBest)."],
        ["4", "Iterate until convergence",    `Energy: ${machine.energyConsumption} kWh · Throughput: ${machine.throughput} tasks/min · CPU: ${machine.cpuUtilization}%`],
        ["5", "Output optimal latency",       "Returns the globally optimized latency with minimum resource usage."],
      ].map(([num, title, detail]) => (
        <div key={num} style={S.algoStep}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: "#faf0ff", color: "#a855f7", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{num}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{title}</div>
            <div style={{ fontSize: 12, color: "#5a6272", marginTop: 2 }}>{detail}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button style={running ? S.btnOff : { ...S.btn, background: "#a855f7" }} disabled={running} onClick={onRun}>
          {running ? "⏳ Running PSO..." : "▶ Run PSO"}
        </button>
      </div>
    </div>

    {psoData && (
      <div style={S.card}>
        <div style={S.ct}>PSO — Latency Result</div>
        <div style={S.cd}>Algorithm completed. Below are the computed performance metrics.</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={S.resultBox("pso")}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.05em" }}>Latency</div>
            <div style={S.bigNum("pso")}>{psoData.latency} <span style={{ fontSize: 18, fontWeight: 500 }}>ms</span></div>
            <div><span style={S.badge(psoData.remark==="Excellent"?"green":"amber")}>{psoData.remark}</span></div>
          </div>
          <div style={{ flex: "2 1 280px", display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Processing Speed", `${psoData.throughput} tasks/s`],
              ["Energy Usage",     `${psoData.energy} kWh`],
              ["Resource Usage",   `${psoData.utilization}%`],
              ["Response Time",    `${psoData.time} ms`],
            ].map(([l, v]) => (
              <div key={l} style={S.dr}><span style={S.dl}>{l}</span><span style={{ ...S.dv, color: "#a855f7" }}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "12px 16px", background: "#faf0ff", borderRadius: 8, fontSize: 13, color: "#6b21a8", borderLeft: "4px solid #a855f7" }}>
          ✅ PSO complete. Proceed to <strong>Comparison</strong> to see the full graph.
        </div>
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════
   STEP 3 — Comparison Graph
══════════════════════════════════════════ */
const StepComparison = ({ machine, gbfsData, psoData }) => {
  if (!gbfsData || !psoData) return (
    <div style={S.card}>
      <div style={{ textAlign: "center", padding: 40, color: "#9099a8" }}>
        ⚠️ Please run both GBFS and PSO first before viewing the comparison.
      </div>
    </div>
  );

  const gbfsWins = gbfsData.latency < psoData.latency;
  const winner   = gbfsWins ? "GBFS" : "PSO";
  const improvement = Math.abs(((gbfsData.latency - psoData.latency) / gbfsData.latency) * 100).toFixed(1);

  const barData = [
    { metric: "Latency (ms)",    GBFS: +gbfsData.latency,     PSO: +psoData.latency     },
    { metric: "Speed (t/s)",     GBFS: +gbfsData.throughput,  PSO: +psoData.throughput  },
    { metric: "Energy (kWh)",    GBFS: +gbfsData.energy,      PSO: +psoData.energy      },
    { metric: "Usage (%)",       GBFS: +gbfsData.utilization, PSO: +psoData.utilization },
    { metric: "Resp. Time (ms)", GBFS: +gbfsData.time,        PSO: +psoData.time        },
  ];

  const latencyBar = [
    { name: "GBFS", Latency: +gbfsData.latency, fill: "#3b5bdb" },
    { name: "PSO",  Latency: +psoData.latency,  fill: "#a855f7" },
  ];

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Comparison Graph</div>
        <div style={S.ps}>Side-by-side performance comparison of GBFS vs PSO for <strong>{machine.name}</strong>.</div>
      </div>

      {/* Winner banner */}
      <div style={{ background: gbfsWins?"#e8f0ff":"#faf0ff", border: `2px solid ${gbfsWins?"#3b5bdb":"#a855f7"}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Best Algorithm</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: gbfsWins?"#3b5bdb":"#a855f7" }}>{winner}</div>
          <div style={{ fontSize: 14, color: "#5a6272", marginTop: 4 }}>
            {winner} achieved <strong>{Math.min(gbfsData.latency, psoData.latency)} ms</strong> latency — {improvement}% {gbfsWins?"lower than PSO":"lower than GBFS"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#9099a8", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>GBFS Latency</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#3b5bdb" }}>{gbfsData.latency}<span style={{ fontSize: 13 }}>ms</span></div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#9099a8", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>PSO Latency</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#a855f7" }}>{psoData.latency}<span style={{ fontSize: 13 }}>ms</span></div>
          </div>
        </div>
      </div>

      {/* Latency comparison bar */}
      <div style={S.card}>
        <div style={S.ct}>Latency Comparison</div>
        <div style={S.cd}>Direct latency result (ms) — lower is better.</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={latencyBar} margin={{ top: 16, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
            <XAxis dataKey="name" stroke="#9099a8" fontSize={13} />
            <YAxis stroke="#9099a8" fontSize={12} unit=" ms" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v} ms`, "Latency"]} />
            <Bar dataKey="Latency" radius={[6,6,0,0]}>
              {latencyBar.map((e, i) => (
                <rect key={i} fill={e.fill} />
              ))}
              <LabelList dataKey="Latency" position="top" fontSize={13} fontWeight={700} formatter={v => `${v} ms`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ textAlign: "center", fontSize: 12, color: "#9099a8", marginTop: 4 }}>Lower latency = better performance</p>
      </div>

      {/* Full metrics comparison */}
      <div style={S.card}>
        <div style={S.ct}>Full Metrics Comparison</div>
        <div style={S.cd}>All computed performance indicators side by side.</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 16, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
            <XAxis dataKey="metric" stroke="#9099a8" fontSize={11} />
            <YAxis stroke="#9099a8" fontSize={12} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="GBFS" fill="#3b5bdb" radius={[4,4,0,0]}>
              <LabelList dataKey="GBFS" position="top" fill="#9099a8" fontSize={10} />
            </Bar>
            <Bar dataKey="PSO" fill="#a855f7" radius={[4,4,0,0]}>
              <LabelList dataKey="PSO" position="top" fill="#9099a8" fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ textAlign: "center", fontSize: 12, color: "#9099a8", marginTop: 4 }}>
          Lower delay & energy is better · Higher speed is better
        </p>
      </div>

      {/* Table comparison */}
      <div style={S.card}>
        <div style={S.ct}>Result Summary Table</div>
        <div style={S.cd}>Metric-by-metric result for {machine.name} ({machine.machineId}).</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["Metric", "GBFS", "PSO", "Better"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ["Latency (ms)",        gbfsData.latency,     psoData.latency,     "lower"],
              ["Speed (tasks/s)",     gbfsData.throughput,  psoData.throughput,  "higher"],
              ["Energy (kWh)",        gbfsData.energy,      psoData.energy,      "lower"],
              ["Resource Usage (%)",  gbfsData.utilization, psoData.utilization, "lower"],
              ["Response Time (ms)",  gbfsData.time,        psoData.time,        "lower"],
            ].map(([label, g, p, dir], i) => {
              const gWins = dir==="lower" ? +g <= +p : +g >= +p;
              return (
                <tr key={label} style={{ background: i%2===0?"#fff":"#fafbfc" }}>
                  <td style={{ ...S.td, fontWeight: 500 }}>{label}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: gWins?"#3b5bdb":"#1a1d23" }}>{g}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: !gWins?"#a855f7":"#1a1d23" }}>{p}</td>
                  <td style={S.td}><span style={S.badge(gWins?"blue":"amber")}>{gWins?"GBFS":"PSO"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── ERROR BOUNDARY ─── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  render() {
    if (this.state.hasError) return <div style={{ padding: 20, color: "red" }}><h1>Error</h1><pre>{this.state.error?.toString()}</pre></div>;
    return this.props.children;
  }
}

/* ─── MAIN APP ─── */
export default function App() {
  const [step,         setStep]         = useState(0);
  const [maxReached,   setMaxReached]   = useState(0);
  const [selectedId,   setSelectedId]   = useState("M1");
  const [gbfsData,     setGbfsData]     = useState(null);
  const [psoData,      setPsoData]      = useState(null);
  const [gbfsRunning,  setGbfsRunning]  = useState(false);
  const [psoRunning,   setPsoRunning]   = useState(false);

  const machine = MACHINE_DATA[selectedId];

  const runGBFS = () => {
    setGbfsRunning(true);
    setGbfsData(null);
    setTimeout(() => {
      setGbfsData(computeGbfsScore(machine));
      setGbfsRunning(false);
      setMaxReached(r => Math.max(r, 1));
    }, 900);
  };

  const runPSO = () => {
    setPsoRunning(true);
    setPsoData(null);
    setTimeout(() => {
      setPsoData(computePsoScore(machine));
      setPsoRunning(false);
      setMaxReached(r => Math.max(r, 3));
    }, 900);
  };

  /* allow moving to next only when prerequisite is done */
  const canNext = () => {
    if (step === 0) return true;                      // can always go to GBFS
    if (step === 1) return !!gbfsData;                // need GBFS result
    if (step === 2) return !!psoData;                 // need PSO result
    return false;
  };

  const goNext = () => {
    const n = step + 1;
    setStep(n);
    setMaxReached(r => Math.max(r, n));
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepSelect   selectedId={selectedId} setSelectedId={id => { setSelectedId(id); setGbfsData(null); setPsoData(null); setMaxReached(0); }} />;
      case 1: return <StepGBFS    machine={machine} gbfsData={gbfsData} onRun={runGBFS} running={gbfsRunning} />;
      case 2: return <StepPSO     machine={machine} psoData={psoData}   onRun={runPSO}  running={psoRunning}  />;
      case 3: return <StepComparison machine={machine} gbfsData={gbfsData} psoData={psoData} />;
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <div style={S.root}>
        <Sidebar step={step} onJump={i => i <= maxReached && setStep(i)} />
        <div style={S.content}>
          <TopBar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} />
          <div style={S.main}>{renderStep()}</div>
          <div style={S.bottomBar}>
            <button style={S.bbBack(step===0)} disabled={step===0} onClick={() => setStep(p => p-1)}>← Back</button>
            <span style={{ fontSize: 12, color: "#9099a8" }}>Step {step+1} of {STEPS.length}</span>
            <button style={S.bbNext(!canNext() || step>=3)} disabled={!canNext() || step>=3} onClick={goNext}>Next →</button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
