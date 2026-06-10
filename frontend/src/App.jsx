import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
  LineChart, Line, ReferenceLine
} from "recharts";

/* ─────────────────────────────────────────────
   DESIGN TOKENS  (Dark & Light)
───────────────────────────────────────────── */
const makeTheme = (dark) => dark ? {
  bg:        "#0f1117",
  surface:   "#1a1d27",
  elevated:  "#22263a",
  border:    "#2e3347",
  borderSub: "#1e2235",
  text:      "#e8eaf0",
  muted:     "#8b90a7",
  dim:       "#4a5070",
  blue:      "#60a5fa",
  blueDim:   "#1d3a6e",
  blueBg:    "#0d1f3c",
  green:     "#34d399",
  greenDim:  "#064e3b",
  greenBg:   "#022c22",
  purple:    "#a78bfa",
  purpleDim: "#3b1fa8",
  purpleBg:  "#1e0a4a",
  amber:     "#fbbf24",
  amberBg:   "#292100",
  red:       "#f87171",
  redBg:     "#2d0a0a",
  fontMono:  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSans:  "'Inter', system-ui, -apple-system, sans-serif",
} : {
  // ── LIGHT MODE — high-contrast, fully readable ──────────────
  bg:        "#eef0f5",
  surface:   "#ffffff",
  elevated:  "#f4f6fb",
  border:    "#c8cdd8",
  borderSub: "#dde0ea",
  text:      "#111827",
  muted:     "#4b5563",
  dim:       "#9ca3af",
  blue:      "#1d4ed8",
  blueDim:   "#bfdbfe",
  blueBg:    "#dbeafe",
  green:     "#065f46",
  greenDim:  "#6ee7b7",
  greenBg:   "#d1fae5",
  purple:    "#5b21b6",
  purpleDim: "#c4b5fd",
  purpleBg:  "#ede9fe",
  amber:     "#92400e",
  amberBg:   "#fef3c7",
  red:       "#991b1b",
  redBg:     "#fee2e2",
  fontMono:  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSans:  "'Inter', system-ui, -apple-system, sans-serif",
};

const ThemeCtx = React.createContext(makeTheme(true));
const useT = () => React.useContext(ThemeCtx);

/* ─────────────────────────────────────────────
   SERVER CONFIG
───────────────────────────────────────────── */
const SERVERS = {
  A: {
    label:   "Edge Server A",
    sub:     "Latency-Sensitive · Compute-Heavy",
    icon:    "⚡",
    tag:     "A",
    baseUrl: "https://system-ctld.onrender.com/api",
  },
  B: {
    label:   "Edge Server B",
    sub:     "Energy-Efficient",
    icon:    "🌿",
    tag:     "B",
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
  { title: "IoT Machine",        short: "Machine",    icon: "⚙" },
  { title: "Collect Data",       short: "Collect",    icon: "📊" },
  { title: "Run Algorithms",     short: "Algorithms", icon: "⟳" },
  { title: "Select Edge Server", short: "Edge Server",icon: "🖥" },
  { title: "Offload Task",       short: "Offload",    icon: "📤" },
  { title: "Measure Latency",    short: "Latency",    icon: "📈" },
];

/* ─────────────────────────────────────────────
   PLASMA CUTTER IMAGE (user-supplied)
───────────────────────────────────────────── */
const PLASMA_IMG = "data:image/png;base64,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";

/* ─────────────────────────────────────────────
   SHARED PRIMITIVES  (all use useT())
───────────────────────────────────────────── */
const Badge = ({ color = "blue", children, dot }) => {
  const T = useT();
  const map = {
    blue:   { bg: T.blueBg,   border: T.blueDim,   text: T.blue   },
    green:  { bg: T.greenBg,  border: T.greenDim,  text: T.green  },
    purple: { bg: T.purpleBg, border: T.purpleDim, text: T.purple },
    amber:  { bg: T.amberBg,  border: T.amber,     text: T.amber  },
    red:    { bg: T.redBg,    border: T.red,        text: T.red    },
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

const Stat = ({ label, value, color = "blue", mono = true }) => {
  const T = useT();
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

const Card = ({ title, sub, children, accent }) => {
  const T = useT();
  return (
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
};

const InfoBox = ({ color = "blue", children }) => {
  const T = useT();
  const map = {
    blue:   { bg: T.blueBg,   border: T.blueDim,  text: T.blue   },
    green:  { bg: T.greenBg,  border: T.greenDim, text: T.green  },
    amber:  { bg: T.amberBg,  border: T.amber,    text: T.amber  },
    red:    { bg: T.redBg,    border: T.red,       text: T.red    },
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

const ErrBox = ({ children }) => <InfoBox color="red">{children}</InfoBox>;

const TableRow = ({ cells, isOdd }) => {
  const T = useT();
  return (
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
};

const Th = ({ children }) => {
  const T = useT();
  return (
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
};

const PrimaryBtn = ({ onClick, disabled, children }) => {
  const T = useT();
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? T.elevated : T.green,
      color: disabled ? T.dim : T.bg === "#eef0f5" ? "#ffffff" : "#0d1117",
      border: disabled ? `1px solid ${T.border}` : "none",
      borderRadius: 6, padding: "10px 24px",
      fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.fontSans, transition: "all 0.15s", letterSpacing: "0.01em",
    }}>
      {children}
    </button>
  );
};

const GhostBtn = ({ onClick, disabled, children }) => {
  const T = useT();
  return (
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
};

const DualBtn = ({ onClick, disabled, children }) => {
  const T = useT();
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? T.elevated : "linear-gradient(135deg, #2563eb, #7c3aed)",
      color: disabled ? T.dim : "#ffffff",
      border: disabled ? `1px solid ${T.border}` : "none",
      borderRadius: 6, padding: "12px 32px",
      fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.fontSans, letterSpacing: "0.01em",
    }}>
      {children}
    </button>
  );
};

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
const Sidebar = ({ step, maxReached, onJump, serverStatuses }) => {
  const T = useT();
  return (
    <div style={{
      width: 220, background: T.bg, display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      flexShrink: 0, borderRight: `1px solid ${T.border}`,
    }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "linear-gradient(135deg, #2563eb, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, flexShrink: 0,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: "-0.01em", fontFamily: T.fontSans, lineHeight: 1.3 }}>Task Offloading<br/>Simulation System</div>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: T.fontMono, marginTop: 2 }}>IoT · v5.0</div>
          </div>
        </div>
      </div>

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
              <div style={{
                width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? 10 : 11, fontWeight: 700, fontFamily: T.fontMono,
                background: active ? T.green : done ? T.greenDim : T.elevated,
                color: active ? (T.bg === "#eef0f5" ? "#fff" : "#0d1117") : done ? T.green : T.dim,
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
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: online ? T.green : st === "checking" ? T.amber : T.red,
              }} />
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
};

/* ─────────────────────────────────────────────
   TOP BAR
───────────────────────────────────────────── */
const TopBar = ({ step, maxReached, onJump, activeServerKey, dark, setDark }) => {
  const T = useT();
  const srv = activeServerKey ? SERVERS[activeServerKey] : null;
  const srvAccent = activeServerKey === "A" ? T.blue : T.green;
  const srvAccentBg = activeServerKey === "A" ? T.blueBg : T.greenBg;
  const srvAccentDim = activeServerKey === "A" ? T.blueDim : T.greenDim;
  return (
    <div style={{
      background: T.surface, borderBottom: `1px solid ${T.border}`,
      padding: "0 24px", minHeight: 52, display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, color: T.muted, fontFamily: T.fontSans }}>Simulation</span>
      <span style={{ color: T.border, fontSize: 12 }}>›</span>
      <span style={{ fontSize: 12, color: T.text, fontWeight: 600, fontFamily: T.fontSans }}>{STEPS[step].title}</span>

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

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {srv && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 11,
            fontFamily: T.fontMono,
            color: srvAccent, background: srvAccentBg,
            border: `1px solid ${srvAccentDim}`,
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
        <button
          onClick={() => setDark(d => !d)}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: T.elevated, border: `1px solid ${T.border}`,
            borderRadius: 20, padding: "5px 12px 5px 8px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 13, lineHeight: 1 }}>{dark ? "🌙" : "☀️"}</span>
          <div style={{
            position: "relative", width: 34, height: 19, borderRadius: 10,
            background: dark ? T.green : T.blue,
            transition: "background 0.25s", flexShrink: 0, opacity: 0.85,
          }}>
            <div style={{
              position: "absolute", top: 3, left: dark ? 16 : 3,
              width: 13, height: 13, borderRadius: "50%",
              background: "#ffffff",
              transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
            }} />
          </div>
          <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontMono, userSelect: "none", minWidth: 28 }}>
            {dark ? "Dark" : "Light"}
          </span>
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 0: SELECT MACHINE
───────────────────────────────────────────── */
const Step0Machine = ({ machineData, loading, error, selectedId, setSelectedId, onRetry }) => {
  const T = useT();
  const isDark = T.bg !== "#eef0f5";
  const imgFilter = isDark ? "grayscale(100%) brightness(0.75)" : "none";
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

  const getMachineImg = (mc) => {
    const name = (mc.name || mc.machineId || "").toLowerCase();
    if (name.includes("plasma")) return PLASMA_IMG;
    const categoryMap = {
      "Cutting Machines":   "https://images.unsplash.com/photo-1565776630587-2e4f9e3eb5c9?w=400&h=260&fit=crop&auto=format&q=80",
      "Welding Machines":   "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=260&fit=crop&auto=format&q=80",
      "Finishing Machines": "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=400&h=260&fit=crop&auto=format&q=80",
    };
    return categoryMap[mc.category] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=260&fit=crop&auto=format&q=80";
  };

  const cats = [
    { label: "Total Devices", value: machines.length, color: "green" },
    { label: "Cutting",       value: machines.filter(x => x.category === "Cutting Machines").length,   color: "blue" },
    { label: "Finishing",     value: machines.filter(x => x.category === "Finishing Machines").length, color: "purple" },
    { label: "Welding",       value: machines.filter(x => x.category === "Welding Machines").length,   color: "amber" },
  ];

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
            return (
              <div key={mc.id} onClick={() => setSelectedId(mc.id)} style={{
                flex: "1 1 160px", maxWidth: 200,
                border: `2px solid ${sel ? T.green : T.border}`,
                borderRadius: 10, overflow: "hidden", cursor: "pointer",
                background: sel ? T.greenBg : T.elevated,
                transition: "all 0.15s",
              }}>
                <div style={{ position: "relative", width: "100%", height: 110, overflow: "hidden", background: T.bg }}>
                  <img
                    src={getMachineImg(mc)}
                    alt={mc.name}
                    onError={e => { e.target.style.display = "none"; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: imgFilter }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                  {sel && (
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <Badge color="green" dot>selected</Badge>
                    </div>
                  )}
                </div>
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
          <div style={{ width: "100%", height: 180, borderRadius: 8, overflow: "hidden", marginBottom: 16, position: "relative", background: T.bg }}>
            <img
              src={getMachineImg(m)}
              alt={m.name}
              onError={e => { e.target.style.display = "none"; }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
            <div style={{ position: "absolute", bottom: 14, left: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: T.fontSans, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{m.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: T.fontMono, marginTop: 3 }}>{m.category}</div>
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
const Step1CollectData = ({ machine: m }) => {
  const T = useT();
  return (
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
          <thead><tr><Th>Parameter</Th><Th>Value</Th><Th>Description</Th></tr></thead>
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
      <InfoBox color="green">All parameters loaded. Proceed to run GBFS (Greedy Best-First Search) + PSO (Particle Swarm Optimization).</InfoBox>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 2: RUN ALGORITHMS
───────────────────────────────────────────── */
const Step2Algorithms = ({
  machine: m, gbfsData, psoData, algoRunning, algoError,
  selectedServer, setSelectedServer, onRunBoth,
  gbfsProgress, psoProgress,
}) => {
  const T = useT();
  const srv = SERVERS[selectedServer];
  const srvAccent = selectedServer === "A" ? T.blue : T.green;
  const srvAccentBg = selectedServer === "A" ? T.blueBg : T.greenBg;
  const bothDone = !!gbfsData && !!psoData;
  const resultsRef = React.useRef(null);

  // Auto-scroll to results when both algorithms complete
  React.useEffect(() => {
    if (bothDone && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [bothDone]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Algorithm Execution</h1>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Run <strong style={{ color: T.text }}>GBFS</strong> (Greedy Best-First Search) and <strong style={{ color: T.text }}>PSO</strong> (Particle Swarm Optimization) sequentially on the selected backend to find the optimal edge server.
        </p>
      </div>

      <Card title="Backend Selection" sub="Both algorithms POST to this server" accent={T.blue}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(SERVERS).map(([key, s]) => {
            const active = key === selectedServer;
            const kAccent = key === "A" ? T.blue : T.green;
            const kAccentBg = key === "A" ? T.blueBg : T.greenBg;
            const kAccentDim = key === "A" ? T.blueDim : T.greenDim;
            return (
              <div key={key} onClick={() => !algoRunning && setSelectedServer(key)} style={{
                flex: "1 1 200px",
                border: `2px solid ${active ? kAccent : T.border}`,
                borderRadius: 8, padding: "14px 16px",
                background: active ? kAccentBg : T.elevated,
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
                <div style={{ fontSize: 10, fontFamily: T.fontMono, color: active ? kAccent : T.dim, wordBreak: "break-all" }}>
                  {s.baseUrl}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Execution Pipeline" sub={`Target: ${srv.label}`} accent={T.purple}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, paddingBottom: 16, justifyContent: "center" }}>
          {[
            { icon: "⚙", label: m.machineId, sub: "IoT Source", done: true, running: false },
            { icon: "⚙", label: "GBFS",    sub: "Greedy Best-First", done: !!gbfsData, running: algoRunning && !gbfsData },
            { icon: "◈", label: "PSO",     sub: "Particle Swarm",  done: !!psoData,  running: algoRunning && !!gbfsData && !psoData },
            { icon: "≋", label: "Compare", sub: "Pick best", done: bothDone, running: false },
          ].map((node, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <div style={{ display: "flex", alignItems: "center", padding: "0 6px", flexShrink: 0 }}>
                <div style={{ width: 20, height: 1, background: T.border }} />
                <span style={{ color: T.muted, fontSize: 10 }}>▶</span>
              </div>}
              <div style={{
                flex: "0 0 auto", width: 100,
                border: `1px solid ${node.done ? T.green : node.running ? T.blue : T.border}`,
                borderRadius: 8, padding: "12px 10px", textAlign: "center",
                background: node.done ? T.greenBg : node.running ? T.blueBg : T.elevated,
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{node.running ? "⟳" : node.done ? "✓" : node.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: node.done ? T.green : node.running ? T.blue : T.text, fontFamily: T.fontMono }}>{node.label}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 3, fontFamily: T.fontSans }}>{node.running ? "running…" : node.sub}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {(gbfsProgress || psoProgress) && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {[["GBFS", "Greedy Best-First Search", T.blue, gbfsData], ["PSO", "Particle Swarm Optimization", T.purple, psoData]].map(([name, fullName, color, done]) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.muted, fontFamily: T.fontMono, marginBottom: 4 }}>
                  <span style={{ color }}><strong>{name}</strong> <span style={{ color: T.dim, fontWeight: 400 }}>— {fullName}</span></span>
                  <span>{done ? "done ✓" : algoRunning ? "running…" : ""}</span>
                </div>
                <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: color, borderRadius: 2, width: done ? "100%" : algoRunning ? "55%" : "0%", transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {algoError && <div style={{ marginBottom: 16 }}><ErrBox>Run failed — {algoError}</ErrBox></div>}

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
          <DualBtn disabled={algoRunning || bothDone} onClick={onRunBoth}>
            {algoRunning ? `Running on ${srv.icon} ${srv.label}…` : bothDone ? "✓ Algorithms Complete" : `Run GBFS + PSO on ${srv.icon} ${srv.label}`}
          </DualBtn>
          {bothDone && !algoRunning && <GhostBtn onClick={onRunBoth}>↺ Re-run</GhostBtn>}
        </div>
      </Card>

      {bothDone && (() => {
        const gbfsWins = gbfsData.latency <= psoData.latency;
        return (
          <div ref={resultsRef}>
            {/* Algorithm legend */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { abbr: "GBFS", full: "Greedy Best-First Search", color: T.blue, bg: T.blueBg, border: T.blueDim, desc: "Selects the locally optimal path at each step using a heuristic. Fast execution, deterministic output." },
                { abbr: "PSO",  full: "Particle Swarm Optimization", color: T.purple, bg: T.purpleBg, border: T.purpleDim, desc: "Bio-inspired swarm algorithm that iteratively refines candidate solutions. Finds global optima more reliably." },
              ].map(({ abbr, full, color, bg, border, desc }) => (
                <div key={abbr} style={{ flex: "1 1 240px", background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 48, textAlign: "center", background: color, borderRadius: 6, padding: "6px 4px" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: T.fontMono, lineHeight: 1 }}>{abbr}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: color, fontFamily: T.fontSans, marginBottom: 3 }}>{full}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSans, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { algo: "GBFS", full: "Greedy Best-First Search", color: T.blue, bg: gbfsWins ? T.blueBg : T.elevated, border: gbfsWins ? T.blue : T.border, data: gbfsData, wins: gbfsWins, badgeColor: "blue" },
                { algo: "PSO",  full: "Particle Swarm Optimization", color: T.purple, bg: !gbfsWins ? T.purpleBg : T.elevated, border: !gbfsWins ? T.purple : T.border, data: psoData, wins: !gbfsWins, badgeColor: "purple" },
              ].map(({ algo, full, color, bg, border, data, wins, badgeColor }) => (
                <div key={algo} style={{ flex: "1 1 240px", border: `1px solid ${border}`, borderRadius: 8, padding: "18px 20px", background: bg }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: T.fontSans }}>{algo}</span>
                    {wins && <Badge color={badgeColor} dot>winner</Badge>}
                  </div>
                  <div style={{ fontSize: 10, color: T.muted, fontFamily: T.fontSans, marginBottom: 12 }}>{full}</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color, fontFamily: T.fontMono }}>{data.latency}<span style={{ fontSize: 13, color: T.muted }}> ms</span></div>
                  <div style={{ fontSize: 10, color: T.muted, fontFamily: T.fontSans, marginBottom: 12 }}>Latency</div>
                  {[["Throughput", `${data.throughput} t/s`], ["Energy", `${data.energy} kWh`], ["Utilization", `${data.utilization}%`]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${T.borderSub}` }}>
                      <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSans }}>{l}</span>
                      <span style={{ fontSize: 11, fontFamily: T.fontMono, color: T.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ background: T.greenBg, border: `1px solid ${T.greenDim}`, borderLeft: `3px solid ${T.green}`, borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
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
  const T = useT();
  if (!gbfsData || !psoData) return <Card><InfoBox color="amber">Run both algorithms first (Step 3).</InfoBox></Card>;

  const gbfsWins   = gbfsData.latency <= psoData.latency;
  const bestAlgo   = gbfsWins ? "GBFS" : "PSO";
  const bestLat    = Math.min(+gbfsData.latency, +psoData.latency);
  const srv        = SERVERS[algoServer];
  const improvement = Math.abs(((gbfsData.latency - psoData.latency) / gbfsData.latency) * 100).toFixed(1);
  const srvAccent = algoServer === "A" ? T.blue : T.green;
  const srvAccentBg = algoServer === "A" ? T.blueBg : T.greenBg;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Edge Server Selection</h1>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Winner: <strong style={{ color: gbfsWins ? T.blue : T.purple }}>{bestAlgo}</strong> on <strong style={{ color: T.text }}>{srv.label}</strong>.
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat label="GBFS Latency"   value={`${gbfsData.latency} ms`} color="blue" />
        <Stat label="PSO Latency"    value={`${psoData.latency} ms`}  color="purple" />
        <Stat label="Best Algorithm" value={bestAlgo}                 color="green" />
        <Stat label="Best Latency"   value={`${bestLat} ms`}          color="amber" />
        <Stat label="Improvement"    value={`${improvement}%`}        color="green" />
      </div>
      <Card title="Server Network" sub="Recommended server highlighted" accent={T.green}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(SERVERS).map(([key, s]) => {
            const isActive = key === algoServer;
            const kAccent = key === "A" ? T.blue : T.green;
            const kAccentBg = key === "A" ? T.blueBg : T.greenBg;
            return (
              <div key={key} style={{
                flex: "1 1 200px",
                border: `1px solid ${isActive ? kAccent : T.border}`,
                borderRadius: 8, padding: "14px 16px",
                background: isActive ? kAccentBg : T.elevated,
                opacity: isActive ? 1 : 0.5,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? T.text : T.muted, fontFamily: T.fontSans }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{s.sub}</div>
                  </div>
                  {isActive && <Badge color={key === "A" ? "blue" : "green"} dot>recommended</Badge>}
                </div>
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
  const T = useT();
  if (!gbfsData || !psoData) return <Card><InfoBox color="amber">Run both algorithms first.</InfoBox></Card>;
  const gbfsWins = gbfsData.latency <= psoData.latency;
  const bestAlgo = gbfsWins ? "GBFS" : "PSO";
  const srv      = SERVERS[algoServer];
  const srvAccent = algoServer === "A" ? T.blue : T.green;
  const srvAccentBg = algoServer === "A" ? T.blueBg : T.greenBg;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Task Offloading</h1>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Dispatch <strong style={{ color: T.text }}>{m.name}</strong> task to <strong style={{ color: T.text }}>{srv.label}</strong>.
        </p>
      </div>
      <Card title="Offload Flow" sub="IoT → Network → Edge → Database" accent={T.blue}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", padding: "8px 0" }}>
          {[
            { icon: "⚙",       label: m.machineId, sub: "IoT Device",          bc: T.blue,   bg: T.blueBg },
            { icon: "📡",      label: "Network",    sub: `${m.bandwidth} Mbps`, bc: T.amber,  bg: T.amberBg },
            { icon: srv.icon,   label: srv.label,    sub: "Edge Node",           bc: srvAccent, bg: srvAccentBg },
            { icon: "🗄",      label: "Supabase",   sub: "Logs saved",          bc: T.purple, bg: T.purpleBg },
          ].map((node, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span style={{ padding: "0 8px", color: T.dim, fontSize: 11, fontFamily: T.fontMono }}>→</span>}
              <div style={{ flex: "1 1 100px", maxWidth: 130, border: `1px solid ${node.bc}`, borderRadius: 8, padding: "12px 10px", background: node.bg, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{node.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text, fontFamily: T.fontMono }}>{node.label}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 3, fontFamily: T.fontSans, lineHeight: 1.4 }}>{node.sub}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </Card>
      <Card title={`Send to ${srv.label}`} sub={`POST → ${srv.baseUrl}/offload`} accent={srvAccent}>
        {offloadError && <div style={{ marginBottom: 16 }}><ErrBox>Offload failed — {offloadError}</ErrBox></div>}
        {!offloadResult ? (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <PrimaryBtn onClick={onOffload} disabled={offloading}>
              {offloading ? `Sending to ${srv.label}…` : `Offload Task → ${srv.icon} ${srv.label}`}
            </PrimaryBtn>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                ["Task Size",    `${m.taskSize} MB`,    "blue"],
                ["Algorithm",    bestAlgo,              gbfsWins ? "blue" : "purple"],
                ["Target",       srv.label,             "green"],
                ["Status",       offloadResult.status === "success" ? "Success" : "Failed", offloadResult.status === "success" ? "green" : "red"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ flex: "1 1 140px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>{l}</div>
                  <Badge color={c}>{v}</Badge>
                </div>
              ))}
            </div>
            <InfoBox color="green">
              Task offloaded. Measured latency: <strong style={{ fontFamily: T.fontMono }}>{offloadResult.measuredLatency} ms</strong>. Saved to Supabase.
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
  const T = useT();
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
  const T = useT();
  if (!gbfsData || !psoData) return <Card><InfoBox color="amber">Run both algorithms first.</InfoBox></Card>;

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
        <Stat label="Winner"       value={winner}           color={gbfsWins ? "blue" : "purple"} />
        <Stat label="GBFS Latency" value={`${gbfsBase} ms`} color="blue" />
        <Stat label="PSO Latency"  value={`${psoBase} ms`}  color="purple" />
        <Stat label="Improvement"  value={`${improvement}%`}color="amber" />
        {measuredLat && <Stat label="Actual Latency" value={`${measuredLat} ms`} color="green" />}
      </div>
      <div style={{
        background: T.elevated, border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${gbfsWins ? T.blue : T.purple}`,
        borderRadius: 8, padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: gbfsWins ? T.blue : T.purple, fontFamily: T.fontMono, lineHeight: 1 }}>{winner}</div>
        <div>
          <div style={{ fontSize: 13, color: T.text, fontFamily: T.fontSans }}>
            {winner} achieved <strong style={{ fontFamily: T.fontMono }}>{Math.min(gbfsBase, psoBase)} ms</strong> on <strong>{srv.label}</strong>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 3, fontFamily: T.fontSans }}>
            {improvement}% lower latency than {gbfsWins ? "PSO" : "GBFS"}
          </div>
        </div>
      </div>
      <Card title="Latency Over Time" sub="6-cycle simulation" accent={T.blue}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="cycle" stroke={T.dim} fontSize={11} fontFamily={T.fontMono} label={{ value: "Cycle", position: "insideBottom", offset: -6, fill: T.muted, fontSize: 10 }} />
            <YAxis stroke={T.dim} fontSize={11} fontFamily={T.fontMono} unit=" ms" domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.fontMono }} verticalAlign="top" />
            <Line type="monotone" dataKey="GBFS"    stroke={T.blue}   strokeWidth={2.5} dot={{ r: 4, fill: T.blue,   stroke: T.surface, strokeWidth: 2 }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="PSO"     stroke={T.purple} strokeWidth={2.5} dot={{ r: 4, fill: T.purple, stroke: T.surface, strokeWidth: 2 }} activeDot={{ r: 7 }} />
            {measuredLat && <Line type="monotone" dataKey="Measured" stroke={T.green} strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4, fill: T.green, stroke: T.surface, strokeWidth: 2 }} activeDot={{ r: 7 }} />}
          </LineChart>
        </ResponsiveContainer>
      </Card>
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
      <div style={{ padding: 32, fontFamily: "monospace" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#dc2626" }}>Runtime Error</div>
        <pre style={{ fontSize: 11, color: "#6b7280" }}>{this.state.error?.toString()}</pre>
      </div>
    );
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [dark,           setDark]           = useState(true);
  const T = makeTheme(dark);
  const scrollAreaRef = React.useRef(null);

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
      case 2: return machine ? <Step2Algorithms machine={machine} gbfsData={gbfsData} psoData={psoData} algoRunning={algoRunning} algoError={algoError} selectedServer={algoServer} setSelectedServer={k => { setAlgoServer(k); setGbfsData(null); setPsoData(null); }} onRunBoth={runBothAlgorithms} gbfsProgress={gbfsProgress} psoProgress={psoProgress} scrollAreaRef={scrollAreaRef} /> : null;
      case 3: return machine ? <Step3SelectEdge machine={machine} gbfsData={gbfsData} psoData={psoData} algoServer={algoServer} /> : null;
      case 4: return machine ? <Step4Offload machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} offloading={offloading} offloadError={offloadError} onOffload={offloadTask} algoServer={algoServer} /> : null;
      case 5: return machine ? <Step5Latency machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} algoServer={algoServer} /> : null;
      default: return null;
    }
  };

  return (
    <ThemeCtx.Provider value={T}>
      <ErrorBoundary>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background: ${T.bg}; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: ${T.bg}; }
          ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.text }}>
          <Sidebar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} serverStatuses={serverStatuses} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <TopBar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} activeServerKey={algoServer} dark={dark} setDark={setDark} />
            <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", background: T.bg }}>
              {renderStep()}
            </div>
            <div style={{
              background: T.surface, borderTop: `1px solid ${T.border}`,
              padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0,
            }}>
              <GhostBtn disabled={step === 0} onClick={() => setStep(p => p - 1)}>← Back</GhostBtn>
              <span style={{ fontSize: 11, color: T.dim, fontFamily: T.fontMono }}>{STEPS[step].title}</span>
              <PrimaryBtn disabled={!canNext() || step >= 5} onClick={goNext}>
                {step >= 5 ? "Complete" : "Next →"}
              </PrimaryBtn>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </ThemeCtx.Provider>
  );
}
