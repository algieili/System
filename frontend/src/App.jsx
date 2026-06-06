import React, { useState } from "react";
import "./App.css";
import { computeGbfsScore } from "./algorithms/gbfs";
import { computePsoScore } from "./algorithms/pso";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList
} from "recharts";

/* ---------------- CONFIG ---------------- */

const STEP_DETAILS = [
  { title: "DATA INPUT & GENERATION", desc: "Enter machine data and generate tasks." },
  { title: "ALGORITHMS APPLIED", desc: "GBFS vs PSO evaluation." },
  { title: "DECISION EVALUATION", desc: "Compare and select best result." },
  { title: "TASK PROCESSING", desc: "Edge/Cloud assignment." },
  { title: "EXECUTION RESULTS", desc: "Logs & analytics." }
];

const STEPS = STEP_DETAILS.map(s => s.title);

const COLORS = {
  Delay: "#3b82f6",
  Speed: "#10b981",
  Energy: "#f97316",
  Usage: "#a855f7"
};

/* ---------------- UI COMPONENTS ---------------- */

const PanelHeader = ({ title, description, variant }) => (
  <div className={`panel-label ${variant === "main" ? "main-header" : ""}`}>
    {title}
    {description && <span className="helper-text">{description}</span>}
  </div>
);

/* ---------------- SIDEBAR ---------------- */

const SidebarNavigation = ({ currentStep, onJump }) => (
  <div className="sidebar">
    <h1>Task Offloading</h1>
    <p>Simulation System</p>
    {STEP_DETAILS.map((step, idx) => (
      <button
        key={idx}
        className={`nav-item ${idx === currentStep ? "active" : ""}`}
        onClick={() => onJump(idx)}
      >
        <div className="nav-title">{idx + 1}. {step.title}</div>
        <div className="nav-desc">{step.desc}</div>
      </button>
    ))}
  </div>
);

/* ---------------- FLOW ---------------- */

const SystemFlow = ({ currentStep, maxReached, onJump }) => (
  <div className="top-bar">
    {STEPS.map((step, idx) => (
      <React.Fragment key={idx}>
        <div className="flow-step">
          <span
            className={`flow-dot ${idx <= maxReached ? "clickable" : ""}`}
            onClick={() => idx <= maxReached && onJump(idx)}
          >
            ●
          </span>
          <span
            className={`flow-label ${idx <= maxReached ? "clickable" : ""}`}
            onClick={() => idx <= maxReached && onJump(idx)}
          >
            {step}
          </span>
        </div>
        {idx < STEPS.length - 1 && <span className="flow-arrow">→</span>}
      </React.Fragment>
    ))}
  </div>
);

/* ---------------- NAV ---------------- */

const StepNavigation = ({ currentStep, maxReached, onNext, onPrev }) => (
  <div className="bottom-nav">
    <button onClick={onPrev} disabled={currentStep === 0}>
      ← BACK
    </button>
    <button
      onClick={onNext}
      disabled={currentStep >= maxReached || currentStep >= 4}
    >
      NEXT →
    </button>
  </div>
);

/* ---------------- PLASMA MODEL ---------------- */

const lookupPlasmaMatrix = (material, thickness, current) => {
  const baselineSpeed = current * 20;

  let cutSpeed = baselineSpeed;
  let voltage = 140;
  let pierceDelayTime = 0.2;

  if (material === "Mild Steel") {
    cutSpeed *= Math.exp(-thickness / 10) * 1.5;
    voltage = 130 + thickness * 1.5;
  } else if (material === "Stainless Steel") {
    cutSpeed *= Math.exp(-thickness / 10) * 1.2;
    voltage = 135 + thickness * 1.8;
  } else if (material === "Aluminum") {
    cutSpeed *= Math.exp(-thickness / 12) * 1.7;
    voltage = 140 + thickness * 1.2;
  }

  return {
    cutSpeed: Math.max(100, Math.min(6000, Math.round(cutSpeed))),
    voltage: Math.max(100, Math.min(200, Math.round(voltage))),
    pierceDelayTime,
    torchDistance: 3.2,
    pierceHeight: 6.4
  };
};

/* ---------------- INPUT PANEL ---------------- */

const OperationalMetricsPanel = ({ inputs, setInputs, onRun, isProcessing }) => {
  const isValid =
    inputs["Material Type"] &&
    inputs["Material Thickness (millimeters)"] &&
    inputs["Cutting Current (amperes)"];

  return (
    <div className="card">
      <PanelHeader title="DATA INPUT" description="Enter machining parameters." />

      {Object.keys(inputs).map((k) => (
        <div className="data-row" key={k}>
          <span>{k}</span>

          {k === "Material Type" ? (
            <select
              value={inputs[k]}
              onChange={(e) => setInputs({ ...inputs, [k]: e.target.value })}
            >
              <option value="">Select</option>
              <option>Mild Steel</option>
              <option>Stainless Steel</option>
              <option>Aluminum</option>
            </select>
          ) : (
            <input
              type="number"
              value={inputs[k]}
              onChange={(e) =>
                setInputs({ ...inputs, [k]: e.target.value })
              }
            />
          )}
        </div>
      ))}

      <button disabled={!isValid || isProcessing} onClick={onRun}>
        {isProcessing ? "Processing..." : "GENERATE"}
      </button>
    </div>
  );
};

/* ---------------- FIXED ALGO PANEL ---------------- */

const AlgoPanel = ({ title, colorClass, data }) => (
  <div className="card">
    <PanelHeader title={title} />
    <div className={`section-title ${colorClass}`}>
      {title}
    </div>

    <div className="data-row">Latency: {data?.latency}</div>
    <div className="data-row">Speed: {data?.throughput}</div>
    <div className="data-row">Energy: {data?.energy}</div>
    <div className="data-row">Utilization: {data?.utilization}</div>
  </div>
);

/* ---------------- MAIN APP ---------------- */

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [inputs, setInputs] = useState({
    "Material Type": "",
    "Material Thickness (millimeters)": "",
    "Cutting Current (amperes)": ""
  });

  const [gbfsData, setGbfsData] = useState(null);
  const [psoData, setPsoData] = useState(null);
  const [decision, setDecision] = useState({});
  const [logs, setLogs] = useState([]);

  const handleRun = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const material = inputs["Material Type"] || "Mild Steel";
      const thickness = parseFloat(inputs["Material Thickness (millimeters)"]) || 10;
      const current = parseFloat(inputs["Cutting Current (amperes)"]) || 40;

      const plasma = lookupPlasmaMatrix(material, thickness, current);

      const params = {
        latency_milliseconds: plasma.pierceDelayTime * 1000,
        energy_watts: plasma.voltage * current,
        processingSpeed: plasma.cutSpeed / 6000,
        complexity_score: thickness
      };

      const gbfs = computeGbfsScore(params);
      const pso = computePsoScore(params);

      setGbfsData(gbfs);
      setPsoData(pso);

      const winner =
        parseFloat(gbfs.throughput) > parseFloat(pso.throughput)
          ? "GBFS"
          : "PSO";

      const server = "Cloud";

      setDecision({ winner, server, taskType: "Computation-Intensive" });

      // FIXED LOG ID (no stale state bug)
      setLogs((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          timestamp: new Date().toISOString(),
          category: "Cutting",
          type: "Computation-Intensive",
          delay: `${gbfs.latency}/${pso.latency}`,
          speed: `${gbfs.throughput}/${pso.throughput}`,
          winner,
          server,
          status: "SUCCESS"
        }
      ]);

      setCurrentStep(1);
      setMaxReached(4);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="dashboard-layout">
      <SidebarNavigation currentStep={currentStep} onJump={setCurrentStep} />

      <div className="content-area">
        <SystemFlow
          currentStep={currentStep}
          maxReached={maxReached}
          onJump={setCurrentStep}
        />

        <div className="main-content">
          {currentStep === 1 && (
            <div className="row-container">
              <AlgoPanel title="GBFS" colorClass="cyan-text" data={gbfsData} />
              <AlgoPanel title="PSO" colorClass="magenta-text" data={psoData} />
            </div>
          )}
        </div>

        <StepNavigation
          currentStep={currentStep}
          maxReached={maxReached}
          onPrev={() => setCurrentStep((p) => Math.max(0, p - 1))}
          onNext={() => setCurrentStep((p) => Math.min(4, p + 1))}
        />
      </div>
    </div>
  );
}
