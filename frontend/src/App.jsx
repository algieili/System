import React, { useState, useEffect, useCallback, useRef } from "react";

/* ─────────────────────────────────────────────
   THEME
───────────────────────────────────────────── */
const makeTheme = (dark) => dark ? {
  bg: "#0f1117", surface: "#1a1d27", elevated: "#22263a", border: "#2e3347", borderSub: "#1e2235",
  text: "#e8eaf0", muted: "#8b90a7", dim: "#4a5070",
  blue: "#60a5fa", blueDim: "#1d3a6e", blueBg: "#0d1f3c",
  green: "#34d399", greenDim: "#064e3b", greenBg: "#022c22",
  purple: "#a78bfa", purpleDim: "#3b1fa8", purpleBg: "#1e0a4a",
  amber: "#fbbf24", amberBg: "#292100",
  red: "#f87171", redBg: "#2d0a0a",
  fontMono: "'JetBrains Mono','Fira Code',monospace", fontSans: "'Inter',system-ui,sans-serif",
} : {
  bg: "#eef0f5", surface: "#ffffff", elevated: "#f4f6fb", border: "#c8cdd8", borderSub: "#dde0ea",
  text: "#111827", muted: "#4b5563", dim: "#9ca3af",
  blue: "#1d4ed8", blueDim: "#bfdbfe", blueBg: "#dbeafe",
  green: "#065f46", greenDim: "#6ee7b7", greenBg: "#d1fae5",
  purple: "#5b21b6", purpleDim: "#c4b5fd", purpleBg: "#ede9fe",
  amber: "#92400e", amberBg: "#fef3c7",
  red: "#991b1b", redBg: "#fee2e2",
  fontMono: "'JetBrains Mono','Fira Code',monospace", fontSans: "'Inter',system-ui,sans-serif",
};
const ThemeCtx = React.createContext(makeTheme(true));
const useT = () => React.useContext(ThemeCtx);

/* ─────────────────────────────────────────────
   SERVERS + WORKLOAD TIERS (same shape as the wizard app)
───────────────────────────────────────────── */
const SERVERS = {
  A: { label: "Edge Server A", sub: "Latency-Sensitive · Compute-Heavy", icon: "⚡", baseUrl: "https://system-ctld.onrender.com/api" },
  B: { label: "Cloud Server B", sub: "Energy-Efficient · Cloud-Hosted", icon: "☁️", baseUrl: "https://system-1-rcpl.onrender.com/api" },
};
const PRIMARY_BASE = SERVERS.A.baseUrl;
const resolveServer = (k) => SERVERS[k] ?? SERVERS.A;

const apiFetch = async (baseUrl, path, options = {}) => {
  const res = await fetch(`${baseUrl}${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
};

const WORKLOAD_TIERS = {
  CPCM1: { low: { taskSize: 35, processingTime: 85, queueLength: 1, cpuUtilization: 40, memoryUsage: 1.2, bandwidth: 115, transmissionDelay: 11, energyConsumption: 1.5, throughput: 16, avgLatency: 58 }, medium: { taskSize: 50, processingTime: 120, queueLength: 3, cpuUtilization: 60, memoryUsage: 1.6, bandwidth: 100, transmissionDelay: 16, energyConsumption: 2.3, throughput: 12, avgLatency: 88 }, high: { taskSize: 75, processingTime: 180, queueLength: 7, cpuUtilization: 90, memoryUsage: 2.2, bandwidth: 75, transmissionDelay: 25, energyConsumption: 3.8, throughput: 8, avgLatency: 138 } },
  PB2: { low: { taskSize: 12, processingTime: 45, queueLength: 1, cpuUtilization: 30, memoryUsage: 0.9, bandwidth: 100, transmissionDelay: 8, energyConsumption: 1.0, throughput: 21, avgLatency: 48 }, medium: { taskSize: 20, processingTime: 60, queueLength: 1, cpuUtilization: 45, memoryUsage: 1.2, bandwidth: 80, transmissionDelay: 12, energyConsumption: 1.5, throughput: 16, avgLatency: 72 }, high: { taskSize: 45, processingTime: 130, queueLength: 5, cpuUtilization: 90, memoryUsage: 2.0, bandwidth: 60, transmissionDelay: 22, energyConsumption: 3.2, throughput: 9, avgLatency: 125 } },
  WM1: { low: { taskSize: 18, processingTime: 50, queueLength: 1, cpuUtilization: 35, memoryUsage: 1.2, bandwidth: 115, transmissionDelay: 8, energyConsumption: 1.2, throughput: 23, avgLatency: 55 }, medium: { taskSize: 30, processingTime: 80, queueLength: 2, cpuUtilization: 55, memoryUsage: 2.0, bandwidth: 100, transmissionDelay: 12, energyConsumption: 2.1, throughput: 18, avgLatency: 92 }, high: { taskSize: 60, processingTime: 155, queueLength: 6, cpuUtilization: 90, memoryUsage: 2.8, bandwidth: 70, transmissionDelay: 24, energyConsumption: 3.9, throughput: 9, avgLatency: 140 } },
  SM3: { low: { taskSize: 15, processingTime: 45, queueLength: 1, cpuUtilization: 30, memoryUsage: 1.0, bandwidth: 95, transmissionDelay: 9, energyConsumption: 1.1, throughput: 19, avgLatency: 52 }, medium: { taskSize: 25, processingTime: 70, queueLength: 1, cpuUtilization: 50, memoryUsage: 1.5, bandwidth: 75, transmissionDelay: 15, energyConsumption: 1.8, throughput: 14, avgLatency: 85 }, high: { taskSize: 50, processingTime: 145, queueLength: 5, cpuUtilization: 90, memoryUsage: 2.4, bandwidth: 60, transmissionDelay: 25, energyConsumption: 3.5, throughput: 8, avgLatency: 135 } },
  PCM1: { low: { taskSize: 25, processingTime: 70, queueLength: 1, cpuUtilization: 35, memoryUsage: 0.9, bandwidth: 105, transmissionDelay: 9, energyConsumption: 1.2, throughput: 19, avgLatency: 50 }, medium: { taskSize: 40, processingTime: 100, queueLength: 2, cpuUtilization: 55, memoryUsage: 1.3, bandwidth: 90, transmissionDelay: 14, energyConsumption: 2.0, throughput: 15, avgLatency: 78 }, high: { taskSize: 70, processingTime: 165, queueLength: 7, cpuUtilization: 90, memoryUsage: 2.1, bandwidth: 65, transmissionDelay: 26, energyConsumption: 3.7, throughput: 8, avgLatency: 135 } },
};
const WORKLOAD_LABELS = { low: "Low", medium: "Mid", high: "High" };
const applyWorkloadTier = (machine, tier) => {
  if (!machine || !tier) return machine;
  const o = WORKLOAD_TIERS[machine.machineId]?.[tier];
  return o ? { ...machine, ...o } : machine;
};

/* ─────────────────────────────────────────────
   REAL ALGORITHM MATH (GBFS + PSO) — unchanged logic
───────────────────────────────────────────── */
const SERVER_PROFILES = {
  A: { networkLatencyMs: 5, computeSpeedFactor: 1.00, energyFactor: 1.15, utilizationFactor: 0.90, queueFactor: 1.00 },
  B: { networkLatencyMs: 35, computeSpeedFactor: 0.75, energyFactor: 0.55, utilizationFactor: 0.55, queueFactor: 0.60 },
};
const interpolateProfile = (x) => {
  const a = SERVER_PROFILES.A, b = SERVER_PROFILES.B;
  const lerp = (k) => a[k] + (b[k] - a[k]) * x;
  return { networkLatencyMs: lerp("networkLatencyMs"), computeSpeedFactor: lerp("computeSpeedFactor"), energyFactor: lerp("energyFactor"), utilizationFactor: lerp("utilizationFactor"), queueFactor: lerp("queueFactor") };
};
const evaluateCandidate = (m, profile) => {
  const time = +(m.processingTime * profile.computeSpeedFactor).toFixed(2);
  const networkDelay = +(m.transmissionDelay + profile.networkLatencyMs).toFixed(2);
  const queueDelay = +(m.queueLength * 2 * profile.queueFactor).toFixed(2);
  const latency = +(time + networkDelay + queueDelay).toFixed(2);
  const utilization = +Math.min(100, m.cpuUtilization * profile.utilizationFactor).toFixed(1);
  const energy = +(m.energyConsumption * profile.energyFactor).toFixed(2);
  const throughput = +(m.throughput / profile.computeSpeedFactor).toFixed(1);
  const resourceAvailability = +(100 - utilization).toFixed(1);
  const heuristicScore = +(networkDelay * 0.35 + time * 0.30 + queueDelay * 0.20 + utilization * 0.15).toFixed(2);
  return { time, latency, utilization, energy, throughput, networkDelay, queueDelay, resourceAvailability, heuristicScore };
};
const fitnessOf = (m, x) => {
  const cand = evaluateCandidate(m, interpolateProfile(x));
  const aC = evaluateCandidate(m, SERVER_PROFILES.A), bC = evaluateCandidate(m, SERVER_PROFILES.B);
  const norm = (v, lo, hi) => (hi === lo ? 0 : (v - Math.min(lo, hi)) / Math.abs(hi - lo));
  const cost = 0.5 * norm(cand.latency, aC.latency, bC.latency) + 0.3 * norm(cand.energy, aC.energy, bC.energy) + 0.2 * norm(cand.utilization, aC.utilization, bC.utilization);
  return { cost, fitness: +(1 - cost).toFixed(4), candidate: cand };
};
const computeGBFS = (m) => {
  const A = evaluateCandidate(m, SERVER_PROFILES.A), B = evaluateCandidate(m, SERVER_PROFILES.B);
  const winner = A.latency <= B.latency ? "A" : "B";
  const w = winner === "A" ? A : B, loser = winner === "A" ? B : A;
  return { candidates: { A, B }, recommendedServer: winner, latency: w.latency, time: w.time, utilization: w.utilization, energy: w.energy, throughput: w.throughput,
    decisionReason: `Greedy pick: ${resolveServer(winner).label} latency ${w.latency} ms beats ${resolveServer(winner === "A" ? "B" : "A").label}'s ${loser.latency} ms.` };
};
const computePSO = (m, iterations = 4) => {
  const w = 0.5, c1 = 1.5, c2 = 1.5;
  let particles = [{ x: 0.15, v: 0.10 }, { x: 0.85, v: -0.10 }];
  let globalBestX = particles[0].x, globalBestFitness = -Infinity;
  const log = [];
  for (let it = 1; it <= iterations; it++) {
    const evals = particles.map(p => fitnessOf(m, p.x));
    evals.forEach((e, i) => { if (e.fitness > globalBestFitness) { globalBestFitness = e.fitness; globalBestX = particles[i].x; } });
    log.push({ iteration: it, particleA: { x: +particles[0].x.toFixed(3), fitness: evals[0].fitness, ...evals[0].candidate }, particleB: { x: +particles[1].x.toFixed(3), fitness: evals[1].fitness, ...evals[1].candidate }, bestFitness: +globalBestFitness.toFixed(4), bestX: +globalBestX.toFixed(3) });
    particles = particles.map((p) => {
      const newV = w * p.v + c1 * 0.5 * (p.x - p.x) + c2 * 0.5 * (globalBestX - p.x);
      return { x: Math.min(1, Math.max(0, p.x + newV)), v: newV };
    });
  }
  const finalX = globalBestX;
  const recommendedServer = finalX < 0.5 ? "A" : "B";
  const official = evaluateCandidate(m, SERVER_PROFILES[recommendedServer]);
  return { iterations: log, candidates: { A: evaluateCandidate(m, SERVER_PROFILES.A), B: evaluateCandidate(m, SERVER_PROFILES.B) }, recommendedServer,
    latency: official.latency, time: official.time, utilization: official.utilization, energy: official.energy, throughput: official.throughput,
    decisionReason: `Converged to x=${finalX.toFixed(3)} after ${iterations} iterations (fitness ${globalBestFitness.toFixed(4)}) → ${resolveServer(recommendedServer).label}.` };
};

/* ─────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────── */
const Badge = ({ color = "blue", children, dot }) => {
  const T = useT();
  const map = { blue: [T.blueBg, T.blueDim, T.blue], green: [T.greenBg, T.greenDim, T.green], purple: [T.purpleBg, T.purpleDim, T.purple], amber: [T.amberBg, T.amber, T.amber], red: [T.redBg, T.red, T.red], dim: [T.elevated, T.border, T.muted] };
  const [bg, border, text] = map[color] || map.blue;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 5, fontSize: 13, fontWeight: 600, fontFamily: T.fontMono, background: bg, border: `1px solid ${border}`, color: text, whiteSpace: "nowrap" }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: text, display: "inline-block", flexShrink: 0 }} />}{children}
  </span>;
};
const Card = ({ title, sub, children, accent, right }) => {
  const T = useT();
  return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
    {(title || sub) && <div style={{ padding: "11px 16px", borderBottom: `1px solid ${T.borderSub}`, display: "flex", alignItems: "center", gap: 10, background: T.elevated }}>
      {accent && <div style={{ width: 3, height: 16, borderRadius: 2, background: accent, flexShrink: 0 }} />}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: T.fontSans }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: T.muted, marginTop: 2, fontFamily: T.fontSans }}>{sub}</div>}
      </div>
      {right}
    </div>}
    <div style={{ padding: 16 }}>{children}</div>
  </div>;
};
const InfoBox = ({ color = "blue", children }) => {
  const T = useT();
  const map = { blue: [T.blueBg, T.blueDim, T.blue], green: [T.greenBg, T.greenDim, T.green], amber: [T.amberBg, T.amber, T.amber], red: [T.redBg, T.red, T.red] };
  const [bg, border, text] = map[color] || map.blue;
  return <div style={{ background: bg, border: `1px solid ${border}`, borderLeft: `3px solid ${text}`, borderRadius: 7, padding: "12px 16px", fontSize: 14, color: text, lineHeight: 1.6, fontFamily: T.fontSans }}>{children}</div>;
};
const Stat = ({ label, value, color = "blue" }) => {
  const T = useT();
  const map = { blue: T.blue, green: T.green, purple: T.purple, amber: T.amber, red: T.red };
  return <div style={{ flex: "1 1 130px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px" }}>
    <div style={{ fontSize: 12, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: T.fontSans, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: map[color] || T.text, fontFamily: T.fontMono }}>{value}</div>
  </div>;
};
const Btn = ({ onClick, disabled, children, kind = "primary" }) => {
  const T = useT();
  const styles = {
    primary: { background: disabled ? T.elevated : T.green, color: disabled ? T.dim : (T.bg === "#eef0f5" ? "#fff" : "#0d1117"), border: disabled ? `1px solid ${T.border}` : "none" },
    dual: { background: disabled ? T.elevated : "linear-gradient(135deg,#2563eb,#7c3aed)", color: disabled ? T.dim : "#fff", border: "none" },
    ghost: { background: "transparent", color: disabled ? T.dim : T.muted, border: `1px solid ${disabled ? T.borderSub : T.border}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...styles[kind], borderRadius: 7, padding: "9px 18px", fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: T.fontSans, transition: "transform .12s,filter .12s" }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.08)"; }} onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}>
    {children}
  </button>;
};
const Toggle = ({ on, onClick, labelOn = "ON", labelOff = "OFF" }) => {
  const T = useT();
  return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}>
    <div style={{ position: "relative", width: 34, height: 19, borderRadius: 10, background: on ? T.green : T.dim, transition: "background .2s" }}>
      <div style={{ position: "absolute", top: 3, left: on ? 16 : 3, width: 13, height: 13, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
    </div>
    <span style={{ fontSize: 13, fontFamily: T.fontMono, color: on ? T.green : T.muted, fontWeight: 700, minWidth: 30 }}>{on ? labelOn : labelOff}</span>
  </button>;
};

/* ─────────────────────────────────────────────
   ANIMATED PIPELINE
   Stages mirror the spec's exact sequence. `status` per stage:
   'idle' | 'active' | 'done'
───────────────────────────────────────────── */
const PIPELINE = [
  { key: "machine",  icon: "⚙",  label: "Source Machine" },
  { key: "sim",       icon: "📊", label: "Simulation" },
  { key: "simData",   icon: "📦", label: "Simulation Data" },
  { key: "gbfs",       icon: "⚙️", label: "GBFS" },
  { key: "pso",        icon: "⚙️", label: "PSO" },
  { key: "offloadData",icon: "📦", label: "Offload Data" },
  { key: "network",    icon: "🌐", label: "Network" },
  { key: "server",     icon: "🖥️", label: "Edge Server" },
  { key: "completed",  icon: "✅", label: "Completed" },
  { key: "latency",    icon: "📈", label: "Measure Latency" },
];

const PipelineFlow = ({ stageStatus, statusText }) => {
  const T = useT();
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 6 }}>
        {PIPELINE.map((s, i) => {
          const st = stageStatus[s.key] || "idle";
          const color = st === "done" ? T.green : st === "active" ? T.blue : T.dim;
          const bg = st === "done" ? T.greenBg : st === "active" ? T.blueBg : T.elevated;
          return (
            <React.Fragment key={s.key}>
              {i > 0 && (
                <div style={{ position: "relative", width: 30, height: 2, background: T.border, flexShrink: 0, overflow: "hidden" }}>
                  {(st === "active" || st === "done") && stageStatus[PIPELINE[i - 1].key] !== "idle" && (
                    <div className="flow-packet" style={{ background: st === "active" ? T.blue : T.green }} />
                  )}
                </div>
              )}
              <div style={{ flexShrink: 0, width: 92, textAlign: "center" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%", margin: "0 auto 6px",
                  background: bg, border: `1.5px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  boxShadow: st === "active" ? `0 0 10px ${color}66` : "none",
                  animation: st === "active" ? "pulse 1.1s ease-in-out infinite" : "none",
                }}>{st === "done" ? "✓" : s.icon}</div>
                <div style={{ fontSize: 11, fontFamily: T.fontSans, color, fontWeight: st === "idle" ? 400 : 700, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ marginTop: 6, fontFamily: T.fontMono, fontSize: 13, color: T.blue, minHeight: 18 }}>{statusText}</div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ALGORITHM RESULT MINI-TABLE
───────────────────────────────────────────── */
const CandidateTable = ({ candidates, recommendedServer, color }) => {
  const T = useT();
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
      <thead><tr>
        {["Node", "Latency", "Proc. Time", "Resource Avail.", "Score"].map(h => (
          <th key={h} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", color: T.dim, padding: "5px 8px", borderBottom: `1px solid ${T.borderSub}`, fontFamily: T.fontSans }}>{h}</th>
        ))}
      </tr></thead>
      <tbody>
        {["A", "B"].map(k => {
          const c = candidates[k]; const sel = k === recommendedServer;
          return (
            <tr key={k} style={{ background: sel ? `${color}18` : "transparent" }}>
              <td style={{ padding: "6px 8px", fontFamily: T.fontMono, fontSize: 13, color: sel ? color : T.text, fontWeight: sel ? 700 : 400, borderBottom: `1px solid ${T.borderSub}` }}>{resolveServer(k).label}</td>
              <td style={{ padding: "6px 8px", fontFamily: T.fontMono, fontSize: 13, color: sel ? color : T.muted, borderBottom: `1px solid ${T.borderSub}` }}>{c.latency} ms</td>
              <td style={{ padding: "6px 8px", fontFamily: T.fontMono, fontSize: 13, color: sel ? color : T.muted, borderBottom: `1px solid ${T.borderSub}` }}>{c.time} ms</td>
              <td style={{ padding: "6px 8px", fontFamily: T.fontMono, fontSize: 13, color: sel ? color : T.muted, borderBottom: `1px solid ${T.borderSub}` }}>{c.resourceAvailability}%</td>
              <td style={{ padding: "6px 8px", fontFamily: T.fontMono, fontSize: 13, color: sel ? color : T.muted, fontWeight: sel ? 700 : 400, borderBottom: `1px solid ${T.borderSub}` }}>{c.heuristicScore}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

/* ─────────────────────────────────────────────
   ROOT APP — everything in one panel
───────────────────────────────────────────── */
export default function App() {
  const [dark, setDark] = useState(true);
  const T = makeTheme(dark);

  // machines
  const [machineData, setMachineData] = useState({});
  const [machinesLoading, setMachinesLoading] = useState(true);
  const [machinesError, setMachinesError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [serverStatuses, setServerStatuses] = useState({ A: "checking", B: "checking" });

  // workload
  const [workload, setWorkload] = useState(null); // null | low | medium | high

  // offload controls
  const [autoOffload, setAutoOffload] = useState(true);
  const [manualServer, setManualServer] = useState("A");

  // algorithm state
  const [gbfsPreview, setGbfsPreview] = useState(null); // "GBFS Simulation" — quick, non-committal
  const [gbfsResult, setGbfsResult] = useState(null);   // "GBFS Execution"
  const [psoResult, setPsoResult] = useState(null);     // "PSO Execution"
  const [psoIterShown, setPsoIterShown] = useState(0);

  // pipeline / offload
  const [stageStatus, setStageStatus] = useState({});
  const [statusText, setStatusText] = useState("");
  const [running, setRunning] = useState(false);
  const [decidedServer, setDecidedServer] = useState(null);
  const [winnerAlgo, setWinnerAlgo] = useState(null);
  const [offloadResult, setOffloadResult] = useState(null);
  const [offloadError, setOffloadError] = useState(null);
  const [measuredLatency, setMeasuredLatency] = useState(null);
  const [awaitingManualOffload, setAwaitingManualOffload] = useState(false);

  const rawMachine = selectedId ? machineData[selectedId] : null;
  const machine = applyWorkloadTier(rawMachine, workload);

  const pingServers = useCallback(async () => {
    const results = await Promise.allSettled(Object.entries(SERVERS).map(async ([k, s]) => {
      try { await apiFetch(s.baseUrl, "/health"); return [k, "online"]; } catch { return [k, "offline"]; }
    }));
    const next = {};
    results.forEach(r => { if (r.status === "fulfilled") next[r.value[0]] = r.value[1]; });
    setServerStatuses(prev => ({ ...prev, ...next }));
  }, []);

  const loadMachines = useCallback(async () => {
    setMachinesLoading(true); setMachinesError(null);
    try {
      const data = await apiFetch(PRIMARY_BASE, "/machines");
      setMachineData(data);
      const first = Object.keys(data)[0];
      if (first) setSelectedId(first);
      setServerStatuses(p => ({ ...p, A: "online" }));
    } catch (err) { setMachinesError(err.message); setServerStatuses(p => ({ ...p, A: "offline" })); }
    finally { setMachinesLoading(false); }
  }, []);

  useEffect(() => { loadMachines(); pingServers(); }, [loadMachines, pingServers]);

  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const setStage = (key, status) => setStageStatus(s => ({ ...s, [key]: status }));

  const resetRunState = () => {
    setStageStatus({}); setStatusText(""); setDecidedServer(null); setWinnerAlgo(null);
    setOffloadResult(null); setOffloadError(null); setMeasuredLatency(null); setAwaitingManualOffload(false);
  };

  const handleSelectMachine = (id) => {
    setSelectedId(id); setGbfsPreview(null); setGbfsResult(null); setPsoResult(null); setPsoIterShown(0);
    setWorkload(null); resetRunState();
  };

  const handleSetWorkload = (tier) => {
    setWorkload(tier); setGbfsPreview(null); setGbfsResult(null); setPsoResult(null); setPsoIterShown(0);
    resetRunState();
  };

  /* ---- GBFS Simulation: quick heuristic preview, no commitment ---- */
  const runGbfsSimulation = () => {
    if (!machine) return;
    setGbfsPreview(computeGBFS(machine));
  };

  /* ---- GBFS Execution: standalone full run ---- */
  const runGbfsExecution = async () => {
    if (!machine) return;
    const result = computeGBFS(machine);
    setGbfsResult(result);
  };

  /* ---- PSO Execution: standalone full run with iteration reveal ---- */
  const runPsoExecution = async () => {
    if (!machine) return;
    const result = computePSO(machine);
    setPsoResult(result); setPsoIterShown(0);
    for (let i = 1; i <= result.iterations.length; i++) {
      await delay(280);
      setPsoIterShown(i);
    }
  };

  /* ---- Run GBFS + PSO: the full spec workflow ---- */
  const runFullWorkflow = async () => {
    if (!machine || running) return;
    setRunning(true);
    resetRunState();
    setGbfsResult(null); setPsoResult(null); setPsoIterShown(0);

    // Step 1 — Simulation
    setStage("machine", "done");
    setStage("sim", "active"); setStatusText("Simulation Running...");
    await delay(650);
    setStage("sim", "done");

    // Step 2 — Data Processing: Simulation -> Data -> GBFS -> PSO
    setStage("simData", "active"); setStatusText("Simulation Data → feeding algorithms...");
    await delay(450);
    setStage("simData", "done");

    setStage("gbfs", "active"); setStatusText("GBFS: Running");
    const gbfs = computeGBFS(machine);
    await delay(600);
    setGbfsResult(gbfs);
    setStage("gbfs", "done");

    setStage("pso", "active"); setStatusText("PSO: Running");
    const pso = computePSO(machine);
    setPsoResult(pso); setPsoIterShown(0);
    for (let i = 1; i <= pso.iterations.length; i++) { await delay(260); setPsoIterShown(i); }
    setStage("pso", "done");

    // Step 3 — Algorithm Decision
    const gWins = gbfs.latency <= pso.latency;
    const winner = gWins ? "GBFS" : "PSO";
    const winnerData = gWins ? gbfs : pso;
    setWinnerAlgo(winner);
    setDecidedServer(winnerData.recommendedServer);
    setStatusText("Offload Decision Ready");
    await delay(400);

    // Step 4 — Automatic Offloading
    if (!autoOffload) {
      setAwaitingManualOffload(true);
      setStatusText(`Decision ready — ${winner} recommends ${resolveServer(winnerData.recommendedServer).label}. Automatic Offload is OFF; choose a server and click Offload Task.`);
      setRunning(false);
      return;
    }

    await doOffload(winnerData.recommendedServer, winner, gbfs, pso);
    setRunning(false);
  };

  /* ---- shared offload + measure-latency sequence ---- */
  const doOffload = async (serverKey, winner, gbfs, pso) => {
    const targetSrv = resolveServer(serverKey);

    setStage("offloadData", "active"); setStatusText(`Offload Data → ${targetSrv.label}`);
    await delay(450);
    setStage("offloadData", "done");

    setStage("network", "active"); setStatusText("Network / Offloading — sending task...");
    setMeasuredLatency("calculating");

    let result = null, err = null;
    try {
      result = await apiFetch(targetSrv.baseUrl, "/offload", {
        method: "POST",
        body: JSON.stringify({
          machineId: machine.machineId, taskSize: machine.taskSize, algorithm: winner,
          targetServer: targetSrv.label, gbfsLatency: gbfs.latency, psoLatency: pso.latency,
        }),
      });
    } catch (e) { err = e.message; }

    await delay(400);
    setStage("network", "done");

    setStage("server", "active"); setStatusText(`${targetSrv.label}: Task Received — Server Executing...`);
    await delay(650);
    setStage("server", "done");

    if (err) {
      setOffloadError(err);
      setStatusText(`Offload failed — ${err}`);
      setMeasuredLatency(null);
      return;
    }

    setOffloadResult(result);
    setStage("completed", "done"); setStatusText("Task Completed");
    await delay(250);

    setStage("latency", "active"); setStatusText("Measure Latency: Calculating...");
    await delay(400);
    setMeasuredLatency(result.measuredLatency);
    setStage("latency", "done"); setStatusText(`Measure Latency: ${result.measuredLatency} ms`);
  };

  const manualOffload = async () => {
    if (!gbfsResult || !psoResult || !decidedServer) return;
    setAwaitingManualOffload(false); setRunning(true);
    await doOffload(manualServer, winnerAlgo, gbfsResult, psoResult);
    setRunning(false);
  };

  const overallComplete = stageStatus.latency === "done";

  return (
    <ThemeCtx.Provider value={T}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes packetMove { from { left: -8px; } to { left: 100%; } }
        .flow-packet { position: absolute; top: -3px; width: 8px; height: 8px; border-radius: 50%; animation: packetMove 0.9s linear infinite; }
        button { font-family: inherit; }
        select { font-family: inherit; }
      `}</style>
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: "20px 22px", fontFamily: T.fontSans }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>GBFS + PSO Edge Offloading Panel</div>
            <div style={{ fontSize: 13, color: T.muted, fontFamily: T.fontMono }}>Single-panel · automatic pipeline · v1.0</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(SERVERS).map(([k, s]) => {
              const st = serverStatuses[k]; const online = st === "online";
              return <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 10px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: online ? T.green : st === "checking" ? T.amber : T.red }} />
                <span style={{ fontSize: 12, fontFamily: T.fontMono, color: T.muted }}>{s.label}</span>
              </div>;
            })}
            <button onClick={() => setDark(d => !d)} style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 15 }}>{dark ? "🌙" : "☀️"}</button>
          </div>
        </div>

        {machinesError && <div style={{ marginBottom: 12 }}><InfoBox color="red">Connection failed — {machinesError} <span style={{ marginLeft: 10, textDecoration: "underline", cursor: "pointer" }} onClick={loadMachines}>Retry</span></InfoBox></div>}

        {/* Machine & Workload row */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, marginBottom: 4 }}>
          <Card title="Choose Machine" accent={T.blue}>
            {machinesLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.muted, fontFamily: T.fontMono, fontSize: 14 }}>
                <div style={{ width: 14, height: 14, border: `2px solid ${T.blue}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                Connecting…
              </div>
            ) : (
              <select value={selectedId || ""} onChange={e => handleSelectMachine(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.elevated, color: T.text, fontSize: 14 }}>
                {Object.values(machineData).map(m => <option key={m.id} value={m.id}>{m.machineId} — {m.name}</option>)}
              </select>
            )}
          </Card>

          <Card title="Workload" sub="Low / Mid / High parameter sets" accent={T.purple}>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ k: null, l: "Live" }, { k: "low", l: "Low" }, { k: "medium", l: "Mid" }, { k: "high", l: "High" }].map(opt => {
                const active = workload === opt.k;
                const hasTiers = !opt.k || !!(machine && WORKLOAD_TIERS[machine.machineId]);
                const color = opt.k === "high" ? T.red : opt.k === "medium" ? T.amber : opt.k === "low" ? T.green : T.blue;
                return <button key={opt.l} disabled={!hasTiers} onClick={() => handleSetWorkload(opt.k)} style={{
                  flex: 1, padding: "9px 6px", borderRadius: 7, cursor: hasTiers ? "pointer" : "not-allowed",
                  border: `1px solid ${active ? color : T.border}`, background: active ? `${color}22` : T.elevated,
                  color: active ? color : T.muted, fontWeight: active ? 700 : 500, fontSize: 13,
                }}>{active && "✓ "}{opt.l}</button>;
              })}
            </div>
          </Card>
        </div>

        {/* See Data */}
        {machine && (
          <Card title="See Data" sub={`${machine.machineId} · ${workload ? `${WORKLOAD_LABELS[workload]} workload` : "Live data"}`} accent={T.green}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
              <Stat label="CPU Usage" value={`${machine.cpuUtilization}%`} color="blue" />
              <Stat label="Memory Usage" value={`${machine.memoryUsage} GB`} color="purple" />
              <Stat label="Power" value="Mains (no battery)" color="amber" />
              <Stat label="Network Status" value={serverStatuses.A === "online" ? "Connected" : "Degraded"} color={serverStatuses.A === "online" ? "green" : "red"} />
              <Stat label="Task Size" value={`${machine.taskSize} MB`} color="blue" />
              <Stat label="Processing Time" value={`${machine.processingTime} ms`} color="green" />
              <Stat label="Queue Length" value={`${machine.queueLength} tasks`} color="amber" />
              <Stat label="Bandwidth" value={`${machine.bandwidth} Mbps`} color="purple" />
            </div>
          </Card>
        )}

        {/* Algorithm controls */}
        {machine && (
          <Card title="Algorithm" sub="GBFS Simulation · GBFS Execution · PSO Execution · Run GBFS + PSO" accent={T.blue}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              <Btn kind="ghost" onClick={runGbfsSimulation} disabled={running}>GBFS Simulation</Btn>
              <Btn kind="ghost" onClick={runGbfsExecution} disabled={running}>GBFS Execution</Btn>
              <Btn kind="ghost" onClick={runPsoExecution} disabled={running}>PSO Execution</Btn>
              <Btn kind="dual" onClick={runFullWorkflow} disabled={running}>{running ? "Running…" : "▶ Run GBFS + PSO"}</Btn>
            </div>

            {gbfsPreview && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: "0.05em" }}>GBFS Simulation (preview)</div>
                <CandidateTable candidates={gbfsPreview.candidates} recommendedServer={gbfsPreview.recommendedServer} color={T.blue} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
              {gbfsResult && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>GBFS Execution → {resolveServer(gbfsResult.recommendedServer).label}</div>
                  <CandidateTable candidates={gbfsResult.candidates} recommendedServer={gbfsResult.recommendedServer} color={T.blue} />
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{gbfsResult.decisionReason}</div>
                </div>
              )}
              {psoResult && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.purple, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    PSO Execution — iteration {Math.min(psoIterShown, psoResult.iterations.length)}/{psoResult.iterations.length}
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Particle", "x", "Fitness"].map(h => <th key={h} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", color: T.dim, padding: "5px 8px", borderBottom: `1px solid ${T.borderSub}` }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {psoIterShown > 0 && [{ n: "P1", ...psoResult.iterations[psoIterShown - 1].particleA }, { n: "P2", ...psoResult.iterations[psoIterShown - 1].particleB }].map(p => (
                        <tr key={p.n}>
                          <td style={{ padding: "6px 8px", fontFamily: T.fontMono, fontSize: 13, borderBottom: `1px solid ${T.borderSub}` }}>{p.n}</td>
                          <td style={{ padding: "6px 8px", fontFamily: T.fontMono, fontSize: 13, color: T.muted, borderBottom: `1px solid ${T.borderSub}` }}>{p.x}</td>
                          <td style={{ padding: "6px 8px", fontFamily: T.fontMono, fontSize: 13, color: T.muted, borderBottom: `1px solid ${T.borderSub}` }}>{p.fitness}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {psoIterShown === psoResult.iterations.length && <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{psoResult.decisionReason}</div>}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Offloading controls */}
        {machine && (
          <Card title="Offloading" accent={T.amber} right={<Toggle on={autoOffload} onClick={() => setAutoOffload(a => !a)} />}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSans }}>Automatic Offload</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSans }}>Select Edge Server{autoOffload && " (used only if Automatic Offload is OFF)"}</div>
              <select value={manualServer} onChange={e => setManualServer(e.target.value)} disabled={autoOffload} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: autoOffload ? T.elevated : T.surface, color: autoOffload ? T.dim : T.text, fontSize: 13 }}>
                {Object.entries(SERVERS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
              <Btn kind="primary" onClick={manualOffload} disabled={autoOffload || !awaitingManualOffload || running}>Offload Task</Btn>
            </div>
            {!autoOffload && !awaitingManualOffload && <InfoBox color="amber">Run GBFS + PSO first — with Automatic Offload OFF, the pipeline pauses at the decision step and waits here.</InfoBox>}
          </Card>
        )}

        {/* Animated pipeline */}
        {machine && (
          <Card title="Pipeline" sub="Source Machine → Simulation → Simulation Data → GBFS → PSO → Offload Data → Network → Edge Server → Completed → Measure Latency" accent={T.blue}>
            <PipelineFlow stageStatus={stageStatus} statusText={statusText} />
            {decidedServer && (
              <div style={{ marginTop: 10 }}>
                <Badge color={winnerAlgo === "GBFS" ? "blue" : "purple"} dot>
                  {winnerAlgo} decided → {resolveServer(decidedServer).icon} {resolveServer(decidedServer).label}
                </Badge>
              </div>
            )}
            {offloadError && <div style={{ marginTop: 10 }}><InfoBox color="red">Offload failed — {offloadError}</InfoBox></div>}
          </Card>
        )}

        {/* Measure Latency summary */}
        {machine && (stageStatus.sim || measuredLatency) && (
          <Card title="Measure Latency" accent={T.green}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 10 }}>
              <Stat label="Simulation" value={stageStatus.sim === "done" ? "Completed" : stageStatus.sim === "active" ? "Running" : "—"} color={stageStatus.sim === "done" ? "green" : "amber"} />
              <Stat label="GBFS" value={stageStatus.gbfs === "done" ? "Completed" : stageStatus.gbfs === "active" ? "Running" : "—"} color={stageStatus.gbfs === "done" ? "blue" : "amber"} />
              <Stat label="PSO" value={stageStatus.pso === "done" ? "Completed" : stageStatus.pso === "active" ? "Running" : "—"} color={stageStatus.pso === "done" ? "purple" : "amber"} />
              <Stat label="Offload" value={stageStatus.completed === "done" ? "Completed" : awaitingManualOffload ? "Waiting" : (stageStatus.network || stageStatus.server) ? "In progress" : "—"} color={stageStatus.completed === "done" ? "green" : "amber"} />
              <Stat label="Server" value={decidedServer ? resolveServer(decidedServer).label : "—"} color="blue" />
              <Stat label="Task Status" value={overallComplete ? "Completed" : "Pending"} color={overallComplete ? "green" : "amber"} />
            </div>
            <Stat label="Measured Latency" value={measuredLatency === "calculating" ? "Calculating…" : measuredLatency != null ? `${measuredLatency} ms` : "—"} color="green" />
          </Card>
        )}

      </div>
    </ThemeCtx.Provider>
  );
}
