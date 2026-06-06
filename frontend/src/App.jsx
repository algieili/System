import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell
} from "recharts";

/* ─── FIXED MACHINE DATA (from IoT Manufacturing Machine Data table) ─── */
const MACHINE_DATA = {
  M1: { id: "M1", name: "CNC Plasma",       taskSize: 50, bandwidth: 100, processingTime: 120, queueLength: 3, cpuUtilization: 75, category: "Cutting Machines",   taskType: "Computation-Intensive" },
  M2: { id: "M2", name: "Plasma Cutting",    taskSize: 40, bandwidth: 90,  processingTime: 100, queueLength: 2, cpuUtilization: 68, category: "Cutting Machines",   taskType: "Computation-Intensive" },
  M3: { id: "M3", name: "Painting Booth",    taskSize: 20, bandwidth: 80,  processingTime: 60,  queueLength: 1, cpuUtilization: 45, category: "Finishing Machines", taskType: "Energy-Efficient"      },
  M4: { id: "M4", name: "Arc Welding",       taskSize: 30, bandwidth: 85,  processingTime: 90,  queueLength: 2, cpuUtilization: 60, category: "Welding Machines",   taskType: "Computation-Intensive" },
  M5: { id: "M5", name: "Shearing Machine",  taskSize: 25, bandwidth: 75,  processingTime: 70,  queueLength: 1, cpuUtilization: 50, category: "Cutting Machines",   taskType: "Latency-Sensitive"     },
};

/* ─── INLINE STYLES ─── */
const S = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: "#f5f6fa", color: "#1a1d23" },
  sidebar: { width: 220, background: "#fff", borderRight: "1px solid #e8eaf0", display: "flex", flexDirection: "column", padding: "0 0 24px 0", position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  sidebarBrand: { padding: "24px 20px 16px", borderBottom: "1px solid #e8eaf0" },
  brandTitle: { fontWeight: 700, fontSize: 16, color: "#1a1d23", margin: 0, lineHeight: 1.2 },
  brandSub: { fontSize: 11, color: "#9099a8", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" },
  navSection: { padding: "16px 12px 8px" },
  navLabel: { fontSize: 10, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 6 },
  navBtn: (active) => ({ display: "flex", alignItems: "flex-start", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2, background: active ? "#f0f4ff" : "transparent", color: active ? "#3b5bdb" : "#4a5568" }),
  navIcon: (active) => ({ width: 18, height: 18, marginTop: 1, flexShrink: 0, color: active ? "#3b5bdb" : "#9099a8" }),
  navText: { flex: 1 },
  navTitle: (active) => ({ fontSize: 13, fontWeight: active ? 600 : 500, lineHeight: 1.2 }),
  navDesc: { fontSize: 11, color: "#9099a8", lineHeight: 1.3, marginTop: 2 },
  navIndicator: { width: 6, height: 6, borderRadius: 3, background: "#3b5bdb", marginTop: 5, flexShrink: 0 },
  content: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topBar: { background: "#fff", borderBottom: "1px solid #e8eaf0", padding: "0 28px", display: "flex", alignItems: "center", minHeight: 56, gap: 8 },
  breadcrumb: { fontSize: 13, color: "#9099a8", display: "flex", alignItems: "center", gap: 6 },
  crumbActive: { color: "#1a1d23", fontWeight: 500 },
  crumbSep: { color: "#c4cad6" },
  flowSteps: { display: "flex", alignItems: "center", gap: 0, flex: 1, justifyContent: "center" },
  flowStep: (active, done) => ({ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, cursor: "pointer", background: active ? "#3b5bdb" : done ? "#e8f5e9" : "transparent", color: active ? "#fff" : done ? "#2e7d32" : "#9099a8", fontSize: 12, fontWeight: active ? 600 : 500, whiteSpace: "nowrap" }),
  flowDot: (active, done) => ({ width: 7, height: 7, borderRadius: 4, flexShrink: 0, background: active ? "#fff" : done ? "#4caf50" : "#d0d6e0" }),
  flowArrow: { color: "#d0d6e0", fontSize: 14, padding: "0 2px" },
  main: { flex: 1, padding: "28px", overflowY: "auto" },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: 0, color: "#1a1d23" },
  pageSubtitle: { fontSize: 13, color: "#9099a8", marginTop: 4 },
  statsRow: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  statCard: { flex: "1 1 140px", background: "#fff", border: "1px solid #e8eaf0", borderRadius: 10, padding: "16px 18px", minWidth: 130 },
  statLabel: { fontSize: 12, color: "#9099a8", fontWeight: 500, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: 700, color: "#1a1d23" },
  statChange: (up) => ({ fontSize: 12, color: up ? "#2e7d32" : "#c62828", marginTop: 4, fontWeight: 500 }),
  row: { display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" },
  card: { background: "#fff", border: "1px solid #e8eaf0", borderRadius: 12, padding: "20px 22px", flex: "1 1 320px", minWidth: 260 },
  cardFull: { background: "#fff", border: "1px solid #e8eaf0", borderRadius: 12, padding: "20px 22px", marginBottom: 20 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#1a1d23", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" },
  cardDesc: { fontSize: 12, color: "#9099a8", marginBottom: 16 },
  dataRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f1f5" },
  dataLabel: { fontSize: 13, color: "#5a6272" },
  dataValue: { fontSize: 13, fontWeight: 500, color: "#1a1d23" },
  select: { border: "1px solid #e2e5ec", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "#1a1d23", background: "#fafbfc", outline: "none", width: "100%", maxWidth: 300 },
  btnPrimary: { background: "#3b5bdb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 16, width: "100%" },
  btnDisabled: { background: "#c4cad6", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "not-allowed", marginTop: 16, width: "100%" },
  bottomBar: { background: "#fff", borderTop: "1px solid #e8eaf0", padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  navBtnBottom: (disabled) => ({ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "1px solid #e2e5ec", background: disabled ? "#f5f6fa" : "#fff", color: disabled ? "#c4cad6" : "#1a1d23" }),
  navBtnNext: (disabled) => ({ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "#c4cad6" : "#3b5bdb", color: "#fff", border: "none" }),
  badge: (color) => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: color === "blue" ? "#e8f0ff" : color === "green" ? "#e8f5e9" : color === "amber" ? "#fff8e1" : "#fce4ec", color: color === "blue" ? "#1a3db5" : color === "green" ? "#2e7d32" : color === "amber" ? "#b45309" : "#c62828" }),
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #e8eaf0", background: "#f9fafb" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f0f1f5", color: "#1a1d23" },
  decisionBig: (server) => ({ fontSize: 32, fontWeight: 800, marginTop: 8, marginBottom: 8, color: server === "Edge" ? "#1a3db5" : "#7b2ff7" }),
  decisionReason: { fontSize: 14, color: "#5a6272", marginTop: 4 },
  statusDot: (ok) => ({ display: "inline-block", width: 7, height: 7, borderRadius: 4, background: ok ? "#4caf50" : "#f44336", marginRight: 6, verticalAlign: "middle" }),
  tabBtn: (active) => ({ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer", border: "1px solid " + (active ? "#3b5bdb" : "#e2e5ec"), background: active ? "#3b5bdb" : "#fff", color: active ? "#fff" : "#5a6272" }),
  alertBox: (color) => ({ background: color === "blue" ? "#e8f0ff" : "#e8f5e9", border: `1px solid ${color === "blue" ? "#bad0ff" : "#c8e6c9"}`, borderRadius: 8, padding: "14px 18px", marginBottom: 16, borderLeft: `4px solid ${color === "blue" ? "#3b5bdb" : "#4caf50"}` }),
  machineCard: (selected) => ({ flex: "1 1 160px", minWidth: 150, maxWidth: 200, border: `2px solid ${selected ? "#3b5bdb" : "#e8eaf0"}`, borderRadius: 12, padding: "16px 14px", cursor: "pointer", background: selected ? "#f0f4ff" : "#fff", transition: "all 0.15s" }),
};

/* ─── ALGORITHMS ─── */
const computeGbfsScore = (m) => {
  const latency = Number((m.processingTime * 0.9 + Math.random() * 5).toFixed(2));
  const throughput = Number(((1000 / m.processingTime) * 120 + Math.random() * 10).toFixed(2));
  const energy = Number((m.cpuUtilization * m.bandwidth * 0.85 + Math.random() * 50).toFixed(2));
  const utilization = Number((m.cpuUtilization * 0.88 + Math.random() * 5).toFixed(2));
  const time = Number((latency * 1.1).toFixed(2));
  const remark = latency < 80 ? "Excellent" : latency < 150 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};

const computePsoScore = (m) => {
  const latency = Number((m.processingTime * 0.82 + Math.random() * 4).toFixed(2));
  const throughput = Number(((1000 / m.processingTime) * 135 + Math.random() * 12).toFixed(2));
  const energy = Number((m.cpuUtilization * m.bandwidth * 0.78 + Math.random() * 40).toFixed(2));
  const utilization = Number((m.cpuUtilization * 0.80 + Math.random() * 5).toFixed(2));
  const time = Number((latency * 1.05).toFixed(2));
  const remark = latency < 80 ? "Excellent" : latency < 150 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};

/* ─── STEP DEFINITIONS ─── */
const STEP_DETAILS = [
  { title: "Data Input", icon: "📥", desc: "Select machine and review fixed parameters." },
  { title: "Algorithms", icon: "⚙️", desc: "Evaluate using GBFS and PSO." },
  { title: "Decision", icon: "🔍", desc: "Compare and choose best processing." },
  { title: "Processing", icon: "🖥️", desc: "Assign task to Edge or Cloud." },
  { title: "Results", icon: "📊", desc: "View performance graphs and logs." }
];

/* ─── HELPERS ─── */
const CardHeader = ({ title, desc }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={S.cardTitle}>{title}</div>
    {desc && <div style={S.cardDesc}>{desc}</div>}
  </div>
);
const DataRow = ({ label, value, valueStyle }) => (
  <div style={S.dataRow}>
    <span style={S.dataLabel}>{label}</span>
    <span style={{ ...S.dataValue, ...valueStyle }}>{value}</span>
  </div>
);

/* ─── SIDEBAR ─── */
const Sidebar = ({ step, onJump }) => (
  <div style={S.sidebar}>
    <div style={S.sidebarBrand}>
      <div style={S.brandTitle}>Task Offloading</div>
      <div style={S.brandSub}>Simulation System</div>
    </div>
    <div style={S.navSection}>
      <div style={S.navLabel}>Navigation</div>
      {STEP_DETAILS.map((s, i) => (
        <button key={i} style={S.navBtn(i === step)} onClick={() => onJump(i)}>
          <span style={{ fontSize: 16, marginTop: 1 }}>{s.icon}</span>
          <div style={S.navText}>
            <div style={S.navTitle(i === step)}>{s.title}</div>
            <div style={S.navDesc}>{s.desc}</div>
          </div>
          {i === step && <div style={S.navIndicator} />}
        </button>
      ))}
    </div>
  </div>
);

/* ─── TOP FLOW BAR ─── */
const TopBar = ({ step, maxReached, onJump }) => (
  <div style={S.topBar}>
    <div style={S.breadcrumb}>
      <span>Simulation</span>
      <span style={S.crumbSep}>›</span>
      <span style={S.crumbActive}>{STEP_DETAILS[step].title}</span>
    </div>
    <div style={S.flowSteps}>
      {STEP_DETAILS.map((s, i) => (
        <React.Fragment key={i}>
          <div style={S.flowStep(i === step, i < step)} onClick={() => i <= maxReached && onJump(i)}>
            <div style={S.flowDot(i === step, i < step)} />
            {s.title}
          </div>
          {i < STEP_DETAILS.length - 1 && <span style={S.flowArrow}>›</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

/* ─── STEP 0: DATA INPUT ─── */
const StepInput = ({ selectedMachineId, setSelectedMachineId, onRun, isProcessing }) => {
  const machine = MACHINE_DATA[selectedMachineId];
  const thStyle = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #e8eaf0", background: "#f9fafb", whiteSpace: "nowrap" };
  const tdStyle = { padding: "11px 14px", borderBottom: "1px solid #f0f1f5", verticalAlign: "middle" };

  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Data Input & Generation</div>
        <div style={S.pageSubtitle}>Select a machine from the IoT Manufacturing dataset to begin the offloading evaluation.</div>
      </div>

      {/* Machine Selection Cards */}
      <div style={S.cardFull}>
        <CardHeader title="Select Machine" desc="Choose from the 5 fixed IoT manufacturing machines below." />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.values(MACHINE_DATA).map(m => (
            <div key={m.id} style={S.machineCard(selectedMachineId === m.id)} onClick={() => setSelectedMachineId(m.id)}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>
                {m.id === "M1" ? "🔩" : m.id === "M2" ? "⚡" : m.id === "M3" ? "🎨" : m.id === "M4" ? "🔥" : "✂️"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedMachineId === m.id ? "#3b5bdb" : "#1a1d23", marginBottom: 2 }}>{m.id}</div>
              <div style={{ fontSize: 12, color: "#5a6272", lineHeight: 1.3 }}>{m.name}</div>
              <div style={{ marginTop: 8 }}>
                <span style={S.badge(selectedMachineId === m.id ? "blue" : "amber")}>{m.taskType === "Computation-Intensive" ? "Compute" : m.taskType === "Latency-Sensitive" ? "Latency" : "Energy"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Machines Overview Table */}
      <div style={S.cardFull}>
        <CardHeader title="IoT Manufacturing Machine Data" desc="Fixed parameters from the dataset. Select a machine above to use its values." />
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Machine ID", "Machine Name", "Task Size (MB)", "Bandwidth (Mbps)", "Processing Time (ms)", "Queue Length", "CPU Utilization (%)", "Category", "Task Type"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(MACHINE_DATA).map((m, i) => (
                <tr key={m.id}
                  onClick={() => setSelectedMachineId(m.id)}
                  style={{ background: selectedMachineId === m.id ? "#f0f4ff" : i % 2 === 0 ? "#fff" : "#fafbfc", cursor: "pointer" }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "#3b5bdb" }}>{m.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{m.name}</td>
                  <td style={tdStyle}>{m.taskSize}</td>
                  <td style={tdStyle}>{m.bandwidth}</td>
                  <td style={tdStyle}>{m.processingTime}</td>
                  <td style={tdStyle}>{m.queueLength}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: "#e8eaf0", borderRadius: 3, maxWidth: 60 }}>
                        <div style={{ width: `${m.cpuUtilization}%`, height: "100%", background: m.cpuUtilization > 70 ? "#e53e3e" : m.cpuUtilization > 50 ? "#f97316" : "#4caf50", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12 }}>{m.cpuUtilization}%</span>
                    </div>
                  </td>
                  <td style={tdStyle}><span style={S.badge("blue")}>{m.category}</span></td>
                  <td style={tdStyle}><span style={S.badge(m.taskType === "Latency-Sensitive" ? "green" : m.taskType === "Energy-Efficient" ? "amber" : "blue")}>{m.taskType}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Machine Details */}
      {machine && (
        <div style={S.cardFull}>
          <CardHeader title={`Selected: ${machine.id} — ${machine.name}`} desc="Fixed data parameters that will be used for the offloading simulation." />
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "Task Size", value: `${machine.taskSize} MB`, icon: "📦" },
              { label: "Bandwidth", value: `${machine.bandwidth} Mbps`, icon: "📡" },
              { label: "Processing Time", value: `${machine.processingTime} ms`, icon: "⏱️" },
              { label: "Queue Length", value: machine.queueLength, icon: "📋" },
              { label: "CPU Utilization", value: `${machine.cpuUtilization}%`, icon: "💻" },
              { label: "Task Type", value: machine.taskType, icon: "🏷️" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ flex: "1 1 140px", background: "#f8f9ff", border: "1px solid #e0e7ff", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 11, color: "#9099a8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>{value}</div>
              </div>
            ))}
          </div>

          <button style={!isProcessing ? S.btnPrimary : S.btnDisabled} disabled={isProcessing} onClick={onRun}>
            {isProcessing ? "⏳ Processing..." : `Generate & Offload Task for ${machine.name} →`}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── STEP 1: ALGORITHMS ─── */
const PIE_COLORS = { Delay: "#3b5bdb", Speed: "#10b981", Energy: "#f97316", Usage: "#a855f7" };

const AlgoCard = ({ title, data }) => (
  <div style={S.card}>
    <CardHeader title={title} desc="Detailed metrics and target destination." />
    <p style={{ fontSize: 12, color: "#9099a8", marginBottom: 12, fontStyle: "italic" }}>
      Lower delay = faster response. Higher processing speed = more tasks/second.
    </p>
    <DataRow label="Delay (ms)" value={data?.latency || 0} valueStyle={{ color: "#3b5bdb", fontWeight: 700 }} />
    <DataRow label="Processing Speed (tasks/s)" value={data?.throughput || 0} />
    <DataRow label="Energy (watts)" value={data?.energy || 0} />
    <DataRow label="Resource Usage (%)" value={data?.utilization || 0} />
    <DataRow label="Response Time (ms)" value={data?.time || "-"} />
    <div style={S.dataRow}>
      <span style={S.dataLabel}>Remark</span>
      <span style={S.badge(data?.remark === "Excellent" ? "green" : "amber")}>{data?.remark || "-"}</span>
    </div>
  </div>
);

const StepAlgorithms = ({ gbfs, pso }) => {
  const prepData = (d) => [
    { name: "Delay", value: parseFloat(d?.latency) || 0, fill: PIE_COLORS.Delay },
    { name: "Speed", value: parseFloat(d?.throughput) || 0, fill: PIE_COLORS.Speed },
    { name: "Energy", value: parseFloat(d?.energy) || 0, fill: PIE_COLORS.Energy },
    { name: "Usage", value: parseFloat(d?.utilization) || 0, fill: PIE_COLORS.Usage }
  ];
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + r * Math.sin(-midAngle * Math.PI / 180);
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
  };
  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Algorithms Applied</div>
        <div style={S.pageSubtitle}>Evaluate tasks using GBFS and Particle Swarm Optimization.</div>
      </div>
      <div style={S.cardFull}>
        <CardHeader title="Performance Overview" desc="Visual breakdown of metric contributions." />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {[{ label: "GBFS Distribution", d: gbfs }, { label: "PSO Distribution", d: pso }].map(({ label, d }) => (
            <div key={label} style={{ flex: "1 1 280px", textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#5a6272", marginBottom: 8 }}>{label}</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={prepData(d)} cx="50%" cy="50%" labelLine={false} label={renderLabel} outerRadius={75} dataKey="value">
                    {prepData(d).map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => Number(v).toFixed(2)} contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
          {Object.entries(PIE_COLORS).map(([k, c]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 12, color: "#5a6272" }}>{k}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={S.row}>
        <AlgoCard title="GBFS Evaluation" data={gbfs} />
        <AlgoCard title="PSO Evaluation" data={pso} />
      </div>
    </div>
  );
};

/* ─── STEP 2: DECISION ─── */
const StepDecision = ({ gbfs, pso, decision }) => {
  const getW = (metric) => {
    if (metric === "Delay") return parseFloat(gbfs.latency) < parseFloat(pso.latency) ? "GBFS" : "PSO";
    if (metric === "Speed") return parseFloat(gbfs.throughput) > parseFloat(pso.throughput) ? "GBFS" : "PSO";
    if (metric === "Energy") return parseFloat(gbfs.energy) < parseFloat(pso.energy) ? "GBFS" : "PSO";
    if (metric === "Usage") return parseFloat(gbfs.utilization) < parseFloat(pso.utilization) ? "GBFS" : "PSO";
  };
  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Decision Evaluation</div>
        <div style={S.pageSubtitle}>Compare results and determine the best processing choice.</div>
      </div>
      <div style={S.row}>
        <div style={{ ...S.card, flex: "0 1 320px" }}>
          <CardHeader title="Processing Decision" desc="Final destination chosen by the offloading logic." />
          <div style={S.decisionBig(decision.server)}>OFFLOAD TO {(decision.server || "...").toUpperCase()}</div>
          <div style={S.decisionReason}>Chosen because {decision.reason}</div>
          <div style={{ marginTop: 16 }}>
            <span style={S.badge(decision.winner === "GBFS" ? "blue" : "amber")}>Best Algorithm: {decision.winner}</span>
          </div>
        </div>
        <div style={S.card}>
          <CardHeader title="Interpretation & Analysis" desc="Contextual breakdown of the offloading results." />
          {[
            { heading: "Algorithm Result", text: `${decision.winner} was deemed the better algorithm for this cycle because it optimized critical metrics better than its counterpart.` },
            { heading: "Decision Explanation", text: `The system selected ${decision.server} processing primarily to handle the ${decision.taskType} task effectively.` },
            { heading: "Final Interpretation", text: `Overall, deploying via ${decision.winner} to ${decision.server} provided the most efficient compute solution for the current system load.` }
          ].map(({ heading, text }) => (
            <div key={heading} style={S.alertBox("blue")}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3db5", marginBottom: 4 }}>{heading}</div>
              <div style={{ fontSize: 13, color: "#3b5bdb", lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.cardFull}>
        <CardHeader title="Comparison Results" desc="Direct metric comparison of GBFS vs PSO." />
        <table style={S.table}>
          <thead>
            <tr>{["Metric", "GBFS", "PSO", "Better Result"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {[["Delay (ms)", gbfs.latency, pso.latency, "Delay"], ["Processing Speed (tasks/s)", gbfs.throughput, pso.throughput, "Speed"], ["Energy (watts)", gbfs.energy, pso.energy, "Energy"], ["Resource Usage (%)", gbfs.utilization, pso.utilization, "Usage"]].map(([label, g, p, metric]) => (
              <tr key={label}>
                <td style={S.td}>{label}</td>
                <td style={{ ...S.td, fontWeight: 600, color: "#3b5bdb" }}>{g}</td>
                <td style={{ ...S.td, fontWeight: 600, color: "#7b2ff7" }}>{p}</td>
                <td style={S.td}><span style={S.badge(getW(metric) === "GBFS" ? "blue" : "amber")}>{getW(metric)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── STEP 3: PROCESSING ─── */
const StepProcessing = ({ decision }) => (
  <div>
    <div style={S.pageHeader}>
      <div style={S.pageTitle}>Task Processing</div>
      <div style={S.pageSubtitle}>Assign and simulate task execution on Edge or Cloud.</div>
    </div>
    <div style={S.row}>
      <div style={S.card}>
        <CardHeader title="Task Assignment" desc="Targeted server and task categorization." />
        <DataRow label="Task Type" value={<span style={S.badge("blue")}>{decision.taskType}</span>} />
        <DataRow label="Machine" value={<span style={{ fontWeight: 600 }}>{decision.machineName} ({decision.machineId})</span>} />
        <DataRow label="Assigned Server" value={<span style={S.badge(decision.server === "Edge" ? "blue" : "amber")}>{decision.server} Server</span>} />
        <DataRow label="Algorithm Used" value={decision.winner} />
        <DataRow label="Summary" value={`${decision.winner} optimally assigned to ${decision.server} server.`} />
      </div>
      <div style={S.card}>
        <CardHeader title="Result Transmission" desc="Confirmation of data flow back to local device." />
        {[["Processing Status", "Complete", "green"], ["Transmission Time", "145 ms", "green"], ["Network Return Status", "Confirmed", "green"], ["Final Task Status", "Success", "green"]].map(([label, value, color]) => (
          <div key={label} style={S.dataRow}>
            <span style={S.dataLabel}>{label}</span>
            <span style={S.badge(color)}><span style={S.statusDot(true)} />{value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── STEP 4: RESULTS ─── */
const StepResults = ({ gbfs, pso, logs, setLogs }) => {
  const [viewMode, setViewMode] = useState("Single Run");
  const aggregateLogs = (mode) => {
    const groups = {};
    logs.forEach(L => {
      if (!L.timestamp) return;
      const d = new Date(L.timestamp);
      let key;
      if (mode === "Daily Analysis") {
        key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      } else {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = `Week of ${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
      }
      if (!groups[key]) groups[key] = { time: key, gbfsLat: 0, psoLat: 0, gbfsSpeed: 0, psoSpeed: 0, gbfsEng: 0, psoEng: 0, gbfsUtil: 0, psoUtil: 0, count: 0, t: new Date(L.timestamp).getTime() };
      groups[key].gbfsLat += (L.gbfsLat || 0); groups[key].psoLat += (L.psoLat || 0);
      groups[key].gbfsSpeed += (L.gbfsSpeed || 0); groups[key].psoSpeed += (L.psoSpeed || 0);
      groups[key].gbfsEng += (L.gbfsEng || 0); groups[key].psoEng += (L.psoEng || 0);
      groups[key].gbfsUtil += (L.gbfsUtil || 0); groups[key].psoUtil += (L.psoUtil || 0);
      groups[key].count += 1;
    });
    return Object.values(groups).map(g => {
      const c = g.count;
      return { time: g.time, t: g.t, GBFS_Delay: +(g.gbfsLat / c).toFixed(2), PSO_Delay: +(g.psoLat / c).toFixed(2), GBFS_Speed: +(g.gbfsSpeed / c).toFixed(2), PSO_Speed: +(g.psoSpeed / c).toFixed(2), GBFS_Energy: +(g.gbfsEng / c).toFixed(2), PSO_Energy: +(g.psoEng / c).toFixed(2), GBFS_Util: +(g.gbfsUtil / c).toFixed(2), PSO_Util: +(g.psoUtil / c).toFixed(2), TotalTasks: c, Winner: (g.psoLat / c) < (g.gbfsLat / c) ? "PSO" : "GBFS" };
    }).sort((a, b) => a.t - b.t);
  };
  const chartData = [
    { metric: "Delay (ms)", GBFS: Number(gbfs?.latency || 0), PSO: Number(pso?.latency || 0) },
    { metric: "Speed (t/s)", GBFS: Number(gbfs?.throughput || 0), PSO: Number(pso?.throughput || 0) },
    { metric: "Energy (W)", GBFS: Number(gbfs?.energy || 0), PSO: Number(pso?.energy || 0) },
    { metric: "Usage (%)", GBFS: Number(gbfs?.utilization || 0), PSO: Number(pso?.utilization || 0) }
  ];
  const trendData = viewMode !== "Single Run" ? aggregateLogs(viewMode) : [];
  const avgGbfs = trendData.length ? trendData.reduce((a, c) => a + c.GBFS_Delay, 0) / trendData.length : 0;
  const avgPso = trendData.length ? trendData.reduce((a, c) => a + c.PSO_Delay, 0) / trendData.length : 0;
  const improvement = avgGbfs ? (((avgGbfs - avgPso) / avgGbfs) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Execution Results</div>
        <div style={S.pageSubtitle}>View performance results, graphs, and execution logs.</div>
      </div>
      <div style={S.statsRow}>
        {[
          { label: "Total Simulations", value: logs.length, change: `+${logs.length} this session` },
          { label: "GBFS Wins", value: logs.filter(l => l.winner === "GBFS").length },
          { label: "PSO Wins", value: logs.filter(l => l.winner === "PSO").length },
          { label: "Cloud Offloads", value: logs.filter(l => l.server === "Cloud").length }
        ].map(({ label, value, change }) => (
          <div key={label} style={S.statCard}>
            <div style={S.statLabel}>{label}</div>
            <div style={S.statValue}>{value}</div>
            {change && <div style={S.statChange(true)}>{change}</div>}
          </div>
        ))}
      </div>
      <div style={S.cardFull}>
        <CardHeader title="Performance Monitoring" desc="Continuous tracking of system efficiency and utilization." />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
            <XAxis dataKey="metric" stroke="#9099a8" fontSize={12} />
            <YAxis stroke="#9099a8" fontSize={12} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8eaf0" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="GBFS" fill="#3b5bdb" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="GBFS" position="top" fill="#9099a8" fontSize={11} />
            </Bar>
            <Bar dataKey="PSO" fill="#a855f7" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="PSO" position="top" fill="#9099a8" fontSize={11} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ textAlign: "center", color: "#9099a8", fontSize: 12, marginTop: 8 }}>
          Lower delay is better · Higher processing speed is better · Lower resource usage is better
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {["Single Run", "Daily Analysis", "Weekly Analysis"].map(m => (
          <button key={m} style={S.tabBtn(viewMode === m)} onClick={() => setViewMode(m)}>{m}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setLogs([])} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fce4ec", color: "#c62828", border: "1px solid #f8bbd0" }}>Clear Logs</button>
      </div>
      {viewMode === "Single Run" ? (
        <div style={S.cardFull}>
          <CardHeader title="Execution Logs" desc="Timestamped records of all historical decisions." />
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>{["#", "Timestamp", "Machine", "Category", "Task Type", "Delay", "Speed", "Best Algorithm", "Server", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {logs.map((L, i) => (
                  <tr key={i}>
                    <td style={{ ...S.td, color: "#9099a8" }}>{L.id}</td>
                    <td style={S.td}>{L.timestamp ? new Date(L.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    <td style={S.td}><span style={{ fontWeight: 600, color: "#3b5bdb" }}>{L.machineId}</span> {L.machineName}</td>
                    <td style={S.td}>{L.category}</td>
                    <td style={S.td}><span style={S.badge("blue")}>{L.type}</span></td>
                    <td style={S.td}>{L.delay}</td>
                    <td style={S.td}>{L.speed}</td>
                    <td style={S.td}><span style={S.badge(L.winner === "GBFS" ? "blue" : "amber")}>{L.winner}</span></td>
                    <td style={S.td}><span style={S.badge(L.server === "Edge" ? "blue" : "amber")}>{L.server}</span></td>
                    <td style={S.td}><span style={S.badge("green")}>{L.status}</span></td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={10} style={{ ...S.td, textAlign: "center", color: "#9099a8", fontStyle: "italic", padding: "28px" }}>No execution records. Run a simulation to generate results.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={S.cardFull}>
          <CardHeader title={`${viewMode} Trend`} desc="Aggregated offloading performance over time." />
          {trendData.length === 0 ? (
            <p style={{ color: "#9099a8", fontStyle: "italic" }}>No data yet. Run a simulation first.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1, ...S.alertBox("blue") }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3db5", marginBottom: 4 }}>Summary Insight</div>
                  <div style={{ fontSize: 13, color: "#3b5bdb", lineHeight: 1.5 }}>
                    Over the visualized period, PSO made the system {improvement}% faster in response time compared to GBFS.
                  </div>
                </div>
                <div style={{ background: "#f3e8ff", border: "1px solid #e9d5ff", borderLeft: "4px solid #a855f7", borderRadius: 8, padding: "14px 18px", textAlign: "center", minWidth: 140 }}>
                  <div style={{ fontSize: 12, color: "#6b21a8", marginBottom: 4 }}>Faster Response (%)</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#7b2ff7" }}>{improvement}%</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData} margin={{ top: 16, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
                  <XAxis dataKey="time" stroke="#9099a8" fontSize={12} angle={-15} textAnchor="end" />
                  <YAxis stroke="#9099a8" fontSize={12} label={{ value: "Delay (ms)", angle: -90, position: "insideLeft", style: { fill: "#9099a8", fontSize: 11 } }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="top" />
                  <Line type="monotone" dataKey="GBFS_Delay" name="GBFS Delay" stroke="#3b5bdb" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="PSO_Delay" name="PSO Delay" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <table style={{ ...S.table, marginTop: 20 }}>
                <thead>
                  <tr>{["Period", "Tasks", "Avg Delay (G/P)", "Avg Speed (G/P)", "Avg Energy (G/P)", "Avg Util (G/P)", "Best"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {trendData.map((d, i) => (
                    <tr key={i}>
                      <td style={S.td}>{d.time}</td>
                      <td style={S.td}>{d.TotalTasks}</td>
                      <td style={S.td}>{d.GBFS_Delay}/{d.PSO_Delay}</td>
                      <td style={S.td}>{d.GBFS_Speed}/{d.PSO_Speed}</td>
                      <td style={S.td}>{d.GBFS_Energy}/{d.PSO_Energy}</td>
                      <td style={S.td}>{d.GBFS_Util}/{d.PSO_Util}</td>
                      <td style={S.td}><span style={S.badge(d.Winner === "GBFS" ? "blue" : "amber")}>{d.Winner}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── ERROR BOUNDARY ─── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div style={{ padding: 20, color: "red" }}><h1>Something went wrong.</h1><pre>{this.state.error?.toString()}</pre></div>;
    return this.props.children;
  }
}

/* ─── MAIN APP ─── */
export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState("M1");
  const [gbfsData, setGbfsData] = useState(null);
  const [psoData, setPsoData] = useState(null);
  const [decisionData, setDecisionData] = useState({});
  const [logs, setLogs] = useState([]);

  const handleRun = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const machine = MACHINE_DATA[selectedMachineId];
      const gbfs = computeGbfsScore(machine);
      const pso = computePsoScore(machine);
      setGbfsData(gbfs);
      setPsoData(pso);

      let winner, server, reason;
      if (machine.taskType === "Latency-Sensitive") {
        winner = parseFloat(gbfs.latency) < parseFloat(pso.latency) ? "GBFS" : "PSO";
        reason = "it has a faster response (lower delay).";
        server = "Edge";
      } else if (machine.taskType === "Computation-Intensive") {
        winner = parseFloat(gbfs.throughput) > parseFloat(pso.throughput) ? "GBFS" : "PSO";
        reason = "it has higher processing speed.";
        server = "Cloud";
      } else {
        winner = parseFloat(gbfs.energy) < parseFloat(pso.energy) ? "GBFS" : "PSO";
        reason = "it has better energy efficiency.";
        server = parseFloat(pso.utilization) > 80 ? "Cloud" : "Edge";
      }

      setDecisionData({ winner, server, reason, taskType: machine.taskType, machineId: machine.id, machineName: machine.name });
      setLogs(prev => [...prev, {
        id: prev.length + 1, machineId: machine.id, machineName: machine.name,
        category: machine.category, type: machine.taskType,
        timestamp: new Date().toISOString(),
        delay: `${gbfs.latency}/${pso.latency}`, speed: `${gbfs.throughput}/${pso.throughput}`,
        energy: `${gbfs.energy}/${pso.energy}`, utilization: `${gbfs.utilization}/${pso.utilization}`,
        gbfsLat: parseFloat(gbfs.latency), psoLat: parseFloat(pso.latency),
        gbfsSpeed: parseFloat(gbfs.throughput), psoSpeed: parseFloat(pso.throughput),
        gbfsEng: parseFloat(gbfs.energy), psoEng: parseFloat(pso.energy),
        gbfsUtil: parseFloat(gbfs.utilization), psoUtil: parseFloat(pso.utilization),
        winner, server, status: "SUCCESS"
      }]);

      setCurrentStep(1);
      setMaxReached(4);
      setIsProcessing(false);
    }, 800);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepInput selectedMachineId={selectedMachineId} setSelectedMachineId={setSelectedMachineId} onRun={handleRun} isProcessing={isProcessing} />;
      case 1: return <StepAlgorithms gbfs={gbfsData} pso={psoData} />;
      case 2: return <StepDecision gbfs={gbfsData} pso={psoData} decision={decisionData} />;
      case 3: return <StepProcessing decision={decisionData} />;
      case 4: return <StepResults gbfs={gbfsData} pso={psoData} logs={logs} setLogs={setLogs} />;
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <div style={S.root}>
        <Sidebar step={currentStep} onJump={i => setCurrentStep(i)} />
        <div style={S.content}>
          <TopBar step={currentStep} maxReached={maxReached} onJump={i => setCurrentStep(i)} />
          <div style={S.main}>{renderStep()}</div>
          <div style={S.bottomBar}>
            <button style={S.navBtnBottom(currentStep === 0)} onClick={() => setCurrentStep(p => p - 1)} disabled={currentStep === 0}>← Back</button>
            <span style={{ fontSize: 12, color: "#9099a8" }}>Step {currentStep + 1} of {STEP_DETAILS.length}</span>
            <button style={S.navBtnNext(currentStep >= maxReached || currentStep >= 4)} onClick={() => setCurrentStep(p => p + 1)} disabled={currentStep >= maxReached || currentStep >= 4}>Next →</button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
