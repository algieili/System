import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
  LineChart, Line, ReferenceLine
} from "recharts";

/* ══════════════════════════════════════════════════════
   FIXED MACHINE DATA
══════════════════════════════════════════════════════ */
const MACHINE_DATA = {
  M1: { id:"M1", machineId:"CPCM1", name:"CNC Plasma",      taskSize:50, bandwidth:100, processingTime:120, queueLength:3, cpuUtilization:60, memoryUsage:1.6, transmissionDelay:16, energyConsumption:2.3, throughput:12, avgLatency:88,  category:"Cutting Machines",   taskType:"Computation-Intensive" },
  M2: { id:"M2", machineId:"PCM1",  name:"Plasma Cutting",   taskSize:40, bandwidth:90,  processingTime:100, queueLength:2, cpuUtilization:55, memoryUsage:1.3, transmissionDelay:14, energyConsumption:2.0, throughput:15, avgLatency:78,  category:"Cutting Machines",   taskType:"Computation-Intensive" },
  M3: { id:"M3", machineId:"PB2",   name:"Paint Booth",      taskSize:20, bandwidth:80,  processingTime:60,  queueLength:1, cpuUtilization:45, memoryUsage:1.2, transmissionDelay:12, energyConsumption:1.5, throughput:16, avgLatency:72,  category:"Finishing Machines", taskType:"Energy-Efficient"      },
  M4: { id:"M4", machineId:"WM1",   name:"Arc Welding",      taskSize:30, bandwidth:100, processingTime:80,  queueLength:2, cpuUtilization:55, memoryUsage:2.0, transmissionDelay:12, energyConsumption:2.1, throughput:18, avgLatency:92,  category:"Welding Machines",   taskType:"Computation-Intensive" },
  M5: { id:"M5", machineId:"SM3",   name:"Shearing Machine", taskSize:25, bandwidth:75,  processingTime:70,  queueLength:1, cpuUtilization:50, memoryUsage:1.5, transmissionDelay:15, energyConsumption:1.8, throughput:14, avgLatency:85,  category:"Cutting Machines",   taskType:"Latency-Sensitive"     },
};

/* ══════════════════════════════════════════════════════
   ALGORITHMS
══════════════════════════════════════════════════════ */
const computeGbfs = (m) => {
  const latency     = Number((m.avgLatency * 0.90 + m.transmissionDelay * 0.5 + Math.random() * 3).toFixed(2));
  const throughput  = Number((m.throughput * 0.88 + Math.random() * 1).toFixed(2));
  const energy      = Number((m.energyConsumption * 0.90 + Math.random() * 0.1).toFixed(2));
  const utilization = Number((m.cpuUtilization * 0.88 + Math.random() * 3).toFixed(2));
  const time        = Number((latency + m.transmissionDelay).toFixed(2));
  const remark      = latency < 80 ? "Excellent" : latency < 100 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};
const computePso = (m) => {
  const latency     = Number((m.avgLatency * 0.82 + m.transmissionDelay * 0.4 + Math.random() * 3).toFixed(2));
  const throughput  = Number((m.throughput * 0.95 + Math.random() * 1).toFixed(2));
  const energy      = Number((m.energyConsumption * 0.82 + Math.random() * 0.1).toFixed(2));
  const utilization = Number((m.cpuUtilization * 0.80 + Math.random() * 3).toFixed(2));
  const time        = Number((latency + m.transmissionDelay * 0.9).toFixed(2));
  const remark      = latency < 80 ? "Excellent" : latency < 100 ? "Good" : "Moderate";
  return { latency, throughput, energy, utilization, time, remark };
};

/* ══════════════════════════════════════════════════════
   DESIGN TOKENS — dark-green sidebar theme
══════════════════════════════════════════════════════ */
const SIDEBAR_BG   = "#1a2e1a";   // deep forest green
const SIDEBAR_SEC  = "#243524";   // slightly lighter green
const ACCENT       = "#4ade80";   // bright green accent
const ACCENT_DIM   = "#16a34a";   // medium green
const TEXT_LIGHT   = "#e2f0e2";   // near-white on dark
const TEXT_MUTED   = "#7cad7c";   // muted green text

const S = {
  /* ── Layout ── */
  root:      { display:"flex", minHeight:"100vh", fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:"#f0f2f5", color:"#1a1d23" },

  /* ── Sidebar ── */
  sidebar:   { width:240, background:SIDEBAR_BG, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto", flexShrink:0 },
  sbTop:     { padding:"28px 20px 20px", borderBottom:`1px solid #2d442d` },
  sbLogo:    { display:"flex", alignItems:"center", gap:10, marginBottom:4 },
  sbIcon:    { width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#4ade80,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 },
  sbTitle:   { fontSize:15, fontWeight:700, color:TEXT_LIGHT, letterSpacing:"-0.01em" },
  sbSub:     { fontSize:10, color:TEXT_MUTED, textTransform:"uppercase", letterSpacing:"0.1em", marginTop:2 },
  sbSection: { padding:"20px 14px 6px" },
  sbLabel:   { fontSize:10, fontWeight:700, color:TEXT_MUTED, textTransform:"uppercase", letterSpacing:"0.1em", padding:"0 8px", marginBottom:8 },
  sbBtn:  a  => ({ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer", textAlign:"left", marginBottom:3, background:a?"rgba(74,222,128,0.15)":"transparent", color:a?ACCENT:TEXT_MUTED, transition:"all 0.15s" }),
  sbBtnBar:  { width:3, height:20, borderRadius:2, background:ACCENT, marginRight:2, flexShrink:0 },
  sbBtnIcon: { fontSize:15, width:20, textAlign:"center", flexShrink:0 },
  sbBtnText: { flex:1 },
  sbBtnT: a  => ({ fontSize:13, fontWeight:a?600:400, lineHeight:1.2, color:a?ACCENT:TEXT_MUTED }),
  sbBtnD:    { fontSize:10, color:"#4d6b4d", marginTop:1 },
  sbBadge:   { fontSize:10, fontWeight:700, background:"rgba(74,222,128,0.2)", color:ACCENT, borderRadius:10, padding:"2px 7px", flexShrink:0 },
  sbFooter:  { marginTop:"auto", padding:"16px 20px", borderTop:"1px solid #2d442d" },
  sbFootT:   { fontSize:11, color:"#4d6b4d" },
  sbFootV:   { fontSize:12, color:TEXT_MUTED, fontWeight:600 },

  /* ── Main content ── */
  content:   { flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" },

  /* ── Top header bar ── */
  header:    { background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 28px", display:"flex", alignItems:"center", minHeight:60, gap:12 },
  hBreadcrumb: { display:"flex", alignItems:"center", gap:8, fontSize:13 },
  hBCRoot:   { color:"#9ca3af" },
  hBCSep:    { color:"#d1d5db", fontSize:12 },
  hBCActive: { color:"#111827", fontWeight:600 },
  hRight:    { marginLeft:"auto", display:"flex", alignItems:"center", gap:8 },
  hStepPill: { background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, color:"#15803d" },

  /* ── Progress bar below header ── */
  progBar:   { background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"12px 28px", display:"flex", alignItems:"center", gap:0, overflowX:"auto" },
  progStep: (a,d) => ({ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:6, cursor:"pointer", background:a?"#052e16":d?"#f0fdf4":"transparent", border:a?"none":d?"1px solid #bbf7d0":"none", flexShrink:0 }),
  progNum:  (a,d) => ({ width:22, height:22, borderRadius:11, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:a?"#4ade80":d?"#16a34a":"#e5e7eb", color:a?"#052e16":d?"#fff":"#9ca3af" }),
  progTxt:  (a,d) => ({ fontSize:11, fontWeight:a?700:d?600:400, color:a?"#4ade80":d?"#15803d":"#9ca3af", whiteSpace:"nowrap" }),
  progLine:  { flex:"0 0 24px", height:2, background:"#e5e7eb", margin:"0 2px" },
  progLineDone: { flex:"0 0 24px", height:2, background:"#16a34a", margin:"0 2px" },

  /* ── Page main area ── */
  main:      { flex:1, padding:"28px 32px", overflowY:"auto", background:"#f0f2f5" },

  /* ── Page header ── */
  ph:        { marginBottom:24 },
  pt:        { fontSize:22, fontWeight:700, color:"#111827", margin:0 },
  ps:        { fontSize:13, color:"#6b7280", marginTop:5 },

  /* ── Cards ── */
  card:      { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"22px 24px", marginBottom:20, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  cardRow:   { display:"flex", gap:20, marginBottom:20, flexWrap:"wrap" },
  ct:        { fontSize:12, fontWeight:700, color:"#374151", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.06em" },
  cd:        { fontSize:12, color:"#9ca3af", marginBottom:16 },

  /* ── Stat cards ── */
  statCard:  { flex:"1 1 150px", background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  statIcon:  (c) => ({ width:40, height:40, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:12, background:c==="green"?"#f0fdf4":c==="blue"?"#eff6ff":c==="purple"?"#faf5ff":"#fff7ed", border:`1px solid ${c==="green"?"#bbf7d0":c==="blue"?"#bfdbfe":c==="purple"?"#e9d5ff":"#fed7aa"}` }),
  statVal:   { fontSize:26, fontWeight:800, color:"#111827", lineHeight:1 },
  statLbl:   { fontSize:12, color:"#6b7280", marginTop:4, fontWeight:500 },
  statChg:   (up) => ({ fontSize:11, color:up?"#16a34a":"#dc2626", marginTop:6, fontWeight:600 }),

  /* ── Table ── */
  th:        { textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #f3f4f6", background:"#f9fafb", whiteSpace:"nowrap" },
  td:        { padding:"11px 14px", borderBottom:"1px solid #f3f4f6", color:"#1f2937", fontSize:13 },

  /* ── Data rows ── */
  dr:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f3f4f6" },
  dl:        { fontSize:13, color:"#6b7280" },
  dv:        { fontSize:13, fontWeight:600, color:"#111827" },

  /* ── Badges ── */
  badge:  c  => ({ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
    background:c==="green"?"#f0fdf4":c==="blue"?"#eff6ff":c==="amber"?"#fffbeb":c==="purple"?"#faf5ff":"#fef2f2",
    color:c==="green"?"#15803d":c==="blue"?"#1d4ed8":c==="amber"?"#92400e":c==="purple"?"#7c3aed":"#dc2626",
    border:`1px solid ${c==="green"?"#bbf7d0":c==="blue"?"#bfdbfe":c==="amber"?"#fde68a":c==="purple"?"#e9d5ff":"#fecaca"}` }),

  /* ── Machine selection cards ── */
  mCard:  s  => ({ flex:"1 1 140px", minWidth:130, maxWidth:170, border:`2px solid ${s?"#16a34a":"#e5e7eb"}`, borderRadius:12, padding:"16px 14px", cursor:"pointer", background:s?"#f0fdf4":"#fff", transition:"all 0.15s", boxShadow:s?"0 0 0 3px rgba(22,163,74,0.15)":"none" }),

  /* ── Buttons ── */
  btn:       { background:"#16a34a", color:"#fff", border:"none", borderRadius:8, padding:"11px 28px", fontSize:14, fontWeight:600, cursor:"pointer" },
  btnOff:    { background:"#d1d5db", color:"#9ca3af", border:"none", borderRadius:8, padding:"11px 28px", fontSize:14, fontWeight:600, cursor:"not-allowed" },
  btnPurple: { background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, padding:"11px 28px", fontSize:14, fontWeight:600, cursor:"pointer" },

  /* ── Bottom nav ── */
  bottomBar: { background:"#fff", borderTop:"1px solid #e5e7eb", padding:"14px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  bbBack: d  => ({ padding:"9px 22px", borderRadius:8, fontSize:13, fontWeight:600, cursor:d?"not-allowed":"pointer", border:"1px solid #d1d5db", background:d?"#f9fafb":"#fff", color:d?"#d1d5db":"#374151" }),
  bbNext: d  => ({ padding:"9px 22px", borderRadius:8, fontSize:13, fontWeight:600, cursor:d?"not-allowed":"pointer", background:d?"#d1d5db":"#16a34a", color:"#fff", border:"none" }),

  /* ── Misc ── */
  bigNum: c  => ({ fontSize:36, fontWeight:800, color:c==="gbfs"?"#1d4ed8":"#7c3aed", margin:"8px 0 4px" }),
  infoBox: c => ({ background:c==="blue"?"#eff6ff":c==="green"?"#f0fdf4":c==="purple"?"#faf5ff":"#fff7ed", border:`1px solid ${c==="blue"?"#bfdbfe":c==="green"?"#bbf7d0":c==="purple"?"#e9d5ff":"#fed7aa"}`, borderLeft:`4px solid ${c==="blue"?"#3b82f6":c==="green"?"#16a34a":c==="purple"?"#7c3aed":"#f97316"}`, borderRadius:8, padding:"14px 18px", marginBottom:12 }),
  stepNum:   { width:30, height:30, borderRadius:15, background:"#eff6ff", color:"#1d4ed8", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  divider:   { height:1, background:"#f3f4f6", margin:"12px 0" },
};

/* ══════════════════════════════════════════════════════
   STEP DEFINITIONS
══════════════════════════════════════════════════════ */
const STEPS = [
  { title:"IoT Machine",       icon:"🏭", short:"Machine",    desc:"Select the IoT device"         },
  { title:"Collect Data",      icon:"📋", short:"Collect",    desc:"View task parameters"          },
  { title:"GBFS Algorithm",    icon:"⚙️", short:"GBFS",       desc:"Run greedy search"             },
  { title:"PSO Algorithm",     icon:"🔬", short:"PSO",        desc:"Run swarm optimization"        },
  { title:"Select Edge Server",icon:"🖧",  short:"Edge Server",desc:"Pick best server"             },
  { title:"Offload Task",      icon:"📤", short:"Offload",    desc:"Send to edge"                  },
  { title:"Measure Latency",   icon:"📊", short:"Latency",    desc:"Results & measurement"         },
];

/* ══════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════ */
const Sidebar = ({ step, maxReached, onJump }) => (
  <div style={S.sidebar}>
    {/* Brand */}
    <div style={S.sbTop}>
      <div style={S.sbLogo}>
        <div style={S.sbIcon}>⚡</div>
        <div>
          <div style={S.sbTitle}>EdgeOffload</div>
          <div style={S.sbSub}>IoT Simulation</div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <div style={S.sbSection}>
      <div style={S.sbLabel}>Simulation Flow</div>
      {STEPS.map((s, i) => {
        const active = i === step;
        const done   = i < step;
        return (
          <button key={i} style={S.sbBtn(active)} onClick={() => i <= maxReached && onJump(i)}>
            {active && <div style={S.sbBtnBar} />}
            <span style={S.sbBtnIcon}>{s.icon}</span>
            <div style={S.sbBtnText}>
              <div style={S.sbBtnT(active)}>{s.title}</div>
              <div style={S.sbBtnD}>{s.desc}</div>
            </div>
            {done  && <span style={{ fontSize:12, color:ACCENT_DIM }}>✓</span>}
            {active && <div style={{ ...S.sbBadge }}>Active</div>}
          </button>
        );
      })}
    </div>

    {/* Footer */}
    <div style={S.sbFooter}>
      <div style={S.sbFootT}>IoT Task Offloading</div>
      <div style={S.sbFootV}>v2.0 · Edge Computing</div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   HEADER + PROGRESS BAR
══════════════════════════════════════════════════════ */
const Header = ({ step, maxReached, onJump }) => (
  <>
    <div style={S.header}>
      <div style={S.hBreadcrumb}>
        <span style={S.hBCRoot}>Simulation</span>
        <span style={S.hBCSep}>›</span>
        <span style={S.hBCActive}>{STEPS[step].title}</span>
      </div>
      <div style={S.hRight}>
        <div style={S.hStepPill}>Step {step + 1} of {STEPS.length}</div>
      </div>
    </div>

    {/* Step progress bar */}
    <div style={S.progBar}>
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div style={S.progStep(i===step, i<step)} onClick={() => i<=maxReached && onJump(i)}>
            <div style={S.progNum(i===step, i<step)}>
              {i < step ? "✓" : i+1}
            </div>
            <span style={S.progTxt(i===step, i<step)}>{s.short}</span>
          </div>
          {i < STEPS.length-1 && (
            <div style={i < step ? S.progLineDone : S.progLine} />
          )}
        </React.Fragment>
      ))}
    </div>
  </>
);

/* ══════════════════════════════════════════════════════
   STEP 0 — IoT Machine
══════════════════════════════════════════════════════ */
const Step0Machine = ({ selectedId, setSelectedId }) => {
  const m = MACHINE_DATA[selectedId];
  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>IoT Machine (Device)</div>
        <div style={S.ps}>Select the IoT manufacturing machine to begin the task offloading simulation flow.</div>
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { icon:"🏭", label:"Total Machines",  value:5,         color:"green"  },
          { icon:"⚙️", label:"Cutting Machines", value:3,         color:"blue"   },
          { icon:"🎨", label:"Finishing",        value:1,         color:"purple" },
          { icon:"🔥", label:"Welding",          value:1,         color:"amber"  },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={S.statCard}>
            <div style={S.statIcon(color)}>{icon}</div>
            <div style={S.statVal}>{value}</div>
            <div style={S.statLbl}>{label}</div>
          </div>
        ))}
      </div>

      {/* Machine cards */}
      <div style={S.card}>
        <div style={S.ct}>Available IoT Machines</div>
        <div style={S.cd}>Click a machine to select it for simulation.</div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          {Object.values(MACHINE_DATA).map(mc => (
            <div key={mc.id} style={S.mCard(selectedId===mc.id)} onClick={() => setSelectedId(mc.id)}>
              <div style={{ fontSize:26, marginBottom:8 }}>
                {mc.id==="M1"?"🔩":mc.id==="M2"?"⚡":mc.id==="M3"?"🎨":mc.id==="M4"?"🔥":"✂️"}
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:selectedId===mc.id?"#15803d":"#111827", marginBottom:2 }}>{mc.machineId}</div>
              <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.3 }}>{mc.name}</div>
              {selectedId===mc.id && (
                <div style={{ marginTop:8 }}>
                  <span style={S.badge("green")}>✓ Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected machine detail */}
      <div style={S.card}>
        <div style={S.ct}>{m.name} — {m.machineId}</div>
        <div style={S.cd}>Machine registered as an IoT device in the edge computing network.</div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:16 }}>
          {[
            ["Machine ID", m.machineId, "blue"],
            ["Category",   m.category,  "green"],
            ["Task Type",  m.taskType,  "amber"],
          ].map(([l,v,c]) => (
            <div key={l} style={{ flex:"1 1 160px", background:"#f9fafb", border:"1px solid #f3f4f6", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontSize:11, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{l}</div>
              <span style={S.badge(c)}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...S.infoBox("green"), marginBottom:0 }}>
          <div style={{ fontSize:13, color:"#15803d" }}>
            ✅ <strong>{m.machineId} ({m.name})</strong> selected as the IoT device. Click <strong>Next</strong> to collect its task data.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   STEP 1 — Collect Task Data
══════════════════════════════════════════════════════ */
const Step1CollectData = ({ machine: m }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>Collect Task Data</div>
      <div style={S.ps}>Task parameters collected from <strong>{m.name} ({m.machineId})</strong> — Task Size, Processing Time, Queue Length, and more.</div>
    </div>

    {/* Quick stats */}
    <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
      {[
        { icon:"📦", label:"Task Size",       value:`${m.taskSize} MB`,           color:"blue"   },
        { icon:"⏱️", label:"Processing Time", value:`${m.processingTime} ms`,     color:"green"  },
        { icon:"📡", label:"Bandwidth",       value:`${m.bandwidth} Mbps`,        color:"purple" },
        { icon:"🔋", label:"Energy",          value:`${m.energyConsumption} kWh`, color:"amber"  },
      ].map(({ icon, label, value, color }) => (
        <div key={label} style={S.statCard}>
          <div style={S.statIcon(color)}>{icon}</div>
          <div style={S.statVal}>{value}</div>
          <div style={S.statLbl}>{label}</div>
        </div>
      ))}
    </div>

    <div style={S.card}>
      <div style={S.ct}>Collected Parameters — {m.machineId}</div>
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
            ["Machine ID",        m.machineId,                    "Unique device identifier"],
            ["Task Size",         `${m.taskSize} MB`,             "Data generated per task"],
            ["Processing Time",   `${m.processingTime} ms`,       "Time to process task locally"],
            ["Queue Length",      m.queueLength,                  "Pending task count"],
            ["CPU Utilization",   `${m.cpuUtilization}%`,         "Edge node processing load"],
            ["Memory Usage",      `${m.memoryUsage} GB`,          "RAM used by edge node"],
            ["Network Bandwidth", `${m.bandwidth} Mbps`,          "Communication speed"],
            ["Transmission Delay",`${m.transmissionDelay} ms`,    "Delay to edge server"],
            ["Energy Consumption",`${m.energyConsumption} kWh`,   "Energy per operation cycle"],
            ["Throughput",        `${m.throughput} tasks/min`,    "Tasks completed per minute"],
            ["Average Latency",   `${m.avgLatency} ms`,           "End-to-end delay"],
          ].map(([p,v,d],i) => (
            <tr key={p} style={{ background:i%2===0?"#fff":"#f9fafb" }}>
              <td style={{ ...S.td, fontWeight:600, color:"#374151" }}>{p}</td>
              <td style={{ ...S.td }}><span style={S.badge("blue")}>{v}</span></td>
              <td style={{ ...S.td, color:"#6b7280" }}>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div style={{ ...S.infoBox("green"), marginBottom:0 }}>
      <div style={{ fontSize:13, color:"#15803d" }}>
        📋 All task parameters for <strong>{m.name}</strong> collected. Click <strong>Next</strong> to run the GBFS algorithm.
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   STEP 2 — GBFS Algorithm
══════════════════════════════════════════════════════ */
const Step2GBFS = ({ machine: m, gbfsData, onRun, running }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>GBFS Algorithm — Decision Making</div>
      <div style={S.ps}>Greedy Best-First Search evaluates the optimal offloading path using heuristic cost estimation for <strong>{m.name}</strong>.</div>
    </div>

    <div style={S.card}>
      <div style={S.ct}>How GBFS Works</div>
      <div style={S.cd}>Step-by-step heuristic search process applied to the collected task data.</div>
      {[
        ["1","Load collected task data",   `Task Size: ${m.taskSize} MB · Bandwidth: ${m.bandwidth} Mbps · Processing Time: ${m.processingTime} ms`],
        ["2","Compute heuristic h(n)",     "Estimates cost using avg latency + transmission delay weighted factors."],
        ["3","Greedy node expansion",      "Always expands the node with the lowest h(n) — fastest path to offload decision."],
        ["4","Evaluate resource usage",    `CPU: ${m.cpuUtilization}% · Memory: ${m.memoryUsage} GB · Queue: ${m.queueLength}`],
        ["5","Output decision metrics",    "Records final latency, throughput, energy and utilization for edge server selection."],
      ].map(([n,t,d]) => (
        <div key={n} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 0", borderBottom:"1px solid #f3f4f6" }}>
          <div style={S.stepNum}>{n}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{t}</div>
            <div style={{ fontSize:12, color:"#6b7280", marginTop:3 }}>{d}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop:20, textAlign:"center" }}>
        <button style={running ? S.btnOff : S.btn} disabled={running} onClick={onRun}>
          {running ? "⏳ Running GBFS..." : "▶  Run GBFS Algorithm"}
        </button>
      </div>
    </div>

    {gbfsData && (
      <div style={S.card}>
        <div style={S.ct}>GBFS Result</div>
        <div style={S.cd}>Algorithm completed. Computed performance metrics for {m.name}.</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 200px", border:"2px solid #bfdbfe", borderRadius:12, padding:"20px", background:"#eff6ff", textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#1d4ed8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Computed Latency</div>
            <div style={S.bigNum("gbfs")}>{gbfsData.latency}<span style={{ fontSize:16, fontWeight:500 }}> ms</span></div>
            <span style={S.badge(gbfsData.remark==="Excellent"?"green":"amber")}>{gbfsData.remark}</span>
          </div>
          <div style={{ flex:"2 1 280px" }}>
            {[["Processing Speed",`${gbfsData.throughput} tasks/s`],["Energy Usage",`${gbfsData.energy} kWh`],["Resource Utilization",`${gbfsData.utilization}%`],["Response Time",`${gbfsData.time} ms`]].map(([l,v]) => (
              <div key={l} style={S.dr}><span style={S.dl}>{l}</span><span style={S.dv}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ ...S.infoBox("blue"), marginTop:16, marginBottom:0 }}>
          <div style={{ fontSize:13, color:"#1d4ed8" }}>✅ GBFS computed a latency of <strong>{gbfsData.latency} ms</strong>. Click <strong>Next</strong> to run PSO.</div>
        </div>
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════
   STEP 3 — PSO Algorithm
══════════════════════════════════════════════════════ */
const Step3PSO = ({ machine: m, psoData, onRun, running }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>PSO Algorithm — Decision Making</div>
      <div style={S.ps}>Particle Swarm Optimization explores the solution space broadly for a globally optimal offloading decision for <strong>{m.name}</strong>.</div>
    </div>

    <div style={S.card}>
      <div style={S.ct}>How PSO Works</div>
      <div style={S.cd}>Swarm-based optimization applied to the collected task data.</div>
      {[
        ["1","Initialize particle swarm",  `Each particle = a candidate offloading decision for ${m.name}.`],
        ["2","Evaluate fitness function",  `Task Size: ${m.taskSize} MB · Bandwidth: ${m.bandwidth} Mbps · Latency: ${m.avgLatency} ms`],
        ["3","Update velocity & position", "Particles move toward personal best (pBest) and global best (gBest)."],
        ["4","Iterate until convergence",  `CPU: ${m.cpuUtilization}% · Queue: ${m.queueLength} · Energy: ${m.energyConsumption} kWh`],
        ["5","Output optimal decision",    "Returns the globally best offloading path with minimized latency and energy."],
      ].map(([n,t,d]) => (
        <div key={n} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 0", borderBottom:"1px solid #f3f4f6" }}>
          <div style={{ ...S.stepNum, background:"#faf5ff", color:"#7c3aed" }}>{n}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{t}</div>
            <div style={{ fontSize:12, color:"#6b7280", marginTop:3 }}>{d}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop:20, textAlign:"center" }}>
        <button style={running ? S.btnOff : S.btnPurple} disabled={running} onClick={onRun}>
          {running ? "⏳ Running PSO..." : "▶  Run PSO Algorithm"}
        </button>
      </div>
    </div>

    {psoData && (
      <div style={S.card}>
        <div style={S.ct}>PSO Result</div>
        <div style={S.cd}>Algorithm completed. Computed performance metrics for {m.name}.</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 200px", border:"2px solid #e9d5ff", borderRadius:12, padding:"20px", background:"#faf5ff", textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.06em" }}>Computed Latency</div>
            <div style={S.bigNum("pso")}>{psoData.latency}<span style={{ fontSize:16, fontWeight:500 }}> ms</span></div>
            <span style={S.badge(psoData.remark==="Excellent"?"green":"amber")}>{psoData.remark}</span>
          </div>
          <div style={{ flex:"2 1 280px" }}>
            {[["Processing Speed",`${psoData.throughput} tasks/s`],["Energy Usage",`${psoData.energy} kWh`],["Resource Utilization",`${psoData.utilization}%`],["Response Time",`${psoData.time} ms`]].map(([l,v]) => (
              <div key={l} style={S.dr}><span style={S.dl}>{l}</span><span style={S.dv}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ ...S.infoBox("purple"), marginBottom:0, marginTop:16 }}>
          <div style={{ fontSize:13, color:"#7c3aed" }}>✅ PSO computed a latency of <strong>{psoData.latency} ms</strong>. Click <strong>Next</strong> to select the best edge server.</div>
        </div>
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════
   STEP 4 — Select Best Edge Server
══════════════════════════════════════════════════════ */
const Step4SelectEdge = ({ machine: m, gbfsData, psoData }) => {
  if (!gbfsData || !psoData) return (
    <div style={S.card}><div style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>⚠️ Please run both GBFS and PSO first.</div></div>
  );
  const gbfsWins   = gbfsData.latency <= psoData.latency;
  const bestAlgo   = gbfsWins ? "GBFS" : "PSO";
  const bestLat    = Math.min(+gbfsData.latency, +psoData.latency);
  const server     = m.taskType==="Latency-Sensitive" ? "Edge Server A (Low-Latency)" : m.taskType==="Energy-Efficient" ? "Edge Server B (Energy-Optimized)" : "Edge Server C (High-Compute Cloud)";
  const serverIcon = m.taskType==="Latency-Sensitive" ? "⚡" : m.taskType==="Energy-Efficient" ? "🌿" : "☁️";

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Select Best Edge Server</div>
        <div style={S.ps}>Based on <strong>{bestAlgo}</strong> result, the system selects the most suitable edge server for <strong>{m.name}</strong>.</div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { icon:"⚙️", label:"GBFS Latency", value:`${gbfsData.latency} ms`, color:"blue",   wins:gbfsWins },
          { icon:"🔬", label:"PSO Latency",  value:`${psoData.latency} ms`,  color:"purple", wins:!gbfsWins },
          { icon:"🏆", label:"Best Algorithm",value:bestAlgo,                color:"green",  wins:true },
          { icon:"📉", label:"Best Latency",  value:`${bestLat} ms`,         color:"amber",  wins:true },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={S.statCard}>
            <div style={S.statIcon(color)}>{icon}</div>
            <div style={S.statVal}>{value}</div>
            <div style={S.statLbl}>{label}</div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div style={S.card}>
        <div style={S.ct}>Algorithm Comparison</div>
        <div style={S.cd}>GBFS vs PSO metric-by-metric comparison to determine the best offloading path.</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Metric","GBFS","PSO","Better"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {[["Latency (ms)",gbfsData.latency,psoData.latency,"lower"],["Speed (tasks/s)",gbfsData.throughput,psoData.throughput,"higher"],["Energy (kWh)",gbfsData.energy,psoData.energy,"lower"],["Utilization (%)",gbfsData.utilization,psoData.utilization,"lower"]].map(([l,g,p,dir],i) => {
              const gW = dir==="lower"?+g<=+p:+g>=+p;
              return (
                <tr key={l} style={{ background:i%2===0?"#fff":"#f9fafb" }}>
                  <td style={{ ...S.td, fontWeight:600 }}>{l}</td>
                  <td style={{ ...S.td, fontWeight:700, color:gW?"#1d4ed8":"#374151" }}>{g}</td>
                  <td style={{ ...S.td, fontWeight:700, color:!gW?"#7c3aed":"#374151" }}>{p}</td>
                  <td style={S.td}><span style={S.badge(gW?"blue":"purple")}>{gW?"GBFS":"PSO"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected server */}
      <div style={S.card}>
        <div style={S.ct}>Selected Edge Server</div>
        <div style={S.cd}>Chosen based on <strong>{bestAlgo}</strong> and task type: <strong>{m.taskType}</strong>.</div>
        <div style={{ display:"flex", alignItems:"center", gap:20, background:"#f0fdf4", border:"2px solid #86efac", borderRadius:12, padding:"20px 24px" }}>
          <div style={{ fontSize:40 }}>{serverIcon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color:"#111827" }}>{server}</div>
            <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>Best latency: <strong style={{ color:"#15803d" }}>{bestLat} ms</strong> · Algorithm: <strong>{bestAlgo}</strong> · Machine: <strong>{m.machineId}</strong></div>
          </div>
          <span style={S.badge("green")}>✓ Ready</span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   STEP 5 — Offload Task
══════════════════════════════════════════════════════ */
const Step5Offload = ({ machine: m, gbfsData, psoData }) => {
  if (!gbfsData || !psoData) return (
    <div style={S.card}><div style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>⚠️ Please run both algorithms first.</div></div>
  );
  const bestAlgo = gbfsData.latency <= psoData.latency ? "GBFS" : "PSO";
  const server   = m.taskType==="Latency-Sensitive" ? "Edge Server A" : m.taskType==="Energy-Efficient" ? "Edge Server B" : "Edge Server C";

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Offload Task</div>
        <div style={S.ps}>Task from <strong>{m.name}</strong> is being offloaded to <strong>{server}</strong> via <strong>{bestAlgo}</strong>.</div>
      </div>

      {/* Flow diagram */}
      <div style={S.card}>
        <div style={S.ct}>Task Offloading Flow</div>
        <div style={S.cd}>Data transmission path from IoT device to edge server.</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, flexWrap:"wrap", padding:"16px 0" }}>
          {[
            { icon:"🏭", label:m.machineId,  sub:"IoT Device",   bc:"#bfdbfe", bg:"#eff6ff" },
            null,
            { icon:"📡", label:"Network",    sub:`${m.bandwidth} Mbps · ${m.transmissionDelay}ms`, bc:"#fde68a", bg:"#fffbeb" },
            null,
            { icon:"🖧",  label:server,       sub:"Edge Node",    bc:"#86efac", bg:"#f0fdf4" },
          ].map((item, i) => item === null ? (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:0, padding:"0 4px" }}>
              <div style={{ width:36, height:2, background:"linear-gradient(90deg,#6b7280,#16a34a)" }} />
              <span style={{ color:"#16a34a", fontSize:14 }}>▶</span>
            </div>
          ) : (
            <div key={i} style={{ flex:"1 1 130px", maxWidth:170, border:`2px solid ${item.bc}`, borderRadius:12, padding:"16px 14px", background:item.bg, textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{item.label}</div>
              <div style={{ fontSize:11, color:"#6b7280", marginTop:4, lineHeight:1.4 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div style={S.card}>
        <div style={S.ct}>Offload Details</div>
        <div style={S.cd}>Task transmission parameters and status.</div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          {[
            ["Task Size",`${m.taskSize} MB`,"blue"],["Algorithm",bestAlgo,"blue"],
            ["Target Server",server,"green"],["Bandwidth",`${m.bandwidth} Mbps`,"blue"],
            ["Trans. Delay",`${m.transmissionDelay} ms`,"amber"],["Status","✅ Success","green"],
          ].map(([l,v,c]) => (
            <div key={l} style={{ flex:"1 1 150px", background:"#f9fafb", border:"1px solid #f3f4f6", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:11, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{l}</div>
              <span style={S.badge(c)}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   STEP 6 — Measure Latency
══════════════════════════════════════════════════════ */
const Step6Latency = ({ machine: m, gbfsData, psoData }) => {
  if (!gbfsData || !psoData) return (
    <div style={S.card}><div style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>⚠️ Please run both algorithms first.</div></div>
  );
  const gbfsWins   = gbfsData.latency <= psoData.latency;
  const winner     = gbfsWins ? "GBFS" : "PSO";
  const improvement= Math.abs(((gbfsData.latency - psoData.latency) / gbfsData.latency) * 100).toFixed(1);
  const server     = m.taskType==="Latency-Sensitive" ? "Edge Server A" : m.taskType==="Energy-Efficient" ? "Edge Server B" : "Edge Server C";
  const gbfsBase   = +gbfsData.latency;
  const psoBase    = +psoData.latency;

  const lineData = [1,2,3,4,5,6].map(t => ({
    cycle:`T${t}`,
    GBFS: +(gbfsBase + Math.sin(t*1.1)*gbfsBase*0.06).toFixed(2),
    PSO:  +(psoBase  + Math.sin(t*1.3)*psoBase *0.06).toFixed(2),
  }));
  const barData = [
    { metric:"Latency (ms)",  GBFS:+gbfsData.latency,     PSO:+psoData.latency     },
    { metric:"Speed (t/s)",   GBFS:+gbfsData.throughput,  PSO:+psoData.throughput  },
    { metric:"Energy (kWh)",  GBFS:+gbfsData.energy,      PSO:+psoData.energy      },
    { metric:"Usage (%)",     GBFS:+gbfsData.utilization, PSO:+psoData.utilization },
  ];

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Edge Server Processes Task & Measure Latency</div>
        <div style={S.ps}><strong>{server}</strong> has processed the task from <strong>{m.name}</strong>. Final performance results.</div>
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { icon:"🏆", label:"Best Algorithm", value:winner,                color:"green"  },
          { icon:"⚙️", label:"GBFS Latency",   value:`${gbfsData.latency} ms`, color:"blue" },
          { icon:"🔬", label:"PSO Latency",    value:`${psoData.latency} ms`,  color:"purple" },
          { icon:"📉", label:"Improvement",    value:`${improvement}%`,        color:"amber"  },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={S.statCard}>
            <div style={S.statIcon(color)}>{icon}</div>
            <div style={S.statVal}>{value}</div>
            <div style={S.statLbl}>{label}</div>
          </div>
        ))}
      </div>

      {/* Winner banner */}
      <div style={{ background:gbfsWins?"#eff6ff":"#faf5ff", border:`2px solid ${gbfsWins?"#bfdbfe":"#e9d5ff"}`, borderRadius:12, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Best Algorithm</div>
          <div style={{ fontSize:36, fontWeight:800, color:gbfsWins?"#1d4ed8":"#7c3aed" }}>{winner}</div>
          <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>
            {winner} achieved <strong>{Math.min(+gbfsData.latency, +psoData.latency)} ms</strong> — {improvement}% lower than {gbfsWins?"PSO":"GBFS"}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div style={S.card}>
        <div style={S.ct}>Latency Comparison — Line Graph</div>
        <div style={S.cd}>GBFS vs PSO measured latency (ms) across 6 processing cycles on <strong>{server}</strong>.</div>
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={lineData} margin={{ top:16, right:24, left:0, bottom:20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="cycle" stroke="#9ca3af" fontSize={12} label={{ value:"Processing Cycle", position:"insideBottom", offset:-6, fill:"#9ca3af", fontSize:11 }} />
            <YAxis stroke="#9ca3af" fontSize={12} unit=" ms" domain={["auto","auto"]} label={{ value:"Latency (ms)", angle:-90, position:"insideLeft", style:{ fill:"#9ca3af", fontSize:11 } }} />
            <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"1px solid #e5e7eb" }} formatter={v=>[`${v} ms`,""]} />
            <Legend wrapperStyle={{ fontSize:12 }} verticalAlign="top" />
            <ReferenceLine y={gbfsBase} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.4} />
            <ReferenceLine y={psoBase}  stroke="#8b5cf6" strokeDasharray="4 4" strokeOpacity={0.4} />
            <Line type="monotone" dataKey="GBFS" stroke="#3b82f6" strokeWidth={2.5} dot={{ r:5, fill:"#3b82f6", strokeWidth:2, stroke:"#fff" }} activeDot={{ r:7 }} />
            <Line type="monotone" dataKey="PSO"  stroke="#8b5cf6" strokeWidth={2.5} dot={{ r:5, fill:"#8b5cf6", strokeWidth:2, stroke:"#fff" }} activeDot={{ r:7 }} />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ textAlign:"center", fontSize:12, color:"#9ca3af", marginTop:4 }}>Lower latency = better · Dashed lines = baseline values</p>
      </div>

      {/* Bar chart */}
      <div style={S.card}>
        <div style={S.ct}>Full Metrics Comparison</div>
        <div style={S.cd}>All computed performance indicators for <strong>{m.name}</strong>.</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{ top:16, right:20, left:0, bottom:4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="metric" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"1px solid #e5e7eb" }} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar dataKey="GBFS" fill="#3b82f6" radius={[4,4,0,0]}><LabelList dataKey="GBFS" position="top" fill="#9ca3af" fontSize={10} /></Bar>
            <Bar dataKey="PSO"  fill="#8b5cf6" radius={[4,4,0,0]}><LabelList dataKey="PSO"  position="top" fill="#9ca3af" fontSize={10} /></Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ textAlign:"center", fontSize:12, color:"#9ca3af", marginTop:4 }}>Lower delay & energy is better · Higher speed is better</p>
      </div>

      {/* Summary table */}
      <div style={S.card}>
        <div style={S.ct}>Result Summary Table</div>
        <div style={S.cd}>Final metric-by-metric results for {m.name} ({m.machineId}) on {server}.</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Metric","GBFS","PSO","Better"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {[["Latency (ms)",gbfsData.latency,psoData.latency,"lower"],["Speed (tasks/s)",gbfsData.throughput,psoData.throughput,"higher"],["Energy (kWh)",gbfsData.energy,psoData.energy,"lower"],["Resource Usage (%)",gbfsData.utilization,psoData.utilization,"lower"],["Response Time (ms)",gbfsData.time,psoData.time,"lower"]].map(([l,g,p,dir],i) => {
              const gW=dir==="lower"?+g<=+p:+g>=+p;
              return (
                <tr key={l} style={{ background:i%2===0?"#fff":"#f9fafb" }}>
                  <td style={{ ...S.td, fontWeight:600 }}>{l}</td>
                  <td style={{ ...S.td, fontWeight:700, color:gW?"#1d4ed8":"#374151" }}>{g}</td>
                  <td style={{ ...S.td, fontWeight:700, color:!gW?"#7c3aed":"#374151" }}>{p}</td>
                  <td style={S.td}><span style={S.badge(gW?"blue":"purple")}>{gW?"GBFS":"PSO"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ ...S.infoBox("green"), marginTop:16, marginBottom:0 }}>
          <div style={{ fontSize:13, color:"#15803d" }}>
            🎉 <strong>{m.name} ({m.machineId})</strong> task successfully offloaded to <strong>{server}</strong> using <strong>{winner}</strong>. Final measured latency: <strong>{Math.min(+gbfsData.latency, +psoData.latency)} ms</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   ERROR BOUNDARY
══════════════════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(e) { return { hasError:true, error:e }; }
  render() {
    if (this.state.hasError) return <div style={{ padding:20, color:"red" }}><h1>Error</h1><pre>{this.state.error?.toString()}</pre></div>;
    return this.props.children;
  }
}

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
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
    if (step===2) return !!gbfsData;
    if (step===3) return !!psoData;
    if (step===4||step===5) return !!gbfsData && !!psoData;
    return true;
  };

  const goNext = () => { const n=step+1; setStep(n); setMaxReached(r=>Math.max(r,n)); };

  const renderStep = () => {
    switch(step) {
      case 0: return <Step0Machine     selectedId={selectedId} setSelectedId={id => { setSelectedId(id); setGbfsData(null); setPsoData(null); setMaxReached(0); }} />;
      case 1: return <Step1CollectData machine={machine} />;
      case 2: return <Step2GBFS        machine={machine} gbfsData={gbfsData} onRun={runGBFS} running={gbfsRunning} />;
      case 3: return <Step3PSO         machine={machine} psoData={psoData}   onRun={runPSO}  running={psoRunning} />;
      case 4: return <Step4SelectEdge  machine={machine} gbfsData={gbfsData} psoData={psoData} />;
      case 5: return <Step5Offload     machine={machine} gbfsData={gbfsData} psoData={psoData} />;
      case 6: return <Step6Latency     machine={machine} gbfsData={gbfsData} psoData={psoData} />;
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <div style={S.root}>
        <Sidebar step={step} maxReached={maxReached} onJump={i => i<=maxReached && setStep(i)} />
        <div style={S.content}>
          <Header step={step} maxReached={maxReached} onJump={i => i<=maxReached && setStep(i)} />
          <div style={S.main}>{renderStep()}</div>
          <div style={S.bottomBar}>
            <button style={S.bbBack(step===0)} disabled={step===0} onClick={()=>setStep(p=>p-1)}>← Back</button>
            <span style={{ fontSize:12, color:"#9ca3af", fontWeight:500 }}>Step {step+1} of {STEPS.length}</span>
            <button style={S.bbNext(!canNext()||step>=6)} disabled={!canNext()||step>=6} onClick={goNext}>Next →</button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
