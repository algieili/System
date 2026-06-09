import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
  LineChart, Line, ReferenceLine
} from "recharts";

const SERVERS = {
  A: {
    label:   "Edge Server A",
    sub:     "Latency-Sensitive · Computation-Intensive",
    icon:    "⚡",
    color:   "blue",
    hex:     "#1d4ed8",
    bg:      "#eff6ff",
    border:  "#bfdbfe",
    baseUrl: "https://system-ctld.onrender.com/api",
  },
  B: {
    label:   "Edge Server B",
    sub:     "Energy-Efficient",
    icon:    "🌿",
    color:   "green",
    hex:     "#15803d",
    bg:      "#f0fdf4",
    border:  "#86efac",
    baseUrl: "https://system-1-rcpl.onrender.com/api",
  },
};

const taskTypeToServer = (taskType) => {
  if (taskType === "Latency-Sensitive" || taskType === "Computation-Intensive") return "A";
  return "B";
};

const apiFetch = async (baseUrl, path, options = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error ${res.status}: ${text}`);
  }
  return res.json();
};

const PRIMARY_BASE = SERVERS.A.baseUrl;

const SIDEBAR_BG = "#1a2e1a";
const ACCENT     = "#4ade80";
const ACCENT_DIM = "#16a34a";
const TEXT_LIGHT = "#e2f0e2";
const TEXT_MUTED = "#7cad7c";

const S = {
  root:      { display:"flex", minHeight:"100vh", fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:"#f0f2f5", color:"#1a1d23" },
  sidebar:   { width:240, background:SIDEBAR_BG, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto", flexShrink:0 },
  sbTop:     { padding:"28px 20px 20px", borderBottom:"1px solid #2d442d" },
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
  sbSrvPill: (online) => ({
    display:"flex", alignItems:"center", gap:6, padding:"6px 10px",
    borderRadius:8, marginBottom:4,
    background: online ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)",
    border: `1px solid ${online ? "#2d442d" : "rgba(239,68,68,0.2)"}`,
  }),
  sbSrvDot:  (online) => ({
    width:6, height:6, borderRadius:"50%", flexShrink:0,
    background: online ? ACCENT : "#ef4444",
  }),
  sbSrvName: { fontSize:11, color:TEXT_MUTED, flex:1 },
  sbSrvStat: (online) => ({ fontSize:10, color: online ? ACCENT_DIM : "#ef4444", fontWeight:600 }),
  sbFooter:  { marginTop:"auto", padding:"16px 20px", borderTop:"1px solid #2d442d" },
  sbFootT:   { fontSize:11, color:"#4d6b4d" },
  sbFootV:   { fontSize:12, color:TEXT_MUTED, fontWeight:600 },
  content:   { flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" },
  header:    { background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 28px", display:"flex", alignItems:"center", minHeight:60, gap:12 },
  hBreadcrumb: { display:"flex", alignItems:"center", gap:8, fontSize:13 },
  hBCRoot:   { color:"#9ca3af" },
  hBCSep:    { color:"#d1d5db", fontSize:12 },
  hBCActive: { color:"#111827", fontWeight:600 },
  hRight:    { marginLeft:"auto", display:"flex", alignItems:"center", gap:8 },
  hStepPill: { background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, color:"#15803d" },
  hSrvBadge: (srv) => ({
    display:"flex", alignItems:"center", gap:6, fontSize:12,
    color: srv ? SERVERS[srv].hex : "#92400e",
    background: srv ? SERVERS[srv].bg : "#fffbeb",
    border: `1px solid ${srv ? SERVERS[srv].border : "#fde68a"}`,
    borderRadius:20, padding:"5px 12px", fontWeight:600,
  }),
  progBar:   { background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"12px 28px", display:"flex", alignItems:"center", gap:0, overflowX:"auto" },
  progStep: (a,d) => ({ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:6, cursor:"pointer", background:a?"#052e16":d?"#f0fdf4":"transparent", border:a?"none":d?"1px solid #bbf7d0":"none", flexShrink:0 }),
  progNum:  (a,d) => ({ width:22, height:22, borderRadius:11, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:a?"#4ade80":d?"#16a34a":"#e5e7eb", color:a?"#052e16":d?"#fff":"#9ca3af" }),
  progTxt:  (a,d) => ({ fontSize:11, fontWeight:a?700:d?600:400, color:a?"#4ade80":d?"#15803d":"#9ca3af", whiteSpace:"nowrap" }),
  progLine:     { flex:"0 0 24px", height:2, background:"#e5e7eb", margin:"0 2px" },
  progLineDone: { flex:"0 0 24px", height:2, background:"#16a34a", margin:"0 2px" },
  main:      { flex:1, padding:"28px 32px", overflowY:"auto", background:"#f0f2f5" },
  ph:        { marginBottom:24 },
  pt:        { fontSize:22, fontWeight:700, color:"#111827", margin:0 },
  ps:        { fontSize:13, color:"#6b7280", marginTop:5 },
  card:      { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"22px 24px", marginBottom:20, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  ct:        { fontSize:12, fontWeight:700, color:"#374151", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.06em" },
  cd:        { fontSize:12, color:"#9ca3af", marginBottom:16 },
  statCard:  { flex:"1 1 150px", background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  statIcon:  c => ({ width:40, height:40, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:12, background:c==="green"?"#f0fdf4":c==="blue"?"#eff6ff":c==="purple"?"#faf5ff":"#fff7ed", border:`1px solid ${c==="green"?"#bbf7d0":c==="blue"?"#bfdbfe":c==="purple"?"#e9d5ff":"#fed7aa"}` }),
  statVal:   { fontSize:26, fontWeight:800, color:"#111827", lineHeight:1 },
  statLbl:   { fontSize:12, color:"#6b7280", marginTop:4, fontWeight:500 },
  th:        { textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #f3f4f6", background:"#f9fafb", whiteSpace:"nowrap" },
  td:        { padding:"11px 14px", borderBottom:"1px solid #f3f4f6", color:"#1f2937", fontSize:13 },
  dr:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f3f4f6" },
  dl:        { fontSize:13, color:"#6b7280" },
  dv:        { fontSize:13, fontWeight:600, color:"#111827" },
  badge:  c  => ({ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
    background:c==="green"?"#f0fdf4":c==="blue"?"#eff6ff":c==="amber"?"#fffbeb":c==="purple"?"#faf5ff":"#fef2f2",
    color:c==="green"?"#15803d":c==="blue"?"#1d4ed8":c==="amber"?"#92400e":c==="purple"?"#7c3aed":"#dc2626",
    border:`1px solid ${c==="green"?"#bbf7d0":c==="blue"?"#bfdbfe":c==="amber"?"#fde68a":c==="purple"?"#e9d5ff":"#fecaca"}` }),
  mCard:  s  => ({ flex:"1 1 140px", minWidth:130, maxWidth:170, border:`2px solid ${s?"#16a34a":"#e5e7eb"}`, borderRadius:12, padding:"16px 14px", cursor:"pointer", background:s?"#f0fdf4":"#fff", transition:"all 0.15s", boxShadow:s?"0 0 0 3px rgba(22,163,74,0.15)":"none" }),
  btn:       { background:"#16a34a", color:"#fff", border:"none", borderRadius:8, padding:"11px 28px", fontSize:14, fontWeight:600, cursor:"pointer" },
  btnOff:    { background:"#d1d5db", color:"#9ca3af", border:"none", borderRadius:8, padding:"11px 28px", fontSize:14, fontWeight:600, cursor:"not-allowed" },
  btnPurple: { background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, padding:"11px 28px", fontSize:14, fontWeight:600, cursor:"pointer" },
  btnDual:   { background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", color:"#fff", border:"none", borderRadius:8, padding:"13px 32px", fontSize:15, fontWeight:700, cursor:"pointer" },
  btnDualOff:{ background:"#d1d5db", color:"#9ca3af", border:"none", borderRadius:8, padding:"13px 32px", fontSize:15, fontWeight:700, cursor:"not-allowed" },
  bottomBar: { background:"#fff", borderTop:"1px solid #e5e7eb", padding:"14px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  bbBack: d  => ({ padding:"9px 22px", borderRadius:8, fontSize:13, fontWeight:600, cursor:d?"not-allowed":"pointer", border:"1px solid #d1d5db", background:d?"#f9fafb":"#fff", color:d?"#d1d5db":"#374151" }),
  bbNext: d  => ({ padding:"9px 22px", borderRadius:8, fontSize:13, fontWeight:600, cursor:d?"not-allowed":"pointer", background:d?"#d1d5db":"#16a34a", color:"#fff", border:"none" }),
  bigNum: c  => ({ fontSize:36, fontWeight:800, color:c==="gbfs"?"#1d4ed8":"#7c3aed", margin:"8px 0 4px" }),
  infoBox: c => ({ background:c==="blue"?"#eff6ff":c==="green"?"#f0fdf4":c==="purple"?"#faf5ff":"#fff7ed", border:`1px solid ${c==="blue"?"#bfdbfe":c==="green"?"#bbf7d0":c==="purple"?"#e9d5ff":"#fed7aa"}`, borderLeft:`4px solid ${c==="blue"?"#3b82f6":c==="green"?"#16a34a":c==="purple"?"#7c3aed":"#f97316"}`, borderRadius:8, padding:"14px 18px", marginBottom:12 }),
  stepNum:   { width:30, height:30, borderRadius:15, background:"#eff6ff", color:"#1d4ed8", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  errBox:    { background:"#fef2f2", border:"1px solid #fecaca", borderLeft:"4px solid #dc2626", borderRadius:8, padding:"14px 18px", marginBottom:12, fontSize:13, color:"#dc2626" },
};

const STEPS = [
  { title:"IoT Machine",        icon:"🏭", short:"Machine",     desc:"Select the IoT device"    },
  { title:"Collect Data",       icon:"📋", short:"Collect",     desc:"View task parameters"     },
  { title:"Run Algorithms",     icon:"⚙️", short:"Algorithms",  desc:"GBFS + PSO on same server"},
  { title:"Select Edge Server", icon:"🖧",  short:"Edge Server", desc:"Best server recommended"  },
  { title:"Offload Task",       icon:"📤", short:"Offload",     desc:"Send to edge"             },
  { title:"Measure Latency",    icon:"📊", short:"Latency",     desc:"Results & measurement"    },
];

const ServerStatusList = ({ statuses }) => (
  <div style={{ padding:"12px 14px 0" }}>
    <div style={S.sbLabel}>Backend Servers</div>
    {Object.entries(SERVERS).map(([key, srv]) => {
      const st = statuses[key];
      const online = st === "online";
      return (
        <div key={key} style={S.sbSrvPill(online)}>
          <span style={{ fontSize:13 }}>{srv.icon}</span>
          <span style={S.sbSrvName}>{srv.label}</span>
          <span style={S.sbSrvStat(online)}>{online ? "Online" : st === "checking" ? "…" : "Offline"}</span>
          <div style={S.sbSrvDot(online)} />
        </div>
      );
    })}
  </div>
);

const Sidebar = ({ step, maxReached, onJump, serverStatuses }) => (
  <div style={S.sidebar}>
    <div style={S.sbTop}>
      <div style={S.sbLogo}>
        <div style={S.sbIcon}>⚡</div>
        <div><div style={S.sbTitle}>EdgeOffload</div><div style={S.sbSub}>IoT Simulation</div></div>
      </div>
    </div>
    <div style={S.sbSection}>
      <div style={S.sbLabel}>Simulation Flow</div>
      {STEPS.map((s,i) => {
        const active=i===step, done=i<step;
        return (
          <button key={i} style={S.sbBtn(active)} onClick={()=>i<=maxReached&&onJump(i)}>
            {active&&<div style={S.sbBtnBar}/>}
            <span style={S.sbBtnIcon}>{s.icon}</span>
            <div style={S.sbBtnText}>
              <div style={S.sbBtnT(active)}>{s.title}</div>
              <div style={S.sbBtnD}>{s.desc}</div>
            </div>
            {done&&<span style={{fontSize:12,color:ACCENT_DIM}}>✓</span>}
            {active&&<div style={S.sbBadge}>Active</div>}
          </button>
        );
      })}
    </div>
    <ServerStatusList statuses={serverStatuses} />
    <div style={S.sbFooter}>
      <div style={S.sbFootT}>IoT Task Offloading</div>
      <div style={S.sbFootV}>v5.0 · Unified Algorithm Server</div>
    </div>
  </div>
);

const Header = ({ step, maxReached, onJump, activeServerKey }) => {
  const srv = activeServerKey ? SERVERS[activeServerKey] : null;
  return (
    <>
      <div style={S.header}>
        <div style={S.hBreadcrumb}>
          <span style={S.hBCRoot}>Simulation</span>
          <span style={S.hBCSep}>›</span>
          <span style={S.hBCActive}>{STEPS[step].title}</span>
        </div>
        <div style={S.hRight}>
          {srv && (
            <div style={S.hSrvBadge(activeServerKey)}>
              <span>{srv.icon}</span>
              {srv.label}
            </div>
          )}
          <div style={S.hStepPill}>Step {step+1} of {STEPS.length}</div>
        </div>
      </div>
      <div style={S.progBar}>
        {STEPS.map((s,i)=>(
          <React.Fragment key={i}>
            <div style={S.progStep(i===step,i<step)} onClick={()=>i<=maxReached&&onJump(i)}>
              <div style={S.progNum(i===step,i<step)}>{i<step?"✓":i+1}</div>
              <span style={S.progTxt(i===step,i<step)}>{s.short}</span>
            </div>
            {i<STEPS.length-1&&<div style={i<step?S.progLineDone:S.progLine}/>}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

/* ── Step 0: Select Machine ── */
const Step0Machine = ({ machineData, loading, error, selectedId, setSelectedId, onRetry }) => {
  const machines = Object.values(machineData);
  const m = machineData[selectedId];
  if (loading) return (
    <div style={S.card}>
      <div style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:32,marginBottom:12}}>⏳</div>
        <div style={{color:"#6b7280"}}>Loading machines from Supabase via Server A…</div>
      </div>
    </div>
  );
  if (error) return (
    <div>
      <div style={S.errBox}>❌ <strong>Could not load machines.</strong><br/><span style={{fontSize:12}}>{error}</span></div>
      <button style={S.btn} onClick={onRetry}>↺ Retry</button>
    </div>
  );
  if (!m) return null;
  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>IoT Machine (Device)</div>
        <div style={S.ps}>Machines loaded via <strong>Server A</strong>. Select a machine — then choose which single server runs <em>both</em> GBFS and PSO together.</div>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
        {[
          {icon:"🏭",label:"Total Machines", value:machines.length,                                              color:"green"},
          {icon:"⚙️",label:"Cutting",        value:machines.filter(x=>x.category==="Cutting Machines").length,   color:"blue"},
          {icon:"🎨",label:"Finishing",      value:machines.filter(x=>x.category==="Finishing Machines").length, color:"purple"},
          {icon:"🔥",label:"Welding",        value:machines.filter(x=>x.category==="Welding Machines").length,   color:"amber"},
        ].map(({icon,label,value,color})=>(
          <div key={label} style={S.statCard}>
            <div style={S.statIcon(color)}>{icon}</div>
            <div style={S.statVal}>{value}</div>
            <div style={S.statLbl}>{label}</div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.ct}>Available IoT Machines</div>
        <div style={S.cd}>Click a machine to select it.</div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          {machines.map(mc=>(
            <div key={mc.id} style={{...S.mCard(selectedId===mc.id),position:"relative"}} onClick={()=>setSelectedId(mc.id)}>
              <div style={{fontSize:26,marginBottom:8}}>
                {mc.id==="M1"?"🔩":mc.id==="M2"?"⚡":mc.id==="M3"?"🎨":mc.id==="M4"?"🔥":"✂️"}
              </div>
              <div style={{fontSize:14,fontWeight:700,color:selectedId===mc.id?"#15803d":"#111827",marginBottom:2}}>{mc.machineId}</div>
              <div style={{fontSize:12,color:"#6b7280",lineHeight:1.3,marginBottom:6}}>{mc.name}</div>
              <div style={{fontSize:10,color:"#9ca3af"}}>{mc.taskType}</div>
              {selectedId===mc.id&&<div style={{marginTop:8}}><span style={S.badge("green")}>✓ Selected</span></div>}
            </div>
          ))}
        </div>
      </div>
      {m && (
        <div style={S.card}>
          <div style={S.ct}>{m.name} — {m.machineId}</div>
          <div style={S.cd}>Registered IoT device.</div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:16}}>
            {[["Machine ID",m.machineId,"blue"],["Category",m.category,"green"],["Task Type",m.taskType,"amber"]].map(([l,v,c])=>(
              <div key={l} style={{flex:"1 1 160px",background:"#f9fafb",border:"1px solid #f3f4f6",borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:11,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{l}</div>
                <span style={S.badge(c)}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{...S.infoBox("green"),marginBottom:0}}>
            <div style={{fontSize:13,color:"#15803d"}}>✅ <strong>{m.machineId} ({m.name})</strong> selected. Click <strong>Next</strong> to collect task data.</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Step 1: Collect Data ── */
const Step1CollectData = ({ machine:m }) => (
  <div>
    <div style={S.ph}>
      <div style={S.pt}>Collect Task Data</div>
      <div style={S.ps}>Parameters for <strong>{m.name} ({m.machineId})</strong> from Supabase. Both algorithms will run on the same server you pick next.</div>
    </div>
    <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
      {[
        {icon:"📦",label:"Task Size",      value:`${m.taskSize} MB`,          color:"blue"},
        {icon:"⏱️",label:"Processing Time",value:`${m.processingTime} ms`,    color:"green"},
        {icon:"📡",label:"Bandwidth",      value:`${m.bandwidth} Mbps`,       color:"purple"},
        {icon:"🔋",label:"Energy",         value:`${m.energyConsumption} kWh`,color:"amber"},
      ].map(({icon,label,value,color})=>(
        <div key={label} style={S.statCard}>
          <div style={S.statIcon(color)}>{icon}</div>
          <div style={S.statVal}>{value}</div>
          <div style={S.statLbl}>{label}</div>
        </div>
      ))}
    </div>
    <div style={S.card}>
      <div style={S.ct}>Collected Parameters — {m.machineId}</div>
      <div style={S.cd}>Live data from Supabase database.</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr><th style={S.th}>Parameter</th><th style={S.th}>Value</th><th style={S.th}>Description</th></tr></thead>
        <tbody>
          {[
            ["Machine ID",        m.machineId,                 "Unique device identifier"],
            ["Task Size",         `${m.taskSize} MB`,          "Data generated per task"],
            ["Processing Time",   `${m.processingTime} ms`,    "Time to process task locally"],
            ["Queue Length",      m.queueLength,               "Pending task count"],
            ["CPU Utilization",   `${m.cpuUtilization}%`,      "Edge node processing load"],
            ["Memory Usage",      `${m.memoryUsage} GB`,       "RAM used by edge node"],
            ["Network Bandwidth", `${m.bandwidth} Mbps`,       "Communication speed"],
            ["Transmission Delay",`${m.transmissionDelay} ms`, "Delay to edge server"],
            ["Energy Consumption",`${m.energyConsumption} kWh`,"Energy per operation cycle"],
            ["Throughput",        `${m.throughput} tasks/min`, "Tasks completed per minute"],
            ["Average Latency",   `${m.avgLatency} ms`,        "End-to-end delay"],
          ].map(([p,v,d],i)=>(
            <tr key={p} style={{background:i%2===0?"#fff":"#f9fafb"}}>
              <td style={{...S.td,fontWeight:600,color:"#374151"}}>{p}</td>
              <td style={S.td}><span style={S.badge("blue")}>{v}</span></td>
              <td style={{...S.td,color:"#6b7280"}}>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div style={{...S.infoBox("green"),marginBottom:0}}>
      <div style={{fontSize:13,color:"#15803d"}}>📋 All parameters loaded. Click <strong>Next</strong> to run GBFS + PSO on the same server.</div>
    </div>
  </div>
);

/* ── Step 2: Run Both Algorithms (MERGED) ── */
const Step2Algorithms = ({
  machine:m, gbfsData, psoData, algoRunning, algoError,
  selectedServer, setSelectedServer, onRunBoth,
  gbfsProgress, psoProgress
}) => {
  const srv = SERVERS[selectedServer];
  const bothDone = !!gbfsData && !!psoData;

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Run GBFS + PSO — Same Server</div>
        <div style={S.ps}>Pick one server to run <strong>both</strong> algorithms sequentially. Results are compared to determine the best edge server.</div>
      </div>

      {/* Server Picker */}
      <div style={S.card}>
        <div style={S.ct}>Choose Algorithm Server</div>
        <div style={S.cd}>Both GBFS and PSO will run on the selected backend.</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {Object.entries(SERVERS).map(([key,s])=>{
            const active = key === selectedServer;
            return (
              <div key={key} onClick={()=>!algoRunning&&setSelectedServer(key)}
                style={{flex:"1 1 200px",border:`2px solid ${active?s.border:"#e5e7eb"}`,borderRadius:12,padding:"16px 18px",
                  background:active?s.bg:"#f9fafb",cursor:algoRunning?"not-allowed":"pointer",
                  boxShadow:active?`0 0 0 3px ${s.border}`:"none",transition:"all 0.15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:26}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:active?"#111827":"#6b7280"}}>{s.label}</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>{s.sub}</div>
                  </div>
                  {active&&<span style={{...S.badge(s.color),marginLeft:"auto"}}>✓ Selected</span>}
                </div>
                <div style={{fontSize:10,fontFamily:"monospace",color:active?s.hex:"#9ca3af",
                  background:"rgba(0,0,0,0.04)",padding:"4px 8px",borderRadius:4,wordBreak:"break-all"}}>
                  {s.baseUrl}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithm Pipeline */}
      <div style={S.card}>
        <div style={S.ct}>Algorithm Execution Pipeline</div>
        <div style={S.cd}>Both algorithms POST to <strong>{srv.label}</strong> sequentially, then results are compared.</div>

        {/* Visual pipeline */}
        <div style={{display:"flex",alignItems:"center",gap:0,flexWrap:"wrap",padding:"16px 0 20px",justifyContent:"center"}}>
          {[
            {icon:"🏭", label:m.machineId,    sub:"IoT Data",      bc:"#bfdbfe",bg:"#eff6ff",done:true},
            null,
            {icon:"⚙️", label:"GBFS",         sub:"Greedy search", bc:gbfsData?"#86efac":"#e5e7eb",bg:gbfsData?"#f0fdf4":"#f9fafb",done:!!gbfsData,running:algoRunning&&!gbfsData},
            null,
            {icon:"🔬", label:"PSO",          sub:"Swarm optim.",  bc:psoData?"#e9d5ff":"#e5e7eb",bg:psoData?"#faf5ff":"#f9fafb",done:!!psoData,running:algoRunning&&gbfsData&&!psoData},
            null,
            {icon:"📊", label:"Compare",      sub:"Best result",   bc:bothDone?"#fde68a":"#e5e7eb",bg:bothDone?"#fffbeb":"#f9fafb",done:bothDone},
          ].map((item,i)=>item===null?(
            <div key={i} style={{display:"flex",alignItems:"center",padding:"0 4px"}}>
              <div style={{width:24,height:2,background:"linear-gradient(90deg,#9ca3af,#16a34a)"}}/>
              <span style={{color:"#16a34a",fontSize:12}}>▶</span>
            </div>
          ):(
            <div key={i} style={{flex:"0 0 auto",width:110,border:`2px solid ${item.bc}`,borderRadius:12,padding:"12px 10px",background:item.bg,textAlign:"center",position:"relative"}}>
              <div style={{fontSize:20,marginBottom:4}}>{item.running?"⏳":item.done?"✅":item.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{item.label}</div>
              <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{item.running?"Running…":item.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {(gbfsProgress||psoProgress) && (
          <div style={{marginBottom:16}}>
            {gbfsProgress && (
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#374151",marginBottom:4}}>
                  <span>⚙️ GBFS</span><span>{gbfsProgress}</span>
                </div>
                <div style={{height:6,background:"#e5e7eb",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",background:"#3b82f6",borderRadius:3,width:gbfsData?"100%":"60%",transition:"width 0.5s"}}/>
                </div>
              </div>
            )}
            {psoProgress && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#374151",marginBottom:4}}>
                  <span>🔬 PSO</span><span>{psoProgress}</span>
                </div>
                <div style={{height:6,background:"#e5e7eb",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",background:"#8b5cf6",borderRadius:3,width:psoData?"100%":"60%",transition:"width 0.5s"}}/>
                </div>
              </div>
            )}
          </div>
        )}

        {algoError&&<div style={{...S.errBox,marginBottom:16}}>❌ <strong>Algorithm run failed on {srv.label}.</strong> {algoError}</div>}

        <div style={{textAlign:"center",paddingTop:4}}>
          <button
            style={algoRunning||bothDone?S.btnDualOff:S.btnDual}
            disabled={algoRunning||bothDone}
            onClick={onRunBoth}
          >
            {algoRunning
              ? `⏳ Running on ${srv.icon} ${srv.label}…`
              : bothDone
              ? "✅ Both Algorithms Complete"
              : `▶  Run GBFS + PSO on ${srv.icon} ${srv.label}`}
          </button>
          {algoRunning&&<div style={{fontSize:12,color:"#9ca3af",marginTop:8}}>POST → {srv.baseUrl}/gbfs → {srv.baseUrl}/pso</div>}
          {bothDone&&!algoRunning&&(
            <button style={{...S.btn,marginTop:12,background:"#6b7280",fontSize:13}} onClick={onRunBoth}>↺ Re-run on {srv.icon} {srv.label}</button>
          )}
        </div>
      </div>

      {/* Results side by side */}
      {bothDone && (() => {
        const gbfsWins = gbfsData.latency <= psoData.latency;
        return (
          <div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:16}}>
              {/* GBFS result */}
              <div style={{flex:"1 1 240px",border:`2px solid ${gbfsWins?"#bfdbfe":"#e5e7eb"}`,borderRadius:12,padding:"20px 22px",background:gbfsWins?"#eff6ff":"#f9fafb"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:20}}>⚙️</span>
                  <span style={{fontSize:14,fontWeight:700,color:"#111827"}}>GBFS Result</span>
                  {gbfsWins&&<span style={{...S.badge("blue"),marginLeft:"auto"}}>🏆 Winner</span>}
                </div>
                <div style={{fontSize:32,fontWeight:800,color:"#1d4ed8",marginBottom:4}}>{gbfsData.latency}<span style={{fontSize:14,fontWeight:500}}> ms</span></div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>Latency</div>
                {[["Speed",`${gbfsData.throughput} t/s`],["Energy",`${gbfsData.energy} kWh`],["Usage",`${gbfsData.utilization}%`]].map(([l,v])=>(
                  <div key={l} style={S.dr}><span style={S.dl}>{l}</span><span style={S.dv}>{v}</span></div>
                ))}
              </div>
              {/* vs divider */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",flex:"0 0 40px"}}>
                <div style={{fontSize:16,fontWeight:700,color:"#9ca3af"}}>VS</div>
              </div>
              {/* PSO result */}
              <div style={{flex:"1 1 240px",border:`2px solid ${!gbfsWins?"#e9d5ff":"#e5e7eb"}`,borderRadius:12,padding:"20px 22px",background:!gbfsWins?"#faf5ff":"#f9fafb"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:20}}>🔬</span>
                  <span style={{fontSize:14,fontWeight:700,color:"#111827"}}>PSO Result</span>
                  {!gbfsWins&&<span style={{...S.badge("purple"),marginLeft:"auto"}}>🏆 Winner</span>}
                </div>
                <div style={{fontSize:32,fontWeight:800,color:"#7c3aed",marginBottom:4}}>{psoData.latency}<span style={{fontSize:14,fontWeight:500}}> ms</span></div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>Latency</div>
                {[["Speed",`${psoData.throughput} t/s`],["Energy",`${psoData.energy} kWh`],["Usage",`${psoData.utilization}%`]].map(([l,v])=>(
                  <div key={l} style={S.dr}><span style={S.dl}>{l}</span><span style={S.dv}>{v}</span></div>
                ))}
              </div>
            </div>

            {/* Best server recommendation */}
            <div style={{background:"#f0fdf4",border:"2px solid #86efac",borderRadius:12,padding:"20px 24px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
                🏆 Recommended Edge Server
              </div>
              <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{fontSize:40}}>{srv.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:18,fontWeight:800,color:"#111827"}}>{srv.label}</div>
                  <div style={{fontSize:13,color:"#6b7280",marginTop:4}}>
                    Best algorithm: <strong style={{color:gbfsWins?"#1d4ed8":"#7c3aed"}}>{gbfsWins?"GBFS":"PSO"}</strong> with{" "}
                    <strong style={{color:"#15803d"}}>{Math.min(+gbfsData.latency,+psoData.latency)} ms</strong> latency.
                    Both algorithms ran on this server.
                  </div>
                </div>
                <span style={S.badge("green")}>✓ Best Server</span>
              </div>
            </div>
            <div style={{...S.infoBox("green"),marginTop:16,marginBottom:0}}>
              <div style={{fontSize:13,color:"#15803d"}}>
                ✅ Both algorithms complete on <strong>{srv.icon} {srv.label}</strong>. Winner: <strong>{gbfsWins?"GBFS":"PSO"}</strong> ({Math.min(+gbfsData.latency,+psoData.latency)} ms). Click <strong>Next</strong> to confirm edge server.
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

/* ── Step 3: Select Edge Server ── */
const Step4SelectEdge = ({ machine:m, gbfsData, psoData, algoServer }) => {
  if (!gbfsData||!psoData) return <div style={S.card}><div style={{textAlign:"center",padding:40,color:"#9ca3af"}}>⚠️ Please run both algorithms first.</div></div>;
  const gbfsWins  = gbfsData.latency <= psoData.latency;
  const bestAlgo  = gbfsWins ? "GBFS" : "PSO";
  const bestLat   = Math.min(+gbfsData.latency, +psoData.latency);
  const sKey      = algoServer;
  const srv       = SERVERS[sKey];
  const improvement = Math.abs(((gbfsData.latency-psoData.latency)/gbfsData.latency)*100).toFixed(1);

  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Select Best Edge Server</div>
        <div style={S.ps}>Based on comparing GBFS and PSO results from <strong>{srv.icon} {srv.label}</strong>. Winner: <strong>{bestAlgo}</strong>.</div>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
        {[
          {icon:"⚙️",label:"GBFS Latency",  value:`${gbfsData.latency} ms`, color:"blue"},
          {icon:"🔬",label:"PSO Latency",   value:`${psoData.latency} ms`,  color:"purple"},
          {icon:"🏆",label:"Best Algorithm",value:bestAlgo,                 color:"green"},
          {icon:"📉",label:"Best Latency",  value:`${bestLat} ms`,          color:"amber"},
          {icon:"📈",label:"Improvement",   value:`${improvement}%`,        color:"green"},
        ].map(({icon,label,value,color})=>(
          <div key={label} style={S.statCard}><div style={S.statIcon(color)}>{icon}</div><div style={S.statVal}>{value}</div><div style={S.statLbl}>{label}</div></div>
        ))}
      </div>

      {/* Server display */}
      <div style={S.card}>
        <div style={S.ct}>Distributed Server Network</div>
        <div style={S.cd}>All backends — the recommended server is highlighted based on algorithm results.</div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          {Object.entries(SERVERS).map(([key,s])=>{
            const isActive = key === sKey;
            return (
              <div key={key} style={{flex:"1 1 200px",border:`2px solid ${isActive?s.border:"#e5e7eb"}`,borderRadius:12,padding:"16px 18px",background:isActive?s.bg:"#f9fafb",opacity:isActive?1:0.55,transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:24}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:isActive?"#111827":"#6b7280"}}>{s.label}</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>{s.sub}</div>
                  </div>
                  {isActive&&<span style={{...S.badge(s.color),marginLeft:"auto"}}>✓ Recommended</span>}
                </div>
                <div style={{fontSize:10,fontFamily:"monospace",color:isActive?s.hex:"#9ca3af",background:"rgba(0,0,0,0.04)",padding:"4px 8px",borderRadius:4,wordBreak:"break-all",marginBottom:isActive?8:0}}>
                  {s.baseUrl}
                </div>
                {isActive&&(
                  <div style={{fontSize:11,color:"#15803d",fontWeight:600}}>
                    Both algorithms ran here · {bestAlgo} wins with {bestLat} ms
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.ct}>Algorithm Comparison (on {srv.label})</div>
        <div style={S.cd}>Head-to-head metrics from the same server run.</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr>{["Metric","GBFS","PSO","Better"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {[["Latency (ms)",gbfsData.latency,psoData.latency,"lower"],["Speed (tasks/s)",gbfsData.throughput,psoData.throughput,"higher"],["Energy (kWh)",gbfsData.energy,psoData.energy,"lower"],["Utilization (%)",gbfsData.utilization,psoData.utilization,"lower"]].map(([l,g,p,dir],i)=>{
              const gW=dir==="lower"?+g<=+p:+g>=+p;
              return <tr key={l} style={{background:i%2===0?"#fff":"#f9fafb"}}><td style={{...S.td,fontWeight:600}}>{l}</td><td style={{...S.td,fontWeight:700,color:gW?"#1d4ed8":"#374151"}}>{g}</td><td style={{...S.td,fontWeight:700,color:!gW?"#7c3aed":"#374151"}}>{p}</td><td style={S.td}><span style={S.badge(gW?"blue":"purple")}>{gW?"GBFS":"PSO"}</span></td></tr>;
            })}
          </tbody>
        </table>
      </div>

      <div style={S.card}>
        <div style={S.ct}>Selected Edge Server</div>
        <div style={S.cd}>Determined by comparing {bestAlgo}'s lower latency on <strong>{srv.label}</strong>.</div>
        <div style={{display:"flex",alignItems:"center",gap:20,background:srv.bg,border:`2px solid ${srv.border}`,borderRadius:12,padding:"20px 24px"}}>
          <div style={{fontSize:40}}>{srv.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:800,color:"#111827"}}>{srv.label}</div>
            <div style={{fontSize:13,color:"#6b7280",marginTop:4}}>Best latency: <strong style={{color:srv.hex}}>{bestLat} ms</strong> · Algorithm: <strong>{bestAlgo}</strong></div>
          </div>
          <span style={S.badge(srv.color)}>✓ Ready</span>
        </div>
      </div>
    </div>
  );
};

/* ── Step 4: Offload Task ── */
const Step5Offload = ({ machine:m, gbfsData, psoData, offloadResult, offloading, offloadError, onOffload, algoServer }) => {
  if (!gbfsData||!psoData) return <div style={S.card}><div style={{textAlign:"center",padding:40,color:"#9ca3af"}}>⚠️ Please run both algorithms first.</div></div>;
  const gbfsWins = gbfsData.latency <= psoData.latency;
  const bestAlgo = gbfsWins ? "GBFS" : "PSO";
  const sKey     = algoServer;
  const srv      = SERVERS[sKey];
  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Offload Task</div>
        <div style={S.ps}>Sending task from <strong>{m.name}</strong> to <strong>{srv.icon} {srv.label}</strong> — logged to <strong>Supabase</strong>.</div>
      </div>
      <div style={S.card}>
        <div style={S.ct}>Task Offloading Flow</div><div style={S.cd}>IoT Device → Network → {srv.label} → Supabase log.</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,flexWrap:"wrap",padding:"16px 0"}}>
          {[
            {icon:"🏭",label:m.machineId,  sub:"IoT Device",           bc:"#bfdbfe",bg:"#eff6ff"},
            null,
            {icon:"📡",label:"Network",    sub:`${m.bandwidth} Mbps`,  bc:"#fde68a",bg:"#fffbeb"},
            null,
            {icon:srv.icon,label:srv.label,sub:"Edge Node",            bc:srv.border,bg:srv.bg},
            null,
            {icon:"🗄️",label:"Supabase",   sub:"Logs saved",           bc:"#e9d5ff",bg:"#faf5ff"},
          ].map((item,i)=>item===null?(
            <div key={i} style={{display:"flex",alignItems:"center",padding:"0 4px"}}>
              <div style={{width:28,height:2,background:"linear-gradient(90deg,#6b7280,#16a34a)"}}/>
              <span style={{color:"#16a34a",fontSize:14}}>▶</span>
            </div>
          ):(
            <div key={i} style={{flex:"1 1 110px",maxWidth:140,border:`2px solid ${item.bc}`,borderRadius:12,padding:"14px 10px",background:item.bg,textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:6}}>{item.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>{item.label}</div>
              <div style={{fontSize:10,color:"#6b7280",marginTop:3,lineHeight:1.4}}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.card}>
        <div style={S.ct}>Send Task to {srv.label}</div>
        <div style={S.cd}>POSTs to <code style={{fontSize:11}}>{srv.baseUrl}/offload</code>, logs result to Supabase.</div>
        {offloadError&&<div style={{...S.errBox,marginBottom:16}}>❌ <strong>Offload to {srv.label} failed.</strong> {offloadError}</div>}
        {!offloadResult?(
          <div style={{textAlign:"center",paddingTop:8}}>
            <button style={offloading?S.btnOff:S.btn} disabled={offloading} onClick={onOffload}>
              {offloading?`⏳ Sending to ${srv.label}…`:`📤 Offload Task to ${srv.icon} ${srv.label}`}
            </button>
            {offloading&&<div style={{fontSize:12,color:"#9ca3af",marginTop:8}}>POST → {srv.baseUrl}/offload → Supabase log</div>}
          </div>
        ):(
          <>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              {[["Task Size",`${m.taskSize} MB`,"blue"],["Algorithm",bestAlgo,"blue"],["Target Server",srv.label,srv.color],["Bandwidth",`${m.bandwidth} Mbps`,"blue"],["Trans. Delay",`${m.transmissionDelay} ms`,"amber"],["Status",offloadResult.status==="success"?"✅ Success":"❌ Failed",offloadResult.status==="success"?"green":"red"]].map(([l,v,c])=>(
                <div key={l} style={{flex:"1 1 150px",background:"#f9fafb",border:"1px solid #f3f4f6",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:11,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>{l}</div>
                  <span style={S.badge(c)}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{...S.infoBox("green"),marginTop:16,marginBottom:0}}>
              <div style={{fontSize:13,color:"#15803d"}}>✅ Task offloaded to {srv.icon} {srv.label}. Measured latency: <strong>{offloadResult.measuredLatency} ms</strong>. Saved to Supabase.</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Step 5: Measure Latency ── */
const Step6Latency = ({ machine:m, gbfsData, psoData, offloadResult, algoServer }) => {
  if (!gbfsData||!psoData) return <div style={S.card}><div style={{textAlign:"center",padding:40,color:"#9ca3af"}}>⚠️ Please run both algorithms first.</div></div>;
  const gbfsWins   = gbfsData.latency<=psoData.latency;
  const winner     = gbfsWins?"GBFS":"PSO";
  const improvement= Math.abs(((gbfsData.latency-psoData.latency)/gbfsData.latency)*100).toFixed(1);
  const sKey       = algoServer;
  const srv        = SERVERS[sKey];
  const gbfsBase   = +gbfsData.latency;
  const psoBase    = +psoData.latency;
  const measuredLat= offloadResult?.measuredLatency;
  const lineData   = [1,2,3,4,5,6].map(t=>({cycle:`T${t}`,GBFS:+(gbfsBase+Math.sin(t*1.1)*gbfsBase*0.06).toFixed(2),PSO:+(psoBase+Math.sin(t*1.3)*psoBase*0.06).toFixed(2),...(measuredLat?{Measured:+(measuredLat+Math.sin(t*0.9)*measuredLat*0.03).toFixed(2)}:{})}));
  const barData    = [{metric:"Latency (ms)",GBFS:+gbfsData.latency,PSO:+psoData.latency},{metric:"Speed (t/s)",GBFS:+gbfsData.throughput,PSO:+psoData.throughput},{metric:"Energy (kWh)",GBFS:+gbfsData.energy,PSO:+psoData.energy},{metric:"Usage (%)",GBFS:+gbfsData.utilization,PSO:+psoData.utilization}];
  return (
    <div>
      <div style={S.ph}>
        <div style={S.pt}>Edge Server Processes Task & Measure Latency</div>
        <div style={S.ps}><strong>{srv.icon} {srv.label}</strong> ran both algorithms and processed task from <strong>{m.name}</strong>.</div>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
        {[
          {icon:"🏆",label:"Best Algorithm",  value:winner,                    color:"green"},
          {icon:srv.icon,label:"Active Server",value:srv.label,                color:srv.color},
          {icon:"⚙️",label:"GBFS Latency",    value:`${gbfsData.latency} ms`,  color:"blue"},
          {icon:"🔬",label:"PSO Latency",     value:`${psoData.latency} ms`,   color:"purple"},
          {icon:"📉",label:"Improvement",     value:`${improvement}%`,         color:"amber"},
          ...(measuredLat?[{icon:"📡",label:"Actual Latency",value:`${measuredLat} ms`,color:"green"}]:[]),
        ].map(({icon,label,value,color})=>(
          <div key={label} style={S.statCard}><div style={S.statIcon(color)}>{icon}</div><div style={S.statVal}>{value}</div><div style={S.statLbl}>{label}</div></div>
        ))}
      </div>
      <div style={{background:gbfsWins?"#eff6ff":"#faf5ff",border:`2px solid ${gbfsWins?"#bfdbfe":"#e9d5ff"}`,borderRadius:12,padding:"20px 24px",marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Best Algorithm</div>
        <div style={{fontSize:36,fontWeight:800,color:gbfsWins?"#1d4ed8":"#7c3aed"}}>{winner}</div>
        <div style={{fontSize:13,color:"#6b7280",marginTop:4}}>{winner} achieved <strong>{Math.min(gbfsBase,psoBase)} ms</strong> on <strong>{srv.label}</strong> — {improvement}% lower than {gbfsWins?"PSO":"GBFS"}</div>
      </div>
      <div style={S.card}>
        <div style={S.ct}>Latency Comparison — Line Graph</div><div style={S.cd}>GBFS vs PSO{measuredLat?" vs Actual":""} latency across 6 cycles on {srv.label}.</div>
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={lineData} margin={{top:16,right:24,left:0,bottom:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
            <XAxis dataKey="cycle" stroke="#9ca3af" fontSize={12} label={{value:"Processing Cycle",position:"insideBottom",offset:-6,fill:"#9ca3af",fontSize:11}}/>
            <YAxis stroke="#9ca3af" fontSize={12} unit=" ms" domain={["auto","auto"]}/>
            <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:"1px solid #e5e7eb"}} formatter={v=>[`${v} ms`,""]}/>
            <Legend wrapperStyle={{fontSize:12}} verticalAlign="top"/>
            <ReferenceLine y={gbfsBase} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.4}/>
            <ReferenceLine y={psoBase}  stroke="#8b5cf6" strokeDasharray="4 4" strokeOpacity={0.4}/>
            <Line type="monotone" dataKey="GBFS"     stroke="#3b82f6" strokeWidth={2.5} dot={{r:5,fill:"#3b82f6",strokeWidth:2,stroke:"#fff"}} activeDot={{r:7}}/>
            <Line type="monotone" dataKey="PSO"      stroke="#8b5cf6" strokeWidth={2.5} dot={{r:5,fill:"#8b5cf6",strokeWidth:2,stroke:"#fff"}} activeDot={{r:7}}/>
            {measuredLat&&<Line type="monotone" dataKey="Measured" stroke="#16a34a" strokeWidth={2.5} strokeDasharray="5 3" dot={{r:5,fill:"#16a34a",strokeWidth:2,stroke:"#fff"}} activeDot={{r:7}}/>}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={S.card}>
        <div style={S.ct}>Full Metrics Comparison</div><div style={S.cd}>All indicators from {srv.label}.</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{top:16,right:20,left:0,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
            <XAxis dataKey="metric" stroke="#9ca3af" fontSize={11}/>
            <YAxis stroke="#9ca3af" fontSize={12}/>
            <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:"1px solid #e5e7eb"}}/>
            <Legend wrapperStyle={{fontSize:12}}/>
            <Bar dataKey="GBFS" fill="#3b82f6" radius={[4,4,0,0]}><LabelList dataKey="GBFS" position="top" fill="#9ca3af" fontSize={10}/></Bar>
            <Bar dataKey="PSO"  fill="#8b5cf6" radius={[4,4,0,0]}><LabelList dataKey="PSO"  position="top" fill="#9ca3af" fontSize={10}/></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={S.card}>
        <div style={S.ct}>Result Summary Table</div><div style={S.cd}>Final results for {m.name} ({m.machineId}) on {srv.label}.</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr>{["Metric","GBFS","PSO","Better"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {[["Latency (ms)",gbfsData.latency,psoData.latency,"lower"],["Speed (tasks/s)",gbfsData.throughput,psoData.throughput,"higher"],["Energy (kWh)",gbfsData.energy,psoData.energy,"lower"],["Resource Usage (%)",gbfsData.utilization,psoData.utilization,"lower"],["Response Time (ms)",gbfsData.time,psoData.time,"lower"]].map(([l,g,p,dir],i)=>{
              const gW=dir==="lower"?+g<=+p:+g>=+p;
              return <tr key={l} style={{background:i%2===0?"#fff":"#f9fafb"}}><td style={{...S.td,fontWeight:600}}>{l}</td><td style={{...S.td,fontWeight:700,color:gW?"#1d4ed8":"#374151"}}>{g}</td><td style={{...S.td,fontWeight:700,color:!gW?"#7c3aed":"#374151"}}>{p}</td><td style={S.td}><span style={S.badge(gW?"blue":"purple")}>{gW?"GBFS":"PSO"}</span></td></tr>;
            })}
          </tbody>
        </table>
        <div style={{...S.infoBox("green"),marginTop:16,marginBottom:0}}>
          <div style={{fontSize:13,color:"#15803d"}}>
            🎉 <strong>{m.name}</strong> offloaded to <strong>{srv.icon} {srv.label}</strong> using <strong>{winner}</strong>.
            {measuredLat&&<> Actual latency: <strong>{measuredLat} ms</strong>.</>} Saved to Supabase.
          </div>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(e){return{hasError:true,error:e};}
  render(){
    if(this.state.hasError)return<div style={{padding:20,color:"red"}}><h1>Error</h1><pre>{this.state.error?.toString()}</pre></div>;
    return this.props.children;
  }
}

export default function App() {
  const [step,            setStep]            = useState(0);
  const [maxReached,      setMaxReached]      = useState(0);
  const [selectedId,      setSelectedId]      = useState(null);
  const [serverStatuses,  setServerStatuses]  = useState({A:"checking",B:"checking"});
  const [machineData,     setMachineData]     = useState({});
  const [machinesLoading, setMachinesLoading] = useState(true);
  const [machinesError,   setMachinesError]   = useState(null);
  const [gbfsData,        setGbfsData]        = useState(null);
  const [psoData,         setPsoData]         = useState(null);
  const [algoRunning,     setAlgoRunning]     = useState(false);
  const [algoError,       setAlgoError]       = useState(null);
  const [offloadResult,   setOffloadResult]   = useState(null);
  const [offloading,      setOffloading]      = useState(false);
  const [offloadError,    setOffloadError]    = useState(null);
  const [algoServer,      setAlgoServer]      = useState("A");
  const [gbfsProgress,    setGbfsProgress]    = useState("");
  const [psoProgress,     setPsoProgress]     = useState("");

  const machine = selectedId ? machineData[selectedId] : null;
  const activeServerKey = algoServer;

  const pingServers = useCallback(async () => {
    const results = await Promise.allSettled(
      Object.entries(SERVERS).map(async ([key, srv]) => {
        try { await apiFetch(srv.baseUrl, "/health"); return [key, "online"]; }
        catch { return [key, "offline"]; }
      })
    );
    const next = {};
    results.forEach(r => { if (r.status==="fulfilled") { const [k,s]=r.value; next[k]=s; } });
    setServerStatuses(prev => ({ ...prev, ...next }));
  }, []);

  const loadMachines = useCallback(async () => {
    setMachinesLoading(true); setMachinesError(null);
    try {
      const data = await apiFetch(PRIMARY_BASE, "/machines");
      setMachineData(data);
      const firstId = Object.keys(data)[0];
      if (firstId) setSelectedId(firstId);
      setServerStatuses(prev => ({ ...prev, A:"online" }));
    } catch (err) {
      setMachinesError(err.message);
      setServerStatuses(prev => ({ ...prev, A:"offline" }));
    } finally { setMachinesLoading(false); }
  }, []);

  useEffect(() => { loadMachines(); pingServers(); }, [loadMachines, pingServers]);

  /* Run BOTH algorithms on the same selected server */
  const runBothAlgorithms = async () => {
    const srv = SERVERS[algoServer];
    setAlgoRunning(true); setAlgoError(null);
    setGbfsData(null); setPsoData(null);
    setGbfsProgress(""); setPsoProgress("");

    try {
      // Step 1: GBFS
      setGbfsProgress("Running…");
      const gbfsResult = await apiFetch(srv.baseUrl, "/gbfs", {
        method:"POST", body:JSON.stringify({ machine })
      });
      setGbfsData({ ...gbfsResult, ranOnServer: algoServer });
      setGbfsProgress("Done ✓");

      // Step 2: PSO on the SAME server
      setPsoProgress("Running…");
      const psoResult = await apiFetch(srv.baseUrl, "/pso", {
        method:"POST", body:JSON.stringify({ machine })
      });
      setPsoData({ ...psoResult, ranOnServer: algoServer });
      setPsoProgress("Done ✓");

      setMaxReached(r => Math.max(r, 5));
    } catch (err) {
      setAlgoError(err.message);
    } finally {
      setAlgoRunning(false);
    }
  };

  /* Offload task */
  const offloadTask = async () => {
    const gbfsWins  = gbfsData.latency <= psoData.latency;
    const bestAlgo  = gbfsWins ? "GBFS" : "PSO";
    const winSrv    = SERVERS[algoServer];
    setOffloading(true); setOffloadError(null);
    try {
      const result = await apiFetch(winSrv.baseUrl, "/offload", {
        method: "POST",
        body: JSON.stringify({
          machineId:    machine.machineId,
          taskSize:     machine.taskSize,
          algorithm:    bestAlgo,
          targetServer: winSrv.label,
          gbfsLatency:  gbfsData.latency,
          psoLatency:   psoData.latency,
        })
      });
      setOffloadResult(result);
      setServerStatuses(prev => ({ ...prev, [algoServer]:"online" }));
    } catch (err) { setOffloadError(err.message); }
    finally { setOffloading(false); }
  };

  const handleSelectMachine = id => {
    setSelectedId(id); setGbfsData(null); setPsoData(null);
    setOffloadResult(null); setMaxReached(0);
    setGbfsProgress(""); setPsoProgress("");
  };

  const canNext = () => {
    if (step===0) return !!selectedId;
    if (step===2) return !!gbfsData && !!psoData;
    if (step===3) return !!gbfsData && !!psoData;
    if (step===4) return !!offloadResult;
    return true;
  };

  const goNext = () => { const n=step+1; setStep(n); setMaxReached(r=>Math.max(r,n)); };

  const renderStep = () => {
    switch(step) {
      case 0: return <Step0Machine machineData={machineData} loading={machinesLoading} error={machinesError} selectedId={selectedId} setSelectedId={handleSelectMachine} onRetry={loadMachines}/>;
      case 1: return machine ? <Step1CollectData machine={machine}/> : null;
      case 2: return machine ? <Step2Algorithms machine={machine} gbfsData={gbfsData} psoData={psoData} algoRunning={algoRunning} algoError={algoError} selectedServer={algoServer} setSelectedServer={k=>{setAlgoServer(k);setGbfsData(null);setPsoData(null);}} onRunBoth={runBothAlgorithms} gbfsProgress={gbfsProgress} psoProgress={psoProgress}/> : null;
      case 3: return machine ? <Step4SelectEdge machine={machine} gbfsData={gbfsData} psoData={psoData} algoServer={algoServer}/> : null;
      case 4: return machine ? <Step5Offload machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} offloading={offloading} offloadError={offloadError} onOffload={offloadTask} algoServer={algoServer}/> : null;
      case 5: return machine ? <Step6Latency machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} algoServer={algoServer}/> : null;
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <div style={S.root}>
        <Sidebar step={step} maxReached={maxReached} onJump={i=>i<=maxReached&&setStep(i)} serverStatuses={serverStatuses}/>
        <div style={S.content}>
          <Header step={step} maxReached={maxReached} onJump={i=>i<=maxReached&&setStep(i)} activeServerKey={activeServerKey}/>
          <div style={S.main}>{renderStep()}</div>
          <div style={S.bottomBar}>
            <button style={S.bbBack(step===0)} disabled={step===0} onClick={()=>setStep(p=>p-1)}>← Back</button>
            <span style={{fontSize:12,color:"#9ca3af",fontWeight:500}}>Step {step+1} of {STEPS.length}</span>
            <button style={S.bbNext(!canNext()||step>=5)} disabled={!canNext()||step>=5} onClick={goNext}>Next →</button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
