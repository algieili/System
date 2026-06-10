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
                    {wins && <Badge color={badgeColor} dot>RECOMMENDED ALGORITHM</Badge>}
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
        <Stat label="RECOMMENDED ALGORITHM"       value={winner}           color={gbfsWins ? "blue" : "purple"} />
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
