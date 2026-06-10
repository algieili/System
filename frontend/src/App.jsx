import React, { useState, useEffect, useCallback, useContext, createContext } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
  LineChart, Line, ReferenceLine
} from "recharts";

/* ═══════════════════════════════════════════════
   THEME SYSTEM — all components use useTheme()
   No module-level T mutation; pure React context.
═══════════════════════════════════════════════ */
const DARK = {
  bg:          "#0d1117",
  surface:     "#161b22",
  elevated:    "#1c2128",
  border:      "#30363d",
  borderSub:   "#21262d",
  text:        "#e6edf3",
  textSub:     "#8b949e",
  textDim:     "#484f58",
  blue:        "#58a6ff",
  blueBg:      "#0d2137",
  blueBorder:  "#1f4068",
  blueText:    "#79c0ff",
  green:       "#3fb950",
  greenBg:     "#0d2b14",
  greenBorder: "#1a4422",
  greenText:   "#56d364",
  purple:      "#a371f7",
  purpleBg:    "#1f1335",
  purpleBorder:"#3d1f7a",
  purpleText:  "#c7a6f7",
  amber:       "#d29922",
  amberBg:     "#2b1d00",
  amberBorder: "#5a3e00",
  amberText:   "#e3b341",
  red:         "#f85149",
  redBg:       "#2b0a0a",
  redBorder:   "#6e1a1a",
  redText:     "#ff7b72",
  chart1:      "#58a6ff",
  chart2:      "#a371f7",
  chart3:      "#3fb950",
  fontMono:    "'JetBrains Mono','Fira Code',monospace",
  fontSans:    "'Inter',system-ui,sans-serif",
};

const LIGHT = {
  bg:          "#f6f8fa",
  surface:     "#ffffff",
  elevated:    "#f0f3f6",
  border:      "#d0d7de",
  borderSub:   "#e8ecef",
  text:        "#1f2328",
  textSub:     "#57606a",
  textDim:     "#9ba1a8",
  blue:        "#0969da",
  blueBg:      "#ddf4ff",
  blueBorder:  "#54aeff",
  blueText:    "#0550ae",
  green:       "#1a7f37",
  greenBg:     "#dafbe1",
  greenBorder: "#4ac26b",
  greenText:   "#116329",
  purple:      "#8250df",
  purpleBg:    "#fbefff",
  purpleBorder:"#d2a8ff",
  purpleText:  "#5e2d9e",
  amber:       "#9a6700",
  amberBg:     "#fff8c5",
  amberBorder: "#d4a72c",
  amberText:   "#7d4e00",
  red:         "#cf222e",
  redBg:       "#fff0ee",
  redBorder:   "#ff8182",
  redText:     "#a40e26",
  chart1:      "#0969da",
  chart2:      "#8250df",
  chart3:      "#1a7f37",
  fontMono:    "'JetBrains Mono','Fira Code',monospace",
  fontSans:    "'Inter',system-ui,sans-serif",
};

const ThemeCtx = createContext(DARK);
const useTheme = () => useContext(ThemeCtx);

/* ═══════════════════════════════════════════════
   SERVER CONFIG
═══════════════════════════════════════════════ */
const SERVERS = {
  A: {
    label:   "Edge Server A",
    sub:     "Latency-sensitive · Compute-heavy",
    tag:     "A",
    colorKey:"blue",
    baseUrl: "https://system-ctld.onrender.com/api",
  },
  B: {
    label:   "Edge Server B",
    sub:     "Energy-efficient",
    tag:     "B",
    colorKey:"green",
    baseUrl: "https://system-1-rcpl.onrender.com/api",
  },
};

const srvColors = (T, key) => {
  if (key === "A") return { accent: T.blue,   bg: T.blueBg,   border: T.blueBorder,   text: T.blueText };
  return               { accent: T.green,  bg: T.greenBg,  border: T.greenBorder,  text: T.greenText };
};

const PRIMARY_BASE = SERVERS.A.baseUrl;

const apiFetch = async (baseUrl, path, options = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" }, ...options,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
};

const STEPS = [
  { title: "IoT Machine",        short: "Machine" },
  { title: "Collect Data",       short: "Data" },
  { title: "Run Algorithms",     short: "Algorithms" },
  { title: "Select Edge Server", short: "Edge Server" },
  { title: "Offload Task",       short: "Offload" },
  { title: "Measure Latency",    short: "Results" },
];

/* ═══════════════════════════════════════════════
   PRIMITIVES (all consume useTheme)
═══════════════════════════════════════════════ */
const badgeStyles = (T, variant) => {
  const map = {
    blue:   { bg: T.blueBg,   border: T.blueBorder,   color: T.blueText  },
    green:  { bg: T.greenBg,  border: T.greenBorder,  color: T.greenText },
    purple: { bg: T.purpleBg, border: T.purpleBorder, color: T.purpleText},
    amber:  { bg: T.amberBg,  border: T.amberBorder,  color: T.amberText },
    red:    { bg: T.redBg,    border: T.redBorder,    color: T.redText   },
    dim:    { bg: T.elevated, border: T.border,       color: T.textSub   },
  };
  return map[variant] || map.dim;
};

const Badge = ({ variant = "dim", dot, children }) => {
  const T = useTheme();
  const c = badgeStyles(T, variant);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 9px", borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      fontFamily: T.fontMono,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, display: "inline-block" }} />}
      {children}
    </span>
  );
};

const InfoBox = ({ variant = "blue", children }) => {
  const T = useTheme();
  const map = {
    blue:  { bg: T.blueBg,   border: T.blueBorder,   accent: T.blue,   color: T.blueText  },
    green: { bg: T.greenBg,  border: T.greenBorder,  accent: T.green,  color: T.greenText },
    amber: { bg: T.amberBg,  border: T.amberBorder,  accent: T.amber,  color: T.amberText },
    red:   { bg: T.redBg,    border: T.redBorder,    accent: T.red,    color: T.redText   },
  };
  const c = map[variant] || map.blue;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.accent}`,
      borderRadius: "0 6px 6px 0",
      padding: "11px 16px", fontSize: 12, color: c.color,
      lineHeight: 1.6, fontFamily: T.fontSans,
    }}>
      {children}
    </div>
  );
};

const Card = ({ title, sub, accent, children }) => {
  const T = useTheme();
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 8, marginBottom: 14, overflow: "hidden",
    }}>
      {(title || sub) && (
        <div style={{
          padding: "12px 18px", borderBottom: `1px solid ${T.borderSub}`,
          background: T.elevated, display: "flex", alignItems: "center", gap: 10,
        }}>
          {accent && <div style={{ width: 3, height: 14, borderRadius: 2, background: accent, flexShrink: 0 }} />}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: T.fontSans }}>{title}</div>
            {sub && <div style={{ fontSize: 11, color: T.textSub, marginTop: 2, fontFamily: T.fontSans }}>{sub}</div>}
          </div>
        </div>
      )}
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
};

const StatCard = ({ label, value, variant = "blue" }) => {
  const T = useTheme();
  const c = badgeStyles(T, variant);
  return (
    <div style={{
      flex: "1 1 130px",
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 8, padding: "14px 16px",
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: T.fontSans }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: c.color, fontFamily: T.fontMono, lineHeight: 1 }}>{value}</div>
    </div>
  );
};

const Th = ({ children }) => {
  const T = useTheme();
  return (
    <th style={{
      padding: "9px 14px", textAlign: "left",
      fontSize: 10, fontWeight: 700, color: T.textSub,
      textTransform: "uppercase", letterSpacing: "0.08em",
      borderBottom: `1px solid ${T.border}`,
      background: T.elevated, fontFamily: T.fontSans, whiteSpace: "nowrap",
    }}>
      {children}
    </th>
  );
};

const Td = ({ children, mono }) => {
  const T = useTheme();
  return (
    <td style={{
      padding: "9px 14px", borderBottom: `1px solid ${T.borderSub}`,
      fontSize: 12, color: T.text,
      fontFamily: mono ? T.fontMono : T.fontSans,
    }}>
      {children}
    </td>
  );
};

const PrimaryBtn = ({ onClick, disabled, children, style = {} }) => {
  const T = useTheme();
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? T.elevated : T.green,
      color: disabled ? T.textDim : "#ffffff",
      border: `1px solid ${disabled ? T.border : T.greenBorder}`,
      borderRadius: 6, padding: "9px 22px",
      fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.fontSans, letterSpacing: "0.01em", ...style,
    }}>
      {children}
    </button>
  );
};

const GhostBtn = ({ onClick, disabled, children }) => {
  const T = useTheme();
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: "transparent",
      color: disabled ? T.textDim : T.textSub,
      border: `1px solid ${disabled ? T.borderSub : T.border}`,
      borderRadius: 6, padding: "9px 22px",
      fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.fontSans,
    }}>
      {children}
    </button>
  );
};

const DualBtn = ({ onClick, disabled, children }) => {
  const T = useTheme();
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? T.elevated : "linear-gradient(135deg,#0969da,#8250df)",
      color: disabled ? T.textDim : "#ffffff",
      border: disabled ? `1px solid ${T.border}` : "none",
      borderRadius: 6, padding: "10px 28px",
      fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: T.fontSans,
    }}>
      {children}
    </button>
  );
};

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
const Sidebar = ({ step, maxReached, onJump, serverStatuses }) => {
  const T = useTheme();
  return (
    <div style={{
      width: 216, background: T.surface,
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      flexShrink: 0, borderRight: `1px solid ${T.border}`,
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6,
            background: `linear-gradient(135deg,${T.blue},${T.green})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#fff", fontWeight: 700, flexShrink: 0,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: T.fontSans }}>EdgeOffload</div>
            <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontMono, marginTop: 1 }}>IoT · v5.0</div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: "14px 10px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 6, fontFamily: T.fontSans }}>
          Pipeline
        </div>
        {STEPS.map((s, i) => {
          const active = i === step, done = i < step, locked = i > maxReached;
          return (
            <button key={i} onClick={() => !locked && onJump(i)} style={{
              display: "flex", alignItems: "center", gap: 9,
              width: "100%", padding: "8px 10px", borderRadius: 6,
              border: active ? `1px solid ${T.greenBorder}` : "1px solid transparent",
              cursor: locked ? "default" : "pointer",
              background: active ? T.greenBg : "transparent",
              marginBottom: 1,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? 9 : 10, fontWeight: 700, fontFamily: T.fontMono,
                background: active ? T.green : done ? T.greenBg : T.elevated,
                color: active ? "#fff" : done ? T.greenText : T.textDim,
                border: `1px solid ${active ? T.greenBorder : done ? T.greenBorder : T.border}`,
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 12, fontWeight: active ? 600 : 400,
                color: active ? T.greenText : done ? T.textSub : locked ? T.textDim : T.textSub,
                fontFamily: T.fontSans,
              }}>
                {s.title}
              </span>
              {active && <div style={{ width: 3, height: 12, borderRadius: 2, background: T.green, marginLeft: "auto", flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      {/* Server status */}
      <div style={{ padding: "10px 14px 16px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: T.fontSans }}>
          Servers
        </div>
        {Object.entries(SERVERS).map(([key, srv]) => {
          const st = serverStatuses[key];
          const online = st === "online";
          const dotColor = online ? T.green : st === "checking" ? T.amber : T.red;
          const labelColor = online ? T.greenText : st === "checking" ? T.amberText : T.redText;
          return (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px", borderRadius: 6, marginBottom: 3,
              background: T.elevated, border: `1px solid ${T.border}`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 11, color: T.textSub, fontFamily: T.fontMono }}>{srv.label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: labelColor, fontFamily: T.fontMono }}>
                {online ? "online" : st === "checking" ? "…" : "offline"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TOP BAR
═══════════════════════════════════════════════ */
const TopBar = ({ step, maxReached, onJump, algoServer, dark, setDark }) => {
  const T = useTheme();
  const sc = srvColors(T, algoServer);
  return (
    <div style={{
      background: T.surface, borderBottom: `1px solid ${T.border}`,
      padding: "0 22px", minHeight: 50,
      display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, color: T.textDim, fontFamily: T.fontSans }}>Simulation</span>
      <span style={{ color: T.border }}>›</span>
      <span style={{ fontSize: 12, color: T.text, fontWeight: 600, fontFamily: T.fontSans }}>{STEPS[step].title}</span>

      {/* Progress pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 14, overflow: "hidden" }}>
        {STEPS.map((s, i) => {
          const active = i === step, done = i < step;
          return (
            <React.Fragment key={i}>
              <button onClick={() => i <= maxReached && onJump(i)} style={{
                padding: "3px 9px", borderRadius: 4,
                fontSize: 11, fontWeight: active ? 700 : 400,
                fontFamily: T.fontMono,
                background: active ? T.greenBg : done ? T.elevated : "transparent",
                color: active ? T.greenText : done ? T.textSub : T.textDim,
                border: `1px solid ${active ? T.greenBorder : done ? T.border : "transparent"}`,
                cursor: i <= maxReached ? "pointer" : "default",
                whiteSpace: "nowrap",
              }}>
                {done ? "✓ " : ""}{s.short}
              </button>
              {i < STEPS.length - 1 && <span style={{ color: T.border, fontSize: 10, userSelect: "none" }}>—</span>}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {algoServer && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: sc.bg, border: `1px solid ${sc.border}`,
            borderRadius: 4, padding: "3px 10px",
            fontSize: 11, fontFamily: T.fontMono, color: sc.text,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: sc.accent }} />
            {SERVERS[algoServer].label}
          </div>
        )}
        <div style={{
          fontSize: 11, fontFamily: T.fontMono, color: T.textSub,
          background: T.elevated, border: `1px solid ${T.border}`,
          borderRadius: 4, padding: "3px 10px",
        }}>
          {step + 1} / {STEPS.length}
        </div>

        {/* Theme toggle */}
        <button onClick={() => setDark(d => !d)} style={{
          display: "flex", alignItems: "center", gap: 7,
          background: T.elevated, border: `1px solid ${T.border}`,
          borderRadius: 20, padding: "4px 11px 4px 8px",
          cursor: "pointer",
        }}>
          <span style={{ fontSize: 13, lineHeight: 1 }}>{dark ? "🌙" : "☀️"}</span>
          <div style={{
            position: "relative", width: 32, height: 17, borderRadius: 9,
            background: dark ? T.green : T.blue, flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 2, left: dark ? 15 : 2,
              width: 13, height: 13, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s",
            }} />
          </div>
          <span style={{ fontSize: 11, color: T.textSub, fontFamily: T.fontMono, minWidth: 28 }}>
            {dark ? "Dark" : "Light"}
          </span>
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   STEP 0 — SELECT MACHINE
═══════════════════════════════════════════════ */
const PLASMA_IMG = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAFGAVwDASIAAhEBAxEB/8QAHAAAAQQDAQAAAAAAAAAAAAAABQIDBAYAAQcI/8QAVhAAAgEDAgMEBQcHBA4JBQEAAQIDAAQRBSEGEjETQVFhByJxgZEUIzKhscHRFTNCUmKU0hYXcpIkQ0ZVY3OCg4STorLh8Ag0NTZFVmTC8SUmU1R0o//EABoBAAIDAQEAAAAAAAAAAAAAAAABAgMEBQb/xAAyEQACAgEEAQIEBAUFAQAAAAAAAQIRAwQSITFRBRMiMkFxBjNhgRUjNKHhFBZC8PGx/9oADAMBAAIRAxEAPwDnEnG3FuCRr14N+4gfdQrUePuM02TiO+HsK/hUSeROVtx5CgmpOCarGyzWHHnGkp9biS/I82X8KKDjTi7A/wDuC9P+UPwql6MvMKMoARSY0HBxlxd/5gvf6w/CsPGPFx/ugvf6w/ChCJmldn50hhUcY8Wg78QXv9YfhS/5ZcVn/wAfvv6w/Cg3Zms5MCgApPxjxbjbiG9H+X/wqJFxrxh8oXm4iv2Hhzj8KHXWwNChKROKkhdHWtD451xUUTX0k2+5fBp7iDj3WWgK2s/YtjqvWqBpszcgINS5WLk81JyHQi94z4zySnEN6m/QOPwoZLxtxwP7pNQ/rj8KlSwoxO1RJrRD3UKQURZOPuOUOTxLqI/yx+FIPpE436/ym1D+uPwpF7ZJg7fVUBrEGPI+ynZGgj/OLxuf7p9Q/rj8KUvpB41JweJ9SPscfhQJbIlj3e6liyYH/hRYUH4+O+NWO3E+pf6wVPsuL+M5HVP5Saq5PcHzVYhgKHJFXL0eX1jputLPfKGiB8M42qLbJJBA6zx32Bc6zrKAd5zj7KCXnF3GlvIwHEmpHvx2tejtJ4h4X1C1VFuICDsVcYx8aD8Y8OcI31lJM0Vpz4OGTA+yobmS2nn5uP8AjFcc3Eeo7+ElaHpC4uA/7x6j/rKH8R2MFrqNxDbnmjVzy+ygUkUndVkXaItUWp/SFxiRgcTagP8AOD8KizekHjZTtxRqJz/hB+FVdllHjWuSQjJqQizx+kHjbv4n1L+uPwqQnpC4zOx4n1L/AFg/CqiqN1p6OEk7nagEi2Nx/wAYkf8AebUv64ptuP8AjT9HijUv64qvRwqdiDU6y04zSIkUTSOeijqai5UOrDUHHPHDpkcS6kf84KS/G/HAO/E2pD/OCjmncEa9JAHTSLgqRnPLQLiXQdT06Q/KbKaD+mhA+NJTsNo4nGvGnfxPqX+sFSI+OOLlHrcTakfbJVNeWRGwc5rPlBPU499NiLyvH3FQ/ui1Db/CD8KlWXpK4rt5lk/K1xOB+jIQR9lc+Evfmt/KgNvvophaOpXfpc4rnjCpNBEf1khANA7jj/jWRs/yhu08lK/hVKF2c4H21p7liNs/GmrCy1ycecaj+6a/HscfhTB9IHGgO/E+of1x+FVguzDc1rbvNAWWdvSDxpjbibUR/lj8KZf0g8cKf+8+o4/pj8KruVpMzAjYfXTF2WQekLjhtv5TagR/TH4Ur+X3HH/mXUf64/Cq1DyruaeEifq/XQI9PelfgXRotCnvLe3WJ4lzlBivO1/ZeuMV6+9K6r/JW7GRnsm99eW7+AGQUpcDSsj6bp/ZRBht99WjSOBuIdTt/ldpbho+oBOM1EihAtE9lelfRraRnhq0Ypk9mPsqK5Y+jzffcN8Qae/JcaXNkd6jI+qh06zwNyz20sTeDqRXr25062kly8KEeyhmq8NaTeNGstpGcdPVFScA3HlVXXoVwa2SpHSvSesejjQroAm0iBxthcVVr30P6ZIzNEXj2/RJpbQ3HCL0DlzQFyRcew1fvSJwlccOXITte0ib9YVQuRzcdOlC4B8lj0sZjBqfy5OKG2k4hiUGpa30LD6e/hUBjjR4zTLrtvTyTI/fTihCGYn1VGTTGCL0eo1QlBMWKs0jaG7Dl+V7d7xqc/XgUpZNLQfNSXSjvCxqtS2iKvb28jsQsTk+Sk5ohDo184yLSYD9pOX7TU7W721stM+VxSXLyM5jRHf6RxnOB3D7xVPudd1NiWjnEQH6n40bRN0WOXQ7nl9ZoE/pSgffUX5AbY/OX9pF59qSfqFU6W+vJnJnupZcn9NzTTMTuzU9li3HQbbVrW2TkOqQbd45vwrV1rlu8ZQawuG7sv8AhXPS6Dqy/GsE0Y25hT9pBvLTPLZyuSb6Fj3k8w+6tQwWkhwLq3I/xuPtqsdtH3GtdunjT2UG4s0+mZPzSiQfsMDUae07NcNEwoKkw7psHyNS4dQukGEvJNug5sj66jtY7Q72Y8KU3qdBtSo9Slfa4gtpfPkwT7xipKT6ZIMvG8DHpvzL9dFMENW3Kx3FWTh25js7qOfkDFCDjPWgL2/qF4JElHgp3FZBNIg6b91QlEkj0dwz6T9Git44bu2eIhQC3dW+MON+EtQ0t0WaNyf0SmSK88xXsmcGnpbxuXeo7R2RtWhiknkeNAFz6vkKCTwYJxRS4mJBofMxbNWLorZD3G2azGalR2xkwQKeNqVXpTsKIABHQ04pOadaLHdS44eZgBiiwSGsnxrWCT30/cQmLritQle/vpiY0sRJwM1JgsJJBnuqZZqnNtvivQnok4a4Q1HTI3urW2nn5QTzkZ+FQbJxR50m09ol3qMYGB616m9JnBnCEejyywWdtbyqCVaM4xXmu6Xs53RSOVSQPVztQmEonor0oQcQWelFZroSRcoBO+cVxW/chwdutelPTSgOhtjBON6856pDhAeX6qkyKCFmzSWyjGQB3V2PgH0iaRZaVFZXswhkjAUAjauScNIHi3wSBQjXwUvumRvUU+ST6PUEXHvD88yKl7CebxbFEG4j0mSaNUuY2JPQMDXj5bgAgcoBHTyqRDqFwJVZZ5VYdCHORUtwmeyZNTsXIAnTPd6wqXbNDIhIdSMeIrynw7ecQX99GkGqXPUDDPmu16NovFCWIkGoZJHRxmmpESo/9IO3V5YuVgRXC2hX5URvua7T6RdC4ivGBuZFbk6AdK5ta8J63c3wBQIM5zg1EkWL0b8EpxPK3bsRGm3KO/8A5zV7b0Iab8r5laUDwD7fZUL0b3M3B5dL9OdGPNzju7vuroA9J/DwcK10qsdtyBQkDZxL0kcC/wAmpY/kkjEOcYZs1UzFJBG0bsSxO9dT9LHFGn65PAtmyyBDzMQQR7K5lIxdiz9Tvg91SSFZE5cNSgCNwMgdR3n2U4wAGdqyKeK3Sa8kUOltGZSOoJH0f9rH100Fla4zuA1/8nifK2kXKfN8+v8Ah7AKB6dDJcYRQWLtgU/IWlZ3kHOzEsxO+SetWn0U6bBqXFkMEwCwxRvK642OBgfWab4QLkrTcPXKsTNKqeWKbl02KP6TSH3j8K69xVo0Vs5KFSM7gVRNStkEn0VHuqtZOaHtK9b6dZufX7QD2j8Kfl0rTVXKtNnH6w/Cj2m6YLlvo7eykapo7QISAdqbyOw2ori6TaSHlDSD3j8KUdBgP0JWHtGamRW8gY4yT51spOH2GfdT3vyG1EFOF55T8y8bH4UO1fS7zS5FE8ZQNnlOc5x/81a7ee5iXCpn3VD4qllutPiacD1HwD7Rv9gpxnKTpkXFJcFSW4lXo21PJe5wCMCo7py7YpIGetTfAosOyzm3aF0X1ScMaPQxrJAsniBk+dAtOImsU7QBuXY533o5pDOwaHBONxVUyaZKsNIu76bFrbyyj9ZFyKzUdJurcFZYZI2HUMpFdP8ARBxPpOjRm31CEpltm5KuvGXEPCF9pJ5JrfnPRSu4rNvaZcoJo8wXMEqHyqHytz4NWjVewaeQRqAvNtkUHjhVpj0NXp2ihqmOWLxxIOYDOO+lyzRPnYVZLDgPiDUNMbUbfTHaAKSGzuRjqBVevNJuraRkkidSux9XBFJNWSd0D5+XqKYjcowO1OzRkHG5p2xsXumCqDkmpEBi5k7QZ2qMAR0ozfaVLags6Hl9lQVRSNgPhTGbsmdXU5q3aHfvbY7KV4zjflYiqtEOTfFELGU5qLRJMO6vq1xNkPO7DHQsarszxs+Tt7KnX6h7fnX6VCzFIT9A/CiKCTZ629MrqdEYBhk74rz7qw5oRgV1XjC71C805xcYC+dct1XEcIz1okxJE/hiNhGT5UI4gkjF4VPU0a4WlBXl8RSdQ0Fr+YyKMHuPhULosq0Utiva4AJJ2AHfT8ETFwVVmU7ZCmrVo/Bhft9SvP8AqVohYq2xncdI89w7yfD202003qqkpUKAAqeqF7+lWqNoqXDDXo7msbC/We/uYoEBG8jAfbXpvTLuzfTY3S4g5HUFTzrv9deRjdXWR/ZEuQdjznam3uJwebtpM+PMd6ajQNnW/TT6Rl4evhZWGlPqUpxzMAxQZAP6PtoBwbxDfa5pa6hJpUNtK0zLyYcAKNs4O/WuePdXWABczADoA52rBe3g6XdwPZIRToR2yeze7i5pnbJHRUGB8Qaq+rcIW9xIztFc4ySWAA9/SuevqerLGexvrjY7807DA+NOrqWog5XULsHx7Zs/bRQAfW9XXS9Yu7O005pIYZORJGYgt8NqHScTSk4OnqD5sauUGr6uBhNUvlHlO340/wDlLV23OqXp/wBIb8ad0BQjxK5PKbOIDxEhp2fUob7TOxZVjEpDyAODsp9XqPEn6qvo1C+YeveXDDwMhNbF7csRmdzjbc5osDljnS7dRlZPI9ov4VN4T4oTQNWlu9OhSSR4jGwd+bCkjwx4V0KQtIfXCN7UBpv5FbyN85Dbgdd4l/Ck3Y0wHe8fQ3UMTXEHryE8wRiMY7++o8sbX8MV1bRSSRSrzKQpOR7qsurQ6VpNnEbiztHurgghRCvzcZ2B6dT3eyhMt7qWm3Rtorj5oDmhMSKqtGehGB/z7jTUIPsHJ/QM8N6HeJYteXFs9tbIMtLOORRQ7ii80y1V1klklAUFWt4+0DZ94xR3SeK7i+0BdB1OC3vVVueOSVnDnyPKR0qHdQ2E+O10WzcA/pNKR9b4rtaP0WOowe5F2zm6j1B4suxordtpTTxJPbCRkkGcMoU48OtMx6ZrbajGkOlwvGG3yRnHxq5QzQpyqljZoFGAFj6fEmnIdQlt5DLbRW0chGM/J0b7Qa6q/D+HZ9b+/wDgwL1TMpVxX2/yAdR0jXjasNP0+NJGH0jKg5frqjcWadxBp8cUWtyBu0JaNVkV8Yxnp06iurvrGpO3M00YP7MKD7BUC8Iu35rlUmPcXQHFRX4ehVJ0yz+KyvlWcSZTIT6jfA1pbWZvowSk+SE12uO3RQOzjRB3BVwBUuHKEM5yBvg1H/byrnJ/Yb9Vb6icf0S2usSo1vMFwDns2wN8eFEWS8iw0KzRsRjIUg12C64juzaNaJFbRxMAG+YTJwfHGaDy6hJjfsj/AJpfwqC/D6+siX8Ua4SOZx2GuSShX1OaAdR2jsKk3+natBAC2us/sLV0JNVnS3FuOx7IEnlMCH7RUC7mSXZre1I8Pk6D7qzZPw/nviao0R9TxtcxZQ9OuruN2tb3kuVYbMeoolbwdnKoxkdQcVYZbS1mYE6dAzAYHLEM/VTi27BAsel5UeETfcarl6Bmf/Jf9/Yl/EcfhnUeDfS1pOl8PJpt5YOXjj5eZeh2x0rmfGvE1hqeozSwRrGjkkDABpPyO5Zcfk2dQR+jHIKiT2F7asI7u0eSGU+pI8IG/hnFZdR6Ll08N7af2/8AC/Hr4ZHtVlUmIlkJVfhRrhcxQ3itMAADvn2U5JpHYXAdo+SM+NZ8kQSeo3rGuTLh0a++Q3xLPYXcASIDm6VT721NuQeTY0TjhEepIJSeQnfejHEUNg9rGYW9YY7+tCdAyqJADEWxiosE/ZSkYzvRd4z2RUbChEluUlLNUiNB6C7tzZjmAJplp0JyqbVHtUQRY5dhUteQD6IqH1JFt1ri6+uNNwRlRk+6qbcas8qHm76N28aPw+7P1wap5Ks7ID0qW1EbL9wjKrxBs91W/TJUBPrDNcp0u4uY0CQMRgUb4f1Wdb1Le4ZuZnA+JqqcG3wWRkGfSbxsdO06fSbUBMuYXC/ogZzjzJrkq8U3QUBXuvP53FTvSDMLh5Js+tLdMx+s/wDuqqRRFwceNakqVFVh4cU3R/Tu/fJWHim4H9tuP69RoLSPky2fhSjaxHoPiBQBIHFU2N2nPnsaUvFUwP05B7Y1qIbSHvJz4YH400bSMj82KACY4tlxvLIf80lOrxc+B843viWgptIx+gKQbVP1KALAvGEgP55ffFmnBxrMNhLFjzg/41WmtE/UpPyVP1aVAWleNLjP5yD/AFR/GnE42uVG0kH+qP41UTaLjYVoWgPiKKAuY46uhj1rf/Vn8akWfHd38qjKpay4YMUMZwwHd76oZsx505a2vJOrISrZ60UB08yT6vdPf3UzMZjzEnu8vd0pzifUbSDSLSJUD3CSMEY74jxuPZnp7TVft7mZLBY+cgZzQ3UXZ5UDEnAJHvpoCfba3dLcx8gjUB1zt13q3NxFc7gQwL/mlOPiK59D+dT+kPtqys3rn216P0KTjjml5Odr4KTVhVtdvSesR/zSD7BWjrN227Bc/s4H3VFtLG4uVLRhOUd7Ny/bWXVrNaFe1VcHvVubNd+8lHNUsN7bVkj8pz9cb+2sGp3A6qPrP31CHWt0vcl5LNkfBOGq3OMYT3ilDULjPVPdCh+6oAG2aWvWjew2IIpf3BIwU98SD7jUhL+5XcSAHyjX8KGRttmnVc7VGwpBaHVL7uuJB7MfhUuLVdS7r+5UeAbag0TVLiYYqD5ANw6pqbHB1C7x/jjU2K6vGwTfXJPnM/40CtnHOKKW8gAFVvjoKJzz3OBm5uD4/OH8apXpLvJxZ2KCabJu0x6x8/E1bi/N31SPSU8ZXT1J6XAPwBrJqvyZfYtwfmICwy3EzBXmkYYzhjkVJgVlYEjpUSxuI4WEjYI5cb1I+VxyesuBXjcnLO5HojXXNJcHlbFKtbOaWQAkkA71luUN1kt399WPTux9Y+rmq26JJWQodPXGGwMb9arusQ8k7DuoxfS3I1Mgc3Z4oDrdwwmHqmpp2IkaVaPcEeqSKscWjIEHMMGg/Dt9yp9BvhRl9WYt9FvhUW+QGtPsb64tzaRc3Kw86T/IO7QGQsw88VJ9G97JdajiRsqO6uk6vcLHZtyhdhU/qRfJzTSeHLiN+XOcdTTs2gzwXiXfPgRZc79ygmn5Nc7K8ZM4we6o91qzyQXg7TZbd9v6WF/9wpU7Gc54rbK28RGW9Zj49w+6hVkmY1wOshz8BRDiV+e9RQd1THxyfvqPZryfJx3FeY+8kfdWh0Von7BaYe5QOUZ0Ur1Df/FSwFb1R1zik6VfQ2iXbm1E0sz5TnPqrv3jvqJIYE8RH5xPccfdWc0R/TT/AFgp6y0y5vLK/vYo0W3sYllmZm6BpFjAHicsPcDRaHQBf6LHc2Wp2lzcRPDFJaCGRXRpWCKMlQrescbE0UAD54+50/rZrXXoNvHFENd0a0048lvrlhqMomaJ47ZJRyFTg5LoB1HcahvZJDcD1ub5oSZB2yQD99ADXLnurOTyp61hkuJ44IuXnbIHMwA2BPU+zA88U/f2M9lKkcpRi5YAqc9Dg5HUdKdWK0QjHsds4GceNT9SSwe0t/kWk3tvcy5w3aGRJME5Kry0Qh4W1B7cv8wHYfNozHmB+yoakx3QtY7qeGeEkKkoxyk9RkHpvVuXT5cNKcashDLCd7XdAkJkZpyCP55dqkzqkeEjlMwHqsxXlAcDce6tWo+dye6qaLOwiueRRnO1RLve4Oeg29lTDtIq4PTHSh00qvKzc2xb4UALRGSeLmBAYgrnv3qzhA3XvqsafbyzXCupd17TmOegPfirT3+Fej9DhJY5No5+ta3JE2DE8frK9wy/ohuRUHt8aW3zMLo8DRow2UvzAnuIP21FsuUShH3QnJAOK3eNiVok/NqxwM5r0TfwnE9r+Y4/uRmPKCa0jc2d6TOfmyO+mrR881UG4lg+dLBFNgZpSnAoBj8ZwvvpTyCONpDnCqWwPZUcPik3b/2HMf8ABN9hqMnSYkrFaBrEWp26PHG6MIwXBxgHJ2Hw76LxuapvAeVtpN/0V++rVG2RjNZtFOWTTxlLtlmaKjkaQRgkIYUQimxjfNBg5Bzmnop/OtDRWGlnOOtUz0jBHt7eQvysj5A76sPbYxk0C4sZJbGZioPKu2e41nzxvHJE8bqaKzcNy2yhgF26ZqELt4xhDU+S0+UBAWxgd/ShNyoSblBBxXjlFOR2JukPfLJic7Zo7wneyPqCJKx3YDc7darI607FdvbSiSNsEVbkxxoqx5HZ3Sz4fsryxNwWQuBnuNc74i063F2y7bNirDwFrkkmmMJpwPVOxNVPiW//APqDAEnLnpXOdpm5eS+cEcO2FxYByFZvMA0fbhCzz0QeWBQ70fuyaSrnO9WKe+AkIzUkJ0cN4A1RbC7Z5D0q3ScY2t3cm1IwTsTXPIZnV3+bznvpiyjYaqJcbE9c1a19Su6L1f2CGXtxvnc0KvWVIbrlGzIqf7QJ/wB0UTjv7YWoVpATig+qyq9uWi3DS4HuU/iKUXyNopmtf9oyn9XAHwFZanMkQP6MagfDP30zqb9reTlNwznl896kQDM7MOnMasIhI3Eot1hL/NxsXVcdG7zQ+Dl7FT3kZNPTBpLWREGSRtWrSPliKyQM7d2D0+FAFt4Q0221DTdP0/5dLFcaxrcVi8KMMdgoQs5HiGccvmDWXuo6lper20GncLQ6TIl6l5HbmCcyXJiY9mZAz8xA6+rgZyarenR2n5Stvl7TwW3ajtZEjLsq9+Pqqbq15ax6zLd6Pq2oRpBGhtpZXbtSxAyAwAxjxp2AQ4l0+G40XR9StdL+R6pctdG5trd5WUwIyKk2HLEZYyjGcerVdImRmimQowCjlIwfH7AKn2+sXkuqx399ql/JKPVebtS0vLjBwWJyenWoUzvPIZpHLSOxLMxyTt1NICdounRahcmCXtMEYUJKkeWPTJbbHX6qftbeysuKbaKFXCjDESyK5JIJALLsdsVD0m9+RsSZbmBiwPPD3jB2OGB61EvZTPdSTF3k5jnmcYJ+s/bVmGax5IzauiM47ouPk6V28SoXOFC7k+Arlet6j8s1mWcZAaQgHvIFStZ1HVXgjiluu1DLnlBG/vHf7aDW0Ek10sfIS7n1VG5Jrq+q+qR1rjsXCMOi0T09tvlh65uRNDHzXDkhI/msd5UZbrjuHdmt2YBffwobH2wYCXPqEjBGCP8An/nFEtKBO/nXHbs3pUqCaPiVd/P6jQsKudwKIOwEMrZ25aHZGKTGHdHR1t4yAAhznap/fTFiCtpGp2IUU/mvdaXGseKKXg4mSblJs2NiCOorTEliT1JzWZrDVzZCldjM30TTNl3+2n5NlOajWf0iPOojRP6HasrRIrY+jQBomm71j8huP8U/+6aUxHP7qbvsfI58nA7NvsNV5PlZOKtoG8GbWjkeC/fVjiY1X+FojDY4YYJCH/ZFHFbArP6d/TRJahfzGSi+1YslRuY99bDgVqZSTO2yBvQriBubTbj+j94qUX2qBrpH5JuN/wBEfaKqzfly+xKHzIDXIlaMLExBoZLDcBi7L7TRKSXlfHidqy4u1eJkz18q8VFSTtHak0+wO7sNqyKFpmwDilyQhmJBHxpy3hZWz0881bJyaKopIl2N1d2J5IwWXyqRbTLNeK8653zTtpLCkR7Tc461CuXUuSnSsThJs1LJFKjqeh8RadZ2KwlsCsvOJLBpyRIfjXIleYygM3q+2nd6fttMW9Mk30sUSZB3wDQxbxWbAG/tpOorJ2QL83TvqDZKDKNt61WvoZ+a5C3yl8fSPxqckjDS4yd/XLj7PuoRIGAGx+FFJPU0hQ23LCdz4nNEpDxorSDnuFGerdffU21ORnzzUKAYZT0wc1Mt9kFVFpJRZJblYo0d3KlgFXOw8qVfwNBP2RIbYMjFeUMCOoyOnd7qmcPzQW+rLLdxo0aFW5ZASjAFSQcA9d63qF1BPrjSokUMJlLKFTCAFi2BkeYqaimrsg5O6ITWssfZ9rDNGrrzKWUrlfEeNYTMqq/ziBs8rHOGwd8b0c4iv7a8vbcRwCBVwWVZQ4GwGxBI8TgeNTONrmOS1gEaXUYCYEM5JVG5m3jzsFxy9NjTePt30RWT5bXZV2d2yXIflGSSoOBnHePEik8+OpA8cVdeHNI0SThKW+udRjGoc8eLF4fz0TMCx58ZxgN0IwUGc5qn2lur3MEblQC6ht9utRhHdJLyWNpJtkmxs5JUNxNFNHaLu84TKrSZ7WFLWG4S8glaTPNEocNHv0YlQuT12Jq7yOsEMsShhGEKMvQcu+furmkWogXVzGu0bpICvcTg4Pxro+pen/6JxV3Zl0mq99N10SktncN2cRflXmblXPvptbGeW3NzHAxiRsO4GVB8DV64XsLP8kxSzwRTtNHzymQZ2PcPGq7qOmwJr0lrFKDFhioJ3X1SR8CMe+q9V6fl0+KGaT4kGHVwy5JY49oDqiqPV6d1ENNACkeWagZBXOR0onYjEWcb1gNZl36tq37WF+uoajLAeJFTb/At0G27Hb3VGtVL3Ma+LCp41umkRk6TZZIvVRR4KBTg6VoDqD3Hb2Vuvf0kkkcJ9mVlZWmOKgySGrjZDUS3cCQ52qRdt6hocrESUm6JUE2lGcc1b+VRxg5JOBk/sjz8KHXUyxRNKRnlG4pMlsMpHN2ci8ivIRuHkbc+5RgD31izamamseNcstx4003InQ3tvPJiKVHJ8DTPEcxh0ifb1mATbuztQbWFSyEV5aoI2RwGCDAIqRxVdCXRYpFIHaOp2PXYms+XUzjDJGfaXf3JqCcouP1CWiyI/MqZwIozuP2cfdRQN5UB4ZG8p/YT7KOCrPTG/wDTR/chqV/MY5nzrM03WZx31ubKkhzJqDrpzpUwB6gD6xUgydd6ga1Oo02UY7x9oqnO/wCXL7E4L4kBbuOSTHISME5qNOkpQlcn2U7dXckSkxr1NHeBLdb+ZjcA8o6ZHlXicuoWHG5M66we7kSKqsd6TtC5p1Bcx47VGWuvx6bp0S7x591VHjmOCM/MxhQT4Vh0vqbzZFGjTn0PtwuynNLITgE1DkuJVkK/fUiMntDnxqHcMRMSa6eSTT4MMEmuSdaCSZwM8tSjBID9MVDs2YrgMRTpWXP0mqrfIs2RF6vdrcRgKOXFQ7KPDA7UW1C3hiVAF6jvqCwCuMU4STfAZE0h5p0UBSucgj6qma2W+RSqq9FVcDywDQ1olJUkmpD6nJDOS8AmDZVlzjYjqD4ipylb4Fjgoqwfa2rMMyukKEMAzkgZ5Sce/GPbTilcAfRzvg1IjexmyHkulJwSGiDjY+IP3U+gskHq3agefOp+GKgTIUbo5wrKcbHDUsLyk5zv03NE4zDIvKt3GxPQGcZ+BpXyVmHqqJMeCocfAUACywA/5++sVmDBgwOPFRkjwziiJtMfnYVz48rD7Dj6qZNmxHqxOx8A5/hoASNRvBaGzE7rbE57MO2PhnH1VEGVwFOMdMbVJW1bfmjlU+Gx+3FYbYDoz58GQD/3Gj7AzWr6le3GnLbpduC4xKOQDOP2s5+qgsNsoAJ5g/MM46cvfRaSFhsVJ/yaZKqjYJAPgSB99WZMs8rTm7ohHHGHEeAtp2tXtjpR7NYXEbcis8mCMjP0euPPpQhJJ55Zbu7jklLbc+4UN458vDvpTwZ3ZQT0zmsCuq8uXK9cDp8Kll1GXLFRnK0uhQxQg24rsVjfA2ovafmvbQqJWdx7d6K255Yl86pLBnUyOaNe8Ams0kFr9MdwJ+o03qJ5rj2CpOhqWumcforWrQR36mC/UqzNKDDynYeVZSQeUb99Nyzqn317d8HHSHeYUmRhioj3qDpUa81JY1HTJ2G9VzmopyfQ1Ft0SLw+qdxQ7tArHrTE2oM4Oy/Gki3uLiVY0DGQ7hUHWuZl9TwpcM1RwSvk1rNyq2YGCS5xj31K+UxR8yElAG2BfPcD4UOntYyVjmu4QVOSAxY/UKkSXNiGPKss7E56BO7HnXJnr6z+5FfQ0Rw/BtE6yyyaZLyurZI6e0GompzK2l6dahsSrg4ORtipJvhylUt4sftZb/h9VQtVmeeAhyAOo5dsfCqNRrJZW35VFkMSiiyaM0sbyCUYBVOX1vxNEDKcnFVTTSzxQM7MxDYyTVlXpXW9KzSljcfojNqIpSseLtWi5HWkcxrCc11GzMKz30O1oj5GwzvkbVOJJUjyxQzXUlHLJH9AYDVl1TrFJk8fzoGzNHyZOetW30bgPkgH/kVVJIVkzzPjNXH0dGKHIJ+Psrwmu/JZ3NN+ZZeVt1YAsRVC9JA7H6PjV6L7ZVgaoPpGk5iA2NjXL9Pi/eR0NW17TRS4iWyxB6VHuEJOSDU6BkCjNSVa3YYZQa9LJ8HFiuQfbAouTUgTADoacljVzhKR8naq00yyjquqcP6PMvMWUN4VWdS4f09fzcgIFBZddv5tlzv55oXd6zclmiZmB9tZY45p8MulOMlyixw6TZOQitzHNVHUdpWVR9FyPgcVdeAYjdsGck5x13qm6uhS7nH6s7j/AGjVsLUqZB1Voiesf0c0pWKj1sg+yiXD9nbX2sWlrdzSQwzTIjvHHzlQWAJx16Z6A1bNR9HF+bW+1HTLntrC0e455JVUcqxwJKpyrENzmTkUrkHGe/AuKyhcy+VZzYOUbB8tqti+j7XZEkaGTT35LeOfBuOXn51kbkUkcvMOxkByQPV61B1bg3XLPUrXThbQXlzcwieJLO6jn5kKhgcxk4GCDvjrQAHiurlTlbmRfPmzT8ep30fS55/6SKw+BBpDaRfI5RrG7BGduxYnZmU4GP1lI9oNRZEMchjckMDhhy7rt30AEfyxeN+eS2cf4sA/7OKz8pKRg2yDPXDMD9ZP30OVCSMnAI68tZkgbjek3QBFb23bZ4JVHiGVvtApXbWRG080fl2Cn6waFl8AkjFNi6izgmhAEwIs/wDWYCPEoQfspaRI/wBC4t8+cgT7cUNWRG/TX3GlHlYbEEUwCDxtb4aR08RyyBs59hqbHdRFVHMNvKgB5QRgDbwqYuygeIzQBIuZQ0zEHIJ2ohoD/OTf895oQaJcPnM048AD9Zrf6Z/Ux/co1HyMMyPtUK5bJ61Kb6NQrn6Veu3HMSI7nGTQPXHJMYHjRi4Pq0D1U5Ke+uf6lJ+wy7CvjRDDsDkE/Gp2l395DcMYZSheNkJJ7iMHFDx0p+y/Pe7NeVfR0QgDkfdWfog59U9KxFLsqKMljgD21e9J038noUtLfS7q5jAF1e30g+TxvjPZxjYMRtkg1o0mknqZUukZtVq4aaPPbKLnIznNJdQwKtuKsfGccEdzHHNp8VnqIPNObZswSIRs648Tke6q2CFkAc4FV5sPs5dl2W4M3vY1Oqsk6HGxcqvrBZOnhVm9lV7hrDXFwVbOJNh41YF6V2/SopYm19WZ9S7kKXrSjgUgHBrZOa6bMxrvzUHWD/Yw3/ti/bU49KH6v/1ZP8Yv21l1T/ky+xbjXxIa0+3SZHZzjlbapTXLWKH5OcnyorwXpiX1pcSNtyyBemc7Zow/C0LHPJXiJ05OztQ4jwU6HifUlk5GDAe2nLqdtVx2vWrYnCkIz6g+FLi4aWOQMF789KjtgnaRK5NUyiT6NMwzGp602NFu+XYGumx6akZwVHwpz5BCfpKM+yrfcZFYkjl8OnXkX0kJFTEtZ+XeI10X8mWzb8o+FKGmWwH0B8KFNtg4pHM9JhuUAAgz37io2v6W8RFy645vKrlw5qlncFUaMBhtg0n0hQINPV0x5Uk3vFw4iPRnGAikeX21RuJWEWpX6Yxy3D/75q8+jd1WEA+BqlcZrnXdUzsBeSA/1jVq/MZD/ggXa6i8EyywzPDIhyroxDKe4gjpRiDijXVMrDWbqUzFjL2snOXJxkktnP0V+AoFDaW0n0bpV2/T2pTaawPzU8Ug8nH31aQLg/pB4lltbi2u7tbqOeNo5Q+ULIyyDkJUgFQZXYDuOMbACo0HEcNxq4udSsea3lsI9Pmjtn5JOVI0QMpIIyDGp32qqNaXse/I+B342pstdRn1gR7aAOoWPGelW+n2QhOq214lzEHLTA8sCXkk/NzZ5mcrLykd+M9MUK0jWRe6vqjT6jbxyXt1DNFPqEYmUOLhDzNzA+qE5yQNiCfKqIbmQHBG9Ow3YJAZcZ8KAOtcZvos/B+pXNrbaFHNDcxn5RDJayXF16lupHKoDR5JZwY/U/OAgEVy8HKjcnbv601LJErlXOCKUsseBhx5UANz+sOUyKg86ZWyOMrNER484H209JayTHmV4j5FwPtpBsblR0JH7JBFACfktwo+ivuNJEcvRkYVjQTockuPPGKWk10n9sJHmaAFWxbteVs4x30TX6AzUCG5lkYo7H4Cp67qD5YoAypel3S21yw5Cxk2H/PtqE3WiXD6B5p89R+JrVoYuWeKToqz1sYZfGBjpioV5sdqmsCFxUG86V7F9HMIM5PKd6C6mfo+2jE3Q0F1Tqtc31J/ymW4fnRFp6y/Pf5JqMPpVJsvz3+Sa8w+joIn5xjp0q08O3j3Np8kFnBfS2MReNLn8ykI+kcDq5J6+FVNuvuojbWd5BdxQzs1gJljYyS8yqIpMcrnG/IQQav0upenybinV6ZajHtumQ7uYzXUkyryI5ykYJIRT0Az4U2DCCqzqWGdtzVg4y0W00HU106HVYNScQRyvJDC0aKXHMFHNuw5SpzgfS6bVX41uGv4Bacvb845OYgDI9u3xrLKVtsvSqND9pcLasXtozFz+sG3PNvjvq0KcqD41WLq4vJrazjurkSrGjdnGCPmg0hJBAGBvk7ZqyAYAHlXc9Hk2pIyamqTHK0xOdq3WV2jIa7qgax+ZiHcZBRHBxQ/WvzMP+MB+o1m1bXsy+xZi+dFx9F4J0a6bG5uMf7I/GrQzMu+Dj2UD9FgA4dlDbH5Ue79lat5iXOCDXhJv4nZ3or4UDYpMncGnevSpa2yFulKa2xnFIZAeLnFNm2JOxoh2DUkwsemKAIS2zA7nanRbjH/ABqQ0cgG4pPZt4UWJ9HGjCLJu0ilBb2703rOsyXVsLeQ5A6VBsxM0x7Qv1/SNSNUtQIAYoyXHlWm1ZTzRYPR9IIpFjY91VrjMo2u6oMgB7pySe7Jorwcl2LteZH9woXxbFjWL4P6rc+4PiQKIu5sGqigDHpiyDMVzA/sbFak067QZRGI8V3pPyOV/oFXA3wpzTbRXkZ2Eg+NXlZsC7jPrGQeZFKF3cJscP7VBrPl14g5XYv5Mc0tb/AHbWsGD09XH2UAIN5nd4ELd55aUJLJxlopUbu5SOvwpYubJxvbkeYNJxYNvHM6H9pBQAp4raVi8swRz3EZrR09WHNFcwt3gc25pD2xlbnSZARtgtgmtCyuwCRk+ygDbWNwu+3uOfsptorlD/bCffit8t3FvhxnyNLS8vIx9J8eG9AGJdX0Z5u0Zvac0r8ozn87GrHu5lzWLqEhG9vAfIoK38stn2ltQp/ZJH40AKju1mbkMKKeuQMb1OjPqVCRrRj8yGDeZqWuQgoA23WivDf5+5/57zQkmivDhHb3G/6I/wB41t9N/qYlGo+Rha6mhhj55pFjHixoPd6hFIcQI8nsFEr46ekJfUHfb82oTm5jQ+e+MuBY2J2/SkHL78V6ic31f9uTBHrogiSd3PaQ9mmNs9c0L1T6S0YmS8A57h0KnuXuNCNTB9Xbvrna5v2Wuf3LMPzkIfSqTZfnj/RNMbU9Zn504/VNedfR0F2TvVJGRnxrr1xxDodnwW9suq20VydIhhubQZaS559OhjhVSBjEcvOx6YNc64V0W21ZpJbvUlsoYWXmbCkn1WONyAOgA67kCjtxJwDo8M0FtBcatcDHLI6gxk8++Adht31EkCOIWn4i1mbUdNsrySBbaBWPYn1OzhRGJPhlTQFEhaeJpRI0WckIRzEeWdqsNxxpqh0n8lRrG0QJBaQszcvKqgdy59TOR3mq/b3kttdxzxEdohypYcwz7DUJClyjHZRb2iR20sXKmGdySJTzE8y92MYG3eKtdVXtZp+wSWRnWIckQOPVBbOB7yTVq6bV3PRV8MmYtQqSTF1lIJOKTzHwNdtsyjjyKo91DNXuImijBbGGz9VS2QuTkkUJ1q1EvKEICg7msOumlhkW4V8aLBwhxVJpJa3tblSGbnaGQZVth06Y6V0TRuNNG1OZLWXms7pzhRIco5/ZbvrjMPCOs3WltrGnWpntUJRyresD37U3pupPp90kN7burIQyc6br4EA+deSnCMmzrxk0kekordWGS2CKU8SqOpNVng7iiDV7dIJZI0vCvqkfRk9nn5VYiJs4JrPta7L00+hDjuApARvAU8QV3NJLHNIBh+0JwdxWcjfqinpFYDIBpHr/AKpoE+irxcEWi+s9wTnfCoKJ2nDmj24/6iJfOQ831UcWWADDJv7TTRnWTZF91SbFFKhiGCC3U9hbxxgdyoBXCfSf2v8ALLVlwTmQH/ZFd4Z5Bn1K4n6T15+MNU9X1m5dvPkFTxPkhk6KPHa3XLzCOTl7sGliW9hG0ko/pbCk/JryAc3LIg6dcVtby6Ucp9b2gGtZSLGoT9JY4XB7io3rYuoDntLVE812rS3qPtNbRE+OSPspXPp8n0u0jP7IyProASPkMp+lIh8S2aWLS3ZSUuE94rXyS0fdLkKT/wDk2pBsZc4QxuBv6r5+qgBclnPK3NApYDb1SPsppor2E55Z8jw2xWphKHGPVIHdW1ubtMeuxA86ANre3q7FyfJjS11ByPXgifzIrBfP/bIVcf0RWfKLNt2t+z9hNACmubGQ+vbKvmrGk509tgzR5881sRWMmyvIo8Su1b/J8R+hcx4/aBFAG4oYo250mD+AxU0HMYqFFYyW79qRzIdgQdqlr9HFAGHrRThza4uP6I/3jQpyc0U4eINxcD9kfaa2+m/1MSjUfIw1LcRxRE/JGuZjtGo7j7aFX66nc7ns7VO/k6ge00SJ1Nc/kxUyRh2YAhB470KurYRt/wDVr8yvn6HTf2DFeoyNtVz/APEc2PdkKGGFXZvlJmmAwctk4qBq2PVx40VHycFo4LRlGM852z99CdVSUcvqd9c3VxSwOi/C7mQW6U7Y/nT/AETTBJ76es3UOxx3V559G9dkwgHG1Kz41olcjA7hWSoyws+em9EYSn8o3JLswkZp+2spLnLKeQDvIprh/mluGeQ8ygbAij4fIGw+Fb9FoY5lvk/2KcufbwiNZ6fFC4kLF5F6E9M0R5ydyd++mFbwpYUkZruY8cMKqCoxOTm+R/nFZzeVIA32poXcfygwgb0TyqPY1GyTuR1xmgjz8zyKdwGI+FE7u7itgTK2PAeNBdPRrkuY4zIzueUDzrk+p5lsUUzTpofFydl9EORwgcHrcSY/2RRHjLhHTOKLPkvVENxGPmblBhk9viPKoPAbQaXoNtYCUdqMyOW68x6/dVnF+FQkgMPAivNuTUuDqUmjgVxaajwfrR07UFbAb1ZAdnHcynuNdb4M4nTVIo7W6m/sjlzFJn86PA+flS+MNKsuKtKksLiNYpOsMw+lG3cR5eIrkehSXuiazLo+oZilSQcsg6xNnZx5GrfzF+pXexnoAjm2DZrTQyqM8v11B4U1SHVNMHOOS7tx2c8fmejDyIFESHA3Y8vhWdprhlydojyO6dVJFJEoxucVLZsoQMUyUz3CgT6NRwoMZO9Ot2XLhQM1I7WNEzhSPZvTEkoOxAAPlTYR6GpE5lwvXNcN9K6dlxnqLN9NlRv/APMfhXcmljXv61xL0ulG4uu2U5Bhj/3asxdleXooEd3KrZU4NSEu5HGXCsfEioCfTxU6zi7VxFFHJK5PRBkj3VqbS5ZSlYsyW77SQBfMGtGKzfYO6e05zWtQ0+4tny6ty5xgqQQfAjuqMFGem4oTT5Q2mux5rDm3ilQ+/FYbO7T1jG5HkKyNVxnH104ruh9RiPKixDctzcwMESRk2yUI2Nb/ACg+AJoIX88U6J3UEEKc77jNKLQuAXiQePIMUWAyJ7ST6UTJ48jfjShDYyHKXDoD3FaUbe0k3RivtGa01grD5uQfZTAS2ngnEUqP5BhSHsbmPdUb3b1jWVwg+ix9h3pvnu4c4eTHhmgBdt2yTfOFh3HIokn0c1Ahup5GCPgjHhvU6NvUoAQ3WiPD4KzznxUD6zQ1jvU/Qm+cl/og1t9N/qolGo+Rh8gSQsJb5rWEfT5X5S1C5pbKJ+XTrRrl845iML7aemksFAe+V5FX6KL3mtw3F7c+rZW62ydxIxtXqJ/E6+v9/wDBzo8csjxJeEs92UjB+jEBv7ah6jEGX3VNFt2cryTXIkm6EA52qLd7jFUTx1iaJRasEmPbFJ7MZ2qVg+FYE3Oa47wJmn3KIsCH5URjrRbsw1u4/ZNRFUBwR3VOiYBcE7d9X6fEo7iEpbmhnQowlmreOaIjZQT30FtLk2yPC43V8j2GiDXKGNCgY70YdRjxQUWOWOUnaJgO+RSmmVRlmAHnUCSflXmY8o7t96hSXmSeyTmPnVWX1KMflRZHTtvkMPeKi85IwPGg99rCrOzwdcY2pHyO6ut5WY58Km2PCdzcMAqlQe+ufk1+SfDdIvjhS+hBtZPlLKbgDDkAg+Bq/wDDU9tYqIdPslcP1PU//FM6TwhDbqpupA/Lg8v3Uft7aG1QCCIKR0KjeudkyKRpjFoIuVeMG6sZovMDamVjuIjz6fd/KFHSNjv7qudjG89lC7DOUGxFMahpNpcEstv2b9xTbFV2WUBtM1gOwinbklG3KwxVf9KujrqGnfli13urQZfl350/4US17Rb8RM4GWXcOOtBtJ1lopTY6mhKnb2jvoj3aE/1BvAOty2d1b6gz8ycwhuV8Vbv92BXaWLEBwwYEZBB6juNefLaI2et3+nR45HyI894O6muu+jvUWvuGrdZnYy23zL58un1VPKvqLG/oHpA58R51gBH6Z+FPxueYc3SpAMZ7hVJZLoGSrg8zc6jxpp2VlwW+BqXd/J2gVTJlsd1D2aJe+pNcij0Y6xldyx9tcZ9J5STiu9X6DJEigHv9U74rsLzxlccwrjfpPZW4yuyp3aJD/sgVZiXJDJ0UNUIc7HOKtvo8ilMGsS2yFrpLf5vAyV2Ykjw7t/ZVVPMJhsaL6Bql5oGrR6jZMpYAhg26sD1BqWrhLJicY9iwSUZpsOaxqEup8FiW9zLc2dwsazHqY3BJVj34ZdvI4ql8/rmrHxNxD+UrM20GnW1hC79tKsBJ7SQ95z3eFVqNCzZ6YqGjhKGOpKv08D1ElKVolRbinSjcplEZKDYvnYU3GtOTtK0Bj5vV6ADurQUCdm3xWyOmBWQAhMGlHlXJdAx7j4UAJKkHBXHkRSAG5zgkeylKzOMsd++mZZ1DFFzzDrTugHGuDH+mc+Oa2t652IDj9repo4e1M2fyqXTZ44ccxkIzyr+sQNwKEOjwTPG+zKcEUo5Iz+VknFx7Jqyo7ZESqfELj76lr+bobA2XA99EVb5upkRhzhjvU7RT85Lg/oj7agSDLZqZojcs0o67Y+v/AIVs9O41EWU6hfAwwjrHubQ3En6O/SkTi8uRy3M6W0Q6LHsceBNPW5PNz9oyAdwHWtTOpY4JY95NetpNdnL+pG7G3jTMIfmGxYjr76jyr6pyalOc93vqPMMCqsqqJKPZEx5UkDrtS5pFT6Rx5Ux2nNnHq+3vrlZc+PH2zRHFKQmRuUnJx763HNIyYCn3008kY7+Zu+kL2kmynlFcjJq5N/Cao4UuxTEpIZXYMx6rnOafSWWZQEUIO7AxSI7RyOZhgeJp7tLO3Uh2LnwHfWRtt2y6kaS05zzTSjHhzVPsba0zjMuP2IyfrocdQcDFtbcv+T1ps32pc25ePyX8BUWrGnRf9KjhRf7H0S/uG7mYIv1E0at31Yj5vh67Kj/DQj/3VyVk1ibbsLtz4BW+ylxWGt9Rp18fZAx+6j20x7mjsHbagg+d4d1AePLyPn4GmG1i2ibFxp2pW5Hjakj6ia5JPFrMec2l6nL/AIJxj6tqaju9UjYYmukb9tmH1nFHsxGps9G6PxZoD2sUR1VYHC7rNE0WPewxReK7hu/WtLpJ18Y5FYfVXmdtV1ZAFd5XH6wPMPiM0hNYuEYMGZGB2KZjI+G9ReFEvdZ6ZlTmjdHLEEVROL9ER4DcQZEy5IKjoPOqFpvpC1y0jER1B5ov/wAc2JB9e9WrR+PbO/iMOpW3ZsVyWhY4PtBNRWNp8D3JoqEcj3HEMMhV+0WMA7eG1dH9E9yHbU7UgYBVvYcMKpSQrG93qxUIrSciesOp3Ax7BVv9FKhFvZz1lKD3jOftp5V8IQ7Oijs+bbNKyviKQkkI+kawyW+fpis5a+gfJGHUL34qPcQdn6zNygd5ohOrqpYCht3DIx2cn29KmKPRGbs87gN51RfSfonyiIavaRZkhQLMoP0kGcMPMZOfKrrLbuoLNg46YFDruQ4K45c7HIzmpxdEZKzhxaN3J3BPhWpEAXKSbftCumatonDrh5rm0iWQjLND6hJ8dtq55rcVvb308VtzdiG+bLNkkYq5TbKXEHMJycsuRWLzA7risMzqOm3tpcd545FS5IjikgZpfOD061guY2GSBny2rYMD+rlh7adAaDkeFbYhl361r5Pn83gj2itMjrnKnajgDQC4I+Fa05IxrFt2y5jEymQeI2rWT3itiNHHMp9cfo/rUpRtUSjReJ59V0nj9roxsX7YdnGR6s0TbYI6FSDjHtqm8VJFBr95BEoEcc8iL7A5AHuAA91HIONdbh0+O1iaFzCpEMsifOxew1U7uRpZ2cklmPMxPex6msOjwZMcm59VRp1OWE1S77F2hzP7qJL9DFDbRTzLt3+NG4m04RAS210ZO8rOoH+5n666BkB7khqmaWy27yS3GwI2A2+3fvpMk0SP/YsbRAfpSMGcewgAD4UwxiKMTzF85BJqePI8b3LsUluVMOLJzxqw6EZpJ2yd9qZ04g2Ue/SlTTogOGBPfXrVnhHEpSdWjmbG5UkJjvIZTypzZAJbNM3dwD9HYeNQrm9Ac49Y0wqz3JyTtXAz+pzcXCL/AHNkNOruhU06BuhY02sdxK2R6q1Lt7JVPTmPgKKWlg6jnmkWKPwPU1ypTs0qIJitCv0hk99LsOV53yPVU7UflmsobOZLRT2jIRzmq5ZMocKxxkYz4U4NvsGqHbu5a4lMEIO221bhs0jIa4lSM9fE0xO5sx2VuOZ26t41lvYzzDtLiTlTO+abQh2W4t0bCRvKR0LE4+FKj1K/UYt4OUd2AKeiltbbEccIlf41LjGv3XqWVpcdme7l5QPjiotpDSbIqNxRd/mzckf4zH3ipS6XxS6gm4C+T3ag/W1TIeFeIbsc0ksEf9KUsaV/ITVWO+o26nwAJo3pElF+CCdK4ryMXakjoBfLv/tU1JFxRDkPFPIR15JFf7CaLpwFqw3F9CT3eqd6izcHcSQS88U8DEdOWQg0b0Di/ADnubtGPyqxZT3kx4P2UwmoIvqmDGfEZ+2rHOOLbGIJdx3MsPeGbtVoLcz205xPaIjHv5SCKLsjTRCkjhlPPGgBPXBrSdrA3MrYKnNOSQwqOeKTHlim3MvIoccyN3juqaYix6FOt8otZWOWU8pA766r6O7aFdOLRyjKHlcHrnxrj3BVvJ+UDdkEW8OSZOoz4VbdE1+40jUVkDBkuG5WT9cVVkVlsXTOyIqd7KfdToSEjcr8KgaRcLf2S3NtJzQMfo96t4VPBlAwErM1RddrgjXEjOuCcVGmnROqnA76kSlezyqZb2bVAltGJzz7/GpPsUehq4vokQgDrQHUL89pyKoKnyorLbrkh35seA6UJ1JIlbC5yOlANAXUbS3ukYOCrHwO1VXU+HOZmdHDk9zbVbpQS3fTTx/pH41O2iDSOdT6JcRkloGAHeNxUV9Pde7GOuRXTHiYDIBx7KjPbwzEK0KuT0qSyEdqOaNZtzbDPspLQTKe+uhXei225wY271A6UKbRJJpBFbkTMTgKASSfdUlOyDi0VEvIowR+NKS6YYBLe/erzY+jbivUrs29tosnOBkh2A5R44HrVH4o4EOgWcbza1Y3N6XCzWcPrPF13P8A8Cpp0JKyqpcI2RIoPhjatMIz6yOUz49KVNYlAcA1D7N1Y4ZqakgoccTgY6+QprlcdYzSueUHJFPRSk+NOxCLZsN0xipqtkVHYqfopg958aTzOveRRYEhutaxnakpk7s3xpcbZOVGfZUWAo3JigWJc5GenfTSie5O+Vz4UQtbEyOCAWY9ABmjNhoMzt2k+EU74HX31KeonJJSYRxpdAS303OAELN4gUXtNFcAGdljTw76slnZQwR8sa7+OK1cQ5XA2PhWdz5LlGlyCHtbGGM9kh5gPjQ24WQk8rHHgRmrKtmSBzDc9MimLqxwhJGPdTT5E1xZTL+V4Y8d9CwzeODRriCExOMjahQhEg9VgD1q6JBkizkXnXtFDEeNG7aO3vbgLdXQtYABvg/bVaJaM7gjzNPxahNEoBTmWpETp+jabpEESmzhhl8ZMZY++ixiLDp6vdXKLLVYUkD5lgfvKMRVn03iKYgcusoO7E68311RLGWrJRc4o35go2qfDCF+lgmqrBrd4R/1nSZW82ZKmwa5ekj5jTm81vAB9dR9tk1kTLEVboDtWkh9cknr5UKTVNQfHLZWpz0/s6PFKfVNSjBLWWnqfFr1Nvrpe2w3oKzQKVwzMV8OgoRqWg6feEi4s0Yn9JVwaiz69qHJymXSo38Q3N9+KC6lrdyxJm1pOXvEOBT2NCc19SFxBwQtvG01lKFB35GoDZaK8UZGoOoVuiqckj7qnXWt2683z0kp8STQm61jnBCkgH66tjx2UtpvgNSXlvbwLawx9hAgwEXvPifOq/qtxLLNHJESqwsD8aQpmY9vNlYgM79/lSrrKojlSvagBhiixpHVPRprvyZ4EmlIguvVbPc4Gx+7310xbhioIPtrh+nw/J9Es1B9cSBx4g52+uuyjnwOQHB32FUZFyXY2NvMqxruencKS0iHcgkUtbhBEqtlNugprUpdN0+JZNR1Sysg+6rNNiQjxCLlj8MedKrY0+CLdY5SQdvZVc1d0jPaSMFQbEk4qVqvGfCVnCwik1PU5xsEigEEX9dyWPuSqtfcZAMLmPg/TZP1Jb1pZwPYMop+BppLyG5+BjUdfsYJBFGzzSk4Cx9Sf+fCpei6bx3rZzpPBt/KhOA7W7gf1mAFWL0fel3iv8sWul6VwVoF48sgUxWNiYZCvf6ykge07CvQXEOt3cem6pLYwTajqNhGhbS7ac9oOYZ3YDOBv9HI223rRsRQ5Nnnu19FXpUvmBkXTdLU99xcJke5AxqyaP6F7y3CyavxndTP1aK1hQIfEczgk/AYrrXCerapc8NjUtd05tGkV2D21zNz4UHZixHMpPhXMvTx6Q+ItEvYdF0bSbzR4rqMN+UJkCvID17IHZfa2G8l75bUQbZM1rSOBeE4kj1meNpyvMsNy5lmcdciJQNvPAFUy/8ASEUma14W4di5GPLHLcbHJ8I0PL7mJFc54dgvtWu5JewmuZecmaR5Cfe7E7HzJq1C006CEtqF2HZfzcVnuCfOQ7D2rz+yldDSsTfTcWaqJbfV9SuCqbvbq4jjT2ooCKPaPdUCe0urCwYXllGtpKymObqGPhnA+ryqdPrNvHEIrRYbY9TMPWmPl2h3H+TihtzdxzyF5p3mY7Zdix+PWq5Tvos20BryG2mJEcSg+INDX0mZtwy49lWo2gljDRKAPZimvyfMQzFgoHQ5qFkkkU6fSLiIetFn2UOuLeWIn5tl8jV6WSxgcSTX1qQO7tQfsNR73U9ClJzE87/4OPb4mpqTIbUURncVkckrH1VL92wJqw3HJM5NnpGd9ixz9grqHB9sl/ocNzFYxRNF83MqIBhqp1Gd4Y7tp1PSfS4+oZHBz20r67OQWlhqF1js7G5k8kiY/dRvTeEtZ5Va4sZoYyfpMuK7fp0Nzav6rxLg9GQH7advVWTDTXKuV6Kqiuc9fnb4iqO+vwrji6lNv/v7nOdH0BoMExgMB+lRY6ZKP0VJ78HpVgQWySEsze8bUt7yxjz87ED3+uKT1ORs6WP8P6PGlujf7lIvJ7e2k5GJY+CYyPjtUOS7iJyltK/mWUfjVtv14dmw7tEkmfpI2CfqqDNFBHA0lnLHOq9VZRn3EVrx5sb7OJrPStTjblixx2/p3/cr01xd3EaRWyLbcp3btFYn3Ypl4NWZSBf496inb7iGASLHEnL1D4UAjHuoe3ERDkEyHbIy+M/DFdCMIro8tkySnK2Jn0O9ucm7uSwPQ7HNRP5LlRuwHmDU3+UeN15iPMn8aS3Ee2VeQHxDkffUyuyN/JtnUqgWXHUBhkUg8HgW7TyIwXBOAamrxJkMkhL7AqzbsDnx9maft+JAIGEmTzRusg8TjGfI1FsAPPwZy4wko8xvmht7w/eWlwi2/rAjm5XYA9/4V0a141tRFGjQRNhQNx4AUP1C44e1rVnfUHa35kVU5VyuN/OlY2ihPYayiEtaz48QR+NRGa+jO4lXHXOauVjpVpNFbm31OEs8bNJzsBj1iAKWvD+om2guFSC4Ekwj9Uq3XP4CpIRTI9QvEP5yfHlmlPqFwVyZJcnxJoxrUt5pV4bWfSrYuqgnMI29tQBrzKeX8n2SeZgFMAcLy6JwHlz4U4i385xHFK2e6pra1cMPUEMY/YjAph9QvXHLzykH9EHrUWFm00y8+nO6RL3gmn40s7ZgR88+e8bZrLTTtTuzkR9mn67v091H9L0bT7U895O13J1KRLsT4ZPdUSSRD0XTLjVrgPNGVtlOSegold6Zay3SCL1oYj6zd2al3moL2BiBjgiA5RHGcnHmaCXOoSFewt1blOwVepoSf1BvwFbRnudZt4UBMSuCQPLf7q7Ha3BWBeYN08K536PdFmSUXV6vK7/RU91dKaBdvWA2qlu2WxVITK0ZQYx08KFWvBWk6jqUnEsuo20MUzsGs9ReNlDjYsPnAzL4AqCD5VJuJXhUDOwFVGflbU5+U7FiRzYyMnPlSq7JKW1Iuv8AJrSFtnij4j0e05mzz2VhAroB+2j8/wBY99S7bTOC407PVuJJ9RQ/SHKYs+XMqO3wYVQ8FCrJJGmDk7n1qxrhSvryJkdcNShCKfMScss2uHR2XROK+AOHIBa8P6fa2aFcO0UL8z/0m5QW9pPup+b0n6HIpuI70wPjk5/yc0hxnxMg7/KuHm6iP0JBkedNpOnKynYZrRZmo7zYcb8FLMt1darf3VyMcrTwFI4/DliQco9u7edEtT1v0e8V2fyLU77TLuFt+yvoyoJ7iCwGCK89GeE4yTjwxS/lMGMByvvNPdQmrOkat6GtNvpHuOGuNRFzLhLaUR3MI/o9my4+FU7UfQjx8tySL/SbqHHSGYw5/rJ99CI7lDKiLcCME4ypxj40astYvrP8zxPewAfqXJx8A1RbTGkVfiz0da7wpYRahrGlmWCWYRKbe8SU8xGdwPIGhNteWlq6xzaXPEh6v2ecAd9HvSpxnrt7w3DaPrV3qCrdIwUjOMBh169/1Vy4XWqX86wiV4mCHaWTlBzjx9lG1MLaL/Lq9hbgukUxVe9lCg+4mqxrt/PfNG6OEhY7IhO3voPcaVeTFjPqNso68qyFyPdW45wtutr1kRtycgAeP/CnGMU+AbdDMqssTEKpYdM1Z9I1DhWGwimNpPJccvro30c03e6Df2vD/wAtn0u9jjd8LK1m6p0z9IjFVJ0aQr2KOf2QDkVO0Rpl7l4zhgXFjp1rGANsrkipvB3F06JqJBAM0wcgDbpXOltLrAZoWQHcF2C5+NS+GpHRLhmYICwHXwqjUrfjo63oeV4dZGf3OkXPEl1Kxw53ovw/qi9kflDjJBySegrmM2pxQHLyr8azTNdDKVEpwQR9Vct4HXCPZr1fCnUnydMvNJ4z4iYXOj8P3z2LbRSbRq48fWIyKRB6OvSDkF9Nhth/hryPb3Amodn6UrC0023sjqmouYYlj5F5sLygDA3wOlD9S9JNnKpMMN/OT15nH4muTv8AUnJqOJJfb/Jy83qCcm/fr9EHtV4M4y0XTZ9Suo7CW1hQvMYblXZVHU42OPZVNvtRSKVGt8KJEywU+PfTknpEjm0+7tFs7yFp7d4gwYMPWGMEbbYJqnC4vJWHZ25VAAoyuTXT0WLUzjeoik/0/wDTPP1j2oOO9z8eUMX07G8lYHYnbemO3J2ogbO8l6W+D5rWhouoSb9kB7Biu3aPLZHvk5eSEJzjvpPbmp35A1JicRHHkKwcOakT+bb+rRuRXTIfb5rYlODud6nrwrq7jKRHHmKeThDW8ArFk9wpbkG1gpXYeNJPbu5dY5WU9CFJFGhwlxAWAe3wKJ23B+r9gv8AZCx/s82MUb0iSgyoIJ0XJ5l22yCM1JttUu4VjVJ2HI2cA5x51b14V1j1R28LYHfis/kjrJV1C2DhxhuZR0o9xEtjAdvxTeQ8zyRRXPNgE3EXMNu7NO/ymsZz8/odhIe/s0I+yrTp2ga5b2iW3yq2WNOiKmQuetaueHL9x60mnvn9a1BP2VH3A2MrQ1vh7GW4fiB8pCPtFPDV9FG8ekgN3HnJ+6ih4MklOXktUPgltgfaKdj9H1qxDTXU5/ZVQuafuRDYwM/EMSKRDaRJ4ZXNDrjV7i7YqgJJ2xGpq9WnAmjRMGlgllA73cmrFpehWFtyi1sY4x3EDek8ngPbOYadw1rupFZFi7GNurybH4VfOG+C7bTWWZ2aSbIJd9/hVxtbYD1GGwGcEUQghTGCBgdapc3LgsUUiPaW8UeBt8KmCHNLKR49U700Ulzsxx7KUeyT6GbuwSeIc0vLt3VR+I9Cubq4/sS6eLzCjf31dy7NkIRjzobMpWXmO48qaIpWjm9zwtrZOPynNgVDbhHVdy2q3QPk5FdUKiQYEZb2nFMNAvMVkiceYO1S3C9tHLv5J6j/AH1uf65rDwjqZ/8AE7k/5ZrqPya3B26+yslswzBubbGNhRuDYcvbhDU12OoXZz+0341r+RequRy6jcb+LkffXTmtmZgFxy99OJbAEZFG5j2o5lHwPrCH/tObxx2rfjSm4M1vu1Gf35/GuoPAvLzLsT30yOZTgdaNwthzROC77IN5fyOgOcZINSoeD7FDzsZGPdzSHer1MobbBzSEgLYzjAo3MewpEtnZWOEWzRjnGWGftrXokjsoPS1Zz30Mbw2khnETqCrYx1B2OBk+6rRq1gJYXGRnuwKo0dvcaTxLaalzN8zKC2P01OzL8KlCVMrkqPWfHGnR3HAGoQNEjJBOrKSNipTAP114zls7qDV71bQMFEzBQD3V1O64n9JOp6Vql3a3lqNG064igMTkhmjIAHL+spBySehqu2FpHPqk9yjeo0pb1em++1P3CWwqB0PU7o5dHGe/PSn7bg2+69oVB866XFaKegPvqRFbqpx19lQlkZKMadnPIeBpX3kYMfOpJ4AUb8w+NdBWNAOhpzswdqhuZb7a7KDb8DRB15nAH7O32UWg4NsIwOflbxzvmrakKgYXp3U4Ioxgkb0m2w2oqL8KaUTg26Af0APsqbBolpAgCRKyjpmj8kYZs8oFNSLyjlA86NzFSTBy2lvH/aU+FK7CNvoxqMeVSJIj37Ck9kR9FzUrZGkIEKqo9Rc+ylJFHn6C/CnVRgADuaVynwodhSGGXBwAB7qWq4A2pxm3B5M4pQOe7rSFQ2CRtk70pEB6qPhS+QZz4U4o27qYxowA7AD4UtbQ42A+FK5GB3Ix7ac7RwMIRjvoAYa1AYH1sg74JpbRqyjIHvpxQ+cljv3VvlwDzUANoqKMAL8KdiiU7syH2UhUTpvmpscCjbkApNWBqOPmUhUBp+OFtsjBPWnIkCDbvp0N0pgZGhXYjIpe2QeXpWBsZwRSO0Zev1UkqAUnLz+t0pztkGwY/CmVZWcZBxW2WLPQ/wBapJcifR1FfQ3ajca9Pvvvbj+Kmf5nrHO+u3B/0YfxVlZWrZHwZ97FD0Q2ajC67cDP/ph/FSX9C9nMu+v3Az3/ACcZ/wB6srKNkfAb5eRtvQlZQoCeIbk7/wD66/xUtPQ9Y8uPy7cfuw/irKyjZHwG+XkSfQ5ZB8Jr9wCe82w/irD6HLRfpcQTn/Rh/FWVlGyPgN8vJh9D1kQB+Xrj92H8Vab0NWLn1deuAf8A+YfxVlZRsj4DfLyJHoTsx/dBP+6j+Ktj0K2Y/ugn/dR/FWVlGyPgN8vJoeg6zkJ/+4Z/fbD+Kh+rf9HrTL4BH4huEK962q/xVlZRsj4DcwWv/Rot1iaD+XGo9gw5Wi+TLysM53HNRfS/+j3YWdsIU4jmZV6f2KBj/arKyjZHwG+XkIR+gy0QbcQTfuw/ipR9B9sTn+UM37sP4qyspe3HwG+Xk1/Mda/+YZf3YfxVpfQtaE4/L837qP4qyso9uPgfuS8jn8ytoOuvz/uw/irR9C1njfXp9v8A04/irKyj24+A9yXkSnoYs5Dypr84PXe2H8VL/mUtR11+U/6MP4qyso9uPgN8vIhvQdbN14hl/dh/FWv5jrNevEE59lsP4qysp7I+Bb5eTf8AMnZf3+n/AHcfxVv+ZOyH/j1x+7j8ayso2R8Bvl5Et6E7Lp+Xp/3cfxVsehKzOB+X5/3YfxVlZRsj4DfLybPoRsh14guD/o4/irP5krL+/wDc/u6/jWVlGyPgN8vItPQtaKMDX5/3cfjWj6FbMnJ1+4/dx+NZWUbI+A3y8mv5nLFTj8u3G3/ph/FWfzPWP9/bj92X+KsrKNkfAb5eRaeh+xA/7duP3Zf4qd/mjsv79T/6gfjWVlGyPgN8vIr+aayH/jVx/qB+NY3oktChI1ucDH/64/irKyjZHwG+XkZHoktAf+3rj92H8VLX0SWhXfXZ/wB2H8VZWUbI+A3y8ij6JLLG2t3A/wBHH8VJ/mktP7+3H7sP4qyso2R8BvZ//9k=";

const Step0 = ({ machineData, loading, error, selectedId, setSelectedId, onRetry }) => {
  const T = useTheme();
  const machines = Object.values(machineData);
  const m = machineData[selectedId];

  if (loading) return (
    <Card title="Loading machines" sub="Fetching from Supabase via Server A">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: T.textSub, fontFamily: T.fontSans, fontSize: 13 }}>
        <div style={{ width: 14, height: 14, border: `2px solid ${T.blue}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        Connecting to edge…
      </div>
    </Card>
  );

  if (error) return (
    <div>
      <InfoBox variant="red">Connection failed — {error}</InfoBox>
      <div style={{ marginTop: 10 }}><PrimaryBtn onClick={onRetry}>Retry</PrimaryBtn></div>
    </div>
  );

  if (!m) return null;

  const catStats = [
    { label: "Total devices",    value: machines.length,                                                variant: "green" },
    { label: "Cutting",          value: machines.filter(x => x.category === "Cutting Machines").length,   variant: "blue" },
    { label: "Finishing",        value: machines.filter(x => x.category === "Finishing Machines").length, variant: "purple" },
    { label: "Welding",          value: machines.filter(x => x.category === "Welding Machines").length,   variant: "amber" },
  ];

  // Detect plasma/cutting machines by ID or name to show real photo
  const getMachineImage = (mc) => {
    const name = ((mc.name || "") + " " + (mc.category || "") + " " + (mc.machineId || "")).toLowerCase();
    if (name.includes("plasma") || name.includes("cut") || mc.id === "M1" || mc.id === "M2") {
      return PLASMA_IMG;
    }
    return null;
  };
  const icons = { M1: "🔩", M2: "⚡", M3: "🎨", M4: "🔥", M5: "✂️" };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Select IoT machine</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "5px 0 0", fontFamily: T.fontSans }}>
          Machines loaded from Supabase. Choose a device — both algorithms run on the same server in Step 3.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        {catStats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <Card title="Registered devices" sub="Live from Supabase" accent={T.blue}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {machines.map(mc => {
            const sel = selectedId === mc.id;
            return (
              <div key={mc.id} onClick={() => setSelectedId(mc.id)} style={{
                flex: "1 1 130px", maxWidth: 160,
                border: `${sel ? "2px" : "1px"} solid ${sel ? T.greenBorder : T.border}`,
                borderRadius: 8, padding: "14px 12px",
                cursor: "pointer", background: sel ? T.greenBg : T.elevated,
                transition: "all 0.12s",
              }}>
                {(() => {
                  const img = getMachineImage(mc);
                  return img ? (
                    <div style={{ width: "100%", height: 72, borderRadius: 6, overflow: "hidden", marginBottom: 8, background: "#000" }}>
                      <img src={img} alt={mc.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  ) : (
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{icons[mc.id] || "⚙️"}</div>
                  );
                })()}
                <div style={{ fontSize: 13, fontWeight: 700, color: sel ? T.greenText : T.text, marginBottom: 2, fontFamily: T.fontMono }}>{mc.machineId}</div>
                <div style={{ fontSize: 11, color: T.textSub, lineHeight: 1.4, marginBottom: 6, fontFamily: T.fontSans }}>{mc.name}</div>
                <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontMono }}>{mc.taskType}</div>
                {sel && <div style={{ marginTop: 8 }}><Badge variant="green" dot>selected</Badge></div>}
              </div>
            );
          })}
        </div>
      </Card>

      {m && (
        <Card title={`${m.machineId} — ${m.name}`} sub="Device metadata" accent={T.green}>
          {(() => {
            const img = getMachineImage(m);
            return img ? (
              <div style={{ width: "100%", height: 200, borderRadius: 8, overflow: "hidden", marginBottom: 16, position: "relative" }}>
                <img src={img} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: 14, left: 16 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "Inter,system-ui,sans-serif", letterSpacing: "-0.02em" }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "monospace", marginTop: 3 }}>{m.category} · IoT-connected</div>
                </div>
                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, padding: "3px 9px", fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{m.machineId}</div>
              </div>
            ) : null;
          })()}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {[["Machine ID", m.machineId, "blue"], ["Category", m.category, "dim"], ["Task type", m.taskType, "amber"]].map(([l, v, c]) => (
              <div key={l} style={{ flex: "1 1 140px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "11px 13px" }}>
                <div style={{ fontSize: 10, color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: T.fontSans }}>{l}</div>
                <Badge variant={c}>{v}</Badge>
              </div>
            ))}
          </div>
          <InfoBox variant="green"><strong>{m.machineId}</strong> selected — proceed to collect task data.</InfoBox>
        </Card>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   STEP 1 — COLLECT DATA
═══════════════════════════════════════════════ */
const Step1 = ({ machine: m }) => {
  const T = useTheme();
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Task parameters</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "5px 0 0", fontFamily: T.fontSans }}>
          Live data for <strong style={{ color: T.text }}>{m.name} ({m.machineId})</strong> from Supabase.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard label="Task size"        value={`${m.taskSize} MB`}          variant="blue" />
        <StatCard label="Processing time"  value={`${m.processingTime} ms`}    variant="green" />
        <StatCard label="Bandwidth"        value={`${m.bandwidth} Mbps`}       variant="purple" />
        <StatCard label="Energy per cycle" value={`${m.energyConsumption} kWh`}variant="amber" />
      </div>

      <Card title="Parameter table" sub={`${m.machineId} · Supabase`} accent={T.blue}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Parameter</Th><Th>Value</Th><Th>Description</Th></tr></thead>
          <tbody>
            {[
              ["Machine ID",        m.machineId,                  "Unique device identifier"],
              ["Task size",         `${m.taskSize} MB`,           "Data generated per task"],
              ["Processing time",   `${m.processingTime} ms`,     "Local processing time"],
              ["Queue length",      m.queueLength,                "Pending task count"],
              ["CPU utilization",   `${m.cpuUtilization}%`,       "Edge node load"],
              ["Memory usage",      `${m.memoryUsage} GB`,        "RAM consumed"],
              ["Bandwidth",         `${m.bandwidth} Mbps`,        "Communication speed"],
              ["Transmission delay",`${m.transmissionDelay} ms`,  "Network delay"],
              ["Energy",            `${m.energyConsumption} kWh`, "Energy per cycle"],
              ["Throughput",        `${m.throughput} tasks/min`,  "Completion rate"],
              ["Avg latency",       `${m.avgLatency} ms`,         "End-to-end delay"],
            ].map(([p, v, d], i) => (
              <tr key={p} style={{ background: i % 2 === 1 ? T.elevated : T.surface }}>
                <Td><strong style={{ color: T.text }}>{p}</strong></Td>
                <Td mono><Badge variant="blue">{v}</Badge></Td>
                <Td><span style={{ color: T.textSub }}>{d}</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <InfoBox variant="green">All parameters loaded. Proceed to run GBFS + PSO.</InfoBox>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SERVER PICKER (shared component)
═══════════════════════════════════════════════ */
const ServerPicker = ({ selected, onChange, disabled, title, sub }) => {
  const T = useTheme();
  return (
    <Card title={title} sub={sub} accent={T.blue}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {Object.entries(SERVERS).map(([key, srv]) => {
          const active = key === selected;
          const sc = srvColors(T, key);
          return (
            <div key={key} onClick={() => !disabled && onChange(key)} style={{
              flex: "1 1 200px",
              border: `${active ? "2px" : "1px"} solid ${active ? sc.border : T.border}`,
              borderRadius: 8, padding: "13px 15px",
              background: active ? sc.bg : T.elevated,
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.12s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 5,
                  background: active ? sc.accent : T.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                  color: active ? "#fff" : T.textDim, fontFamily: T.fontMono,
                }}>
                  {srv.tag}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: active ? T.text : T.textSub, fontFamily: T.fontSans }}>{srv.label}</div>
                  <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontSans, marginTop: 1 }}>{srv.sub}</div>
                </div>
                {active && <Badge variant={key === "A" ? "blue" : "green"} dot>active</Badge>}
              </div>
              <div style={{
                fontSize: 10, fontFamily: T.fontMono,
                color: active ? sc.text : T.textDim,
                background: T.elevated, padding: "3px 7px", borderRadius: 3,
                wordBreak: "break-all",
              }}>
                {srv.baseUrl}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/* ═══════════════════════════════════════════════
   STEP 2 — RUN ALGORITHMS
═══════════════════════════════════════════════ */
const Step2 = ({
  machine: m, gbfsData, psoData, algoRunning, algoError,
  selectedServer, setSelectedServer, onRunBoth, gbfsProgress, psoProgress,
}) => {
  const T = useTheme();
  const srv = SERVERS[selectedServer];
  const bothDone = !!gbfsData && !!psoData;
  const sc = srvColors(T, selectedServer);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Run algorithms</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "5px 0 0", fontFamily: T.fontSans }}>
          GBFS and PSO run sequentially on the same backend. Results are compared to determine the best edge server.
        </p>
      </div>

      <ServerPicker
        selected={selectedServer}
        onChange={k => { setSelectedServer(k); }}
        disabled={algoRunning}
        title="Algorithm server"
        sub="Both algorithms POST to this backend"
      />

      {/* Pipeline */}
      <Card title="Execution pipeline" sub={`Target: ${srv.label}`} accent={T.purple}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", padding: "8px 0 16px", overflowX: "auto" }}>
          {[
            { label: m.machineId, sub: "IoT source",  done: true,      c: T.blue,   bg: T.blueBg,   border: T.blueBorder },
            null,
            { label: "GBFS",      sub: "Greedy",      done: !!gbfsData, running: algoRunning && !gbfsData, c: T.blue,   bg: T.blueBg,   border: T.blueBorder },
            null,
            { label: "PSO",       sub: "Swarm",       done: !!psoData,  running: algoRunning && !!gbfsData && !psoData,  c: T.purple, bg: T.purpleBg, border: T.purpleBorder },
            null,
            { label: "Compare",   sub: "Pick best",   done: bothDone,  c: T.green,  bg: T.greenBg,  border: T.greenBorder },
          ].map((item, i) => item === null ? (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
              <div style={{ width: 18, height: 1.5, background: T.border }} />
              <div style={{ width: 0, height: 0, borderLeft: `5px solid ${T.border}`, borderTop: "4px solid transparent", borderBottom: "4px solid transparent" }} />
            </div>
          ) : (
            <div key={i} style={{
              flex: "0 0 auto", width: 96,
              border: `1px solid ${(item.done || item.running) ? item.border : T.border}`,
              borderRadius: 8, padding: "10px 8px", textAlign: "center",
              background: (item.done || item.running) ? item.bg : T.elevated,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: (item.done || item.running) ? item.c : T.textDim, fontFamily: T.fontMono, marginBottom: 2 }}>
                {item.running ? "running…" : item.done ? `✓ ${item.label}` : item.label}
              </div>
              <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontSans }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress bars */}
        {(gbfsProgress || psoProgress) && (
          <div style={{ marginBottom: 14 }}>
            {[["GBFS", T.blue, gbfsData], ["PSO", T.purple, psoData]].map(([name, color, done]) => (
              <div key={name} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color, fontFamily: T.fontMono }}>{name}</span>
                  <span style={{ color: T.textSub, fontFamily: T.fontMono }}>{done ? "complete" : algoRunning ? "running…" : ""}</span>
                </div>
                <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: color, borderRadius: 2, width: done ? "100%" : algoRunning ? "55%" : "0%", transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {algoError && <div style={{ marginBottom: 14 }}><InfoBox variant="red">Run failed on {srv.label} — {algoError}</InfoBox></div>}

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", paddingTop: 2 }}>
          <DualBtn disabled={algoRunning} onClick={onRunBoth}>
            {algoRunning
              ? `Running on ${srv.label}…`
              : bothDone
              ? "✓ Algorithms complete"
              : `Run GBFS + PSO on ${srv.label}`}
          </DualBtn>
          {bothDone && !algoRunning && <GhostBtn onClick={onRunBoth}>↺ Re-run</GhostBtn>}
        </div>
      </Card>

      {/* Results side-by-side */}
      {bothDone && (() => {
        const gbfsWins = gbfsData.latency <= psoData.latency;
        return (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { key: "gbfs", label: "GBFS", data: gbfsData, wins: gbfsWins,  accent: T.blue,   bg: T.blueBg,   border: T.blueBorder,   text: T.blueText,   v: "blue" },
                { key: "pso",  label: "PSO",  data: psoData,  wins: !gbfsWins, accent: T.purple, bg: T.purpleBg, border: T.purpleBorder, text: T.purpleText, v: "purple" },
              ].map(({ key, label, data, wins, accent, bg, border, text, v }) => (
                <div key={key} style={{
                  flex: "1 1 220px",
                  border: `${wins ? "2px" : "1px"} solid ${wins ? border : T.border}`,
                  borderRadius: 8, padding: "18px 20px",
                  background: wins ? bg : T.elevated,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: T.fontSans }}>{label}</span>
                    {wins && <Badge variant={v} dot>winner</Badge>}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: accent, fontFamily: T.fontMono, lineHeight: 1, marginBottom: 2 }}>
                    {data.latency}<span style={{ fontSize: 12, color: T.textSub }}> ms</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontSans, marginBottom: 10 }}>Latency</div>
                  {[["Throughput", `${data.throughput} t/s`], ["Energy", `${data.energy} kWh`], ["Utilization", `${data.utilization}%`]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${T.borderSub}` }}>
                      <span style={{ fontSize: 11, color: T.textSub, fontFamily: T.fontSans }}>{l}</span>
                      <span style={{ fontSize: 11, fontFamily: T.fontMono, color: T.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Recommendation banner */}
            <div style={{
              background: T.greenBg, border: `1px solid ${T.greenBorder}`,
              borderLeft: `3px solid ${T.green}`, borderRadius: "0 8px 8px 0",
              padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
              marginBottom: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.greenText, fontFamily: T.fontSans, marginBottom: 3 }}>
                  Recommended: {srv.label}
                </div>
                <div style={{ fontSize: 12, color: T.textSub, fontFamily: T.fontSans }}>
                  Winner: <strong style={{ color: gbfsWins ? T.blueText : T.purpleText }}>{gbfsWins ? "GBFS" : "PSO"}</strong>
                  {" "}— best latency{" "}
                  <strong style={{ color: T.greenText, fontFamily: T.fontMono }}>{Math.min(+gbfsData.latency, +psoData.latency)} ms</strong>
                </div>
              </div>
              <Badge variant="green" dot>best server</Badge>
            </div>
            <InfoBox variant="green">
              Both algorithms complete on <strong>{srv.label}</strong>. Click <strong>Next</strong> to confirm edge server.
            </InfoBox>
          </>
        );
      })()}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   STEP 3 — SELECT EDGE SERVER
═══════════════════════════════════════════════ */
const Step3 = ({ machine: m, gbfsData, psoData, algoServer }) => {
  const T = useTheme();
  if (!gbfsData || !psoData) return <InfoBox variant="amber">Run both algorithms first.</InfoBox>;

  const gbfsWins   = gbfsData.latency <= psoData.latency;
  const bestAlgo   = gbfsWins ? "GBFS" : "PSO";
  const bestLat    = Math.min(+gbfsData.latency, +psoData.latency);
  const srv        = SERVERS[algoServer];
  const sc         = srvColors(T, algoServer);
  const improvement = Math.abs(((gbfsData.latency - psoData.latency) / gbfsData.latency) * 100).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Edge server selection</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "5px 0 0", fontFamily: T.fontSans }}>
          Determined by comparing GBFS vs PSO on <strong style={{ color: T.text }}>{srv.label}</strong>. Winner: <strong style={{ color: gbfsWins ? T.blueText : T.purpleText }}>{bestAlgo}</strong>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard label="GBFS latency"  value={`${gbfsData.latency} ms`} variant="blue" />
        <StatCard label="PSO latency"   value={`${psoData.latency} ms`}  variant="purple" />
        <StatCard label="Best algorithm"value={bestAlgo}                 variant="green" />
        <StatCard label="Best latency"  value={`${bestLat} ms`}          variant="amber" />
        <StatCard label="Improvement"   value={`${improvement}%`}        variant="green" />
      </div>

      <Card title="Server network" sub="Recommended server highlighted" accent={T.green}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(SERVERS).map(([key, s]) => {
            const isActive = key === algoServer;
            const c = srvColors(T, key);
            return (
              <div key={key} style={{
                flex: "1 1 200px",
                border: `${isActive ? "2px" : "1px"} solid ${isActive ? c.border : T.border}`,
                borderRadius: 8, padding: "13px 15px",
                background: isActive ? c.bg : T.elevated,
                opacity: isActive ? 1 : 0.45,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 5,
                    background: isActive ? c.accent : T.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: isActive ? "#fff" : T.textDim, fontFamily: T.fontMono,
                  }}>{s.tag}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? T.text : T.textSub, fontFamily: T.fontSans }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontSans, marginTop: 1 }}>{s.sub}</div>
                  </div>
                  {isActive && <Badge variant={key === "A" ? "blue" : "green"} dot>recommended</Badge>}
                </div>
                <div style={{ fontSize: 10, fontFamily: T.fontMono, color: isActive ? c.text : T.textDim, wordBreak: "break-all", marginBottom: isActive ? 6 : 0 }}>
                  {s.baseUrl}
                </div>
                {isActive && <div style={{ fontSize: 11, color: T.greenText, fontFamily: T.fontMono }}>{bestAlgo} wins · {bestLat} ms</div>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Algorithm comparison" sub={`Head-to-head on ${srv.label}`} accent={T.purple}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><Th>Metric</Th><Th>GBFS</Th><Th>PSO</Th><Th>Winner</Th></tr></thead>
          <tbody>
            {[
              ["Latency (ms)",    gbfsData.latency,     psoData.latency,     "lower"],
              ["Speed (tasks/s)", gbfsData.throughput,  psoData.throughput,  "higher"],
              ["Energy (kWh)",    gbfsData.energy,      psoData.energy,      "lower"],
              ["Utilization (%)", gbfsData.utilization, psoData.utilization, "lower"],
            ].map(([l, g, p, dir], i) => {
              const gW = dir === "lower" ? +g <= +p : +g >= +p;
              return (
                <tr key={l} style={{ background: i % 2 === 1 ? T.elevated : T.surface }}>
                  <Td><span style={{ color: T.text, fontFamily: T.fontSans, fontWeight: 500 }}>{l}</span></Td>
                  <Td mono><span style={{ color: gW ? T.blueText : T.textSub, fontWeight: gW ? 700 : 400 }}>{g}</span></Td>
                  <Td mono><span style={{ color: !gW ? T.purpleText : T.textSub, fontWeight: !gW ? 700 : 400 }}>{p}</span></Td>
                  <Td><Badge variant={gW ? "blue" : "purple"}>{gW ? "GBFS" : "PSO"}</Badge></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   STEP 4 — OFFLOAD
═══════════════════════════════════════════════ */
const Step4 = ({ machine: m, gbfsData, psoData, offloadResult, offloading, offloadError, onOffload, algoServer }) => {
  const T = useTheme();
  if (!gbfsData || !psoData) return <InfoBox variant="amber">Run both algorithms first.</InfoBox>;

  const gbfsWins = gbfsData.latency <= psoData.latency;
  const bestAlgo = gbfsWins ? "GBFS" : "PSO";
  const srv      = SERVERS[algoServer];
  const sc       = srvColors(T, algoServer);

  const flowNodes = [
    { label: m.machineId, sub: "IoT device",       bg: T.blueBg,   border: T.blueBorder,   c: T.blueText  },
    null,
    { label: "Network",   sub: `${m.bandwidth} Mbps`, bg: T.amberBg, border: T.amberBorder, c: T.amberText },
    null,
    { label: srv.label,   sub: "Edge node",        bg: sc.bg,      border: sc.border,      c: sc.text     },
    null,
    { label: "Supabase",  sub: "Logs saved",       bg: T.purpleBg, border: T.purpleBorder, c: T.purpleText},
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Offload task</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "5px 0 0", fontFamily: T.fontSans }}>
          Dispatch <strong style={{ color: T.text }}>{m.name}</strong> to <strong style={{ color: T.text }}>{srv.label}</strong>. Result logged to Supabase.
        </p>
      </div>

      <Card title="Offload path" sub="IoT device → network → edge → database" accent={T.blue}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", padding: "8px 0" }}>
          {flowNodes.map((node, i) => node === null ? (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "0 6px", color: T.textDim, fontSize: 12 }}>→</div>
          ) : (
            <div key={i} style={{
              flex: "1 1 90px", maxWidth: 120,
              border: `1px solid ${node.border}`, borderRadius: 8,
              padding: "11px 8px", textAlign: "center", background: node.bg,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: node.c, fontFamily: T.fontMono, marginBottom: 2 }}>{node.label}</div>
              <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.fontSans }}>{node.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title={`Send to ${srv.label}`} sub={`POST → ${srv.baseUrl}/offload`} accent={sc.accent}>
        {offloadError && <div style={{ marginBottom: 14 }}><InfoBox variant="red">Offload failed — {offloadError}</InfoBox></div>}
        {!offloadResult ? (
          <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
            <PrimaryBtn onClick={onOffload} disabled={offloading}>
              {offloading ? `Sending to ${srv.label}…` : `Offload task → ${srv.label}`}
            </PrimaryBtn>
            {offloading && <div style={{ fontSize: 11, color: T.textDim, fontFamily: T.fontMono, marginTop: 8 }}>POST {srv.baseUrl}/offload → Supabase</div>}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              {[
                ["Task size",   `${m.taskSize} MB`,            "blue"],
                ["Algorithm",  bestAlgo,                       gbfsWins ? "blue" : "purple"],
                ["Server",     srv.label,                      "green"],
                ["Bandwidth",  `${m.bandwidth} Mbps`,          "dim"],
                ["Trans. delay",`${m.transmissionDelay} ms`,   "amber"],
                ["Status",     offloadResult.status === "success" ? "Success" : "Failed", offloadResult.status === "success" ? "green" : "red"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ flex: "1 1 120px", background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "11px 13px" }}>
                  <div style={{ fontSize: 10, color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5, fontFamily: T.fontSans }}>{l}</div>
                  <Badge variant={c}>{v}</Badge>
                </div>
              ))}
            </div>
            <InfoBox variant="green">
              Task offloaded to {srv.label}. Measured latency: <strong style={{ fontFamily: T.fontMono }}>{offloadResult.measuredLatency} ms</strong>. Saved to Supabase.
            </InfoBox>
          </>
        )}
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   STEP 5 — RESULTS
═══════════════════════════════════════════════ */
const CustomTooltip = ({ active, payload, label }) => {
  const T = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 13px", fontFamily: T.fontMono }}>
      <div style={{ fontSize: 11, color: T.textSub, marginBottom: 5 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontSize: 12, color: p.color, marginBottom: 2 }}>
          {p.dataKey}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const CompareTable = ({ gbfsData, psoData }) => {
  const T = useTheme();
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr><Th>Metric</Th><Th>GBFS</Th><Th>PSO</Th><Th>Winner</Th></tr></thead>
      <tbody>
        {[
          ["Latency (ms)",      gbfsData.latency,     psoData.latency,     "lower"],
          ["Speed (tasks/s)",   gbfsData.throughput,  psoData.throughput,  "higher"],
          ["Energy (kWh)",      gbfsData.energy,      psoData.energy,      "lower"],
          ["Utilization (%)",   gbfsData.utilization, psoData.utilization, "lower"],
          ["Response time (ms)",gbfsData.time,        psoData.time,        "lower"],
        ].map(([l, g, p, dir], i) => {
          const gW = dir === "lower" ? +g <= +p : +g >= +p;
          return (
            <tr key={l} style={{ background: i % 2 === 1 ? T.elevated : T.surface }}>
              <Td><span style={{ fontFamily: T.fontSans, fontWeight: 500, color: T.text }}>{l}</span></Td>
              <Td mono><span style={{ color: gW ? T.blueText : T.textSub, fontWeight: gW ? 700 : 400 }}>{g}</span></Td>
              <Td mono><span style={{ color: !gW ? T.purpleText : T.textSub, fontWeight: !gW ? 700 : 400 }}>{p}</span></Td>
              <Td><Badge variant={gW ? "blue" : "purple"}>{gW ? "GBFS" : "PSO"}</Badge></Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const Step5 = ({ machine: m, gbfsData, psoData, offloadResult, algoServer }) => {
  const T = useTheme();
  if (!gbfsData || !psoData) return <InfoBox variant="amber">Run both algorithms first.</InfoBox>;

  const gbfsWins    = gbfsData.latency <= psoData.latency;
  const winner      = gbfsWins ? "GBFS" : "PSO";
  const improvement = Math.abs(((gbfsData.latency - psoData.latency) / gbfsData.latency) * 100).toFixed(1);
  const srv         = SERVERS[algoServer];
  const gbfsBase    = +gbfsData.latency;
  const psoBase     = +psoData.latency;
  const measuredLat = offloadResult?.measuredLatency;

  const lineData = [1,2,3,4,5,6].map(t => ({
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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.fontSans }}>Latency results</h1>
        <p style={{ fontSize: 13, color: T.textSub, margin: "5px 0 0", fontFamily: T.fontSans }}>
          Task from <strong style={{ color: T.text }}>{m.name}</strong> processed on <strong style={{ color: T.text }}>{srv.label}</strong>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard label="Winner"        value={winner}             variant={gbfsWins ? "blue" : "purple"} />
        <StatCard label="GBFS latency"  value={`${gbfsBase} ms`}   variant="blue" />
        <StatCard label="PSO latency"   value={`${psoBase} ms`}    variant="purple" />
        <StatCard label="Improvement"   value={`${improvement}%`}  variant="amber" />
        {measuredLat && <StatCard label="Actual latency" value={`${measuredLat} ms`} variant="green" />}
      </div>

      {/* Winner banner */}
      <div style={{
        background: T.elevated, border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${gbfsWins ? T.blue : T.purple}`,
        borderRadius: "0 8px 8px 0",
        padding: "16px 20px", marginBottom: 14,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ fontSize: 38, fontWeight: 800, color: gbfsWins ? T.blueText : T.purpleText, fontFamily: T.fontMono, lineHeight: 1 }}>
          {winner}
        </div>
        <div>
          <div style={{ fontSize: 13, color: T.text, fontFamily: T.fontSans, marginBottom: 3 }}>
            Achieved <strong style={{ fontFamily: T.fontMono }}>{Math.min(gbfsBase, psoBase)} ms</strong> on <strong>{srv.label}</strong>
          </div>
          <div style={{ fontSize: 11, color: T.textSub, fontFamily: T.fontSans }}>
            {improvement}% lower latency than {gbfsWins ? "PSO" : "GBFS"}
            {measuredLat && ` · Actual: ${measuredLat} ms`}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <Card title="Latency over time" sub={`6-cycle simulation on ${srv.label}`} accent={T.blue}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 8, right: 18, left: 0, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.borderSub} />
            <XAxis dataKey="cycle" stroke={T.textDim} fontSize={11} fontFamily={T.fontMono} label={{ value: "Cycle", position: "insideBottom", offset: -6, fill: T.textDim, fontSize: 10 }} />
            <YAxis stroke={T.textDim} fontSize={11} fontFamily={T.fontMono} unit=" ms" domain={["auto","auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.fontMono }} verticalAlign="top" />
            <ReferenceLine y={gbfsBase} stroke={T.blue}   strokeDasharray="4 4" strokeOpacity={0.35} />
            <ReferenceLine y={psoBase}  stroke={T.purple} strokeDasharray="4 4" strokeOpacity={0.35} />
            <Line type="monotone" dataKey="GBFS"     stroke={T.chart1} strokeWidth={2.5} dot={{ r: 4, fill: T.chart1, stroke: T.surface, strokeWidth: 2 }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="PSO"      stroke={T.chart2} strokeWidth={2.5} dot={{ r: 4, fill: T.chart2, stroke: T.surface, strokeWidth: 2 }} activeDot={{ r: 7 }} />
            {measuredLat && <Line type="monotone" dataKey="Measured" stroke={T.chart3} strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4, fill: T.chart3, stroke: T.surface, strokeWidth: 2 }} activeDot={{ r: 7 }} />}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar chart */}
      <Card title="Full metrics comparison" sub={`All indicators from ${srv.label}`} accent={T.purple}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 8, right: 14, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.borderSub} />
            <XAxis dataKey="metric" stroke={T.textDim} fontSize={10} fontFamily={T.fontMono} />
            <YAxis stroke={T.textDim} fontSize={11} fontFamily={T.fontMono} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.fontMono }} />
            <Bar dataKey="GBFS" fill={T.chart1} radius={[4,4,0,0]}><LabelList dataKey="GBFS" position="top" fill={T.textDim} fontSize={9} fontFamily={T.fontMono} /></Bar>
            <Bar dataKey="PSO"  fill={T.chart2} radius={[4,4,0,0]}><LabelList dataKey="PSO"  position="top" fill={T.textDim} fontSize={9} fontFamily={T.fontMono} /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary table */}
      <Card title="Result summary" sub={`${m.name} · ${srv.label}`} accent={T.green}>
        <CompareTable gbfsData={gbfsData} psoData={psoData} />
        <div style={{ marginTop: 14 }}>
          <InfoBox variant="green">
            <strong>{m.name}</strong> offloaded to <strong>{srv.label}</strong> using <strong>{winner}</strong>.
            {measuredLat && <> Actual latency: <strong style={{ fontFamily: T.fontMono }}>{measuredLat} ms</strong>.</>} Saved to Supabase.
          </InfoBox>
        </div>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   ERROR BOUNDARY
═══════════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 32, color: "#f85149", fontFamily: "monospace" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Runtime error</div>
        <pre style={{ fontSize: 11, color: "#8b949e" }}>{this.state.error?.toString()}</pre>
      </div>
    );
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════ */
export default function App() {
  const [dark,           setDark]           = useState(true);
  const T = dark ? DARK : LIGHT;

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
    } catch (err) { setAlgoError(err.message); }
    finally { setAlgoRunning(false); }
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
      case 0: return <Step0 machineData={machineData} loading={machinesLoading} error={machinesError} selectedId={selectedId} setSelectedId={handleSelectMachine} onRetry={loadMachines} />;
      case 1: return machine ? <Step1 machine={machine} /> : null;
      case 2: return machine ? <Step2 machine={machine} gbfsData={gbfsData} psoData={psoData} algoRunning={algoRunning} algoError={algoError} selectedServer={algoServer} setSelectedServer={k => { setAlgoServer(k); setGbfsData(null); setPsoData(null); }} onRunBoth={runBothAlgorithms} gbfsProgress={gbfsProgress} psoProgress={psoProgress} /> : null;
      case 3: return machine ? <Step3 machine={machine} gbfsData={gbfsData} psoData={psoData} algoServer={algoServer} /> : null;
      case 4: return machine ? <Step4 machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} offloading={offloading} offloadError={offloadError} onOffload={offloadTask} algoServer={algoServer} /> : null;
      case 5: return machine ? <Step5 machine={machine} gbfsData={gbfsData} psoData={psoData} offloadResult={offloadResult} algoServer={algoServer} /> : null;
      default: return null;
    }
  };

  return (
    <ThemeCtx.Provider value={T}>
      <ErrorBoundary>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: ${T.bg}; }
          ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: ${T.textDim}; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.text, transition: "background 0.2s,color 0.2s" }}>
          <Sidebar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} serverStatuses={serverStatuses} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
            <TopBar step={step} maxReached={maxReached} onJump={i => i <= maxReached && setStep(i)} algoServer={algoServer} dark={dark} setDark={setDark} />
            <div style={{ flex: 1, padding: "22px 26px", overflowY: "auto", background: T.bg }}>
              {renderStep()}
            </div>
            <div style={{
              background: T.surface, borderTop: `1px solid ${T.border}`,
              padding: "11px 26px", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <GhostBtn disabled={step === 0} onClick={() => setStep(p => p - 1)}>← Back</GhostBtn>
              <span style={{ fontSize: 11, color: T.textDim, fontFamily: T.fontMono }}>{STEPS[step].title}</span>
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
