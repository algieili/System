import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
  LineChart, Line, ReferenceLine
} from "recharts";

/* ══════════════════════════════════════════
   FIXED MACHINE DATA
══════════════════════════════════════════ */
const MACHINE_DATA = {
  M1: { id:"M1", machineId:"CPCM1", name:"CNC Plasma",       taskSize:50, bandwidth:100, processingTime:120, queueLength:3, cpuUtilization:60, memoryUsage:1.6, transmissionDelay:16, energyConsumption:2.3, throughput:12, avgLatency:88,  category:"Cutting Machines",   taskType:"Computation-Intensive" },
  M2: { id:"M2", machineId:"PCM1",  name:"Plasma Cutting",    taskSize:40, bandwidth:90,  processingTime:100, queueLength:2, cpuUtilization:55, memoryUsage:1.3, transmissionDelay:14, energyConsumption:2.0, throughput:15, avgLatency:78,  category:"Cutting Machines",   taskType:"Computation-Intensive" },
  M3: { id:"M3", machineId:"PB2",   name:"Paint Booth",       taskSize:20, bandwidth:80,  processingTime:60,  queueLength:1, cpuUtilization:45, memoryUsage:1.2, transmissionDelay:12, energyConsumption:1.5, throughput:16, avgLatency:72,  category:"Finishing Machines", taskType:"Energy-Efficient"      },
  M4: { id:"M4", machineId:"WM1",   name:"Arc Welding",       taskSize:30, bandwidth:100, processingTime:80,  queueLength:2, cpuUtilization:55, memoryUsage:2.0, transmissionDelay:12, energyConsumption:2.1, throughput:18, avgLatency:92,  category:"Welding Machines",   taskType:"Computation-Intensive" },
  M5: { id:"M5", machineId:"SM3",   name:"Shearing Machine",  taskSize:25, bandwidth:75,  processingTime:70,  queueLength:1, cpuUtilization:50, memoryUsage:1.5, transmissionDelay:15, energyConsumption:1.8, throughput:14, avgLatency:85,  category:"Cutting Machines",   taskType:"Latency-Sensitive"     },
};

/* ══════════════════════════════════════════
   ALGORITHMS
══════════════════════════════════════════ */
const computeGbfs = (m) => {
  const latency     = Number((m.avgLatency * 0.90 + m.transmissionDelay * 0.5 + Math.random() * 3).toFixed(2));
  const throughput  = Number((m.throughput  * 0.88 + Math.random() * 1).toFixed(2));
  const energy      = Number((m.energyConsumption * 0.90 + Math.random() * 0.1).toFixed(2));
  const utilization = Number((m.cpuUtilization * 0.88 + Math.random() * 3).toFixed(2));
  const time        = Number((latency + m.transmissionDelay).toFixed(2));
  const remark      = latency < 80 ? "Excellent" : latency < 100 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};
const computePso = (m) => {
  const latency     = Number((m.avgLatency * 0.82 + m.transmissionDelay * 0.4 + Math.random() * 3).toFixed(2));
  const throughput  = Number((m.throughput  * 0.95 + Math.random() * 1).toFixed(2));
  const energy      = Number((m.energyConsumption * 0.82 + Math.random() * 0.1).toFixed(2));
  const utilization = Number((m.cpuUtilization * 0.80 + Math.random() * 3).toFixed(2));
  const time        = Number((latency + m.transmissionDelay * 0.9).toFixed(2));
  const remark      = latency < 80 ? "Excellent" : latency < 100 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};

/* ══════════════════════════════════════════
   STYLES
══════════════════════════════════════════ */
const S = {
  root:       { display:"flex", minHeight:"100vh", fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:"#f5f6fa", color:"#1a1d23" },
  sidebar:    { width:230, background:"#fff", borderRight:"1px solid #e8eaf0", display:"flex", flexDirection:"column", padding:"0 0 24px", position:"sticky", top:0, height:"100vh", overflowY:"auto" },
  brand:      { padding:"24px 20px 16px", borderBottom:"1px solid #e8eaf0" },
  brandT:     { fontWeight:700, fontSize:16, color:"#1a1d23", margin:0 },
  brandS:     { fontSize:11, color:"#9099a8", margin:"4px 0 0", textTransform:"uppercase", letterSpacing:"0.06em" },
  navSec:     { padding:"16px 12px 8px" },
  navLabel:   { fontSize:10, fontWeight:600, color:"#9099a8", textTransform:"uppercase", letterSpacing:"0.08em", padding:"0 8px", marginBottom:6 },
  navBtn:  a  => ({ display:"flex", alignItems:"flex-start", gap:10, width:"100%", padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer", textAlign:"left", marginBottom:2, background:a?"#f0f4ff":"transparent", color:a?"#3b5bdb":"#4a5568" }),
  navText:    { flex:1 },
  navT:    a  => ({ fontSize:13, fontWeight:a?600:500, lineHeight:1.2 }),
  navD:       { fontSize:11, color:"#9099a8", lineHeight:1.3, marginTop:2 },
  navDot:     { width:6, height:6, borderRadius:3, background:"#3b5bdb", marginTop:5, flexShrink:0 },
  content:    { flex:1, display:"flex", flexDirection:"column", minWidth:0 },
  topBar:     { background:"#fff", borderBottom:"1px solid #e8eaf0", padding:"0 24px", display:"flex", alignItems:"center", minHeight:56, gap:8, overflowX:"auto" },
  crumb:      { fontSize:13, color:"#9099a8", display:"flex", alignItems:"center", gap:6, flexShrink:0 },
  crumbA:     { color:"#1a1d23", fontWeight:500 },
  flowWrap:   { display:"flex", alignItems:"center", gap:0, flex:1, justifyContent:"center", flexWrap:"nowrap" },
  flowStep: (a,d) => ({ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:20, background:a?"#3b5bdb":d?"#e8f5e9":"transparent", color:a?"#fff":d?"#2e7d32":"#9099a8", fontSize:11, fontWeight:a?600:500, whiteSpace:"nowrap", cursor:"pointer" }),
  flowDot:  (a,d) => ({ width:6, height:6, borderRadius:3, background:a?"#fff":d?"#4caf50":"#d0d6e0", flexShrink:0 }),
  arrow:      { color:"#d0d6e0", fontSize:13, padding:"0 1px", flexShrink:0 },
  main:       { flex:1, padding:"28px", overflowY:"auto" },
  ph:         { marginBottom:24 },
  pt:         { fontSize:22, fontWeight:700, margin:0 },
  ps:         { fontSize:13, color:"#9099a8", marginTop:4 },
  card:       { background:"#fff", border:"1px solid #e8eaf0", borderRadius:12, padding:"20px 22px", marginBottom:20 },
  ct:         { fontSize:13, fontWeight:600, color:"#1a1d23", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.04em" },
  cd:         { fontSize:12, color:"#9099a8", marginBottom:16 },
  dr:         { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f0f1f5" },
  dl:         { fontSize:13, color:"#5a6272" },
  dv:         { fontSize:13, fontWeight:500, color:"#1a1d23" },
  th:         { textAlign:"left", padding:"10px 12px", fontSize:11, fontWeight:600, color:"#9099a8", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"2px solid #e8eaf0", background:"#f9fafb", whiteSpace:"nowrap" },
  td:         { padding:"10px 12px", borderBottom:"1px solid #f0f1f5", color:"#1a1d23", fontSize:13 },
  badge:   c  => ({ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:c==="blue"?"#e8f0ff":c==="green"?"#e8f5e9":c==="amber"?"#fff8e1":"#fce4ec", color:c==="blue"?"#1a3db5":c==="green"?"#2e7d32":c==="amber"?"#b45309":"#c62828" }),
  mCard:   s  => ({ flex:"1 1 140px", minWidth:130, maxWidth:175, border:`2px solid ${s?"#3b5bdb":"#e8eaf0"}`, borderRadius:12, padding:"14px 12px", cursor:"pointer", background:s?"#f0f4ff":"#fff" }),
  btn:        { background:"#3b5bdb", color:"#fff", border:"none", borderRadius:8, padding:"11px 28px", fontSize:14, fontWeight:600, cursor:"pointer" },
  btnOff:     { background:"#c4cad6", color:"#fff", border:"none", borderRadius:8, padding:"11px 28px", fontSize:14, fontWeight:600, cursor:"not-allowed" },
  bottomBar:  { background:"#fff", borderTop:"1px solid #e8eaf0", padding:"12px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  bbBack:  d  => ({ padding:"8px 20px", borderRadius:8, fontSize:13, fontWeight:600, cursor:d?"not-allowed":"pointer", border:"1px solid #e2e5ec", background:d?"#f5f6fa":"#fff", color:d?"#c4cad6":"#1a1d23" }),
  bbNext:  d  => ({ padding:"8px 20px", borderRadius:8, fontSize:13, fontWeight:600, cursor:d?"not-allowed":"pointer", background:d?"#c4cad6":"#3b5bdb", color:"#fff", border:"none" }),
  bigNum:  c  => ({ fontSize:38, fontWeight:800, color:c==="gbfs"?"#3b5bdb":"#a855f7", margin:"8px 0 4px" }),
  infoBox: c  => ({ background:c==="blue"?"#e8f0ff":"#f3e8ff", border:`1px solid ${c==="blue"?"#bad0ff":"#e9d5ff"}`, borderLeft:`4px solid ${c==="blue"?"#3b5bdb":"#a855f7"}`, borderRadius:8, padding:"14px 18px", marginBottom:12 }),
  stepNum:    { width:30, height:30, borderRadius:15, background:"#e8f0ff", color:"#3b5bdb", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
};

/* ══════════════════════════════════════════
   STEP DEFINITIONS  (7 steps matching flow)
══════════════════════════════════════════ */
const STEPS = [
  { title:"IoT Machine",      icon:"🏭", desc:"Select the IoT device/machine."        },
  { title:"Collect Data",     icon:"📋", desc:"View collected task data."              },
  { title:"GBFS Algorithm",   icon:"⚙️", desc:"Run Greedy Best-First Search."         },
  { title:"PSO Algorithm",    icon:"🔬", desc:"Run Particle Swarm Optimization."      },
  { title:"Select Edge Server",icon:"🖧", desc:"Choose best edge server."             },
  { title:"Offload Task",     icon:"📤", desc:"Send task to selected edge server."    },
  { title:"Measure Latency",  icon:"📊", desc:"Edge processes task & measure latency."},
];

/* ══════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════ */
const Sidebar = ({ step, onJump }) => (
  <div style={S.sidebar}>
    <div style={S.brand}>
      <div style={S.brandT}>Task Offloading</div>
      <div style={S.brandS}>Simulation System</div>
    </div>
    <div style={S.navSec}>
      <div style={S.navLabel}>Flow Steps</div>
      {STEPS.map((s,i) => (
        <button key={i} style={S.navBtn(i===step)} onClick={() => onJump(i)}>
          <span style={{ fontSize:15, marginTop:1 }}>{s.icon}</span>
          <div style={S.navText}>
            <div style={S.navT(i===step)}>{s.title}</div>
            <div style={S.navD}>{s.desc}</div>
          </div>
          {i===step && <div style={S.navDot} />}
        </button>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════
   TOP FLOW BAR
══════════════════════════════════════════ */
const TopBar = ({ step, maxReached, onJump }) => (
  <div style={S.topBar}>
    <div style={S.crumb}>
      <span>Simulation</span>
      <span style={{ color:"#c4cad6" }}>›</span>
      <span style={S.crumbA}>{STEPS[step].title}</span>
    </div>
    <div style={S.flowWrap}>
      {STEPS.map((s,i) => (
        <React.Fragment key={i}>
          <div style={S.flowStep(i===step, i<step)} onClick={() => i<=maxReached && onJump(i)}>
            <div style={S.flowDot(i===step, i<step)} />{s.title}
          </div>
          {i < STEPS.length-1 && <span style={S.arrow}>›</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════
   STEP 0 — IoT Machine (Select)
══════════════════════════════════════════ */
const Step0Machine = ({ selectedId, setSelectedId }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>Step 1 — IoT Machine (Device)</div>
      <div style={S.ps}>Select the IoT manufacturing machine to begin the task offloading simulation.</div>
    </div>
    <div style={S.card}>
      <div style={S.ct}>Available IoT Machines</div>
      <div style={S.cd}>Click a machine card to select it.</div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        {Object.values(MACHINE_DATA).map(m => (
          <div key={m.id} style={S.mCard(selectedId===m.id)} onClick={() => setSelectedId(m.id)}>
            <div style={{ fontSize:24, marginBottom:6 }}>
              {m.id==="M1"?"🔩":m.id==="M2"?"⚡":m.id==="M3"?"🎨":m.id==="M4"?"🔥":"✂️"}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:selectedId===m.id?"#3b5bdb":"#1a1d23" }}>{m.machineId}</div>
            <div style={{ fontSize:12, color:"#5a6272", marginTop:2, lineHeight:1.3 }}>{m.name}</div>
            <div style={{ fontSize:11, color:"#9099a8", marginTop:6 }}>{m.category}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Selected machine detail */}
    {(() => { const m = MACHINE_DATA[selectedId]; return (
      <div style={S.card}>
        <div style={S.ct}>{m.name} — {m.machineId}</div>
        <div style={S.cd}>Machine registered as an IoT device in the edge computing network.</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {[["Machine ID",m.machineId],["Machine Type",m.name],["Category",m.category],["Task Type",m.taskType]].map(([l,v])=>(
            <div key={l} style={{ flex:"1 1 160px", background:"#f8f9ff", border:"1px solid #e0e7ff", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:11, color:"#9099a8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#1a1d23" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16, padding:"12px 16px", background:"#f0f4ff", borderRadius:8, fontSize:13, color:"#3b5bdb" }}>
          ✅ <strong>{m.machineId} ({m.name})</strong> selected as the IoT device. Click <strong>Next</strong> to collect its task data.
        </div>
      </div>
    )})()}
  </div>
);

/* ══════════════════════════════════════════
   STEP 1 — Collect Task Data
══════════════════════════════════════════ */
const Step1CollectData = ({ machine }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>Step 2 — Collect Task Data</div>
      <div style={S.ps}>Task parameters collected from <strong>{machine.name} ({machine.machineId})</strong> — Task Size, Processing Time, Queue Length, and more.</div>
    </div>

    <div style={S.card}>
      <div style={S.ct}>Collected Parameters</div>
      <div style={S.cd}>Fixed IoT sensor readings from the machine's edge node.</div>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>Value</th>
            <th style={S.th}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Machine ID",          machine.machineId,                    "Unique device identifier"],
            ["Task Size",           `${machine.taskSize} MB`,             "Data generated per task"],
            ["Processing Time",     `${machine.processingTime} ms`,       "Time to process task locally"],
            ["Queue Length",        machine.queueLength,                  "Pending task count"],
            ["CPU Utilization",     `${machine.cpuUtilization}%`,         "Edge node processing load"],
            ["Memory Usage",        `${machine.memoryUsage} GB`,          "RAM used by edge node"],
            ["Network Bandwidth",   `${machine.bandwidth} Mbps`,          "Communication speed"],
            ["Transmission Delay",  `${machine.transmissionDelay} ms`,    "Delay to edge server"],
            ["Energy Consumption",  `${machine.energyConsumption} kWh`,   "Energy per operation cycle"],
            ["Throughput",          `${machine.throughput} tasks/min`,    "Tasks completed per minute"],
            ["Average Latency",     `${machine.avgLatency} ms`,           "End-to-end delay"],
          ].map(([p,v,d],i) => (
            <tr key={p} style={{ background:i%2===0?"#fff":"#fafbfc" }}>
              <td style={{ ...S.td, fontWeight:500 }}>{p}</td>
              <td style={{ ...S.td, fontWeight:700, color:"#3b5bdb" }}>{v}</td>
              <td style={{ ...S.td, color:"#5a6272" }}>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div style={{ ...S.infoBox("blue"), marginBottom:0 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#1a3db5", marginBottom:4 }}>Data Collection Complete</div>
      <div style={{ fontSize:13, color:"#3b5bdb" }}>
        All task parameters for <strong>{machine.name}</strong> have been collected. Click <strong>Next</strong> to run the GBFS algorithm for decision making.
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   STEP 2 — GBFS Algorithm
══════════════════════════════════════════ */
const Step2GBFS = ({ machine, gbfsData, onRun, running }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>Step 3 — GBFS Algorithm (Decision Making)</div>
      <div style={S.ps}>Greedy Best-First Search evaluates the optimal offloading path using heuristic cost estimation.</div>
    </div>

    <div style={S.card}>
      <div style={S.ct}>How GBFS Works</div>
      <div style={S.cd}>Heuristic search applied to <strong>{machine.name}</strong> task data.</div>
      {[
        ["1", "Load collected task data",    `Task Size: ${machine.taskSize} MB · Bandwidth: ${machine.bandwidth} Mbps · Processing Time: ${machine.processingTime} ms`],
        ["2", "Compute heuristic h(n)",      "Estimates cost using avg latency + transmission delay weighted factors."],
        ["3", "Greedy node expansion",       "Always expands the node with the lowest h(n) — fastest path to offload decision."],
        ["4", "Evaluate resource usage",     `CPU: ${machine.cpuUtilization}% · Memory: ${machine.memoryUsage} GB · Queue: ${machine.queueLength}`],
        ["5", "Output decision metrics",     "Records final latency, throughput, energy and resource utilization for edge server selection."],
      ].map(([n,t,d]) => (
        <div key={n} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid #f0f1f5" }}>
          <div style={S.stepNum}>{n}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#1a1d23" }}>{t}</div>
            <div style={{ fontSize:12, color:"#5a6272", marginTop:2 }}>{d}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop:20, textAlign:"center" }}>
        <button style={running ? S.btnOff : S.btn} disabled={running} onClick={onRun}>
          {running ? "⏳ Running GBFS..." : "▶ Run GBFS Algorithm"}
        </button>
      </div>
    </div>

    {gbfsData && (
      <div style={S.card}>
        <div style={S.ct}>GBFS Result</div>
        <div style={S.cd}>Algorithm completed. Computed performance metrics below.</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 200px", border:"2px solid #3b5bdb", borderRadius:12, padding:"20px", background:"#f0f4ff", textAlign:"center" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#3b5bdb", textTransform:"uppercase", letterSpacing:"0.05em" }}>Computed Latency</div>
            <div style={S.bigNum("gbfs")}>{gbfsData.latency}<span style={{ fontSize:16, fontWeight:500 }}> ms</span></div>
            <span style={S.badge(gbfsData.remark==="Excellent"?"green":"amber")}>{gbfsData.remark}</span>
          </div>
          <div style={{ flex:"2 1 280px" }}>
            {[["Processing Speed",`${gbfsData.throughput} tasks/s`],["Energy Usage",`${gbfsData.energy} kWh`],["Resource Utilization",`${gbfsData.utilization}%`],["Response Time",`${gbfsData.time} ms`]].map(([l,v])=>(
              <div key={l} style={S.dr}><span style={S.dl}>{l}</span><span style={{ ...S.dv, fontWeight:700 }}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ ...S.infoBox("blue"), marginTop:16, marginBottom:0 }}>
          <div style={{ fontSize:13, color:"#3b5bdb" }}>✅ GBFS computed a latency of <strong>{gbfsData.latency} ms</strong>. Click <strong>Next</strong> to run PSO for comparison.</div>
        </div>
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════
   STEP 3 — PSO Algorithm
══════════════════════════════════════════ */
const Step3PSO = ({ machine, psoData, onRun, running }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>Step 4 — PSO Algorithm (Decision Making)</div>
      <div style={S.ps}>Particle Swarm Optimization explores the solution space broadly to find a globally optimal offloading decision.</div>
    </div>

    <div style={S.card}>
      <div style={S.ct}>How PSO Works</div>
      <div style={S.cd}>Swarm-based optimization applied to <strong>{machine.name}</strong> task data.</div>
      {[
        ["1", "Initialize particle swarm",    `Each particle = a candidate offloading decision for ${machine.name}.`],
        ["2", "Evaluate fitness function",    `Uses task size (${machine.taskSize} MB), bandwidth (${machine.bandwidth} Mbps), and latency (${machine.avgLatency} ms).`],
        ["3", "Update velocity & position",   "Particles move toward personal best (pBest) and global best (gBest)."],
        ["4", "Iterate until convergence",    `CPU: ${machine.cpuUtilization}% · Queue: ${machine.queueLength} · Energy: ${machine.energyConsumption} kWh`],
        ["5", "Output optimal decision",      "Returns the globally best offloading path with minimized latency and energy."],
      ].map(([n,t,d]) => (
        <div key={n} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid #f0f1f5" }}>
          <div style={{ ...S.stepNum, background:"#f3e8ff", color:"#7b2ff7" }}>{n}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#1a1d23" }}>{t}</div>
            <div style={{ fontSize:12, color:"#5a6272", marginTop:2 }}>{d}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop:20, textAlign:"center" }}>
        <button style={running ? S.btnOff : { ...S.btn, background:"#7b2ff7" }} disabled={running} onClick={onRun}>
          {running ? "⏳ Running PSO..." : "▶ Run PSO Algorithm"}
        </button>
      </div>
    </div>

    {psoData && (
      <div style={S.card}>
        <div style={S.ct}>PSO Result</div>
        <div style={S.cd}>Algorithm completed. Computed performance metrics below.</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 200px", border:"2px solid #a855f7", borderRadius:12, padding:"20px", background:"#faf0ff", textAlign:"center" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#a855f7", textTransform:"uppercase", letterSpacing:"0.05em" }}>Computed Latency</div>
            <div style={S.bigNum("pso")}>{psoData.latency}<span style={{ fontSize:16, fontWeight:500 }}> ms</span></div>
            <span style={S.badge(psoData.remark==="Excellent"?"green":"amber")}>{psoData.remark}</span>
          </div>
          <div style={{ flex:"2 1 280px" }}>
            {[["Processing Speed",`${psoData.throughput} tasks/s`],["Energy Usage",`${psoData.energy} kWh`],["Resource Utilization",`${psoData.utilization}%`],["Response Time",`${psoData.time} ms`]].map(([l,v])=>(
              <div key={l} style={S.dr}><span style={S.dl}>{l}</span><span style={{ ...S.dv, fontWeight:700 }}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ ...S.infoBox("purple"), marginTop:16, marginBottom:0 }}>
          <div style={{ fontSize:13, color:"#7b2ff7" }}>✅ PSO computed a latency of <strong>{psoData.latency} ms</strong>. Click <strong>Next</strong> to select the best edge server.</div>
        </div>
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════
   STEP 4 — Select Best Edge Server
══════════════════════════════════════════ */
const Step4SelectEdge = ({ machine, gbfsData, psoData }) => {
  if (!gbfsData || !psoData) return (
    <div style={S.card}><div style={{ textAlign:"center", padding:40, color:"#9099a8" }}>⚠️ Please run both GBFS and PSO first.</div></div>
  );

  const gbfsWins  = gbfsData.latency <= psoData.latency;
  const bestAlgo  = gbfsWins ? "GBFS" : "PSO";
  const bestLatency = Math.min(gbfsData.latency, psoData.latency);
  const server    = machine.taskType === "Latency-Sensitive" ? "Edge Server A (Low-Latency)" : machine.taskType === "Energy-Efficient" ? "Edge Server B (Energy-Optimized)" : "Edge Server C (High-Compute Cloud)";
  const serverIcon = machine.taskType === "Latency-Sensitive" ? "⚡" : machine.taskType === "Energy-Efficient" ? "🌿" : "☁️";

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Step 5 — Select Best Edge Server</div>
        <div style={S.ps}>Based on <strong>{bestAlgo}</strong> algorithm result, the system selects the most suitable edge server for <strong>{machine.name}</strong>.</div>
      </div>

      {/* Algorithm comparison */}
      <div style={S.card}>
        <div style={S.ct}>Algorithm Comparison — Decision</div>
        <div style={S.cd}>Comparing GBFS vs PSO to determine the best offloading path.</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:16 }}>
          {[
            { label:"GBFS Latency", value:`${gbfsData.latency} ms`, wins:gbfsWins, color:"#3b5bdb", bg:"#f0f4ff" },
            { label:"PSO Latency",  value:`${psoData.latency} ms`,  wins:!gbfsWins, color:"#a855f7", bg:"#faf0ff" },
          ].map(({label,value,wins,color,bg}) => (
            <div key={label} style={{ flex:"1 1 180px", background:bg, border:`2px solid ${wins?color:"#e8eaf0"}`, borderRadius:12, padding:"16px 20px", textAlign:"center" }}>
              <div style={{ fontSize:12, fontWeight:600, color, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
              <div style={{ fontSize:30, fontWeight:800, color, margin:"8px 0" }}>{value}</div>
              {wins && <span style={S.badge("green")}>✓ Selected</span>}
            </div>
          ))}
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Metric","GBFS","PSO","Better"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {[["Latency (ms)",gbfsData.latency,psoData.latency,"lower"],["Speed (tasks/s)",gbfsData.throughput,psoData.throughput,"higher"],["Energy (kWh)",gbfsData.energy,psoData.energy,"lower"],["Utilization (%)",gbfsData.utilization,psoData.utilization,"lower"]].map(([l,g,p,dir],i)=>{
              const gW = dir==="lower"?+g<=+p:+g>=+p;
              return (
                <tr key={l} style={{ background:i%2===0?"#fff":"#fafbfc" }}>
                  <td style={{ ...S.td, fontWeight:500 }}>{l}</td>
                  <td style={{ ...S.td, fontWeight:700, color:gW?"#3b5bdb":"#1a1d23" }}>{g}</td>
                  <td style={{ ...S.td, fontWeight:700, color:!gW?"#a855f7":"#1a1d23" }}>{p}</td>
                  <td style={S.td}><span style={S.badge(gW?"blue":"amber")}>{gW?"GBFS":"PSO"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected server */}
      <div style={S.card}>
        <div style={S.ct}>Selected Edge Server</div>
        <div style={S.cd}>Chosen based on <strong>{bestAlgo}</strong> recommendation and task type: <strong>{machine.taskType}</strong>.</div>
        <div style={{ display:"flex", gap:16, alignItems:"center", background:"#e8f5e9", border:"2px solid #4caf50", borderRadius:12, padding:"20px 24px" }}>
          <div style={{ fontSize:40 }}>{serverIcon}</div>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#1a1d23" }}>{server}</div>
            <div style={{ fontSize:13, color:"#5a6272", marginTop:4 }}>Best latency: <strong style={{ color:"#2e7d32" }}>{bestLatency} ms</strong> · Algorithm: <strong>{bestAlgo}</strong> · Machine: <strong>{machine.machineId}</strong></div>
          </div>
          <span style={{ ...S.badge("green"), fontSize:13, padding:"4px 14px", marginLeft:"auto" }}>✓ Ready</span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STEP 5 — Offload Task
══════════════════════════════════════════ */
const Step5Offload = ({ machine, gbfsData, psoData }) => {
  if (!gbfsData || !psoData) return (
    <div style={S.card}><div style={{ textAlign:"center", padding:40, color:"#9099a8" }}>⚠️ Please run both algorithms first.</div></div>
  );
  const bestAlgo  = gbfsData.latency <= psoData.latency ? "GBFS" : "PSO";
  const server    = machine.taskType === "Latency-Sensitive" ? "Edge Server A" : machine.taskType === "Energy-Efficient" ? "Edge Server B" : "Edge Server C";

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Step 6 — Offload Task</div>
        <div style={S.ps}>Task from <strong>{machine.name}</strong> is being offloaded to <strong>{server}</strong> using <strong>{bestAlgo}</strong>.</div>
      </div>

      {/* Flow diagram */}
      <div style={S.card}>
        <div style={S.ct}>Task Offloading Flow</div>
        <div style={S.cd}>Data transmission path from IoT device to edge server.</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, flexWrap:"wrap", padding:"10px 0" }}>
          {[
            { icon:"🏭", label:machine.machineId, sub:"IoT Device", color:"#e8f0ff", border:"#3b5bdb" },
            null,
            { icon:"📡", label:"Network",         sub:`${machine.bandwidth} Mbps · ${machine.transmissionDelay}ms delay`, color:"#fff8e1", border:"#f97316" },
            null,
            { icon:"🖧",  label:server,            sub:"Edge Node",  color:"#e8f5e9", border:"#4caf50" },
          ].map((item, i) => item === null ? (
            <div key={i} style={{ display:"flex", alignItems:"center", padding:"0 8px" }}>
              <div style={{ width:40, height:2, background:"#3b5bdb" }} />
              <div style={{ fontSize:12, color:"#3b5bdb" }}>▶</div>
            </div>
          ) : (
            <div key={i} style={{ flex:"1 1 140px", maxWidth:180, border:`2px solid ${item.border}`, borderRadius:12, padding:"16px", background:item.color, textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#1a1d23" }}>{item.label}</div>
              <div style={{ fontSize:11, color:"#5a6272", marginTop:3, lineHeight:1.3 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Offload details */}
      <div style={S.card}>
        <div style={S.ct}>Offload Details</div>
        <div style={S.cd}>Task transmission parameters and status.</div>
        {[
          ["Task Size",         `${machine.taskSize} MB`],
          ["Algorithm Used",    bestAlgo],
          ["Target Server",     server],
          ["Transmission Delay",`${machine.transmissionDelay} ms`],
          ["Bandwidth",         `${machine.bandwidth} Mbps`],
          ["Task Type",         machine.taskType],
          ["Offload Status",    "✅ Success"],
        ].map(([l,v])=>(
          <div key={l} style={S.dr}>
            <span style={S.dl}>{l}</span>
            <span style={{ ...S.dv, color: v==="✅ Success"?"#2e7d32":undefined, fontWeight:700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   STEP 6 — Measure Latency (Edge Processes + Results)
══════════════════════════════════════════ */
const Step6Latency = ({ machine, gbfsData, psoData }) => {
  if (!gbfsData || !psoData) return (
    <div style={S.card}><div style={{ textAlign:"center", padding:40, color:"#9099a8" }}>⚠️ Please run both algorithms first.</div></div>
  );

  const gbfsWins   = gbfsData.latency <= psoData.latency;
  const winner     = gbfsWins ? "GBFS" : "PSO";
  const improvement= Math.abs(((gbfsData.latency - psoData.latency) / gbfsData.latency) * 100).toFixed(1);
  const server     = machine.taskType === "Latency-Sensitive" ? "Edge Server A" : machine.taskType === "Energy-Efficient" ? "Edge Server B" : "Edge Server C";

  // Line chart data — 6 simulated processing cycles
  const gbfsBase = +gbfsData.latency;
  const psoBase  = +psoData.latency;
  const lineData = [1,2,3,4,5,6].map(t => ({
    cycle: `T${t}`,
    GBFS: +(gbfsBase + Math.sin(t*1.1)*gbfsBase*0.06).toFixed(2),
    PSO:  +(psoBase  + Math.sin(t*1.3)*psoBase *0.06).toFixed(2),
  }));

  const barData = [
    { metric:"Latency (ms)",   GBFS:+gbfsData.latency,     PSO:+psoData.latency     },
    { metric:"Speed (t/s)",    GBFS:+gbfsData.throughput,  PSO:+psoData.throughput  },
    { metric:"Energy (kWh)",   GBFS:+gbfsData.energy,      PSO:+psoData.energy      },
    { metric:"Usage (%)",      GBFS:+gbfsData.utilization, PSO:+psoData.utilization },
  ];

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Step 7 — Edge Server Processes Task & Measure Latency</div>
        <div style={S.ps}><strong>{server}</strong> has processed the task from <strong>{machine.name}</strong>. Final latency measurement and performance results below.</div>
      </div>

      {/* Winner banner */}
      <div style={{ background:gbfsWins?"#e8f0ff":"#faf0ff", border:`2px solid ${gbfsWins?"#3b5bdb":"#a855f7"}`, borderRadius:12, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"#9099a8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Best Algorithm</div>
          <div style={{ fontSize:36, fontWeight:800, color:gbfsWins?"#3b5bdb":"#a855f7" }}>{winner}</div>
          <div style={{ fontSize:13, color:"#5a6272", marginTop:4 }}>
            {winner} achieved <strong>{Math.min(gbfsData.latency, psoData.latency)} ms</strong> — {improvement}% lower than {gbfsWins?"PSO":"GBFS"}
          </div>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {[{l:"GBFS",v:gbfsData.latency,c:"#3b5bdb"},{l:"PSO",v:psoData.latency,c:"#a855f7"}].map(({l,v,c})=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#9099a8", fontWeight:600, textTransform:"uppercase", marginBottom:4 }}>{l} Latency</div>
              <div style={{ fontSize:28, fontWeight:800, color:c }}>{v}<span style={{ fontSize:13 }}> ms</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Latency line chart */}
      <div style={S.card}>
        <div style={S.ct}>Latency Comparison — Line Graph</div>
        <div style={S.cd}>GBFS vs PSO measured latency (ms) across 6 processing cycles on <strong>{server}</strong>.</div>
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={lineData} margin={{ top:16, right:24, left:0, bottom:20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
            <XAxis dataKey="cycle" stroke="#9099a8" fontSize={12} label={{ value:"Processing Cycle", position:"insideBottom", offset:-6, fill:"#9099a8", fontSize:11 }} />
            <YAxis stroke="#9099a8" fontSize={12} unit=" ms" domain={["auto","auto"]} label={{ value:"Latency (ms)", angle:-90, position:"insideLeft", style:{ fill:"#9099a8", fontSize:11 } }} />
            <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"1px solid #e8eaf0" }} formatter={v=>[`${v} ms`,""]} />
            <Legend wrapperStyle={{ fontSize:12 }} verticalAlign="top" />
            <ReferenceLine y={gbfsBase} stroke="#3b5bdb" strokeDasharray="4 4" strokeOpacity={0.35} />
            <ReferenceLine y={psoBase}  stroke="#a855f7" strokeDasharray="4 4" strokeOpacity={0.35} />
            <Line type="monotone" dataKey="GBFS" stroke="#3b5bdb" strokeWidth={2.5} dot={{ r:5, fill:"#3b5bdb", strokeWidth:2, stroke:"#fff" }} activeDot={{ r:7 }} />
            <Line type="monotone" dataKey="PSO"  stroke="#a855f7" strokeWidth={2.5} dot={{ r:5, fill:"#a855f7", strokeWidth:2, stroke:"#fff" }} activeDot={{ r:7 }} />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ textAlign:"center", fontSize:12, color:"#9099a8", marginTop:4 }}>Lower latency = better · Dashed lines = baseline values</p>
      </div>

      {/* Full metrics bar chart */}
      <div style={S.card}>
        <div style={S.ct}>Full Metrics Comparison</div>
        <div style={S.cd}>All computed performance indicators for <strong>{machine.name}</strong>.</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{ top:16, right:20, left:0, bottom:4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
            <XAxis dataKey="metric" stroke="#9099a8" fontSize={11} />
            <YAxis stroke="#9099a8" fontSize={12} />
            <Tooltip contentStyle={{ fontSize:12, borderRadius:8 }} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar dataKey="GBFS" fill="#3b5bdb" radius={[4,4,0,0]}>
              <LabelList dataKey="GBFS" position="top" fill="#9099a8" fontSize={10} />
            </Bar>
            <Bar dataKey="PSO" fill="#a855f7" radius={[4,4,0,0]}>
              <LabelList dataKey="PSO" position="top" fill="#9099a8" fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ textAlign:"center", fontSize:12, color:"#9099a8", marginTop:4 }}>Lower delay & energy is better · Higher speed is better</p>
      </div>

      {/* Summary table */}
      <div style={S.card}>
        <div style={S.ct}>Result Summary Table</div>
        <div style={S.cd}>Final metric-by-metric results for {machine.name} ({machine.machineId}) on {server}.</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Metric","GBFS","PSO","Better"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {[["Latency (ms)",gbfsData.latency,psoData.latency,"lower"],["Speed (tasks/s)",gbfsData.throughput,psoData.throughput,"higher"],["Energy (kWh)",gbfsData.energy,psoData.energy,"lower"],["Resource Usage (%)",gbfsData.utilization,psoData.utilization,"lower"],["Response Time (ms)",gbfsData.time,psoData.time,"lower"]].map(([l,g,p,dir],i)=>{
              const gW = dir==="lower"?+g<=+p:+g>=+p;
              return (
                <tr key={l} style={{ background:i%2===0?"#fff":"#fafbfc" }}>
                  <td style={{ ...S.td, fontWeight:500 }}>{l}</td>
                  <td style={{ ...S.td, fontWeight:700, color:gW?"#3b5bdb":"#1a1d23" }}>{g}</td>
                  <td style={{ ...S.td, fontWeight:700, color:!gW?"#a855f7":"#1a1d23" }}>{p}</td>
                  <td style={S.td}><span style={S.badge(gW?"blue":"amber")}>{gW?"GBFS":"PSO"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ ...S.infoBox("blue"), marginTop:16, marginBottom:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#1a3db5", marginBottom:4 }}>Simulation Complete ✅</div>
          <div style={{ fontSize:13, color:"#3b5bdb" }}>
            <strong>{machine.name} ({machine.machineId})</strong> task was successfully offloaded to <strong>{server}</strong> using <strong>{winner}</strong>. Final measured latency: <strong>{Math.min(gbfsData.latency, psoData.latency)} ms</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ERROR BOUNDARY
══════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(e) { return { hasError:true, error:e }; }
  render() {
    if (this.state.hasError) return <div style={{ padding:20, color:"red" }}><h1>Error</h1><pre>{this.state.error?.toString()}</pre></div>;
    return this.props.children;
  }
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  const [step,        setStep]        = useState(0);
  const [maxReached,  setMaxReached]  = useState(0);
  const [selectedId,  setSelectedId]  = useState("M1");
  const [gbfsData,    setGbfsData]    = useState(null);
  const [psoData,     setPsoData]     = useState(null);
  const [gbfsRunning, setGbfsRunning] = useState(false);
  const [psoRunning,  setPsoRunning]  = useState(false);

  const machine = MACHINE_DATA[selectedId];

  const runGBFS = () => {
    setGbfsRunning(true); setGbfsData(null);
    setTimeout(() => { setGbfsData(computeGbfs(machine)); setGbfsRunning(false); setMaxReached(r=>Math.max(r,2)); }, 900);
  };
  const runPSO = () => {
    setPsoRunning(true); setPsoData(null);
    setTimeout(() => { setPsoData(computePso(machine)); setPsoRunning(false); setMaxReached(r=>Math.max(r,6)); }, 900);
  };

  const canNext = () => {
    if (step===0) return true;
    if (step===1) return true;
    if (step===2) return !!gbfsData;
    if (step===3) return !!psoData;
    if (step===4) return !!gbfsData && !!psoData;
    if (step===5) return !!gbfsData && !!psoData;
    return false;
  };

  const goNext = () => { const n=step+1; setStep(n); setMaxReached(r=>Math.max(r,n)); };

  const renderStep = () => {
    switch(step) {
      case 0: return <Step0Machine    selectedId={selectedId} setSelectedId={id=>{ setSelectedId(id); setGbfsData(null); setPsoData(null); setMaxReached(0); }} />;
      case 1: return <Step1CollectData machine={machine} />;
      case 2: return <Step2GBFS       machine={machine} gbfsData={gbfsData} onRun={runGBFS} running={gbfsRunning} />;
      case 3: return <Step3PSO        machine={machine} psoData={psoData}   onRun={runPSO}  running={psoRunning}  />;
      case 4: return <Step4SelectEdge machine={machine} gbfsData={gbfsData} psoData={psoData} />;
      case 5: return <Step5Offload    machine={machine} gbfsData={gbfsData} psoData={psoData} />;
      case 6: return <Step6Latency    machine={machine} gbfsData={gbfsData} psoData={psoData} />;
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <div style={S.root}>
        <Sidebar step={step} onJump={i => i<=maxReached && setStep(i)} />
        <div style={S.content}>
          <TopBar step={step} maxReached={maxReached} onJump={i => i<=maxReached && setStep(i)} />
          <div style={S.main}>{renderStep()}</div>
          <div style={S.bottomBar}>
            <button style={S.bbBack(step===0)} disabled={step===0} onClick={()=>setStep(p=>p-1)}>← Back</button>
            <span style={{ fontSize:12, color:"#9099a8" }}>Step {step+1} of {STEPS.length}</span>
            <button style={S.bbNext(!canNext()||step>=6)} disabled={!canNext()||step>=6} onClick={goNext}>Next →</button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
