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
   Only two servers: A (Edge) and B (Cloud Server B).
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
    label:   "Cloud Server B",
    sub:     "Energy-Efficient · Cloud-Hosted",
    icon:    "☁️",
    tag:     "B",
    baseUrl: "https://system-1-rcpl.onrender.com/api",
  },
};

// All algorithm requests go to this neutral gateway
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

// Resolve which SERVERS entry to display for a given recommendation key.
const resolveServer = (key) => SERVERS[key] ?? SERVERS.A;

const STEPS = [
  { title: "IoT Machine",        short: "Machine",    icon: "⚙" },
  { title: "Collect Data",       short: "Collect",    icon: "📊" },
  { title: "Run Algorithms",     short: "Algorithms", icon: "⟳" },
  { title: "Select Edge Server", short: "Edge Server",icon: "🖥" },
  { title: "Offload Task",       short: "Offload",    icon: "📤" },
  { title: "Measure Latency",    short: "Latency",    icon: "📈" },
];

/* ─────────────────────────────────────────────
   SHARED PRIMITIVES
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
      fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
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
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>{label}</div>
      <div style={{ fontSize: 23, fontWeight: 700, color: map[color] || T.text, fontFamily: mono ? T.fontMono : T.fontSans, lineHeight: 1.2 }}>{value}</div>
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
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: T.fontSans }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 2, fontFamily: T.fontSans }}>{sub}</div>}
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
      fontSize: 13, color: c.text, lineHeight: 1.6,
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
          fontSize: 13, color: T.text, fontFamily: i === 0 ? T.fontSans : T.fontMono,
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
      fontSize: 11, fontWeight: 700, color: T.muted,
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
      fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
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
      fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
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
      fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
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
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-0.01em", fontFamily: T.fontSans, lineHeight: 1.3 }}>Task Offloading<br/>Simulation System</div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: T.fontMono, marginTop: 2 }}>IoT · v5.0</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 12px", flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 8, fontFamily: T.fontSans }}>
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
                fontSize: done ? 11 : 12, fontWeight: 700, fontFamily: T.fontMono,
                background: active ? T.green : done ? T.greenDim : T.elevated,
                color: active ? (T.bg === "#eef0f5" ? "#fff" : "#0d1117") : done ? T.green : T.dim,
                border: `1px solid ${active ? T.green : done ? T.greenDim : T.border}`,
              }}>
                {done ? "✓" : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: active ? 600 : 400,
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
        <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: T.fontSans }}>
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
                <div style={{ fontSize: 12, color: T.text, fontFamily: T.fontMono, lineHeight: 1 }}>{srv.label}</div>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: T.fontMono, marginTop: 2 }}>
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
const TopBar = ({ step, maxReached, onJump, algoDecision, dark, setDark }) => {
  const T = useT();

  const srv = algoDecision ? resolveServer(algoDecision) : null;
  const srvAccent   = algoDecision === "A" ? T.blue : T.green;
  const srvAccentBg = algoDecision === "A" ? T.blueBg : T.greenBg;
  const srvAccentDim= algoDecision === "A" ? T.blueDim : T.greenDim;

  return (
    <div style={{
      background: T.surface, borderBottom: `1px solid ${T.border}`,
      padding: "0 24px", minHeight: 52, display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
    }}>
      <span style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSans }}>Simulation</span>
      <span style={{ color: T.border, fontSize: 13 }}>›</span>
      <span style={{ fontSize: 13, color: T.text, fontWeight: 600, fontFamily: T.fontSans }}>{STEPS[step].title}</span>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 16, overflow: "hidden" }}>
        {STEPS.map((s, i) => {
          const active = i === step, done = i < step;
          return (
            <React.Fragment key={i}>
              <button onClick={() => i <= maxReached && onJump(i)} style={{
                padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: active ? 700 : 400,
                fontFamily: T.fontMono,
                background: active ? T.greenBg : done ? T.elevated : "transparent",
                color: active ? T.green : done ? T.muted : T.dim,
                border: `1px solid ${active ? T.greenDim : done ? T.border : "transparent"}`,
                cursor: i <= maxReached ? "pointer" : "default",
                whiteSpace: "nowrap",
              }}>
                {done ? "✓ " : ""}{s.short}
              </button>
              {i < STEPS.length - 1 && <span style={{ color: T.border, fontSize: 11 }}>—</span>}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {srv && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            fontFamily: T.fontMono, color: srvAccent,
            background: srvAccentBg, border: `1px solid ${srvAccentDim}`,
            borderRadius: 4, padding: "3px 10px",
          }}>
            <span style={{ fontSize: 10, opacity: 0.7 }}>algo →</span>
            {srv.icon} {srv.label}
          </div>
        )}
        <div style={{
          fontSize: 12, fontFamily: T.fontMono, color: T.muted,
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
          <span style={{ fontSize: 14, lineHeight: 1 }}>{dark ? "🌙" : "☀️"}</span>
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
          <span style={{ fontSize: 12, color: T.muted, fontFamily: T.fontMono, userSelect: "none", minWidth: 28 }}>
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
  const machines = Object.values(machineData);
  const m = machineData[selectedId];

  if (loading) return (
    <Card title="Loading Machines" sub="Fetching from Supabase via Server A">
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 0", color: T.muted, fontFamily: T.fontSans, fontSize: 14 }}>
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
    if (name.includes("cnc plasma"))   return "/images/plasma.png";
    if (name.includes("plasma cut"))   return "/images/plasmacut.png";
    const categoryMap = {
      "Cutting Machines":   "/images/shearing.png",
      "Welding Machines":   "/images/welding.png",
      "Finishing Machines": "/images/paint.png",
    };
    return categoryMap[mc.category] || "/images/default.jpg";
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
        <h1 style={{ fontSize: 21, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>IoT Machine Selection</h1>
        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Choose a registered device. The algorithms will automatically decide which server processes its task.
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
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
                  {sel && (
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <Badge color="green" dot>selected</Badge>
                    </div>
                  )}
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: sel ? T.green : T.text, marginBottom: 2, fontFamily: T.fontMono }}>{mc.machineId}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 6, fontFamily: T.fontSans, lineHeight: 1.4 }}>{mc.name}</div>
                  <div style={{ fontSize: 11, color: T.dim, fontFamily: T.fontMono }}>{mc.taskType}</div>
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
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: T.fontMono, marginTop: 3 }}>{m.category}</div>
            </div>
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <Badge color="green" dot>{m.machineId}</Badge>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {[["Machine ID", m.machineId, "blue"], ["Category", m.category, "dim"], ["Task Type", m.taskType, "amber"]].map(([l, v, c]) => (
              <div key={l} style={{ flex: "1 1 160px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>{l}</div>
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
        <h1 style={{ fontSize: 21, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Task Parameters</h1>
        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Live data fetched for <strong style={{ color: T.text }}>{m.name} ({m.machineId})</strong>.
          These metrics are fed into the algorithms to determine the optimal offload target.
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat label="Task Size"          value={`${m.taskSize} MB`}          color="blue" />
        <Stat label="Processing Time"    value={`${m.processingTime} ms`}    color="green" />
        <Stat label="Bandwidth"          value={`${m.bandwidth} Mbps`}       color="purple" />
        <Stat label="Energy Utilization" value={`${m.energyConsumption} kWh`}color="amber" />
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
              ["Energy Utilization", `${m.energyConsumption} kWh`,   "Energy per cycle"],
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
      <InfoBox color="green">
        All parameters loaded. The algorithms will evaluate Edge Server A and Cloud Server B
        to determine where this task should be offloaded.
      </InfoBox>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 2: RUN ALGORITHMS
───────────────────────────────────────────── */
const serverLabel = (key) => {
  if (!key) return "—";
  return resolveServer(key).label;
};

const serverColor = (key) => {
  if (key === "A") return "blue";
  return "green";
};

const Step2Algorithms = ({
  machine: m, gbfsData, psoData, algoRunning, algoError,
  onRunBoth, gbfsProgress, psoProgress,
}) => {
  const T = useT();
  const bothDone = !!gbfsData && !!psoData;
  const resultsRef = React.useRef(null);

  React.useEffect(() => {
    if (bothDone && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [bothDone]);

  const gbfsWins = bothDone && gbfsData.latency <= psoData.latency;
  const winnerData = bothDone ? (gbfsWins ? gbfsData : psoData) : null;
  const winnerAlgo = bothDone ? (gbfsWins ? "GBFS" : "PSO") : null;
  const decidedServer = winnerData?.recommendedServer ?? (gbfsWins ? gbfsData?.recommendedServer : psoData?.recommendedServer);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Algorithm Execution</h1>
        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          <strong style={{ color: T.text }}>GBFS</strong> and <strong style={{ color: T.text }}>PSO</strong> each
          evaluate both candidate targets (Edge Server A, Cloud Server B) and independently decide where to offload the task.
          The algorithm with the lower latency wins, and its server decision is used.
        </p>
      </div>

      <Card title="Decision Logic" sub="How the server is chosen" accent={T.purple}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { icon: "📊", label: "Input", desc: `Task parameters from ${m.machineId} are fed into both algorithms.` },
            { icon: "🧮", label: "Evaluate", desc: "Each algorithm scores Edge Server A and Cloud Server B against latency, energy, and throughput constraints." },
            { icon: "🏆", label: "Decide", desc: "Each algorithm returns its recommended target. The algorithm with lower latency wins; its choice is final." },
            { icon: "📤", label: "Offload", desc: "The task is dispatched to the algorithm-chosen server automatically." },
          ].map((item, i) => (
            <div key={i} style={{ flex: "1 1 160px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: T.fontSans, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: T.fontSans, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Execution Pipeline" sub="Both algorithms run in sequence" accent={T.blue}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, paddingBottom: 16, justifyContent: "center" }}>
          {[
            { icon: "⚙",  label: m.machineId, sub: "IoT Source",          done: true,       running: false },
            { icon: "⚙",  label: "GBFS",       sub: "Greedy Best-First",   done: !!gbfsData, running: algoRunning && !gbfsData },
            { icon: "◈",  label: "PSO",         sub: "Particle Swarm",      done: !!psoData,  running: algoRunning && !!gbfsData && !psoData },
            { icon: "≋",  label: "Compare",     sub: "Pick best algo",      done: bothDone,   running: false },
            { icon: "🖥",  label: decidedServer ? resolveServer(decidedServer).label : "Server?",
                           sub: "Algo decision",    done: bothDone,   running: false },
          ].map((node, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <div style={{ display: "flex", alignItems: "center", padding: "0 6px", flexShrink: 0 }}>
                <div style={{ width: 20, height: 1, background: T.border }} />
                <span style={{ color: T.muted, fontSize: 11 }}>▶</span>
              </div>}
              <div style={{
                flex: "0 0 auto", width: 104,
                border: `1px solid ${node.done ? T.green : node.running ? T.blue : T.border}`,
                borderRadius: 8, padding: "12px 10px", textAlign: "center",
                background: node.done ? T.greenBg : node.running ? T.blueBg : T.elevated,
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{node.running ? "⟳" : node.done ? "✓" : node.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: node.done ? T.green : node.running ? T.blue : T.text, fontFamily: T.fontMono }}>{node.label}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 3, fontFamily: T.fontSans }}>{node.running ? "running…" : node.sub}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {(gbfsProgress || psoProgress) && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {[["GBFS", "Greedy Best-First Search", T.blue, gbfsData], ["PSO", "Particle Swarm Optimization", T.purple, psoData]].map(([name, fullName, color, done]) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, fontFamily: T.fontMono, marginBottom: 4 }}>
                  <span style={{ color }}><strong>{name}</strong> <span style={{ color: T.dim, fontWeight: 400 }}>— {fullName}</span></span>
                  <span>{done ? `done ✓  →  ${serverLabel(done.recommendedServer)}` : algoRunning ? "running…" : ""}</span>
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
            {algoRunning ? "Algorithms running…" : bothDone ? "✓ Algorithms Complete" : "Run GBFS + PSO"}
          </DualBtn>
          {bothDone && !algoRunning && <GhostBtn onClick={onRunBoth}>↺ Re-run</GhostBtn>}
        </div>
      </Card>

      {bothDone && (() => {
        return (
          <div ref={resultsRef}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { abbr: "GBFS", full: "Greedy Best-First Search", color: T.blue, bg: T.blueBg, border: T.blueDim,
                  desc: "Selects the locally optimal path at each step using a heuristic. Fast execution, deterministic output." },
                { abbr: "PSO",  full: "Particle Swarm Optimization", color: T.purple, bg: T.purpleBg, border: T.purpleDim,
                  desc: "Bio-inspired swarm algorithm that iteratively refines candidate solutions. Finds global optima more reliably." },
              ].map(({ abbr, full, color, bg, border, desc }) => (
                <div key={abbr} style={{ flex: "1 1 240px", background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 48, textAlign: "center", background: color, borderRadius: 6, padding: "6px 4px" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: T.fontMono, lineHeight: 1 }}>{abbr}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: color, fontFamily: T.fontSans, marginBottom: 3 }}>{full}</div>
                    <div style={{ fontSize: 12, color: T.muted, fontFamily: T.fontSans, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { algo: "GBFS", full: "Greedy Best-First Search", color: T.blue,   bg: gbfsWins ? T.blueBg : T.elevated,   border: gbfsWins ? T.blue : T.border,   data: gbfsData, wins: gbfsWins,  badgeColor: "blue" },
                { algo: "PSO",  full: "Particle Swarm Optimization", color: T.purple, bg: !gbfsWins ? T.purpleBg : T.elevated, border: !gbfsWins ? T.purple : T.border, data: psoData,  wins: !gbfsWins, badgeColor: "purple" },
              ].map(({ algo, full, color, bg, border, data, wins, badgeColor }) => (
                <div key={algo} style={{ flex: "1 1 240px", border: `1px solid ${border}`, borderRadius: 8, padding: "18px 20px", background: bg }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: T.fontSans }}>{algo}</span>
                    {wins && <Badge color={badgeColor} dot>WINNER</Badge>}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSans, marginBottom: 14 }}>{full}</div>

                  <div style={{ marginBottom: 12, padding: "10px 12px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>
                      Server Decision
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{resolveServer(data.recommendedServer)?.icon ?? "🖥"}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: T.fontMono, color }}>
                        {serverLabel(data.recommendedServer)}
                      </span>
                    </div>
                    {data.decisionReason && (
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontFamily: T.fontSans, lineHeight: 1.4 }}>
                        {data.decisionReason}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: T.fontMono, marginBottom: 4 }}>{algo} Performance Summary</div>

                  {[["Latency", `${data.latency} ms`], ["Processing Time", `${data.time} ms`], ["Resource Utilization", `${data.utilization}%`]].map(([l, v]) => (
                    <div key={l} style={{ padding: "10px 0", borderTop: `1px solid ${T.borderSub}` }}>
                      <div style={{ fontSize: 12, color: T.muted, fontFamily: T.fontMono, marginBottom: 5 }}>{l}</div>
                      <div style={{ fontSize: 15, fontFamily: T.fontMono, color: T.text, fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ background: T.greenBg, border: `1px solid ${T.greenDim}`, borderLeft: `3px solid ${T.green}`, borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{resolveServer(decidedServer)?.icon ?? "🖥"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: T.fontSans }}>
                  {serverLabel(decidedServer)}
                  <span style={{ fontWeight: 400, color: T.muted }}> — chosen by the algorithms</span>
                </div>
                <div style={{ fontSize: 13, color: T.muted, marginTop: 4, fontFamily: T.fontSans }}>
                  Winning algorithm: <strong style={{ color: gbfsWins ? T.blue : T.purple }}>{winnerAlgo}</strong>
                  {" "}— latency <strong style={{ color: T.green, fontFamily: T.fontMono }}>{Math.min(+gbfsData.latency, +psoData.latency)} ms</strong>
                </div>
              </div>
              <Badge color="green" dot>algorithm decision</Badge>
            </div>
            <div style={{ marginTop: 12 }}>
              <InfoBox color="green">
                Both algorithms complete. Winner: <strong>{winnerAlgo}</strong> ({Math.min(+gbfsData.latency, +psoData.latency)} ms).
                Recommended target: <strong>{serverLabel(decidedServer)}</strong>. Proceed to confirm.
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
const Step3SelectEdge = ({ machine: m, gbfsData, psoData }) => {
  const T = useT();
  if (!gbfsData || !psoData) return <Card><InfoBox color="amber">Run both algorithms first (Step 3).</InfoBox></Card>;

  const gbfsWins     = gbfsData.latency <= psoData.latency;
  const winnerAlgo   = gbfsWins ? "GBFS" : "PSO";
  const winnerData   = gbfsWins ? gbfsData : psoData;
  const decidedKey   = winnerData.recommendedServer;
  const decidedSrv   = resolveServer(decidedKey);
  const bestLat      = Math.min(+gbfsData.latency, +psoData.latency);

  const srvAccent    = decidedKey === "A" ? T.blue : T.green;
  const srvAccentBg  = decidedKey === "A" ? T.blueBg : T.greenBg;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Algorithm-Chosen Server</h1>
        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          The winning algorithm (<strong style={{ color: gbfsWins ? T.blue : T.purple }}>{winnerAlgo}</strong>) has selected{" "}
          <strong style={{ color: T.text }}>{decidedSrv.label}</strong> as the offload target.
          No manual override — this is the algorithm's autonomous decision.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat label="GBFS Latency"      value={`${gbfsData.latency} ms`}  color="blue" />
        <Stat label="PSO Latency"       value={`${psoData.latency} ms`}   color="purple" />
        <Stat label="Chosen Algorithm based on Task Offloading Performance" value={winnerAlgo} color="green" />
        <Stat label="Best Latency"      value={`${bestLat} ms`}           color="amber" />
        <Stat label="Algo Decision"     value={decidedSrv.label}          color={serverColor(decidedKey)} mono={false} />
      </div>

      <Card title="Algorithm Decisions" sub="Each algorithm's independent server recommendation" accent={T.purple}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { algo: "GBFS", data: gbfsData, wins: gbfsWins,  color: T.blue,   bg: T.blueBg,   border: T.blueDim },
            { algo: "PSO",  data: psoData,  wins: !gbfsWins, color: T.purple, bg: T.purpleBg, border: T.purpleDim },
          ].map(({ algo, data, wins, color, bg, border }) => {
            const srvKey = data.recommendedServer;
            const srv = resolveServer(srvKey);
            return (
              <div key={algo} style={{ flex: "1 1 220px", background: wins ? bg : T.elevated, border: `1px solid ${wins ? color : T.border}`, borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: wins ? color : T.muted, fontFamily: T.fontMono }}>{algo}</span>
                  {wins && <Badge color={algo === "GBFS" ? "blue" : "purple"} dot>winner</Badge>}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>Recommended Server</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{srv.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: T.fontMono, color: wins ? color : T.muted }}>{srv.label}</span>
                </div>
                {data.decisionReason && (
                  <div style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSans, lineHeight: 1.5, marginBottom: 8 }}>{data.decisionReason}</div>
                )}
                <div style={{ fontSize: 12, fontFamily: T.fontMono, color: wins ? color : T.dim }}>{data.latency} ms latency</div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 12, color: T.muted, marginBottom: 10, fontFamily: T.fontSans, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          All candidate servers evaluated
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(SERVERS).map(([key, srv]) => {
            const isChosen = key === decidedKey;
            const kAccent   = key === "A" ? T.blue : T.green;
            const kAccentBg = key === "A" ? T.blueBg : T.greenBg;
            return (
              <div key={key} style={{
                flex: "1 1 140px",
                border: `1px solid ${isChosen ? kAccent : T.border}`,
                borderRadius: 8, padding: "12px 14px",
                background: isChosen ? kAccentBg : T.elevated,
                opacity: isChosen ? 1 : 0.5,
                transition: "all 0.12s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{srv.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isChosen ? T.text : T.muted, fontFamily: T.fontSans }}>{srv.label}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSans }}>{srv.sub}</div>
                  </div>
                  {isChosen && <Badge color={key === "A" ? "blue" : "green"} dot>chosen</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Metric Comparison" sub="Both algorithms on all indicators" accent={T.blue}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Metric</Th><Th>GBFS</Th><Th>PSO</Th><Th>Better</Th></tr></thead>
          <tbody>
            {[
              ["Latency (ms)",            gbfsData.latency,     psoData.latency,     "lower"],
              ["Throughput (tasks/s)",    gbfsData.throughput,  psoData.throughput,  "higher"],
              ["Energy Utilization (kWh)",gbfsData.energy,      psoData.energy,      "lower"],
              ["Resource Utilization (%)",gbfsData.utilization, psoData.utilization, "lower"],
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

      <InfoBox color="green">
        <strong>{winnerAlgo}</strong> chose <strong>{decidedSrv.icon} {decidedSrv.label}</strong> based on task parameters.
        Proceed to offload the task to this server.
      </InfoBox>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP 4: OFFLOAD
───────────────────────────────────────────── */
const Step4Offload = ({ machine: m, gbfsData, psoData, offloadResult, offloading, offloadError, onOffload }) => {
  const T = useT();
  if (!gbfsData || !psoData) return <Card><InfoBox color="amber">Run both algorithms first.</InfoBox></Card>;

  const gbfsWins   = gbfsData.latency <= psoData.latency;
  const winnerAlgo = gbfsWins ? "GBFS" : "PSO";
  const winnerData = gbfsWins ? gbfsData : psoData;
  const decidedKey = winnerData.recommendedServer;
  const decidedSrv = resolveServer(decidedKey);
  const srvAccent  = decidedKey === "A" ? T.blue : T.green;
  const srvAccentBg= decidedKey === "A" ? T.blueBg : T.greenBg;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Task Offloading</h1>
        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Dispatching <strong style={{ color: T.text }}>{m.name}</strong> task to{" "}
          <strong style={{ color: T.text }}>{decidedSrv.icon} {decidedSrv.label}</strong>{" "}
          — target chosen by <strong style={{ color: gbfsWins ? T.blue : T.purple }}>{winnerAlgo}</strong>.
        </p>
      </div>

      <div style={{
        background: srvAccentBg, border: `1px solid ${srvAccent}`,
        borderLeft: `3px solid ${srvAccent}`, borderRadius: 8,
        padding: "12px 16px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 22 }}>{decidedSrv.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: T.fontSans }}>{decidedSrv.label}</div>
          <div style={{ fontSize: 12, color: T.muted, fontFamily: T.fontSans, marginTop: 2 }}>
            Autonomously selected by <strong style={{ color: gbfsWins ? T.blue : T.purple }}>{winnerAlgo}</strong> based on {m.machineId}'s task profile.
            {winnerData.decisionReason && ` ${winnerData.decisionReason}`}
          </div>
        </div>
        <Badge color="dim">algo-driven</Badge>
      </div>

      <Card title="Offload Flow" sub="IoT → Network → Algorithm-Chosen Server → Database" accent={T.blue}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", padding: "8px 0" }}>
          {[
            { icon: "⚙",             label: m.machineId,      sub: "IoT Device",          bc: T.blue,      bg: T.blueBg },
            { icon: "📡",            label: "Network",         sub: `${m.bandwidth} Mbps`, bc: T.amber,     bg: T.amberBg },
            { icon: decidedSrv.icon, label: decidedSrv.label, sub: `${winnerAlgo} choice`, bc: srvAccent,   bg: srvAccentBg },
            { icon: "🗄",            label: "Supabase",        sub: "Logs saved",           bc: T.purple,    bg: T.purpleBg },
          ].map((node, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span style={{ padding: "0 8px", color: T.dim, fontSize: 12, fontFamily: T.fontMono }}>→</span>}
              <div style={{ flex: "1 1 100px", maxWidth: 130, border: `1px solid ${node.bc}`, borderRadius: 8, padding: "12px 10px", background: node.bg, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{node.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: T.fontMono }}>{node.label}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 3, fontFamily: T.fontSans, lineHeight: 1.4 }}>{node.sub}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card title={`Send to ${decidedSrv.label}`} sub={`POST → ${decidedSrv.baseUrl}/offload`} accent={srvAccent}>
        {offloadError && <div style={{ marginBottom: 16 }}><ErrBox>Offload failed — {offloadError}</ErrBox></div>}
        {!offloadResult ? (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <PrimaryBtn onClick={onOffload} disabled={offloading}>
              {offloading ? `Sending to ${decidedSrv.label}…` : `Offload Task → ${decidedSrv.icon} ${decidedSrv.label}`}
            </PrimaryBtn>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                ["Task Size",  `${m.taskSize} MB`, "blue"],
                ["Algorithm", winnerAlgo,           gbfsWins ? "blue" : "purple"],
                ["Target",    decidedSrv.label,     "green"],
                ["Status",    offloadResult.status === "success" ? "Success" : "Failed", offloadResult.status === "success" ? "green" : "red"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ flex: "1 1 140px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.fontSans }}>{l}</div>
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
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontSize: 13, color: p.color, marginBottom: 3 }}>
          {p.dataKey}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* Gantt-style horizontal comparison chart.
   Each metric is a swimlane; GBFS/PSO bars are normalized to the row's
   own max so every lane fills the same width scale, but the label shown
   on each bar is always the real measured value + unit. */
const GANTT_SERIES = {
  GBFS: { key: "GBFS", rawKey: "GBFSraw", label: "GBFS" },
  PSO:  { key: "PSO",  rawKey: "PSOraw",  label: "PSO" },
  BASE: { key: "BASE", rawKey: "BASEraw", label: "Current System" },
};

const GanttLabel = ({ x, y, width, height, rows, rowIndex, barKey }) => {
  const T = useT();
  const row = rows[rowIndex];
  if (!row) return null;
  const raw = row[GANTT_SERIES[barKey].rawKey];
  if (raw === null || raw === undefined) return null;
  const color = barKey === "GBFS" ? T.blue : barKey === "PSO" ? T.purple : T.amber;
  return (
    <text
      x={x + width + 8} y={y + height / 2} dy={4}
      fontSize={11} fontFamily={T.fontMono} fontWeight={700} fill={color}
    >
      {raw} {row.unit}
    </text>
  );
};

const GanttTooltip = ({ active, payload, label, rows }) => {
  const T = useT();
  if (!active || !payload?.length) return null;
  const row = rows.find(r => r.metric === label);
  return (
    <div style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", fontFamily: T.fontMono }}>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>{label}</div>
      {row?.BASEraw != null && <div style={{ fontSize: 13, color: T.amber, marginBottom: 3 }}>Current System: <strong>{row.BASEraw} {row?.unit}</strong></div>}
      <div style={{ fontSize: 13, color: T.blue, marginBottom: 3 }}>GBFS: <strong>{row?.GBFSraw} {row?.unit}</strong></div>
      <div style={{ fontSize: 13, color: T.purple }}>PSO: <strong>{row?.PSOraw} {row?.unit}</strong></div>
    </div>
  );
};

/* Combines the original four algorithm metrics (Latency, Processing Time,
   Throughput, Energy Utilization) with the newer ones — Resource
   Utilization, plus a third "Current System" baseline lane wherever the
   machine's own telemetry provides an equivalent figure to compare against. */
const GanttComparisonChart = ({ machine: m, gbfsData, psoData }) => {
  const T = useT();

  const baseThroughput = m?.throughput != null ? +(m.throughput / 60).toFixed(2) : null;

  const rows = [
    { metric: "Latency",             unit: "ms",      GBFSraw: +gbfsData.latency,     PSOraw: +psoData.latency,     BASEraw: m?.avgLatency != null ? +m.avgLatency : null },
    { metric: "Processing Time",     unit: "ms",      GBFSraw: +gbfsData.time,        PSOraw: +psoData.time,        BASEraw: m?.processingTime != null ? +m.processingTime : null },
    { metric: "Throughput",          unit: "tasks/s", GBFSraw: +gbfsData.throughput,  PSOraw: +psoData.throughput,  BASEraw: baseThroughput },
    { metric: "Energy Utilization",  unit: "kWh",     GBFSraw: +gbfsData.energy,      PSOraw: +psoData.energy,      BASEraw: m?.energyConsumption != null ? +m.energyConsumption : null },
    { metric: "Resource Utilization",unit: "%",       GBFSraw: +gbfsData.utilization, PSOraw: +psoData.utilization, BASEraw: m?.cpuUtilization != null ? +m.cpuUtilization : null },
  ].map(r => {
    const rowMax = Math.max(r.GBFSraw, r.PSOraw, r.BASEraw ?? 0, 0.0001);
    return {
      ...r,
      GBFS: +(r.GBFSraw / rowMax * 100).toFixed(1),
      PSO:  +(r.PSOraw  / rowMax * 100).toFixed(1),
      BASE: r.BASEraw != null ? +(r.BASEraw / rowMax * 100).toFixed(1) : 0,
    };
  });

  return (
    <Card title="Algorithm Timeline — Gantt Comparison" sub="Current System vs GBFS vs PSO, across latency, processing time, throughput, energy, and resource utilization" accent={T.blue}>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: T.fontSans, color: T.muted }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: T.amber, display: "inline-block" }} /> Current System (baseline)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: T.fontSans, color: T.muted }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: T.blue, display: "inline-block" }} /> GBFS
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: T.fontSans, color: T.muted }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: T.purple, display: "inline-block" }} /> PSO
        </div>
      </div>
      <ResponsiveContainer width="100%" height={rows.length * 104}>
        <BarChart
          data={rows} layout="vertical"
          margin={{ top: 4, right: 76, left: 8, bottom: 4 }}
          barCategoryGap={22} barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category" dataKey="metric" width={150}
            stroke={T.dim} fontSize={12} fontFamily={T.fontSans}
            tickLine={false} axisLine={{ stroke: T.border }}
          />
          <Tooltip content={<GanttTooltip rows={rows} />} cursor={{ fill: T.elevated }} />
          <Bar dataKey="BASE" fill={T.amber} radius={[4, 4, 4, 4]} barSize={13}>
            <LabelList content={(p) => <GanttLabel {...p} rows={rows} rowIndex={p.index} barKey="BASE" />} />
          </Bar>
          <Bar dataKey="GBFS" fill={T.blue} radius={[4, 4, 4, 4]} barSize={13}>
            <LabelList content={(p) => <GanttLabel {...p} rows={rows} rowIndex={p.index} barKey="GBFS" />} />
          </Bar>
          <Bar dataKey="PSO" fill={T.purple} radius={[4, 4, 4, 4]} barSize={13}>
            <LabelList content={(p) => <GanttLabel {...p} rows={rows} rowIndex={p.index} barKey="PSO" />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 11, color: T.dim, marginTop: 10, fontFamily: T.fontSans, lineHeight: 1.5 }}>
        "Current System" rows use {m?.machineId ?? "the device"}'s own reported baseline (no algorithmic offloading).
        Bars in each lane are scaled to that lane's own maximum, so lengths compare within a metric, not across metrics.
      </div>
    </Card>
  );
};

const compareMetric = (gbfsVal, psoVal, lowerIsBetter = true) => {
  const gWins = lowerIsBetter ? gbfsVal <= psoVal : gbfsVal >= psoVal;
  const better = Math.max(gbfsVal, psoVal, 0.0001);
  const pct = (Math.abs(gbfsVal - psoVal) / better * 100).toFixed(1);
  return { winner: gWins ? "GBFS" : "PSO", pct };
};

const Step5Latency = ({ machine: m, gbfsData, psoData, offloadResult }) => {
  const T = useT();
  if (!gbfsData || !psoData) return <Card><InfoBox color="amber">Run both algorithms first.</InfoBox></Card>;

  const gbfsWins    = gbfsData.latency <= psoData.latency;
  const winnerAlgo  = gbfsWins ? "GBFS" : "PSO";
  const winnerData  = gbfsWins ? gbfsData : psoData;
  const decidedKey  = winnerData.recommendedServer;
  const decidedSrv  = resolveServer(decidedKey);
  const improvement = (Math.abs(gbfsData.latency - psoData.latency) / Math.max(gbfsData.latency, psoData.latency) * 100).toFixed(1);
  const gbfsBase    = +gbfsData.latency;
  const psoBase     = +psoData.latency;
  const measuredLat = offloadResult?.measuredLatency;
  const predictedLat = Math.min(gbfsBase, psoBase);
  const deviationPct = measuredLat ? (Math.abs(measuredLat - predictedLat) / predictedLat * 100).toFixed(1) : null;
  const deviationOk  = measuredLat ? +deviationPct <= 20 : null;

  const latencyCmp     = compareMetric(+gbfsData.latency, +psoData.latency, true);
  const completionCmp  = compareMetric(+gbfsData.time, +psoData.time, true);
  const utilizationCmp = compareMetric(+gbfsData.utilization, +psoData.utilization, true);

  const barData = [
    { metric: "Latency",             GBFS: +gbfsData.latency,     PSO: +psoData.latency },
    { metric: "Throughput",          GBFS: +gbfsData.throughput,  PSO: +psoData.throughput },
    { metric: "Energy Utilization",  GBFS: +gbfsData.energy,      PSO: +psoData.energy },
    { metric: "Resource Utilization",GBFS: +gbfsData.utilization, PSO: +psoData.utilization },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Latency Results</h1>
        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0", fontFamily: T.fontSans }}>
          Task from <strong style={{ color: T.text }}>{m.name}</strong> offloaded to{" "}
          <strong style={{ color: T.text }}>{decidedSrv.icon} {decidedSrv.label}</strong> by{" "}
          <strong style={{ color: gbfsWins ? T.blue : T.purple }}>{winnerAlgo}</strong>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat label="Chosen Algorithm based on Task Offloading Performance" value={winnerAlgo} color={gbfsWins ? "blue" : "purple"} />
        <Stat label="Algo-Chosen Server" value={decidedSrv.label}   color={serverColor(decidedKey)} mono={false} />
        <Stat label="GBFS Latency"       value={`${gbfsBase} ms`}   color="blue" />
        <Stat label="PSO Latency"        value={`${psoBase} ms`}    color="purple" />
        <Stat label="Improvement"        value={`${improvement}%`}  color="amber" />
        {measuredLat && <Stat label="Actual Latency" value={`${measuredLat} ms`} color="green" />}
      </div>

      <div style={{
        background: T.elevated, border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${gbfsWins ? T.blue : T.purple}`,
        borderRadius: 8, padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: gbfsWins ? T.blue : T.purple, fontFamily: T.fontMono, lineHeight: 1 }}>{winnerAlgo}</div>
        <div>
          <div style={{ fontSize: 14, color: T.text, fontFamily: T.fontSans }}>
            {winnerAlgo} achieved <strong style={{ fontFamily: T.fontMono }}>{Math.min(gbfsBase, psoBase)} ms</strong> and routed the task to{" "}
            <strong>{decidedSrv.icon} {decidedSrv.label}</strong>
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 3, fontFamily: T.fontSans }}>
            {improvement}% lower latency than {gbfsWins ? "PSO" : "GBFS"}
          </div>
        </div>
      </div>

      <GanttComparisonChart machine={m} gbfsData={gbfsData} psoData={psoData} />

      {/* ── CURRENT SYSTEM vs. ALGORITHM-OPTIMIZED PERFORMANCE ── */}
      {(() => {
        const baseLatency  = +m.avgLatency;
        const baseTime     = +m.processingTime;
        const baseThroughput = +(m.throughput / 60).toFixed(2); // tasks/min → tasks/s, to match algo units
        const winThroughput  = +winnerData.throughput;
        const winTime         = +winnerData.time;

        const pct = (base, win, lowerIsBetter = true) => {
          if (!base) return null;
          const diff = lowerIsBetter ? base - win : win - base;
          return (diff / base * 100).toFixed(1);
        };
        const latPct  = pct(baseLatency, gbfsBase < psoBase ? gbfsBase : psoBase, true);
        const timePct = pct(baseTime, winTime, true);
        const thrPct  = pct(baseThroughput, winThroughput, false);

        const rows2 = [
          { metric: "Latency (ms)",           base: baseLatency,    algo: Math.min(gbfsBase, psoBase), pct: latPct,  dir: "lower" },
          { metric: "Processing Time (ms)",   base: baseTime,       algo: winTime,                     pct: timePct, dir: "lower" },
          { metric: "Throughput (tasks/s)",   base: baseThroughput, algo: winThroughput,                pct: thrPct,  dir: "higher" },
        ];

        return (
          <Card title="Current System vs. Algorithm-Optimized" sub={`Baseline (no offloading) vs. ${winnerAlgo} on ${decidedSrv.label}`} accent={T.amber}>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 0, marginBottom: 16, fontFamily: T.fontSans, lineHeight: 1.6 }}>
              "Current System" reflects {m.machineId}'s baseline performance if the task were processed without algorithmic
              offloading, using its own reported latency, processing time, and throughput. This is compared against the
              algorithm-optimized outcome to evaluate the efficiency gained from offloading.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Metric</Th><Th>Current System</Th><Th>{winnerAlgo} (Optimized)</Th><Th>Change</Th></tr></thead>
              <tbody>
                {rows2.map((r, i) => {
                  const improved = r.pct !== null && +r.pct > 0;
                  return (
                    <TableRow key={r.metric} isOdd={i % 2 === 1} cells={[
                      <span style={{ fontFamily: T.fontSans, color: T.text }}>{r.metric}</span>,
                      <span style={{ fontFamily: T.fontMono, color: T.muted }}>{r.base}</span>,
                      <span style={{ fontFamily: T.fontMono, color: gbfsWins ? T.blue : T.purple, fontWeight: 700 }}>{r.algo}</span>,
                      <Badge color={r.pct === null ? "dim" : improved ? "green" : "red"}>
                        {r.pct === null ? "n/a" : `${improved ? "▼" : "▲"} ${Math.abs(r.pct)}%`}
                      </Badge>,
                    ]} />
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 16 }}>
              <InfoBox color="amber">
                Relative to {m.machineId}'s current (non-offloaded) baseline, <strong>{winnerAlgo}</strong> changed latency by{" "}
                <strong>{latPct === null ? "n/a" : `${latPct}%`}</strong> and throughput by{" "}
                <strong>{thrPct === null ? "n/a" : `${thrPct}%`}</strong> when routing to <strong>{decidedSrv.label}</strong>.
              </InfoBox>
            </div>
          </Card>
        );
      })()}

      {/* ── MACHINE RESOURCE UTILIZATION ── */}
      <Card title="Machine Resource Utilization" sub={`CPU, memory, and storage load · ${m.machineId}`} accent={T.purple}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <Stat label="CPU Utilization"    value={m.cpuUtilization != null ? `${m.cpuUtilization}%` : "—"} color="blue" />
          <Stat label="Memory Usage"       value={m.memoryUsage != null ? `${m.memoryUsage} GB` : "—"}     color="purple" />
          <Stat label="Storage Footprint"  value={m.storageUsage != null ? `${m.storageUsage} GB` : `${m.taskSize} MB / task`} color="amber" />
          <Stat label="Queue Length"       value={m.queueLength ?? "—"}                                    color="green" />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Resource</Th><Th>Reading</Th><Th>Notes</Th></tr></thead>
          <tbody>
            {[
              ["CPU", m.cpuUtilization != null ? `${m.cpuUtilization}%` : "not reported", "Edge-side processor load while handling the task"],
              ["Memory", m.memoryUsage != null ? `${m.memoryUsage} GB` : "not reported", "RAM consumed on the source device"],
              ["Storage", m.storageUsage != null ? `${m.storageUsage} GB` : `${m.taskSize} MB per task (proxy)`, m.storageUsage != null ? "Disk footprint at time of capture" : "Telemetry does not report disk usage directly — task size is shown as the closest proxy"],
              ["Queue", `${m.queueLength ?? "—"} pending`, "Tasks waiting ahead of this one on the device"],
            ].map(([r, v, n], i) => (
              <TableRow key={r} isOdd={i % 2 === 1} cells={[
                <span style={{ fontFamily: T.fontSans, color: T.text }}>{r}</span>,
                <Badge color="dim">{v}</Badge>,
                <span style={{ color: T.muted, fontFamily: T.fontSans }}>{n}</span>,
              ]} />
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Full Metrics Comparison" sub={`All indicators · ${decidedSrv.label}`} accent={T.purple}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="metric" stroke={T.dim} fontSize={12} fontFamily={T.fontMono} />
            <YAxis stroke={T.dim} fontSize={12} fontFamily={T.fontMono} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: T.fontMono }} />
            <Bar dataKey="GBFS" fill={T.blue}   radius={[4, 4, 0, 0]}><LabelList dataKey="GBFS" position="top" fill={T.muted} fontSize={11} fontFamily={T.fontMono} /></Bar>
            <Bar dataKey="PSO"  fill={T.purple} radius={[4, 4, 0, 0]}><LabelList dataKey="PSO"  position="top" fill={T.muted} fontSize={11} fontFamily={T.fontMono} /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Result Summary" sub={`${m.name} · ${decidedSrv.label}`} accent={T.green}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Metric</Th><Th>GBFS</Th><Th>PSO</Th><Th>Better</Th></tr></thead>
          <tbody>
            {[
              ["Latency (ms)",             gbfsData.latency,     psoData.latency,     "lower"],
              ["Throughput (tasks/s)",     gbfsData.throughput,  psoData.throughput,  "higher"],
              ["Energy Utilization (kWh)", gbfsData.energy,      psoData.energy,      "lower"],
              ["Resource Utilization (%)", gbfsData.utilization, psoData.utilization, "lower"],
              ["Processing Time (ms)",     gbfsData.time,        psoData.time,        "lower"],
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
            <strong>{m.name}</strong> offloaded to {decidedSrv.icon} {decidedSrv.label} by <strong>{winnerAlgo}</strong>.
            {measuredLat && <> Actual latency: <strong style={{ fontFamily: T.fontMono }}>{measuredLat} ms</strong>.</>} Saved to Supabase.
          </InfoBox>
        </div>
      </Card>

      {/* ── 1. PROCESS: how the results were obtained ── */}
      <Card title="Simulation Process" sub="How this result was obtained, stage by stage" accent={T.blue}>
        {[
          {
            n: 1, title: "Device & Parameter Setup",
            desc: `${m.machineId} (${m.name}) was selected and its live task profile was pulled from Supabase — task size ${m.taskSize} MB, bandwidth ${m.bandwidth} Mbps, and ${9} other runtime parameters.`,
          },
          {
            n: 2, title: "Independent Algorithm Evaluation",
            desc: `GBFS and PSO each received the identical task profile and independently scored both candidate targets (Edge Server A, Cloud Server B) against latency, energy, and throughput constraints — neither algorithm sees the other's output.`,
          },
          {
            n: 3, title: "Result Capture",
            desc: `GBFS returned ${gbfsData.latency} ms latency, recommending ${serverLabel(gbfsData.recommendedServer)}. PSO returned ${psoData.latency} ms latency, recommending ${serverLabel(psoData.recommendedServer)}.`,
          },
          {
            n: 4, title: "Winner Selection",
            desc: `The algorithm with the lower latency is used as the final decision. ${winnerAlgo} (${Math.min(gbfsBase, psoBase)} ms) beat ${gbfsWins ? "PSO" : "GBFS"} by ${improvement}%, so its target — ${decidedSrv.label} — was selected automatically, with no manual override.`,
          },
          {
            n: 5, title: "Offload & Measurement",
            desc: measuredLat
              ? `The task was dispatched to ${decidedSrv.label} and the round-trip was timed directly, producing an actual measured latency of ${measuredLat} ms — this is the ground-truth figure used to validate the algorithm's ${winnerAlgo} ${Math.min(gbfsBase, psoBase)} ms prediction below.`
              : `The task has not been offloaded yet, so no measured latency exists to compare against the algorithm's prediction. Complete Step 5 (Offload) to generate ground-truth timing.`,
          },
        ].map(s => (
          <div key={s.n} style={{ display: "flex", gap: 14, padding: "12px 0", borderTop: s.n > 1 ? `1px solid ${T.borderSub}` : "none" }}>
            <div style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
              background: T.blueBg, border: `1px solid ${T.blueDim}`, color: T.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, fontFamily: T.fontMono,
            }}>{s.n}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: T.fontSans, marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: T.fontSans, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* ── 2. COMPREHENSIVE REPORT & SUMMARY ── */}
      <Card title="Simulation Summary" sub={`${m.name} · ${m.machineId}`} accent={T.green}>
        {[
          { algo: "GBFS", color: T.blue, data: gbfsData },
          { algo: "PSO",  color: T.purple, data: psoData },
        ].map(({ algo, color, data }) => (
          <div key={algo} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: T.fontMono }}>{algo}</span>
              <Badge color="dim">{resolveServer(data.recommendedServer).icon} {serverLabel(data.recommendedServer)}</Badge>
            </div>
            {[
              ["Latency",              `${data.latency} ms`],
              ["Processing Time",      `${data.time} ms`],
              ["Throughput",           `${data.throughput} tasks/s`],
              ["Energy Utilization",   `${data.energy} kWh`],
              ["Resource Utilization", `${data.utilization}%`],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: "8px 0", borderTop: `1px solid ${T.borderSub}` }}>
                <div style={{ fontSize: 12, color: T.muted, fontFamily: T.fontMono, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 14, color: T.text, fontFamily: T.fontMono, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        ))}

        <div style={{ fontSize: 14, fontWeight: 700, color: T.green, fontFamily: T.fontMono, marginBottom: 10 }}>Conclusion</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, color: T.text, fontFamily: T.fontMono }}>
            <strong style={{ color: latencyCmp.winner === "GBFS" ? T.blue : T.purple }}>{latencyCmp.winner}</strong> reduced latency by <strong>{latencyCmp.pct}%</strong>.
          </div>
          <div style={{ fontSize: 13, color: T.text, fontFamily: T.fontMono }}>
            <strong style={{ color: completionCmp.winner === "GBFS" ? T.blue : T.purple }}>{completionCmp.winner}</strong> completed tasks <strong>{completionCmp.pct}%</strong> faster.
          </div>
          <div style={{ fontSize: 13, color: T.text, fontFamily: T.fontMono }}>
            <strong style={{ color: utilizationCmp.winner === "GBFS" ? T.blue : T.purple }}>{utilizationCmp.winner}</strong> utilized resources <strong>{utilizationCmp.pct}%</strong> better.
          </div>
        </div>
      </Card>

      {/* ── 3. VALIDATION & ACCURACY ── */}
      <Card title="Validation & Accuracy Check" sub="Algorithm-predicted latency vs. actual measured latency" accent={measuredLat ? (deviationOk ? T.green : T.amber) : T.dim}>
        {measuredLat ? (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <Stat label="Predicted Latency" value={`${Math.min(gbfsBase, psoBase)} ms`} color={gbfsWins ? "blue" : "purple"} />
              <Stat label="Measured Latency"  value={`${measuredLat} ms`}                  color="green" />
              <Stat label="Deviation"         value={`${deviationPct}%`}                   color={deviationOk ? "green" : "amber"} />
            </div>
            <InfoBox color={deviationOk ? "green" : "amber"}>
              {deviationOk ? (
                <>
                  <strong>Validated.</strong> The measured latency ({measuredLat} ms) is within {deviationPct}% of {winnerAlgo}'s
                  predicted value ({Math.min(gbfsBase, psoBase)} ms), which is inside the accepted 20% simulation tolerance.
                  The algorithm's decision to route to <strong>{decidedSrv.label}</strong> is consistent with real-world behavior.
                </>
              ) : (
                <>
                  <strong>Deviation flagged.</strong> The measured latency ({measuredLat} ms) differs from {winnerAlgo}'s
                  predicted value ({Math.min(gbfsBase, psoBase)} ms) by {deviationPct}%, above the 20% tolerance band.
                  This can happen from network jitter or {decidedSrv.label} load at offload time — re-run the simulation to confirm before trusting this result.
                </>
              )}
            </InfoBox>
          </>
        ) : (
          <InfoBox color="amber">
            No measured latency yet. Validation compares the algorithm's predicted latency against the real round-trip
            time captured during offload — complete Step 5 (Offload Task) to unlock this check.
          </InfoBox>
        )}
      </Card>

      {/* ── 4. WORKFLOW DOCUMENTATION ── */}
      <Card title="Workflow Documentation" sub="Full audit trail — setup through interpretation" accent={T.purple}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Stage</Th><Th>Action</Th><Th>Status</Th></tr></thead>
          <tbody>
            {[
              ["1 · Setup",         `Selected ${m.machineId} (${m.name}) and loaded its task profile`,              "Complete"],
              ["2 · Collection",    `Captured ${m.taskSize} MB task at ${m.bandwidth} Mbps bandwidth`,               "Complete"],
              ["3 · Execution",     `Ran GBFS (${gbfsData.latency} ms) and PSO (${psoData.latency} ms)`,             "Complete"],
              ["4 · Selection",     `${winnerAlgo} chosen → target ${decidedSrv.label}`,                             "Complete"],
              ["5 · Offload",       measuredLat ? `Dispatched to ${decidedSrv.label}, measured ${measuredLat} ms` : "Not yet offloaded", measuredLat ? "Complete" : "Pending"],
              ["6 · Interpretation",measuredLat ? `Validated against prediction — ${deviationOk ? "within tolerance" : "deviation flagged"}` : "Awaiting offload for validation", measuredLat ? "Complete" : "Pending"],
            ].map(([stage, action, status], i) => (
              <TableRow key={stage} isOdd={i % 2 === 1} cells={[
                <span style={{ fontFamily: T.fontSans, color: T.text, fontWeight: 600 }}>{stage}</span>,
                <span style={{ color: T.muted, fontFamily: T.fontSans }}>{action}</span>,
                <Badge color={status === "Complete" ? "green" : "dim"} dot>{status}</Badge>,
              ]} />
            ))}
          </tbody>
        </table>
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
        <pre style={{ fontSize: 12, color: "#6b7280" }}>{this.state.error?.toString()}</pre>
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
  const [gbfsProgress,   setGbfsProgress]   = useState("");
  const [psoProgress,    setPsoProgress]    = useState("");

  const machine = selectedId ? machineData[selectedId] : null;

  const decidedServerKey = (() => {
    if (!gbfsData || !psoData) return null;
    const gbfsWins = gbfsData.latency <= psoData.latency;
    return (gbfsWins ? gbfsData : psoData).recommendedServer ?? null;
  })();

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
    setAlgoRunning(true); setAlgoError(null);
    setGbfsData(null); setPsoData(null);
    setGbfsProgress(""); setPsoProgress("");
    try {
      setGbfsProgress("Running…");
      const gbfsResult = await apiFetch(PRIMARY_BASE, "/gbfs", {
        method: "POST",
        body: JSON.stringify({ machine, candidates: Object.keys(SERVERS) }),
      });
      if (!gbfsResult.recommendedServer) {
        gbfsResult.recommendedServer = "A";
      }
      setGbfsData(gbfsResult);
      setGbfsProgress("Done ✓");

      setPsoProgress("Running…");
      const psoResult = await apiFetch(PRIMARY_BASE, "/pso", {
        method: "POST",
        body: JSON.stringify({ machine, candidates: Object.keys(SERVERS) }),
      });
      if (!psoResult.recommendedServer) {
        psoResult.recommendedServer = "B";
      }
      setPsoData(psoResult);
      setPsoProgress("Done ✓");

      setMaxReached(r => Math.max(r, 5));
    } catch (err) {
      setAlgoError(err.message);
    } finally { setAlgoRunning(false); }
  };

  const offloadTask = async () => {
    if (!decidedServerKey) return;
    const targetSrv  = resolveServer(decidedServerKey);
    const gbfsWins   = gbfsData.latency <= psoData.latency;
    const winnerAlgo = gbfsWins ? "GBFS" : "PSO";

    setOffloading(true); setOffloadError(null);
    try {
      const result = await apiFetch(targetSrv.baseUrl, "/offload", {
        method: "POST",
        body: JSON.stringify({
          machineId:    machine.machineId,
          taskSize:     machine.taskSize,
          algorithm:    winnerAlgo,
          targetServer: targetSrv.label,
          gbfsLatency:  gbfsData.latency,
          psoLatency:   psoData.latency,
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
      case 2: return machine ? (
        <Step2Algorithms
          machine={machine} gbfsData={gbfsData} psoData={psoData}
          algoRunning={algoRunning} algoError={algoError}
          onRunBoth={runBothAlgorithms}
          gbfsProgress={gbfsProgress} psoProgress={psoProgress}
        />
      ) : null;
      case 3: return machine ? <Step3SelectEdge machine={machine} gbfsData={gbfsData} psoData={psoData} /> : null;
      case 4: return machine ? (
        <Step4Offload
          machine={machine} gbfsData={gbfsData} psoData={psoData}
          offloadResult={offloadResult} offloading={offloading}
          offloadError={offloadError} onOffload={offloadTask}
        />
      ) : null;
      case 5: return machine ? (
        <Step5Latency machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} />
      ) : null;
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
            <TopBar
              step={step} maxReached={maxReached}
              onJump={i => i <= maxReached && setStep(i)}
              algoDecision={decidedServerKey}
              dark={dark} setDark={setDark}
            />
            <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", background: T.bg }}>
              {renderStep()}
            </div>
            <div style={{
              background: T.surface, borderTop: `1px solid ${T.border}`,
              padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0,
            }}>
              <GhostBtn disabled={step === 0} onClick={() => setStep(p => p - 1)}>← Back</GhostBtn>
              <span style={{ fontSize: 12, color: T.dim, fontFamily: T.fontMono }}>{STEPS[step].title}</span>
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
