import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
  LineChart, Line, ReferenceLine
} from "recharts";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   Dark  — charcoal base, vivid accents
   Light — white/slate base, same accent hues
───────────────────────────────────────────── */
const makeTheme = (dark) => dark ? {
  // ── DARK MODE ──────────────────────────────
  bg:        "#0f1117",   // deep navy-black
  surface:   "#1a1d27",   // card bg
  elevated:  "#22263a",   // slightly lifted
  border:    "#2e3347",   // subtle divider
  borderSub: "#1e2235",   // hairline
  text:      "#e8eaf0",   // primary text
  muted:     "#8b90a7",   // secondary text
  dim:       "#4a5070",   // disabled / placeholder

  // Accent palette — vivid on dark
  blue:      "#60a5fa",   // sky-400
  blueDim:   "#1d3a6e",
  blueBg:    "#0d1f3c",

  green:     "#34d399",   // emerald-400
  greenDim:  "#064e3b",
  greenBg:   "#022c22",

  purple:    "#a78bfa",   // violet-400
  purpleDim: "#3b1fa8",
  purpleBg:  "#1e0a4a",

  amber:     "#fbbf24",   // amber-400
  amberBg:   "#292100",

  red:       "#f87171",   // red-400
  redBg:     "#2d0a0a",

  fontMono:  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSans:  "'Inter', system-ui, -apple-system, sans-serif",
} : {
  // ── LIGHT MODE ─────────────────────────────
  bg:        "#f3f4f8",   // cool grey page bg
  surface:   "#ffffff",   // card bg
  elevated:  "#eef0f6",   // slightly lifted
  border:    "#d1d5e0",   // subtle divider
  borderSub: "#e4e7f0",   // hairline
  text:      "#111827",   // primary text
  muted:     "#6b7280",   // secondary text
  dim:       "#9ca3af",   // disabled / placeholder

  // Accent palette — saturated on light
  blue:      "#2563eb",   // blue-600
  blueDim:   "#bfdbfe",
  blueBg:    "#eff6ff",

  green:     "#059669",   // emerald-600
  greenDim:  "#a7f3d0",
  greenBg:   "#ecfdf5",

  purple:    "#7c3aed",   // violet-600
  purpleDim: "#ddd6fe",
  purpleBg:  "#f5f3ff",

  amber:     "#d97706",   // amber-600
  amberBg:   "#fffbeb",

  red:       "#dc2626",   // red-600
  redBg:     "#fef2f2",

  fontMono:  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSans:  "'Inter', system-ui, -apple-system, sans-serif",
};

const ThemeCtx = React.createContext(makeTheme(true));
const useT = () => React.useContext(ThemeCtx);
let T = makeTheme(true);

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
          background: "linear-gradient(135deg, #2563eb, #059669)",
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
const TopBar = ({ step, maxReached, onJump, activeServerKey, dark, setDark }) => {
  const srv = activeServerKey ? SERVERS[activeServerKey] : null;
  return (
    <div style={{
      background: T.surface, borderBottom: `1px solid ${T.border}`,
      padding: "0 24px", minHeight: 52, display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
      transition: "background 0.2s, border-color 0.2s",
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

      {/* Right: server badge + step counter + theme toggle */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
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

        {/* ── Theme toggle switch ── */}
        <button
          onClick={() => setDark(d => !d)}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: T.elevated, border: `1px solid ${T.border}`,
            borderRadius: 20, padding: "5px 12px 5px 8px",
            cursor: "pointer", transition: "background 0.2s, border-color 0.2s",
          }}
        >
          {/* Sun / Moon icon */}
          <span style={{ fontSize: 13, lineHeight: 1 }}>{dark ? "🌙" : "☀️"}</span>
          {/* Track */}
          <div style={{
            position: "relative", width: 34, height: 19, borderRadius: 10,
            background: dark ? T.green : T.blue,
            transition: "background 0.25s", flexShrink: 0,
            opacity: 0.85,
          }}>
            {/* Knob */}
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

  // Plasma machine: user-supplied image (embedded as base64)
  const PLASMA_IMG = "data:image/png;base64,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";

  // Returns correct image for a machine — plasma gets the real photo, others use Unsplash
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
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.6) 100%)" }} />
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
        background: T.elevated,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${T.text}`,
        borderRadius: 8, padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: T.text, fontFamily: T.fontMono, lineHeight: 1 }}>
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
            <Line type="monotone" dataKey="GBFS"    stroke={T.blue}   strokeWidth={2.5} dot={{ r: 4, fill: T.blue,   stroke: T.bg, strokeWidth: 2 }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="PSO"     stroke={T.purple} strokeWidth={2.5} dot={{ r: 4, fill: T.purple, stroke: T.bg, strokeWidth: 2 }} activeDot={{ r: 7 }} />
            {measuredLat && <Line type="monotone" dataKey="Measured" stroke={T.green} strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4, fill: T.green, stroke: T.bg, strokeWidth: 2 }} activeDot={{ r: 7 }} />}
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
  const [dark,           setDark]           = useState(true);
  T = makeTheme(dark); // update module-level T so all components re-read correct tokens
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
    <ThemeCtx.Provider value={T}>
    <ErrorBoundary>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${T.bg}; transition: background 0.2s; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.dim}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.text, transition: "background 0.2s, color 0.2s" }}>
        <Sidebar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} serverStatuses={serverStatuses} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} activeServerKey={algoServer} dark={dark} setDark={setDark} />
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
    </ThemeCtx.Provider>
  );
}
