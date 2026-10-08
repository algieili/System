import React from "react";
import { useT } from "../../../context/ThemeContext";
import { normalizeServerKey } from "../../../utils/serverLabels";

const SERVER_ORDER = ["SERVER_A", "SERVER_B", "LOCAL_MACHINE"];

const SERVER_META = {
  SERVER_A: { label: "Edge A", color: "#60a5fa", cores: 2 },
  SERVER_B: { label: "Cloud B", color: "#f97316", cores: 8 },
  LOCAL_MACHINE: { label: "Local C", color: "#22c55e", cores: 2 },
};

const getServerMeta = (serverKey) => {
  const key = normalizeServerKey(serverKey);
  const lookup = key && key.toUpperCase();

  if (lookup === "SERVER_A") return SERVER_META.SERVER_A;
  if (lookup === "SERVER_B") return SERVER_META.SERVER_B;
  if (lookup === "LOCAL_MACHINE" || lookup === "LOCAL" || lookup === "SERVER_C") return SERVER_META.LOCAL_MACHINE;
  return { label: key || "Unknown", color: "#94a3b8", cores: 4 };
};

const getChartedCpu = (serverUsage, taskList, meta) => {
  if (typeof serverUsage?.cpu_utilization_percent === "number") {
    return Math.max(0, Math.min(100, serverUsage.cpu_utilization_percent));
  }

  if (!taskList.length) return 0;
  const activeCpu = taskList.reduce((total, task) => total + (Number(task.cpu_usage_percent ?? task.cpu_demand_percent ?? 0) || 0), 0);
  const denominator = (meta.cores || 1) * 100;
  return Math.max(0, Math.min(100, (activeCpu / denominator) * 100));
};

const getChartedRam = (serverUsage, taskList) => {
  if (typeof serverUsage?.memory_utilization_percent === "number") {
    return Math.max(0, Math.min(100, serverUsage.memory_utilization_percent));
  }

  if (!taskList.length) return 0;
  const totalRam = taskList.reduce((total, task) => total + (Number(task.memory_usage_mb ?? task.ram_demand_mb ?? 0) || 0), 0);
  return Math.max(0, Math.min(100, totalRam / 1000 * 100));
};

const getServerSummary = (tasks, serverUsage) => {
  const active = tasks.filter((task) => ["TRANSFERRING", "IN_QUEUE", "RUNNING"].includes(task.status));
  const sending = tasks.filter((task) => task.status === "TRANSFERRING");
  const queue = tasks.filter((task) => task.status === "IN_QUEUE");
  const done = tasks.filter((task) => task.status === "FINISHED");
  const failed = tasks.filter((task) => task.status === "FAILED");
  const late = failed.filter((task) => /sla|deadline/i.test(task.error_message || ""));

  const serverKey = normalizeServerKey(tasks[0]?.assigned_server || "");
  const meta = getServerMeta(serverKey || SERVER_ORDER[0]);
  const cpuUsage = getChartedCpu(serverUsage, active, meta);
  const ramUsage = getChartedRam(serverUsage, active);

  return {
    active,
    sending,
    queue,
    done,
    failed,
    late,
    busy: active.length > 0 || sending.length > 0 || queue.length > 0,
    cpuUsage,
    ramUsage,
    meta,
    status: active.length > 0 || sending.length > 0 || queue.length > 0 ? "Busy" : "Idle",
  };
};

const Legend = () => {
  const T = useT();
  const items = [
    { label: "Sending", color: T.blue },
    { label: "Waiting in queue", color: T.amber },
    { label: "Running on a core", color: T.purple },
    { label: "Done on time", color: T.green },
    { label: "Late or rejected", color: T.red },
    { label: "Past deadline", color: T.muted },
  ];

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, display: "inline-block" }} />
          <span style={{ fontSize: 10, color: T.dim, fontFamily: T.fontSans }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const TaskPill = ({ label, color, background }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 20,
      height: 20,
      padding: "0 6px",
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      color,
      background,
      border: `1px solid ${background}`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
    }}
  >
    {label}
  </span>
);

const ServerStatRow = ({ label, values, color, emptyLabel = "—" }) => {
  const T = useT();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "58px 1fr", gap: 8, alignItems: "center" }}>
      <span style={{ color: T.dim, fontSize: 10, fontFamily: T.fontSans, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, minHeight: 20 }}>
        {values.length ? values.map((value) => (
          <TaskPill key={value} label={value} color={color} background={`${color}22`} />
        )) : (
          <span style={{ color: T.muted, fontSize: 10, fontFamily: T.fontMono }}>{emptyLabel}</span>
        )}
      </div>
    </div>
  );
};

const CoreMeter = ({ count, utilization, accentColor }) => {
  const T = useT();
  const cells = Array.from({ length: count }, (_, index) => {
    const active = index < Math.max(0, Math.round((utilization / 100) * count));
    return (
      <span
        key={index}
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: active ? accentColor : T.elevated,
          border: active ? `1px solid ${accentColor}66` : `1px solid ${T.border}`,
          boxShadow: active ? `0 0 0 1px ${accentColor}33 inset` : "none",
        }}
      />
    );
  });

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", minHeight: 14 }}>
      {cells}
    </div>
  );
};

const ServerCard = ({ serverKey, tasks, usage, accentColor, compact = false }) => {
  const T = useT();
  const meta = getServerMeta(serverKey);
  const summary = getServerSummary(tasks, usage);
  const coreCount = Math.max(1, meta.cores || 4);

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "10px 11px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: compact ? 142 : 148,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color, display: "inline-block" }} />
          <span style={{ color: T.text, fontWeight: 700, fontSize: 12, fontFamily: T.fontSans }}>{meta.label}</span>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: T.fontSans,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: summary.busy ? T.blue : T.muted,
            background: summary.busy ? T.blueBg : T.elevated,
            border: `1px solid ${summary.busy ? T.blue : T.border}`,
          }}
        >
          {summary.status}
        </span>
      </div>

      <ServerStatRow label="Sending" values={summary.sending.map((task) => String(task.task_id || task.task_name || "#").slice(-2) || "1")} color={T.blue} emptyLabel="" />
      <ServerStatRow label="Queue" values={summary.queue.map((task) => String(task.task_id || task.task_name || "#").slice(-2) || "1")} color={T.amber} emptyLabel="" />

      <div style={{ display: "grid", gridTemplateColumns: "58px 1fr", gap: 8, alignItems: "center" }}>
        <span style={{ color: T.dim, fontSize: 10, fontFamily: T.fontSans, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cores</span>
        <CoreMeter count={coreCount} utilization={summary.cpuUsage} accentColor={accentColor || meta.color} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "58px 1fr", gap: 8, alignItems: "center" }}>
        <span style={{ color: T.dim, fontSize: 10, fontFamily: T.fontSans, textTransform: "uppercase", letterSpacing: "0.06em" }}>Done</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, minHeight: 20 }}>
          {summary.done.length ? summary.done.map((task, index) => (
            <TaskPill key={`${task.task_id}-${index}`} label={String(task.task_id || task.task_name || index + 1).slice(-2)} color={T.green} background={`${T.green}22`} />
          )) : (
            <span style={{ color: T.muted, fontSize: 10, fontFamily: T.fontMono }}>—</span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "58px 1fr", gap: 8, alignItems: "center" }}>
        <span style={{ color: T.dim, fontSize: 10, fontFamily: T.fontSans, textTransform: "uppercase", letterSpacing: "0.06em" }}>Memory</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: T.muted, fontFamily: T.fontMono }}>
            <span>{Math.round(summary.ramUsage)}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: T.elevated, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max(0, Math.min(100, summary.ramUsage))}%`,
                height: "100%",
                borderRadius: 999,
                background: summary.ramUsage >= 80 ? T.red : summary.ramUsage >= 60 ? T.amber : T.blue,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const AlgoLivePanel = ({ algorithm, tasks, running, accentColor, serverUsage = {} }) => {
  const T = useT();

  const total = tasks.length;
  const onTime = tasks.filter((task) => task.status === "FINISHED").length;
  const late = tasks.filter((task) => task.status === "FAILED" && /sla|deadline/i.test(task.error_message || "")).length;
  const rejected = tasks.filter((task) => task.status === "FAILED").length - late;
  const inProgress = Math.max(0, total - onTime - late - rejected);

  const serverSnapshots = SERVER_ORDER.map((serverKey) => {
    const serverTasks = tasks.filter((task) => normalizeServerKey(task.assigned_server) === serverKey);
    return {
      key: serverKey,
      tasks: serverTasks,
      usage: serverUsage[serverKey] || serverUsage[`${algorithm}:${serverKey}`] || {},
    };
  });

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderTop: `2px solid ${accentColor}`,
        borderRadius: 8,
        padding: "12px 14px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, fontFamily: T.fontSans, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {algorithm}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[{ label: "On time", value: onTime, color: T.green }, { label: "Late", value: late, color: T.red }, { label: "Rejected", value: rejected, color: T.red }, { label: "In progress", value: inProgress, color: T.blue }].map((item) => (
            <div key={item.label} style={{ minWidth: 62, background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.dim, fontFamily: T.fontSans, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: item.color, fontFamily: T.fontMono, lineHeight: 1.2 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <Legend />

      <div style={{ display: "grid", gap: 10 }}>
        {serverSnapshots.map((snapshot) => (
          <ServerCard
            key={snapshot.key}
            serverKey={snapshot.key}
            tasks={snapshot.tasks}
            usage={snapshot.usage}
            accentColor={accentColor}
            compact
          />
        ))}
      </div>

      {!running && total > 0 && onTime === 0 && late === 0 && rejected === 0 && inProgress === total && (
        <div style={{ fontSize: 11, color: T.dim, fontFamily: T.fontSans, textAlign: "center", paddingTop: 2 }}>
          Waiting for run to start…
        </div>
      )}
    </div>
  );
};

