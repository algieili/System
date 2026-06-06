import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell
} from "recharts";

/* ─── INLINE STYLES (no external CSS needed) ─── */
const S = {
  root: {
    display: "flex", minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    background: "#f5f6fa", color: "#1a1d23"
  },
  sidebar: {
    width: 220, background: "#fff", borderRight: "1px solid #e8eaf0",
    display: "flex", flexDirection: "column", padding: "0 0 24px 0",
    position: "sticky", top: 0, height: "100vh", overflowY: "auto"
  },
  sidebarBrand: {
    padding: "24px 20px 16px", borderBottom: "1px solid #e8eaf0"
  },
  brandTitle: {
    fontWeight: 700, fontSize: 16, color: "#1a1d23", margin: 0, lineHeight: 1.2
  },
  brandSub: { fontSize: 11, color: "#9099a8", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" },
  navSection: { padding: "16px 12px 8px" },
  navLabel: { fontSize: 10, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 6 },
  navBtn: (active) => ({
    display: "flex", alignItems: "flex-start", gap: 10, width: "100%",
    padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
    textAlign: "left", marginBottom: 2,
    background: active ? "#f0f4ff" : "transparent",
    color: active ? "#3b5bdb" : "#4a5568"
  }),
  navIcon: (active) => ({
    width: 18, height: 18, marginTop: 1, flexShrink: 0,
    color: active ? "#3b5bdb" : "#9099a8"
  }),
  navText: { flex: 1 },
  navTitle: (active) => ({ fontSize: 13, fontWeight: active ? 600 : 500, lineHeight: 1.2 }),
  navDesc: { fontSize: 11, color: "#9099a8", lineHeight: 1.3, marginTop: 2 },
  navIndicator: { width: 6, height: 6, borderRadius: 3, background: "#3b5bdb", marginTop: 5, flexShrink: 0 },

  content: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topBar: {
    background: "#fff", borderBottom: "1px solid #e8eaf0",
    padding: "0 28px", display: "flex", alignItems: "center",
    minHeight: 56, gap: 8
  },
  breadcrumb: { fontSize: 13, color: "#9099a8", display: "flex", alignItems: "center", gap: 6 },
  crumbActive: { color: "#1a1d23", fontWeight: 500 },
  crumbSep: { color: "#c4cad6" },
  flowSteps: { display: "flex", alignItems: "center", gap: 0, flex: 1, justifyContent: "center" },
  flowStep: (active, done) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "6px 14px", borderRadius: 20, cursor: "pointer",
    background: active ? "#3b5bdb" : done ? "#e8f5e9" : "transparent",
    color: active ? "#fff" : done ? "#2e7d32" : "#9099a8",
    fontSize: 12, fontWeight: active ? 600 : 500, whiteSpace: "nowrap"
  }),
  flowDot: (active, done) => ({
    width: 7, height: 7, borderRadius: 4, flexShrink: 0,
    background: active ? "#fff" : done ? "#4caf50" : "#d0d6e0"
  }),
  flowArrow: { color: "#d0d6e0", fontSize: 14, padding: "0 2px" },

  main: { flex: 1, padding: "28px", overflowY: "auto" },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: 0, color: "#1a1d23" },
  pageSubtitle: { fontSize: 13, color: "#9099a8", marginTop: 4 },

  statsRow: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  statCard: {
    flex: "1 1 140px", background: "#fff", border: "1px solid #e8eaf0",
    borderRadius: 10, padding: "16px 18px", minWidth: 130
  },
  statLabel: { fontSize: 12, color: "#9099a8", fontWeight: 500, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: 700, color: "#1a1d23" },
  statChange: (up) => ({ fontSize: 12, color: up ? "#2e7d32" : "#c62828", marginTop: 4, fontWeight: 500 }),

  row: { display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" },
  card: {
    background: "#fff", border: "1px solid #e8eaf0", borderRadius: 12,
    padding: "20px 22px", flex: "1 1 320px", minWidth: 260
  },
  cardFull: {
    background: "#fff", border: "1px solid #e8eaf0", borderRadius: 12,
    padding: "20px 22px", marginBottom: 20
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#1a1d23", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" },
  cardDesc: { fontSize: 12, color: "#9099a8", marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "16px 0 10px" },

  dataRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f1f5" },
  dataLabel: { fontSize: 13, color: "#5a6272" },
  dataValue: { fontSize: 13, fontWeight: 500, color: "#1a1d23" },

  input: {
    border: "1px solid #e2e5ec", borderRadius: 7, padding: "7px 10px",
    fontSize: 13, color: "#1a1d23", background: "#fafbfc",
    outline: "none", width: "160px", boxSizing: "border-box"
  },
  select: {
    border: "1px solid #e2e5ec", borderRadius: 7, padding: "7px 10px",
    fontSize: 13, color: "#1a1d23", background: "#fafbfc",
    outline: "none", width: "160px"
  },
  btnPrimary: {
    background: "#3b5bdb", color: "#fff", border: "none",
    borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", marginTop: 16, width: "100%"
  },
  btnDisabled: {
    background: "#c4cad6", color: "#fff", border: "none",
    borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
    cursor: "not-allowed", marginTop: 16, width: "100%"
  },
  bottomBar: {
    background: "#fff", borderTop: "1px solid #e8eaf0",
    padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center"
  },
  navBtnBottom: (disabled) => ({
    padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid #e2e5ec", background: disabled ? "#f5f6fa" : "#fff",
    color: disabled ? "#c4cad6" : "#1a1d23"
  }),
  navBtnNext: (disabled) => ({
    padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "#c4cad6" : "#3b5bdb", color: "#fff", border: "none"
  }),
  badge: (color) => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: color === "blue" ? "#e8f0ff" : color === "green" ? "#e8f5e9" : color === "amber" ? "#fff8e1" : "#fce4ec",
    color: color === "blue" ? "#1a3db5" : color === "green" ? "#2e7d32" : color === "amber" ? "#b45309" : "#c62828"
  }),
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#9099a8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #e8eaf0", background: "#f9fafb" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f0f1f5", color: "#1a1d23" },
  decisionBig: (server) => ({
    fontSize: 32, fontWeight: 800, marginTop: 8, marginBottom: 8,
    color: server === "Edge" ? "#1a3db5" : "#7b2ff7"
  }),
  decisionReason: { fontSize: 14, color: "#5a6272", marginTop: 4 },
  statusDot: (ok) => ({
    display: "inline-block", width: 7, height: 7, borderRadius: 4,
    background: ok ? "#4caf50" : "#f44336", marginRight: 6, verticalAlign: "middle"
  }),
  tabBtn: (active) => ({
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 500,
    cursor: "pointer", border: "1px solid " + (active ? "#3b5bdb" : "#e2e5ec"),
    background: active ? "#3b5bdb" : "#fff", color: active ? "#fff" : "#5a6272"
  }),
  alertBox: (color) => ({
    background: color === "blue" ? "#e8f0ff" : "#e8f5e9",
    border: `1px solid ${color === "blue" ? "#bad0ff" : "#c8e6c9"}`,
    borderRadius: 8, padding: "14px 18px", marginBottom: 16,
    borderLeft: `4px solid ${color === "blue" ? "#3b5bdb" : "#4caf50"}`
  }),
};

/* ─── DATA / ALGORITHMS (unchanged) ─── */
const lookupPlasmaMatrix = (material, thickness, current) => {
  const baselineSpeed = current * 20;
  let cutSpeed = 0, voltage = 140, pierceDelayTime = 0, torchDistance = 3.2, pierceHeight = 6.4;
  if (material === "Mild Steel") {
    cutSpeed = baselineSpeed * Math.exp(-thickness / 10) * 1.5;
    voltage = 130 + (thickness * 1.5);
    pierceDelayTime = thickness < 10 ? 0.1 : thickness < 20 ? 0.5 : 1.0;
  } else if (material === "Stainless Steel") {
    cutSpeed = baselineSpeed * Math.exp(-thickness / 10) * 1.2;
    voltage = 135 + (thickness * 1.8);
    pierceDelayTime = thickness < 10 ? 0.2 : thickness < 20 ? 0.6 : 1.2;
  } else if (material === "Aluminum") {
    cutSpeed = baselineSpeed * Math.exp(-thickness / 12) * 1.7;
    voltage = 140 + (thickness * 1.2);
    pierceDelayTime = thickness < 10 ? 0.1 : thickness < 20 ? 0.4 : 0.8;
  } else { cutSpeed = 1000; }
  cutSpeed = Math.max(100, Math.min(6000, Number(cutSpeed.toFixed(0))));
  voltage = Math.max(100, Math.min(200, Number(voltage.toFixed(0))));
  return { cutSpeed, voltage, pierceDelayTime, torchDistance, pierceHeight };
};

/* Inline algorithm implementations so no external imports needed */
const computeGbfsScore = (params) => {
  const lat = params.latency_milliseconds || 0;
  const spd = params.processingSpeed || 0;
  const eng = params.energy_watts || 0;
  const cpu = params.cpuLoad || 60;
  const latency = Number((lat * 0.9 + Math.random() * 5).toFixed(2));
  const throughput = Number((spd * 120 + Math.random() * 10).toFixed(2));
  const energy = Number((eng * 0.85 + Math.random() * 50).toFixed(2));
  const utilization = Number((cpu * 0.88 + Math.random() * 5).toFixed(2));
  const time = Number((latency * 1.1).toFixed(2));
  const remark = latency < 50 ? "Excellent" : latency < 150 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};

const computePsoScore = (params) => {
  const lat = params.latency_milliseconds || 0;
  const spd = params.processingSpeed || 0;
  const eng = params.energy_watts || 0;
  const cpu = params.cpuLoad || 60;
  const latency = Number((lat * 0.82 + Math.random() * 4).toFixed(2));
  const throughput = Number((spd * 135 + Math.random() * 12).toFixed(2));
  const energy = Number((eng * 0.78 + Math.random() * 40).toFixed(2));
  const utilization = Number((cpu * 0.80 + Math.random() * 5).toFixed(2));
  const time = Number((latency * 1.05).toFixed(2));
  const remark = latency < 50 ? "Excellent" : latency < 150 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};

/* ─── STEP DEFINITIONS ─── */
const STEP_DETAILS = [
  { title: "Data Input", icon: "📥", desc: "Enter machine data and generate tasks." },
  { title: "Algorithms", icon: "⚙️", desc: "Evaluate using GBFS and PSO." },
  { title: "Decision", icon: "🔍", desc: "Compare and choose best processing." },
  { title: "Processing", icon: "🖥️", desc: "Assign task to Edge or Cloud." },
  { title: "Results", icon: "📊", desc: "View performance graphs and logs." }
];

/* ─── SMALL HELPERS ─── */
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
          <div style={S.flowStep(i === step, i < step)}
            onClick={() => i <= maxReached && onJump(i)}>
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
const StepInput = ({ inputs, setInputs, category, autoTask, onRun, isProcessing }) => {
  const valid = Object.values(inputs).every(v => v !== "");
  return (
    <div>
      <div style={S.pageHeader}>
        <div style={S.pageTitle}>Data Input & Generation</div>
        <div style={{ ...S.pageSubtitle }}>Enter machine data to begin the offloading evaluation.</div>
      </div>
      <div style={S.row}>
        <div style={S.card}>
          <CardHeader title="Machine Information" desc="Configured for Plasma Cutting operations." />
          <DataRow label="Specific Machine" value="Plasma Cutting Machine" valueStyle={{ color: "#3b5bdb", fontWeight: 600 }} />
          <DataRow label="Machine Category" value={category} />
          <DataRow label="Auto-Assigned Task Type" value={<span style={S.badge("blue")}>{autoTask}</span>} />

          <div style={S.sectionTitle}>Machine Data Inputs</div>
          {Object.keys(inputs).map(k => (
            <div key={k} style={S.dataRow}>
              <span style={S.dataLabel}>{k}</span>
              {k === "Material Type" ? (
                <select style={S.select} value={inputs[k]} onChange={e => setInputs({ ...inputs, [k]: e.target.value })}>
                  <option value="">Select Material</option>
                  <option value="Mild Steel">Mild Steel</option>
                  <option value="Stainless Steel">Stainless Steel</option>
                  <option value="Aluminum">Aluminum</option>
                </select>
              ) : (
                <input style={S.input} type="number"
                  placeholder={`Enter ${k.split("(")[0].trim()}`}
                  value={inputs[k]}
                  onChange={e => setInputs({ ...inputs, [k]: e.target.value })} />
              )}
            </div>
          ))}
          {!valid && <p style={{ color: "#b45309", fontSize: 12, marginTop: 10 }}>⚠ Please fill in all fields to continue.</p>}
          <button style={valid && !isProcessing ? S.btnPrimary : S.btnDisabled}
            disabled={!valid || isProcessing} onClick={onRun}>
            {isProcessing ? "⏳ Processing..." : "Generate & Offload Task →"}
          </button>
        </div>
        <div style={S.card}>
          <CardHeader title="Input Guide" desc="Follow these steps to run the simulation." />
          <div style={S.alertBox("blue")}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a3db5", marginBottom: 6 }}>Welcome to the Simulator</div>
            <div style={{ fontSize: 13, color: "#3b5bdb", lineHeight: 1.6 }}>
              This system simulates task offloading decisions for plasma cutting operations using two AI algorithms.
            </div>
          </div>
          {[
            { icon: "🔧", label: "Machine", text: "Configured for Plasma Cutting operations." },
            { icon: "✏️", label: "Input values", text: "Enter material type, thickness, and current (ensure no blanks)." },
            { icon: "▶️", label: "Click Generate", text: "The system will simulate offloading choices using GBFS and PSO." },
            { icon: "🔀", label: "Navigation", text: "Use NEXT / BACK buttons or the top flow bar to review results." }
          ].map(({ icon, label, text }) => (
            <div key={label} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{label}</div>
                <div style={{ fontSize: 12, color: "#5a6272", lineHeight: 1.5 }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── STEP 1: ALGORITHMS ─── */
const PIE_COLORS = { Delay: "#3b5bdb", Speed: "#10b981", Energy: "#f97316", Usage: "#a855f7" };

const AlgoCard = ({ title, color, data }) => (
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
        <AlgoCard title="GBFS Evaluation" color="blue" data={gbfs} />
        <AlgoCard title="PSO Evaluation" color="purple" data={pso} />
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
          <div style={S.decisionBig(decision.server)}>
            OFFLOAD TO {(decision.server || "...").toUpperCase()}
          </div>
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
            <tr>
              {["Metric", "GBFS", "PSO", "Better Result"].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ["Delay (ms)", gbfs.latency, pso.latency, "Delay"],
              ["Processing Speed (tasks/s)", gbfs.throughput, pso.throughput, "Speed"],
              ["Energy (watts)", gbfs.energy, pso.energy, "Energy"],
              ["Resource Usage (%)", gbfs.utilization, pso.utilization, "Usage"]
            ].map(([label, g, p, metric]) => (
              <tr key={label}>
                <td style={S.td}>{label}</td>
                <td style={{ ...S.td, fontWeight: 600, color: "#3b5bdb" }}>{g}</td>
                <td style={{ ...S.td, fontWeight: 600, color: "#7b2ff7" }}>{p}</td>
                <td style={S.td}>
                  <span style={S.badge(getW(metric) === "GBFS" ? "blue" : "amber")}>{getW(metric)}</span>
                </td>
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
        <DataRow label="Assigned Server" value={<span style={S.badge(decision.server === "Edge" ? "blue" : "amber")}>{decision.server} Server</span>} />
        <DataRow label="Algorithm Used" value={decision.winner} />
        <DataRow label="Summary" value={`${decision.winner} optimally assigned to ${decision.server} server.`} />
      </div>
      <div style={S.card}>
        <CardHeader title="Result Transmission" desc="Confirmation of data flow back to local device." />
        {[
          ["Processing Status", "Complete", "green"],
          ["Transmission Time", "145 ms", "green"],
          ["Network Return Status", "Confirmed", "green"],
          ["Final Task Status", "Success", "green"]
        ].map(([label, value, color]) => (
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

      {/* Stats row */}
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

      {/* Bar chart */}
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

      {/* View mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {["Single Run", "Daily Analysis", "Weekly Analysis"].map(m => (
          <button key={m} style={S.tabBtn(viewMode === m)} onClick={() => setViewMode(m)}>{m}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setLogs([])}
          style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#fce4ec", color: "#c62828", border: "1px solid #f8bbd0" }}>
          Clear Logs
        </button>
      </div>

      {viewMode === "Single Run" ? (
        <div style={S.cardFull}>
          <CardHeader title="Execution Logs" desc="Timestamped records of all historical decisions." />
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>{["#", "Timestamp", "Category", "Task Type", "Delay", "Speed", "Best Algorithm", "Server", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {logs.map((L, i) => (
                  <tr key={i}>
                    <td style={{ ...S.td, color: "#9099a8" }}>{L.id}</td>
                    <td style={S.td}>{L.timestamp ? new Date(L.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</td>
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
                  <tr><td colSpan={9} style={{ ...S.td, textAlign: "center", color: "#9099a8", fontStyle: "italic", padding: "28px" }}>No execution records. Run a simulation to generate results.</td></tr>
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
  const [inputs, setInputs] = useState({ "Material Type": "", "Material Thickness (millimeters)": "", "Cutting Current (amperes)": "" });
  const [gbfsData, setGbfsData] = useState(null);
  const [psoData, setPsoData] = useState(null);
  const [decisionData, setDecisionData] = useState({});
  const [logs, setLogs] = useState([]);

  const category = "Cutting Machines";
  const autoTask = "Computation-Intensive";

  const handleRun = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const materialType = inputs["Material Type"] || "Mild Steel";
      const thickness = parseFloat(inputs["Material Thickness (millimeters)"]) || 10;
      const current = parseFloat(inputs["Cutting Current (amperes)"]) || 45;
      const autoFill = lookupPlasmaMatrix(materialType, thickness, current);
      const materialFactor = materialType === "Aluminum" ? 0.8 : materialType === "Stainless Steel" ? 1.2 : 1.0;
      const processingSpeed = autoFill.cutSpeed / 6000;
      const latency_milliseconds = autoFill.pierceDelayTime * 1000;
      const energy_watts = autoFill.voltage * current;
      const complexity_score = thickness * materialFactor;
      const cpuLoad = Math.random() * 45 + 50;

      const params = {
        "Net Latency (milliseconds)": latency_milliseconds,
        "CPU Load (percent)": cpuLoad, cpuLoad,
        "Task Queue": Math.random() * 9 + 1,
        "Power Usage (watts)": energy_watts,
        "Temperature (degrees Celsius)": Math.random() * 20 + 40,
        "Task Type": autoTask, materialType, thickness_mm: thickness,
        current_amperes: current, cutSpeed_mm_per_min: autoFill.cutSpeed,
        voltage_volts: autoFill.voltage, pierceDelay_seconds: autoFill.pierceDelayTime,
        torchDistance_mm: autoFill.torchDistance, pierceHeight_mm: autoFill.pierceHeight,
        processingSpeed, latency_milliseconds, energy_watts, complexity_score
      };

      const gbfs = computeGbfsScore(params);
      const pso = computePsoScore(params);
      setGbfsData(gbfs); setPsoData(pso);

      let winner, server, reason;
      if (autoTask === "Latency-Sensitive") {
        winner = parseFloat(gbfs.latency) < parseFloat(pso.latency) ? "GBFS" : "PSO";
        reason = "it has a faster response (lower delay)."; server = "Edge";
      } else if (autoTask === "Computation-Intensive") {
        winner = parseFloat(gbfs.throughput) > parseFloat(pso.throughput) ? "GBFS" : "PSO";
        reason = "it has higher processing speed."; server = "Cloud";
      } else {
        winner = parseFloat(gbfs.energy) < parseFloat(pso.energy) ? "GBFS" : "PSO";
        reason = "it has better energy efficiency.";
        server = parseFloat(pso.utilization) > 80 ? "Cloud" : "Edge";
      }

      setDecisionData({ winner, server, reason, taskType: autoTask });
      const newId = logs.length + 1;
      setLogs(prev => [...prev, {
        id: newId, category, type: autoTask, timestamp: new Date().toISOString(),
        delay: `${gbfs.latency}/${pso.latency}`, speed: `${gbfs.throughput}/${pso.throughput}`,
        energy: `${gbfs.energy}/${pso.energy}`, utilization: `${gbfs.utilization}/${pso.utilization}`,
        gbfsLat: parseFloat(gbfs.latency), psoLat: parseFloat(pso.latency),
        gbfsSpeed: parseFloat(gbfs.throughput), psoSpeed: parseFloat(pso.throughput),
        gbfsEng: parseFloat(gbfs.energy), psoEng: parseFloat(pso.energy),
        gbfsUtil: parseFloat(gbfs.utilization), psoUtil: parseFloat(pso.utilization),
        winner, server, status: "SUCCESS"
      }]);

      setCurrentStep(1); setMaxReached(4); setIsProcessing(false);
    }, 800);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepInput inputs={inputs} setInputs={setInputs} category={category} autoTask={autoTask} onRun={handleRun} isProcessing={isProcessing} />;
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
