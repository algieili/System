import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
  LineChart, Line, ReferenceLine
} from "recharts";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  bg:        "#0d1117",
  surface:   "#161b22",
  elevated:  "#1c2128",
  border:    "#30363d",
  borderSub: "#21262d",
  text:      "#e6edf3",
  muted:     "#7d8590",
  dim:       "#484f58",
  blue:      "#58a6ff",
  blueDim:   "#1f4c8b",
  blueBg:    "#0d1f3c",
  green:     "#3fb950",
  greenDim:  "#1a4723",
  greenBg:   "#0d2a14",
  purple:    "#bc8cff",
  purpleDim: "#4d2d8b",
  purpleBg:  "#1a0d3c",
  amber:     "#e3b341",
  amberBg:   "#2a1e08",
  red:       "#f85149",
  redBg:     "#2a0d0b",
  fontMono:  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSans:  "'Inter', system-ui, -apple-system, sans-serif",
};

/* ─────────────────────────────────────────────
   SERVER CONFIG
───────────────────────────────────────────── */
const SERVERS = {
  A: {
    label:   "Edge Server A",
    sub:     "Latency-Sensitive · Compute-Heavy",
    icon:    "⚡",
    tag:     "A",
    accent:  T.blue,
    accentBg: T.blueBg,
    accentDim: T.blueDim,
    baseUrl: "https://system-ctld.onrender.com/api",
  },
  B: {
    label:   "Edge Server B",
    sub:     "Energy-Efficient",
    icon:    "🌿",
    tag:     "B",
    accent:  T.green,
    accentBg: T.greenBg,
    accentDim: T.greenDim,
    baseUrl: "https://system-1-rcpl.onrender.com/api",
  },
};

const PRIMARY_BASE = SERVERS.A.baseUrl;

const apiFetch = async (baseUrl, path, options = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
};

const STEPS = [
  { title: "IoT Machine",        short: "Machine",    icon: "󰾊" },
  { title: "Collect Data",       short: "Collect",    icon: "󰋳" },
  { title: "Run Algorithms",     short: "Algorithms", icon: "󰘳" },
  { title: "Select Edge Server", short: "Edge Server",icon: "󰋊" },
  { title: "Offload Task",       short: "Offload",    icon: "󰕒" },
  { title: "Measure Latency",    short: "Latency",    icon: "󰊌" },
];

/* ─────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────── */
const Badge = ({ color = "blue", children, dot }) => {
  const map = {
    blue:   { bg: T.blueBg,   border: T.blueDim,   text: T.blue   },
    green:  { bg: T.greenBg,  border: T.greenDim,  text: T.green  },
    purple: { bg: T.purpleBg, border: T.purpleDim, text: T.purple },
    amber:  { bg: T.amberBg,  border: "#5c3b00",   text: T.amber  },
    red:    { bg: T.redBg,    border: "#5c1e1a",   text: T.red    },
    dim:    { bg: T.elevated, border: T.border,    text: T.muted  },
  };
  const c = map[color] || map.blue;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 9px", borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      fontFamily: T.fontMono,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text, display: "inline-block" }} />}
      {children}
    </span>
  );
};

const Stat = ({ icon, label, value, color = "blue", mono = true }) => {
  const map = { blue: T.blue, green: T.green, purple: T.purple, amber: T.amber };
  return (
    <div style={{
      flex: "1 1 140px", background: T.surface,
      border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 18px",
    }}>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: map[color] || T.text, fontFamily: mono ? T.fontMono : T.fontSans, lineHeight: 1 }}>{value}</div>
    </div>
  );
};

const Card = ({ title, sub, children, accent }) => (
  <div style={{
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 8, marginBottom: 16, overflow: "hidden",
  }}>
    {(title || sub) && (
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${T.borderSub}`,
        display: "flex", alignItems: "baseline", gap: 10,
        background: T.elevated,
      }}>
        {accent && <div style={{ width: 3, height: 16, borderRadius: 2, background: accent, flexShrink: 0 }} />}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: T.fontSans }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontFamily: T.fontSans }}>{sub}</div>}
        </div>
      </div>
    )}
    <div style={{ padding: "20px" }}>{children}</div>
  </div>
);

const InfoBox = ({ color = "blue", children }) => {
  const map = {
    blue:   { bg: T.blueBg,   border: T.blueDim,   icon: "ℹ", text: T.blue   },
    green:  { bg: T.greenBg,  border: T.greenDim,  icon: "✓", text: T.green  },
    amber:  { bg: T.amberBg,  border: "#5c3b00",   icon: "⚠", text: T.amber  },
    red:    { bg: T.redBg,    border: "#5c1e1a",   icon: "✕", text: T.red    },
  };
  const c = map[color] || map.blue;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.text}`,
      borderRadius: 6, padding: "12px 16px",
      fontSize: 12, color: c.text, lineHeight: 1.6,
      fontFamily: T.fontSans,
    }}>
      {children}
    </div>
  );
};

const ErrBox = ({ children }) => (
  <InfoBox color="red">{children}</InfoBox>
);

const TableRow = ({ cells, isOdd }) => (
  <tr style={{ background: isOdd ? T.elevated : T.surface }}>
    {cells.map((cell, i) => (
      <td key={i} style={{
        padding: "10px 16px", borderBottom: `1px solid ${T.borderSub}`,
        fontSize: 12, color: T.text, fontFamily: i === 0 ? T.fontSans : T.fontMono,
        fontWeight: i === 0 ? 500 : 400, verticalAlign: "middle",
      }}>
        {cell}
      </td>
    ))}
  </tr>
);

const Th = ({ children }) => (
  <th style={{
    padding: "10px 16px", textAlign: "left",
    fontSize: 10, fontWeight: 700, color: T.muted,
    textTransform: "uppercase", letterSpacing: "0.08em",
    borderBottom: `1px solid ${T.border}`,
    background: T.elevated, fontFamily: T.fontSans, whiteSpace: "nowrap",
  }}>
    {children}
  </th>
);

const PrimaryBtn = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? T.elevated : T.green,
    color: disabled ? T.dim : "#0d1117",
    border: disabled ? `1px solid ${T.border}` : "none",
    borderRadius: 6, padding: "10px 24px",
    fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: T.fontSans, transition: "all 0.15s", letterSpacing: "0.01em",
  }}>
    {children}
  </button>
);

const GhostBtn = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: "transparent", color: disabled ? T.dim : T.muted,
    border: `1px solid ${disabled ? T.borderSub : T.border}`,
    borderRadius: 6, padding: "10px 24px",
    fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: T.fontSans, transition: "all 0.15s",
  }}>
    {children}
  </button>
);

const DualBtn = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? T.elevated : "linear-gradient(135deg, #1a5fc8, #6b3fa0)",
    color: disabled ? T.dim : "#fff",
    border: disabled ? `1px solid ${T.border}` : "none",
    borderRadius: 6, padding: "12px 32px",
    fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: T.fontSans, letterSpacing: "0.01em",
  }}>
    {children}
  </button>
);

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
const Sidebar = ({ step, maxReached, onJump, serverStatuses }) => (
  <div style={{
    width: 220, background: T.bg, display: "flex", flexDirection: "column",
    position: "sticky", top: 0, height: "100vh", overflowY: "auto",
    flexShrink: 0, borderRight: `1px solid ${T.border}`,
  }}>
    {/* Logo */}
    <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: "linear-gradient(135deg, #1a5fc8, #3fb950)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0,
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-0.01em", fontFamily: T.fontSans }}>EdgeOffload</div>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: T.fontMono, marginTop: 1 }}>IoT · v5.0</div>
        </div>
      </div>
    </div>

    {/* Steps */}
    <div style={{ padding: "16px 12px", flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 8, fontFamily: T.fontSans }}>
        Pipeline
      </div>
      {STEPS.map((s, i) => {
        const active = i === step, done = i < step;
        return (
          <button key={i} onClick={() => i <= maxReached && onJump(i)} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "9px 10px", borderRadius: 6, border: "none",
            cursor: i <= maxReached ? "pointer" : "default",
            textAlign: "left", marginBottom: 2,
            background: active ? T.elevated : "transparent",
            outline: active ? `1px solid ${T.border}` : "none",
            transition: "all 0.12s",
          }}>
            {/* Step indicator */}
            <div style={{
              width: 22, height: 22, borderRadius: 4, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: done ? 10 : 11, fontWeight: 700, fontFamily: T.fontMono,
              background: active ? T.green : done ? T.greenDim : T.elevated,
              color: active ? "#0d1117" : done ? T.green : T.dim,
              border: `1px solid ${active ? T.green : done ? T.greenDim : T.border}`,
            }}>
              {done ? "✓" : i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: active ? 600 : 400,
                color: active ? T.text : done ? T.muted : T.dim,
                fontFamily: T.fontSans, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {s.title}
              </div>
            </div>
            {active && <div style={{ width: 3, height: 14, borderRadius: 2, background: T.green, flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>

    {/* Server Status */}
    <div style={{ padding: "12px 16px 20px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: T.fontSans }}>
        Servers
      </div>
      {Object.entries(SERVERS).map(([key, srv]) => {
        const st = serverStatuses[key];
        const online = st === "online";
        return (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 6, marginBottom: 4,
            background: T.elevated, border: `1px solid ${T.borderSub}`,
          }}>
            {/* Pulse dot */}
            <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: online ? T.green : st === "checking" ? T.amber : T.red,
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.text, fontFamily: T.fontMono, lineHeight: 1 }}>{srv.label}</div>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: T.fontMono, marginTop: 2 }}>
                {online ? "online" : st === "checking" ? "pinging…" : "offline"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   TOP BAR
───────────────────────────────────────────── */
const TopBar = ({ step, maxReached, onJump, activeServerKey }) => {
  const srv = activeServerKey ? SERVERS[activeServerKey] : null;
  return (
    <div style={{
      background: T.surface, borderBottom: `1px solid ${T.border}`,
      padding: "0 24px", minHeight: 52, display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <span style={{ fontSize: 12, color: T.muted, fontFamily: T.fontSans }}>Simulation</span>
      <span style={{ color: T.border, fontSize: 12 }}>›</span>
      <span style={{ fontSize: 12, color: T.text, fontWeight: 600, fontFamily: T.fontSans }}>{STEPS[step].title}</span>

      {/* Progress pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 16, overflow: "hidden" }}>
        {STEPS.map((s, i) => {
          const active = i === step, done = i < step;
          return (
            <React.Fragment key={i}>
              <button onClick={() => i <= maxReached && onJump(i)} style={{
                padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: active ? 700 : 400,
                fontFamily: T.fontMono,
                background: active ? T.greenBg : done ? T.elevated : "transparent",
                color: active ? T.green : done ? T.muted : T.dim,
                border: `1px solid ${active ? T.greenDim : done ? T.border : "transparent"}`,
                cursor: i <= maxReached ? "pointer" : "default",
                whiteSpace: "nowrap",
              }}>
                {done ? "✓ " : ""}{s.short}
              </button>
              {i < STEPS.length - 1 && <span style={{ color: T.border, fontSize: 10 }}>—</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right badges */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {srv && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 11,
            fontFamily: T.fontMono,
            color: srv.accent, background: srv.accentBg,
            border: `1px solid ${srv.accentDim}`,
            borderRadius: 4, padding: "3px 10px",
          }}>
            {srv.icon} {srv.label}
          </div>
        )}
        <div style={{
          fontSize: 11, fontFamily: T.fontMono, color: T.muted,
          background: T.elevated, border: `1px solid ${T.border}`,
          borderRadius: 4, padding: "3px 10px",
        }}>
          {step + 1} / {STEPS.length}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 0: SELECT MACHINE
───────────────────────────────────────────── */
const Step0Machine = ({ machineData, loading, error, selectedId, setSelectedId, onRetry }) => {
  const machines = Object.values(machineData);
  const m = machineData[selectedId];

  if (loading) return (
    <Card title="Loading Machines" sub="Fetching from Supabase via Server A">
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 0", color: T.muted, fontFamily: T.fontSans, fontSize: 13 }}>
        <div style={{ width: 16, height: 16, border: `2px solid ${T.blue}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        Connecting to edge…
      </div>
    </Card>
  );

  if (error) return (
    <div>
      <ErrBox>Connection failed — {error}</ErrBox>
      <div style={{ marginTop: 12 }}><PrimaryBtn onClick={onRetry}>Retry</PrimaryBtn></div>
    </div>
  );

  if (!m) return null;

  const cats = [
    { label: "Total Devices", value: machines.length, color: "green" },
    { label: "Cutting",       value: machines.filter(x => x.category === "Cutting Machines").length,   color: "blue" },
    { label: "Finishing",     value: machines.filter(x => x.category === "Finishing Machines").length, color: "purple" },
    { label: "Welding",       value: machines.filter(x => x.category === "Welding Machines").length,   color: "amber" },
  ];

  // Unsplash source images matched to each machine category
  // Using specific photo IDs for reliable, relevant industrial machinery images
  const MACHINE_IMAGES = {
    "Cutting Machines":   "https://images.unsplash.com/photo-1565776630587-2e4f9e3eb5c9?w=400&h=220&fit=crop&auto=format&q=80",
    "Welding Machines":   "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=220&fit=crop&auto=format&q=80",
    "Finishing Machines": "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=400&h=220&fit=crop&auto=format&q=80",
    "default":            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=220&fit=crop&auto=format&q=80",
  };

  // Larger detail images for the selected machine panel
  const MACHINE_IMAGES_DETAIL = {
    "Cutting Machines":   "https://images.unsplash.com/photo-1565776630587-2e4f9e3eb5c9?w=700&h=260&fit=crop&auto=format&q=85",
    "Welding Machines":   "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&h=260&fit=crop&auto=format&q=85",
    "Finishing Machines": "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=700&h=260&fit=crop&auto=format&q=85",
    "default":            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&h=260&fit=crop&auto=format&q=85",
  };

  const getMachineImg     = (mc, size = "card") => {
    const map = size === "detail" ? MACHINE_IMAGES_DETAIL : MACHINE_IMAGES;
    return map[mc.category] || map["default"];
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>IoT Machine Selection</h1>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Choose a registered device. Both algorithms will run on the same server in Step 3.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {cats.map(c => <Stat key={c.label} label={c.label} value={c.value} color={c.color} />)}
      </div>

      <Card title="Registered Devices" sub="Live data from Supabase" accent={T.blue}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {machines.map(mc => {
            const sel = selectedId === mc.id;
            const imgSrc = getMachineImg(mc, "card");
            return (
              <div key={mc.id} onClick={() => setSelectedId(mc.id)} style={{
                flex: "1 1 160px", maxWidth: 200,
                border: `1px solid ${sel ? T.green : T.border}`,
                borderRadius: 10, overflow: "hidden", cursor: "pointer",
                background: sel ? T.greenBg : T.elevated,
                outline: sel ? `2px solid ${T.greenDim}` : "none",
                transition: "all 0.15s",
              }}>
                {/* Machine photo */}
                <div style={{ position: "relative", width: "100%", height: 110, overflow: "hidden", background: T.bg }}>
                  <img
                    src={imgSrc}
                    alt={mc.name}
                    onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: sel ? "none" : "grayscale(30%) brightness(0.8)" }}
                  />
                  {/* Fallback if image fails */}
                  <div style={{ display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", fontSize: 28, background: T.elevated }}>⚙</div>
                  {/* Overlay gradient */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(to top, rgba(13,17,23,0.9), transparent)" }} />
                  {sel && (
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <Badge color="green" dot>selected</Badge>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: sel ? T.green : T.text, marginBottom: 2, fontFamily: T.fontMono }}>{mc.machineId}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: T.fontSans, lineHeight: 1.4 }}>{mc.name}</div>
                  <div style={{ fontSize: 10, color: T.dim, fontFamily: T.fontMono }}>{mc.taskType}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {m && (
        <Card title={`${m.machineId} — ${m.name}`} sub="Device metadata" accent={T.green}>
          {/* Hero image */}
          <div style={{ width: "100%", height: 180, borderRadius: 8, overflow: "hidden", marginBottom: 16, position: "relative", background: T.bg }}>
            <img
              src={getMachineImg(m, "detail")}
              alt={m.name}
              onError={e => { e.target.style.display = "none"; }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(13,17,23,0.1) 0%, rgba(13,17,23,0.5) 100%)" }} />
            <div style={{ position: "absolute", bottom: 14, left: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: T.fontSans, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{m.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: T.fontMono, marginTop: 3 }}>{m.category}</div>
            </div>
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <Badge color="green" dot>{m.machineId}</Badge>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {[["Machine ID", m.machineId, "blue"], ["Category", m.category, "dim"], ["Task Type", m.taskType, "amber"]].map(([l, v, c]) => (
              <div key={l} style={{ flex: "1 1 160px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>{l}</div>
                <Badge color={c}>{v}</Badge>
              </div>
            ))}
          </div>
          <InfoBox color="green">
            <strong>{m.machineId}</strong> selected — proceed to collect task parameters.
          </InfoBox>
        </Card>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 1: COLLECT DATA
───────────────────────────────────────────── */
const Step1CollectData = ({ machine: m }) => (
  <div>
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Task Parameters</h1>
      <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
        Live data fetched for <strong style={{ color: T.text }}>{m.name} ({m.machineId})</strong>.
      </p>
    </div>

    <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
      <Stat label="Task Size"       value={`${m.taskSize} MB`}          color="blue" />
      <Stat label="Processing Time" value={`${m.processingTime} ms`}    color="green" />
      <Stat label="Bandwidth"       value={`${m.bandwidth} Mbps`}       color="purple" />
      <Stat label="Energy"          value={`${m.energyConsumption} kWh`}color="amber" />
    </div>

    <Card title="Parameter Table" sub={`${m.machineId} · Supabase`} accent={T.blue}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><Th>Parameter</Th><Th>Value</Th><Th>Description</Th></tr>
        </thead>
        <tbody>
          {[
            ["Machine ID",         m.machineId,                   "Unique device identifier"],
            ["Task Size",          `${m.taskSize} MB`,             "Data generated per task"],
            ["Processing Time",    `${m.processingTime} ms`,       "Local processing time"],
            ["Queue Length",       m.queueLength,                  "Pending task count"],
            ["CPU Utilization",    `${m.cpuUtilization}%`,         "Edge node load"],
            ["Memory Usage",       `${m.memoryUsage} GB`,          "RAM consumed"],
            ["Bandwidth",          `${m.bandwidth} Mbps`,          "Communication speed"],
            ["Transmission Delay", `${m.transmissionDelay} ms`,    "Network delay"],
            ["Energy Consumption", `${m.energyConsumption} kWh`,   "Energy per cycle"],
            ["Throughput",         `${m.throughput} tasks/min`,    "Task completion rate"],
            ["Avg Latency",        `${m.avgLatency} ms`,           "End-to-end delay"],
          ].map(([p, v, d], i) => (
            <TableRow key={p} isOdd={i % 2 === 1} cells={[
              <span style={{ fontFamily: T.fontSans, color: T.text }}>{p}</span>,
              <Badge color="blue">{v}</Badge>,
              <span style={{ color: T.muted, fontFamily: T.fontSans }}>{d}</span>,
            ]} />
          ))}
        </tbody>
      </table>
    </Card>
    <InfoBox color="green">All parameters loaded. Proceed to run GBFS + PSO.</InfoBox>
  </div>
);

/* ─────────────────────────────────────────────
   STEP 2: RUN ALGORITHMS
───────────────────────────────────────────── */
const Step2Algorithms = ({
  machine: m, gbfsData, psoData, algoRunning, algoError,
  selectedServer, setSelectedServer, onRunBoth,
  gbfsProgress, psoProgress,
}) => {
  const srv = SERVERS[selectedServer];
  const bothDone = !!gbfsData && !!psoData;

  const PipeNode = ({ icon, label, sub, done, running, active }) => (
    <div style={{
      flex: "0 0 auto", width: 100,
      border: `1px solid ${done ? T.green : running ? T.blue : T.border}`,
      borderRadius: 8, padding: "12px 10px", textAlign: "center",
      background: done ? T.greenBg : running ? T.blueBg : T.elevated,
      transition: "all 0.2s",
    }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{running ? "⟳" : done ? "✓" : icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: done ? T.green : running ? T.blue : T.text, fontFamily: T.fontMono }}>{label}</div>
      <div style={{ fontSize: 10, color: T.muted, marginTop: 3, fontFamily: T.fontSans }}>{running ? "running…" : sub}</div>
    </div>
  );

  const PipeArrow = () => (
    <div style={{ display: "flex", alignItems: "center", padding: "0 6px", flexShrink: 0 }}>
      <div style={{ width: 20, height: 1, background: T.border }} />
      <span style={{ color: T.muted, fontSize: 10 }}>▶</span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Algorithm Execution</h1>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          GBFS and PSO run sequentially on the selected backend. Results are compared to find the optimal edge server.
        </p>
      </div>

      {/* Server Picker */}
      <Card title="Backend Selection" sub="Both algorithms POST to this server" accent={T.blue}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(SERVERS).map(([key, s]) => {
            const active = key === selectedServer;
            return (
              <div key={key} onClick={() => !algoRunning && setSelectedServer(key)} style={{
                flex: "1 1 200px",
                border: `1px solid ${active ? s.accent : T.border}`,
                borderRadius: 8, padding: "14px 16px",
                background: active ? s.accentBg : T.elevated,
                cursor: algoRunning ? "not-allowed" : "pointer",
                transition: "all 0.12s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: active ? T.text : T.muted, fontFamily: T.fontSans }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSans, marginTop: 2 }}>{s.sub}</div>
                  </div>
                  {active && <Badge color={key === "A" ? "blue" : "green"} dot>active</Badge>}
                </div>
                <div style={{ fontSize: 10, fontFamily: T.fontMono, color: active ? s.accent : T.dim, wordBreak: "break-all" }}>
                  {s.baseUrl}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pipeline */}
      <Card title="Execution Pipeline" sub={`Target: ${srv.label}`} accent={T.purple}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, paddingBottom: 16, justifyContent: "center" }}>
          <PipeNode icon="⚙" label={m.machineId} sub="IoT Source" done />
          <PipeArrow />
          <PipeNode icon="⚙" label="GBFS"    sub="Greedy"      done={!!gbfsData} running={algoRunning && !gbfsData} />
          <PipeArrow />
          <PipeNode icon="◈" label="PSO"     sub="Swarm"       done={!!psoData}  running={algoRunning && !!gbfsData && !psoData} />
          <PipeArrow />
          <PipeNode icon="≋" label="Compare" sub="Pick best"   done={bothDone} />
        </div>

        {/* Progress bars */}
        {(gbfsProgress || psoProgress) && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {[["GBFS", T.blue, gbfsData], ["PSO", T.purple, psoData]].map(([name, color, done]) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.muted, fontFamily: T.fontMono, marginBottom: 4 }}>
                  <span style={{ color }}>{name}</span>
                  <span>{done ? "done ✓" : algoRunning ? "running…" : ""}</span>
                </div>
                <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: color, borderRadius: 2, width: done ? "100%" : algoRunning ? "55%" : "0%", transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {algoError && <div style={{ marginBottom: 16 }}><ErrBox>Run failed on {srv.label} — {algoError}</ErrBox></div>}

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
          <DualBtn disabled={algoRunning || bothDone} onClick={onRunBoth}>
            {algoRunning ? `Running on ${srv.icon} ${srv.label}…` : bothDone ? "✓ Algorithms Complete" : `Run GBFS + PSO on ${srv.icon} ${srv.label}`}
          </DualBtn>
          {bothDone && !algoRunning && (
            <GhostBtn onClick={onRunBoth}>↺ Re-run</GhostBtn>
          )}
        </div>
      </Card>

      {/* Results */}
      {bothDone && (() => {
        const gbfsWins = gbfsData.latency <= psoData.latency;
        return (
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              {/* GBFS */}
              <div style={{
                flex: "1 1 240px",
                border: `1px solid ${gbfsWins ? T.blue : T.border}`,
                borderRadius: 8, padding: "18px 20px",
                background: gbfsWins ? T.blueBg : T.elevated,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: T.fontSans }}>GBFS</span>
                  {gbfsWins && <Badge color="blue" dot>winner</Badge>}
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, color: T.blue, fontFamily: T.fontMono }}>{gbfsData.latency}<span style={{ fontSize: 13, color: T.muted }}> ms</span></div>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: T.fontSans, marginBottom: 12 }}>Latency</div>
                {[["Throughput", `${gbfsData.throughput} t/s`], ["Energy", `${gbfsData.energy} kWh`], ["Utilization", `${gbfsData.utilization}%`]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${T.borderSub}` }}>
                    <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSans }}>{l}</span>
                    <span style={{ fontSize: 11, fontFamily: T.fontMono, color: T.text }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "0 4px" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.dim, fontFamily: T.fontMono }}>VS</span>
              </div>

              {/* PSO */}
              <div style={{
                flex: "1 1 240px",
                border: `1px solid ${!gbfsWins ? T.purple : T.border}`,
                borderRadius: 8, padding: "18px 20px",
                background: !gbfsWins ? T.purpleBg : T.elevated,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: T.fontSans }}>PSO</span>
                  {!gbfsWins && <Badge color="purple" dot>winner</Badge>}
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, color: T.purple, fontFamily: T.fontMono }}>{psoData.latency}<span style={{ fontSize: 13, color: T.muted }}> ms</span></div>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: T.fontSans, marginBottom: 12 }}>Latency</div>
                {[["Throughput", `${psoData.throughput} t/s`], ["Energy", `${psoData.energy} kWh`], ["Utilization", `${psoData.utilization}%`]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${T.borderSub}` }}>
                    <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSans }}>{l}</span>
                    <span style={{ fontSize: 11, fontFamily: T.fontMono, color: T.text }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div style={{
              background: T.greenBg, border: `1px solid ${T.greenDim}`,
              borderLeft: `3px solid ${T.green}`, borderRadius: 8, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{srv.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: T.fontSans }}>{srv.label}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4, fontFamily: T.fontSans }}>
                  Winner: <strong style={{ color: gbfsWins ? T.blue : T.purple }}>{gbfsWins ? "GBFS" : "PSO"}</strong>
                  {" "}— best latency <strong style={{ color: T.green, fontFamily: T.fontMono }}>{Math.min(+gbfsData.latency, +psoData.latency)} ms</strong>
                </div>
              </div>
              <Badge color="green" dot>recommended</Badge>
            </div>
            <div style={{ marginTop: 12 }}>
              <InfoBox color="green">
                Algorithms complete on <strong>{srv.label}</strong>. Winner: <strong>{gbfsWins ? "GBFS" : "PSO"}</strong> ({Math.min(+gbfsData.latency, +psoData.latency)} ms). Proceed to confirm edge server.
              </InfoBox>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 3: SELECT EDGE SERVER
───────────────────────────────────────────── */
const Step3SelectEdge = ({ machine: m, gbfsData, psoData, algoServer }) => {
  if (!gbfsData || !psoData) return (
    <Card><InfoBox color="amber">Run both algorithms first (Step 3).</InfoBox></Card>
  );

  const gbfsWins   = gbfsData.latency <= psoData.latency;
  const bestAlgo   = gbfsWins ? "GBFS" : "PSO";
  const bestLat    = Math.min(+gbfsData.latency, +psoData.latency);
  const srv        = SERVERS[algoServer];
  const improvement = Math.abs(((gbfsData.latency - psoData.latency) / gbfsData.latency) * 100).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Edge Server Selection</h1>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Determined by comparing GBFS vs PSO on <strong style={{ color: T.text }}>{srv.label}</strong>. Winner: <strong style={{ color: gbfsWins ? T.blue : T.purple }}>{bestAlgo}</strong>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat label="GBFS Latency"  value={`${gbfsData.latency} ms`} color="blue" />
        <Stat label="PSO Latency"   value={`${psoData.latency} ms`}  color="purple" />
        <Stat label="Best Algorithm"value={bestAlgo}                 color="green" />
        <Stat label="Best Latency"  value={`${bestLat} ms`}          color="amber" />
        <Stat label="Improvement"   value={`${improvement}%`}        color="green" />
      </div>

      <Card title="Server Network" sub="Recommended server highlighted" accent={T.green}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(SERVERS).map(([key, s]) => {
            const isActive = key === algoServer;
            return (
              <div key={key} style={{
                flex: "1 1 200px",
                border: `1px solid ${isActive ? s.accent : T.border}`,
                borderRadius: 8, padding: "14px 16px",
                background: isActive ? s.accentBg : T.elevated,
                opacity: isActive ? 1 : 0.45,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? T.text : T.muted, fontFamily: T.fontSans }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{s.sub}</div>
                  </div>
                  {isActive && <Badge color={key === "A" ? "blue" : "green"} dot>recommended</Badge>}
                </div>
                <div style={{ fontSize: 10, fontFamily: T.fontMono, color: isActive ? s.accent : T.dim, wordBreak: "break-all", marginBottom: isActive ? 8 : 0 }}>
                  {s.baseUrl}
                </div>
                {isActive && <div style={{ fontSize: 11, color: T.green, fontFamily: T.fontMono }}>{bestAlgo} wins · {bestLat} ms</div>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Algorithm Comparison" sub={`Metrics from ${srv.label}`} accent={T.purple}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Metric</Th><Th>GBFS</Th><Th>PSO</Th><Th>Better</Th></tr></thead>
          <tbody>
            {[
              ["Latency (ms)",     gbfsData.latency,     psoData.latency,     "lower"],
              ["Speed (tasks/s)",  gbfsData.throughput,  psoData.throughput,  "higher"],
              ["Energy (kWh)",     gbfsData.energy,      psoData.energy,      "lower"],
              ["Utilization (%)",  gbfsData.utilization, psoData.utilization, "lower"],
            ].map(([l, g, p, dir], i) => {
              const gW = dir === "lower" ? +g <= +p : +g >= +p;
              return (
                <TableRow key={l} isOdd={i % 2 === 1} cells={[
                  <span style={{ fontFamily: T.fontSans, color: T.text }}>{l}</span>,
                  <span style={{ fontFamily: T.fontMono, color: gW ? T.blue : T.muted, fontWeight: gW ? 700 : 400 }}>{g}</span>,
                  <span style={{ fontFamily: T.fontMono, color: !gW ? T.purple : T.muted, fontWeight: !gW ? 700 : 400 }}>{p}</span>,
                  <Badge color={gW ? "blue" : "purple"}>{gW ? "GBFS" : "PSO"}</Badge>,
                ]} />
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 4: OFFLOAD
───────────────────────────────────────────── */
const Step4Offload = ({ machine: m, gbfsData, psoData, offloadResult, offloading, offloadError, onOffload, algoServer }) => {
  if (!gbfsData || !psoData) return (
    <Card><InfoBox color="amber">Run both algorithms first.</InfoBox></Card>
  );
  const gbfsWins = gbfsData.latency <= psoData.latency;
  const bestAlgo = gbfsWins ? "GBFS" : "PSO";
  const srv      = SERVERS[algoServer];

  const FlowNode = ({ icon, label, sub, bc, bg }) => (
    <div style={{
      flex: "1 1 100px", maxWidth: 130,
      border: `1px solid ${bc}`, borderRadius: 8, padding: "12px 10px",
      background: bg, textAlign: "center",
    }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.text, fontFamily: T.fontMono }}>{label}</div>
      <div style={{ fontSize: 10, color: T.muted, marginTop: 3, fontFamily: T.fontSans, lineHeight: 1.4 }}>{sub}</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Task Offloading</h1>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Dispatch <strong style={{ color: T.text }}>{m.name}</strong> task to <strong style={{ color: T.text }}>{srv.label}</strong>. Result logged to Supabase.
        </p>
      </div>

      <Card title="Offload Flow" sub="IoT → Network → Edge → Database" accent={T.blue}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", padding: "8px 0" }}>
          <FlowNode icon="⚙" label={m.machineId} sub="IoT Device"        bc={T.blue}   bg={T.blueBg} />
          <div style={{ padding: "0 8px", color: T.dim, fontSize: 11, fontFamily: T.fontMono }}>→</div>
          <FlowNode icon="📡" label="Network"    sub={`${m.bandwidth} Mbps`} bc={T.amber} bg={T.amberBg} />
          <div style={{ padding: "0 8px", color: T.dim, fontSize: 11, fontFamily: T.fontMono }}>→</div>
          <FlowNode icon={srv.icon} label={srv.label} sub="Edge Node"     bc={srv.accent} bg={srv.accentBg} />
          <div style={{ padding: "0 8px", color: T.dim, fontSize: 11, fontFamily: T.fontMono }}>→</div>
          <FlowNode icon="🗄" label="Supabase"   sub="Logs saved"         bc={T.purple} bg={T.purpleBg} />
        </div>
      </Card>

      <Card title={`Send to ${srv.label}`} sub={`POST → ${srv.baseUrl}/offload`} accent={srv.accent}>
        {offloadError && <div style={{ marginBottom: 16 }}><ErrBox>Offload failed — {offloadError}</ErrBox></div>}

        {!offloadResult ? (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <PrimaryBtn onClick={onOffload} disabled={offloading}>
              {offloading ? `Sending to ${srv.label}…` : `Offload Task → ${srv.icon} ${srv.label}`}
            </PrimaryBtn>
            {offloading && (
              <div style={{ fontSize: 11, color: T.muted, fontFamily: T.fontMono, marginTop: 10 }}>
                POST {srv.baseUrl}/offload → Supabase log
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                ["Task Size",       `${m.taskSize} MB`,         "blue"],
                ["Algorithm",       bestAlgo,                   gbfsWins ? "blue" : "purple"],
                ["Target Server",   srv.label,                  "green"],
                ["Bandwidth",       `${m.bandwidth} Mbps`,      "blue"],
                ["Trans. Delay",    `${m.transmissionDelay} ms`,"amber"],
                ["Status",          offloadResult.status === "success" ? "Success" : "Failed", offloadResult.status === "success" ? "green" : "red"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ flex: "1 1 140px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>{l}</div>
                  <Badge color={c}>{v}</Badge>
                </div>
              ))}
            </div>
            <InfoBox color="green">
              Task offloaded to {srv.icon} {srv.label}. Measured latency: <strong style={{ fontFamily: T.fontMono }}>{offloadResult.measuredLatency} ms</strong>. Saved to Supabase.
            </InfoBox>
          </>
        )}
      </Card>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 5: MEASURE LATENCY
───────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", fontFamily: T.fontMono }}>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontSize: 12, color: p.color, marginBottom: 3 }}>
          {p.dataKey}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const Step5Latency = ({ machine: m, gbfsData, psoData, offloadResult, algoServer }) => {
  if (!gbfsData || !psoData) return (
    <Card><InfoBox color="amber">Run both algorithms first.</InfoBox></Card>
  );

  const gbfsWins    = gbfsData.latency <= psoData.latency;
  const winner      = gbfsWins ? "GBFS" : "PSO";
  const improvement = Math.abs(((gbfsData.latency - psoData.latency) / gbfsData.latency) * 100).toFixed(1);
  const srv         = SERVERS[algoServer];
  const gbfsBase    = +gbfsData.latency;
  const psoBase     = +psoData.latency;
  const measuredLat = offloadResult?.measuredLatency;

  const lineData = [1, 2, 3, 4, 5, 6].map(t => ({
    cycle: `T${t}`,
    GBFS: +(gbfsBase + Math.sin(t * 1.1) * gbfsBase * 0.06).toFixed(2),
    PSO:  +(psoBase  + Math.sin(t * 1.3) * psoBase  * 0.06).toFixed(2),
    ...(measuredLat ? { Measured: +(measuredLat + Math.sin(t * 0.9) * measuredLat * 0.03).toFixed(2) } : {}),
  }));

  const barData = [
    { metric: "Latency",     GBFS: +gbfsData.latency,     PSO: +psoData.latency },
    { metric: "Throughput",  GBFS: +gbfsData.throughput,  PSO: +psoData.throughput },
    { metric: "Energy",      GBFS: +gbfsData.energy,      PSO: +psoData.energy },
    { metric: "Utilization", GBFS: +gbfsData.utilization, PSO: +psoData.utilization },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Latency Results</h1>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Task from <strong style={{ color: T.text }}>{m.name}</strong> processed on <strong style={{ color: T.text }}>{srv.icon} {srv.label}</strong>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat label="Winner"        value={winner}                  color={gbfsWins ? "blue" : "purple"} />
        <Stat label="GBFS Latency"  value={`${gbfsBase} ms`}        color="blue" />
        <Stat label="PSO Latency"   value={`${psoBase} ms`}         color="purple" />
        <Stat label="Improvement"   value={`${improvement}%`}       color="amber" />
        {measuredLat && <Stat label="Actual Latency" value={`${measuredLat} ms`} color="green" />}
      </div>

      {/* Winner banner */}
      <div style={{
        background: gbfsWins ? T.blueBg : T.purpleBg,
        border: `1px solid ${gbfsWins ? T.blue : T.purple}`,
        borderLeft: `3px solid ${gbfsWins ? T.blue : T.purple}`,
        borderRadius: 8, padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: gbfsWins ? T.blue : T.purple, fontFamily: T.fontMono, lineHeight: 1 }}>
          {winner}
        </div>
        <div>
          <div style={{ fontSize: 13, color: T.text, fontFamily: T.fontSans }}>
            {winner} achieved <strong style={{ fontFamily: T.fontMono }}>{Math.min(gbfsBase, psoBase)} ms</strong> on <strong>{srv.label}</strong>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3, fontFamily: T.fontSans }}>
            {improvement}% lower latency than {gbfsWins ? "PSO" : "GBFS"}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <Card title="Latency Over Time" sub="6-cycle simulation" accent={T.blue}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="cycle" stroke={T.dim} fontSize={11} fontFamily={T.fontMono} label={{ value: "Cycle", position: "insideBottom", offset: -6, fill: T.muted, fontSize: 10 }} />
            <YAxis stroke={T.dim} fontSize={11} fontFamily={T.fontMono} unit=" ms" domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.fontMono }} verticalAlign="top" />
            <ReferenceLine y={gbfsBase} stroke={T.blue}   strokeDasharray="4 4" strokeOpacity={0.3} />
            <ReferenceLine y={psoBase}  stroke={T.purple} strokeDasharray="4 4" strokeOpacity={0.3} />
            <Line type="monotone" dataKey="GBFS"    stroke={T.blue}   strokeWidth={2} dot={{ r: 4, fill: T.blue,   stroke: T.bg, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="PSO"     stroke={T.purple} strokeWidth={2} dot={{ r: 4, fill: T.purple, stroke: T.bg, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            {measuredLat && <Line type="monotone" dataKey="Measured" stroke={T.green} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4, fill: T.green, stroke: T.bg, strokeWidth: 2 }} activeDot={{ r: 6 }} />}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar chart */}
      <Card title="Full Metrics Comparison" sub={`All indicators from ${srv.label}`} accent={T.purple}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="metric" stroke={T.dim} fontSize={11} fontFamily={T.fontMono} />
            <YAxis stroke={T.dim} fontSize={11} fontFamily={T.fontMono} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.fontMono }} />
            <Bar dataKey="GBFS" fill={T.blue}   radius={[4, 4, 0, 0]}><LabelList dataKey="GBFS" position="top" fill={T.muted} fontSize={10} fontFamily={T.fontMono} /></Bar>
            <Bar dataKey="PSO"  fill={T.purple} radius={[4, 4, 0, 0]}><LabelList dataKey="PSO"  position="top" fill={T.muted} fontSize={10} fontFamily={T.fontMono} /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary table */}
      <Card title="Result Summary" sub={`${m.name} · ${srv.label}`} accent={T.green}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Metric</Th><Th>GBFS</Th><Th>PSO</Th><Th>Better</Th></tr></thead>
          <tbody>
            {[
              ["Latency (ms)",      gbfsData.latency,     psoData.latency,     "lower"],
              ["Speed (tasks/s)",   gbfsData.throughput,  psoData.throughput,  "higher"],
              ["Energy (kWh)",      gbfsData.energy,      psoData.energy,      "lower"],
              ["Utilization (%)",   gbfsData.utilization, psoData.utilization, "lower"],
              ["Response Time (ms)",gbfsData.time,        psoData.time,        "lower"],
            ].map(([l, g, p, dir], i) => {
              const gW = dir === "lower" ? +g <= +p : +g >= +p;
              return (
                <TableRow key={l} isOdd={i % 2 === 1} cells={[
                  <span style={{ fontFamily: T.fontSans, color: T.text }}>{l}</span>,
                  <span style={{ fontFamily: T.fontMono, color: gW ? T.blue : T.muted, fontWeight: gW ? 700 : 400 }}>{g}</span>,
                  <span style={{ fontFamily: T.fontMono, color: !gW ? T.purple : T.muted, fontWeight: !gW ? 700 : 400 }}>{p}</span>,
                  <Badge color={gW ? "blue" : "purple"}>{gW ? "GBFS" : "PSO"}</Badge>,
                ]} />
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 16 }}>
          <InfoBox color="green">
            <strong>{m.name}</strong> offloaded to {srv.icon} {srv.label} using <strong>{winner}</strong>.
            {measuredLat && <> Actual latency: <strong style={{ fontFamily: T.fontMono }}>{measuredLat} ms</strong>.</>} Saved to Supabase.
          </InfoBox>
        </div>
      </Card>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ERROR BOUNDARY
───────────────────────────────────────────── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 32, color: T.red, fontFamily: T.fontMono }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Runtime Error</div>
        <pre style={{ fontSize: 11, color: T.muted }}>{this.state.error?.toString()}</pre>
      </div>
    );
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [step,           setStep]           = useState(0);
  const [maxReached,     setMaxReached]     = useState(0);
  const [selectedId,     setSelectedId]     = useState(null);
  const [serverStatuses, setServerStatuses] = useState({ A: "checking", B: "checking" });
  const [machineData,    setMachineData]    = useState({});
  const [machinesLoading,setMachinesLoading]= useState(true);
  const [machinesError,  setMachinesError]  = useState(null);
  const [gbfsData,       setGbfsData]       = useState(null);
  const [psoData,        setPsoData]        = useState(null);
  const [algoRunning,    setAlgoRunning]    = useState(false);
  const [algoError,      setAlgoError]      = useState(null);
  const [offloadResult,  setOffloadResult]  = useState(null);
  const [offloading,     setOffloading]     = useState(false);
  const [offloadError,   setOffloadError]   = useState(null);
  const [algoServer,     setAlgoServer]     = useState("A");
  const [gbfsProgress,   setGbfsProgress]   = useState("");
  const [psoProgress,    setPsoProgress]    = useState("");

  const machine = selectedId ? machineData[selectedId] : null;

  const pingServers = useCallback(async () => {
    const results = await Promise.allSettled(
      Object.entries(SERVERS).map(async ([key, srv]) => {
        try { await apiFetch(srv.baseUrl, "/health"); return [key, "online"]; }
        catch { return [key, "offline"]; }
      })
    );
    const next = {};
    results.forEach(r => { if (r.status === "fulfilled") { const [k, s] = r.value; next[k] = s; } });
    setServerStatuses(prev => ({ ...prev, ...next }));
  }, []);

  const loadMachines = useCallback(async () => {
    setMachinesLoading(true); setMachinesError(null);
    try {
      const data = await apiFetch(PRIMARY_BASE, "/machines");
      setMachineData(data);
      const firstId = Object.keys(data)[0];
      if (firstId) setSelectedId(firstId);
      setServerStatuses(prev => ({ ...prev, A: "online" }));
    } catch (err) {
      setMachinesError(err.message);
      setServerStatuses(prev => ({ ...prev, A: "offline" }));
    } finally { setMachinesLoading(false); }
  }, []);

  useEffect(() => { loadMachines(); pingServers(); }, [loadMachines, pingServers]);

  const runBothAlgorithms = async () => {
    const srv = SERVERS[algoServer];
    setAlgoRunning(true); setAlgoError(null);
    setGbfsData(null); setPsoData(null);
    setGbfsProgress(""); setPsoProgress("");
    try {
      setGbfsProgress("Running…");
      const gbfsResult = await apiFetch(srv.baseUrl, "/gbfs", { method: "POST", body: JSON.stringify({ machine }) });
      setGbfsData({ ...gbfsResult, ranOnServer: algoServer });
      setGbfsProgress("Done ✓");
      setPsoProgress("Running…");
      const psoResult = await apiFetch(srv.baseUrl, "/pso", { method: "POST", body: JSON.stringify({ machine }) });
      setPsoData({ ...psoResult, ranOnServer: algoServer });
      setPsoProgress("Done ✓");
      setMaxReached(r => Math.max(r, 5));
    } catch (err) {
      setAlgoError(err.message);
    } finally { setAlgoRunning(false); }
  };

  const offloadTask = async () => {
    const gbfsWins = gbfsData.latency <= psoData.latency;
    const bestAlgo = gbfsWins ? "GBFS" : "PSO";
    const winSrv   = SERVERS[algoServer];
    setOffloading(true); setOffloadError(null);
    try {
      const result = await apiFetch(winSrv.baseUrl, "/offload", {
        method: "POST",
        body: JSON.stringify({
          machineId: machine.machineId, taskSize: machine.taskSize,
          algorithm: bestAlgo, targetServer: winSrv.label,
          gbfsLatency: gbfsData.latency, psoLatency: psoData.latency,
        }),
      });
      setOffloadResult(result);
      setServerStatuses(prev => ({ ...prev, [algoServer]: "online" }));
    } catch (err) { setOffloadError(err.message); }
    finally { setOffloading(false); }
  };

  const handleSelectMachine = id => {
    setSelectedId(id); setGbfsData(null); setPsoData(null);
    setOffloadResult(null); setMaxReached(0);
    setGbfsProgress(""); setPsoProgress("");
  };

  const canNext = () => {
    if (step === 0) return !!selectedId;
    if (step === 2) return !!gbfsData && !!psoData;
    if (step === 3) return !!gbfsData && !!psoData;
    if (step === 4) return !!offloadResult;
    return true;
  };

  const goNext = () => { const n = step + 1; setStep(n); setMaxReached(r => Math.max(r, n)); };

  const renderStep = () => {
    switch (step) {
      case 0: return <Step0Machine machineData={machineData} loading={machinesLoading} error={machinesError} selectedId={selectedId} setSelectedId={handleSelectMachine} onRetry={loadMachines} />;
      case 1: return machine ? <Step1CollectData machine={machine} /> : null;
      case 2: return machine ? <Step2Algorithms machine={machine} gbfsData={gbfsData} psoData={psoData} algoRunning={algoRunning} algoError={algoError} selectedServer={algoServer} setSelectedServer={k => { setAlgoServer(k); setGbfsData(null); setPsoData(null); }} onRunBoth={runBothAlgorithms} gbfsProgress={gbfsProgress} psoProgress={psoProgress} /> : null;
      case 3: return machine ? <Step3SelectEdge machine={machine} gbfsData={gbfsData} psoData={psoData} algoServer={algoServer} /> : null;
      case 4: return machine ? <Step4Offload machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} offloading={offloading} offloadError={offloadError} onOffload={offloadTask} algoServer={algoServer} /> : null;
      case 5: return machine ? <Step5Latency machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} algoServer={algoServer} /> : null;
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${T.bg}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.dim}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.text }}>
        <Sidebar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} serverStatuses={serverStatuses} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} activeServerKey={algoServer} />
          <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
            {renderStep()}
          </div>
          {/* Bottom navigation */}
          <div style={{
            background: T.surface, borderTop: `1px solid ${T.border}`,
            padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}>
            <GhostBtn disabled={step === 0} onClick={() => setStep(p => p - 1)}>← Back</GhostBtn>
            <span style={{ fontSize: 11, color: T.dim, fontFamily: T.fontMono }}>
              {STEPS[step].title}
            </span>
            <PrimaryBtn disabled={!canNext() || step >= 5} onClick={goNext}>
              {step >= 5 ? "Complete" : "Next →"}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
