import React, { useState } from "react";
import "./App.css";
import { computeGbfsScore } from "./algorithms/gbfs";
import { computePsoScore } from "./algorithms/pso";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell
} from "recharts";

const STEP_DETAILS = [
  { title: "DATA INPUT & GENERATION", desc: "Enter machine data and generate tasks for processing." },
  { title: "ALGORITHMS APPLIED", desc: "Evaluate tasks using Greedy Best-First Search (GBFS) and Particle Swarm Optimization (PSO) algorithms." },
  { title: "DECISION EVALUATION", desc: "Compare results and determine the best processing choice." },
  { title: "TASK PROCESSING", desc: "Assign and simulate task execution on Edge or Cloud." },
  { title: "EXECUTION RESULTS", desc: "View performance results, graphs, and execution logs." }
];

const STEPS = STEP_DETAILS.map(s => s.title);

// --- Subcomponents ---

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

const SystemFlow = ({ currentStep, maxReached, onJump }) => (
  <div className="top-bar">
    {STEPS.map((step, idx) => (
      <React.Fragment key={idx}>
        <div className="flow-step">
          <span 
            className={`flow-dot ${idx < currentStep ? "completed" : idx === currentStep ? "active" : ""} ${idx <= maxReached ? "clickable" : ""}`}
            onClick={() => idx <= maxReached && onJump(idx)}
          >●</span>
          <span 
            className={`flow-label ${idx < currentStep ? "completed" : idx === currentStep ? "active" : ""} ${idx <= maxReached ? "clickable" : ""}`}
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

const StepNavigation = ({ currentStep, maxReached, onNext, onPrev }) => (
  <div className="bottom-nav">
    <button className="nav-btn" onClick={onPrev} disabled={currentStep === 0}>← BACK</button>
    <button className="nav-btn next" onClick={onNext} disabled={currentStep >= maxReached || currentStep >= 4}>NEXT →</button>
  </div>
);

const PanelHeader = ({ title, description, variant }) => (
  <div className={`panel-label ${variant === 'main' ? 'main-header' : ''}`}>
    {title}
    {description && <span className="helper-text">{description}</span>}
  </div>
);

// --- Panels ---

const InputGuidePanel = () => (
  <div className="card">
    <PanelHeader title="INPUT GUIDE" description="Follow these steps to generate data." />
    <div className="guide-text">
      <p>Welcome to the Task Offloading Simulator.</p><br/>
      <p>• <strong>Machine:</strong> Configured for Plasma Cutting operations.</p>
      <p>• <strong>Input values:</strong> Enter specific operation data (ensure no blanks).</p>
      <p>• <strong>Click Generate:</strong> The system will simulate offloading choices.</p><br/>
      <p><strong>Navigating the System:</strong></p>
      <p>You can use NEXT and BACK buttons to review the simulation outcomes.</p>
    </div>
  </div>
);

const lookupPlasmaMatrix = (material, thickness, current) => {
    const baselineSpeed = current * 20; 
    let cutSpeed = 0;
    let voltage = 140;
    let pierceDelayTime = 0;
    let torchDistance = 3.2; 
    let pierceHeight = 6.4; 

    if (material === "Mild Steel") {
         cutSpeed = baselineSpeed * Math.exp(-thickness / 10) * 1.5;
         voltage = 130 + (thickness * 1.5);
         pierceDelayTime = thickness < 10 ? 0.1 : (thickness < 20 ? 0.5 : 1.0);
    } else if (material === "Stainless Steel") {
         cutSpeed = baselineSpeed * Math.exp(-thickness / 10) * 1.2;
         voltage = 135 + (thickness * 1.8);
         pierceDelayTime = thickness < 10 ? 0.2 : (thickness < 20 ? 0.6 : 1.2);
    } else if (material === "Aluminum") {
         cutSpeed = baselineSpeed * Math.exp(-thickness / 12) * 1.7; 
         voltage = 140 + (thickness * 1.2);
         pierceDelayTime = thickness < 10 ? 0.1 : (thickness < 20 ? 0.4 : 0.8);
    } else {
         cutSpeed = 1000;
    }
    
    cutSpeed = Math.max(100, Math.min(6000, Number(cutSpeed.toFixed(0))));
    voltage = Math.max(100, Math.min(200, Number(voltage.toFixed(0))));

    return { cutSpeed, voltage, pierceDelayTime, torchDistance, pierceHeight };
};

const OperationalMetricsPanel = ({ category, autoTask, inputs, setInputs, onRun, isProcessing }) => {
  const isFormValid = Object.keys(inputs).length > 0 && Object.values(inputs).every(v => v !== "");

  return (
    <div className="card">
      <PanelHeader title="DATA INPUT & GENERATION" description="Enter system data to begin the offloading evaluation." />
      
      <div className="section-title">Machine Information</div>
      <div className="data-row">
        <span className="data-label">Specific Machine</span>
        <span className="data-value" style={{fontWeight: 'bold', color: 'var(--cyan)'}}>Plasma Cutting Machine</span>
      </div>
      <div className="data-row">
        <span className="data-label">Machine Category</span>
        <span className="data-value">{category || "-"}</span>
      </div>
      <div className="data-row">
        <span className="data-label">Auto-Assigned Task Type</span>
        <span className="data-value">{autoTask || "-"}</span>
      </div>

      <div className="section-title">Machine Data</div>
      {Object.keys(inputs).map(k => (
        <div className="data-row" key={k}>
          <span className="data-label">{k}</span>
          {k === "Material Type" ? (
            <select className="data-select" value={inputs[k]} onChange={e => setInputs({...inputs, [k]: e.target.value})}>
              <option value="">Select Material</option>
              <option value="Mild Steel">Mild Steel</option>
              <option value="Stainless Steel">Stainless Steel</option>
              <option value="Aluminum">Aluminum</option>
            </select>
          ) : (
            <input 
              className="data-input" 
              type="number"
              placeholder={`Enter ${k.split("(")[0].trim()}`}
              value={inputs[k]} 
              onChange={e => setInputs({...inputs, [k]: e.target.value})} 
            />
          )}
        </div>
      ))}



      {!isFormValid && <p style={{color: "var(--yellow)", fontSize: "13px", marginTop: "10px"}}>Please fill out all manual input fields.</p>}

      <button className="btn-primary" disabled={!isFormValid || isProcessing} onClick={onRun}>
        {isProcessing ? "Processing..." : "GENERATE & OFFLOAD TASK"}
      </button>
    </div>
  );
};

// Error boundary catch
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: '20px', color: 'red'}}><h1>Something went wrong.</h1><pre>{this.state.error?.toString()}</pre></div>;
    }
    return this.props.children; 
  }
}

const COLORS = {
  Delay: "#3b82f6",
  Speed: "#10b981",
  Energy: "#f97316",
  Usage: "#a855f7"
};

const PerformanceOverviewPanel = ({ gbfs, pso }) => {
  if (!gbfs || !pso) return null;

  const prepareData = (data) => [
    { name: 'Delay (milliseconds)', value: parseFloat(data.latency) || 0, fill: COLORS.Delay },
    { name: 'Processing Speed (tasks per second)', value: parseFloat(data.throughput) || 0, fill: COLORS.Speed },
    { name: 'Energy (watts)', value: parseFloat(data.energy) || 0, fill: COLORS.Energy },
    { name: 'Resource Usage (percent)', value: parseFloat(data.utilization) || 0, fill: COLORS.Usage }
  ];

  const gbfsData = prepareData(gbfs);
  const psoData = prepareData(pso);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <PanelHeader title="Performance Overview" description="Visual breakdown of metric contributions." />
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
        <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '0' }}>Greedy Best-First Search (GBFS) Performance Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={gbfsData} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={80} dataKey="value">
                {gbfsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value).toFixed(2)} contentStyle={{backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc"}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
          <div className="section-title" style={{ fontSize: '14px', marginBottom: '0' }}>Particle Swarm Optimization (PSO) Performance Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={psoData} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={80} dataKey="value">
                {psoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value).toFixed(2)} contentStyle={{backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc"}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', backgroundColor: COLORS.Delay, borderRadius: '2px' }}></div><span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Delay</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', backgroundColor: COLORS.Speed, borderRadius: '2px' }}></div><span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Processing Speed</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', backgroundColor: COLORS.Energy, borderRadius: '2px' }}></div><span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Energy</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', backgroundColor: COLORS.Usage, borderRadius: '2px' }}></div><span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Resource Usage</span></div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '15px', fontStyle: 'italic' }}>
        This chart shows how each algorithm performs across different metrics. It helps visualize which factors contribute most to overall performance.
      </p>
    </div>
  );
};

const AlgoPanel = ({ title, color, data }) => (
  <div className="card">
    <PanelHeader title={title} description={`Detailed ${title.includes('(') ? title.split('(')[1].split(')')[0] : title.split(' ')[0]} metrics and target destination.`} />
    <p className="subtitle">Note: Lower delay means faster response time. Higher processing speed means more tasks completed per second.</p>
    <div className="section-title" style={{color: `var(--${color})`}}>{title.replace(/ EVALUATION| Evaluation/i, '')} Result</div>
    <div className="data-row"><span className="data-label">Delay (milliseconds)</span><span className="data-value">{data?.latency || 0}</span></div>
    <div className="data-row"><span className="data-label">Processing Speed (tasks per second)</span><span className="data-value">{data?.throughput || 0}</span></div>
    <div className="data-row"><span className="data-label">Energy (watts)</span><span className="data-value">{data?.energy || 0}</span></div>
    <div className="data-row"><span className="data-label">Resource Usage (percent)</span><span className="data-value">{data?.utilization || 0}</span></div>
    <div className="data-row"><span className="data-label">Response Time (milliseconds)</span><span className="data-value">{data?.time || '-'}</span></div>
    <div className="data-row"><span className="data-label">Remark</span><span className="data-value">{data?.remark || '-'}</span></div>
  </div>
);

const ComparisonEvaluationPanel = ({ gbfs, pso, winner }) => {
  if (!gbfs || !pso) return null;
  const getW = (metric) => {
    if(metric === "Delay") return parseFloat(gbfs.latency) < parseFloat(pso.latency) ? "GBFS" : "PSO";
    if(metric === "Processing Speed") return parseFloat(gbfs.throughput) > parseFloat(pso.throughput) ? "GBFS" : "PSO";
    if(metric === "Energy") return parseFloat(gbfs.energy) < parseFloat(pso.energy) ? "GBFS" : "PSO";
    if(metric === "Resource Usage") return parseFloat(gbfs.utilization) < parseFloat(pso.utilization) ? "GBFS" : "PSO";
  };
  return (
    <div className="card">
      <PanelHeader title="COMPARISON RESULTS" description="Direct comparison of GBFS and PSO metrics." />
      <table className="data-table">
        <thead>
          <tr><th>Metric</th><th>GBFS</th><th>PSO</th><th>Better Result (Based on Performance)</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Delay (milliseconds)</td><td>{gbfs.latency}</td><td>{pso.latency}</td>
            <td className={`val-bold ${getW('Delay') === 'GBFS' ? 'cyan-text' : 'magenta-text'}`}>{getW('Delay')}</td>
          </tr>
          <tr>
            <td>Processing Speed (tasks per second)</td><td>{gbfs.throughput}</td><td>{pso.throughput}</td>
            <td className={`val-bold ${getW('Processing Speed') === 'GBFS' ? 'cyan-text' : 'magenta-text'}`}>{getW('Processing Speed')}</td>
          </tr>
          <tr>
            <td>Energy (watts)</td><td>{gbfs.energy}</td><td>{pso.energy}</td>
            <td className={`val-bold ${getW('Energy') === 'GBFS' ? 'cyan-text' : 'magenta-text'}`}>{getW('Energy')}</td>
          </tr>
          <tr>
            <td>Resource Usage (percent)</td><td>{gbfs.utilization}</td><td>{pso.utilization}</td>
            <td className={`val-bold ${getW('Resource Usage') === 'GBFS' ? 'cyan-text' : 'magenta-text'}`}>{getW('Resource Usage')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ProcessingDecisionPanel = ({ decision, reason }) => (
  <div className="card">
    <PanelHeader title="PROCESSING DECISION" description="Final destination chosen by the smart offloading logic." />
    <div className={`decision-large ${decision === 'Edge' ? 'cyan-text' : 'magenta-text'}`}>
      OFFLOAD TO {decision ? decision.toUpperCase() : "..."}
    </div>
    <div className="decision-reason">Chosen because {reason}</div>
  </div>
);

const InterpretationAnalysisPanel = ({ winner, server, taskType }) => (
  <div className="card">
    <PanelHeader title="INTERPRETATION & ANALYSIS" description="Contextual breakdown of the offloading results." />
    <div className="interpretation-panel">
      <div className="interpretation-item">
        <p><strong>Algorithm Result:</strong> {winner} was deemed the better algorithm for this cycle because it optimized critical metrics better than its counterpart.</p>
      </div>
      <div className="interpretation-item">
        <p><strong>Decision Explanation:</strong> The system selected <strong>{server} processing</strong> primarily to handle the {taskType} task effectively.</p>
      </div>
      <div className="interpretation-item">
        <p><strong>Final Interpretation:</strong> Overall, deploying via {winner} to the {server} provided the most efficient compute solution for the system load.</p>
      </div>
    </div>
  </div>
);

const TaskAssignmentPanel = ({ taskType, server, summary }) => (
  <div className="card">
    <PanelHeader title="TASK ASSIGNMENT" description="Targeted server and task categorization." />
    <div className="data-row"><span className="data-label">Task Type</span><span className="data-value">{taskType}</span></div>
    <div className="data-row"><span className="data-label">Assigned Server</span><span className={`data-value ${server === 'Edge' ? 'cyan-text' : 'magenta-text'}`}>{server} Server</span></div>
    <div className="data-row"><span className="data-label">Summary</span><span className="data-value">{summary}</span></div>
  </div>
);

const ResultTransmissionPanel = () => (
  <div className="card">
    <PanelHeader title="RESULT TRANSMISSION" description="Confirmation of data flow back to the local device." />
    <div className="data-row"><span className="data-label">Processing Status</span><span className="data-value green-text">Complete</span></div>
    <div className="data-row"><span className="data-label">Transmission Time (milliseconds)</span><span className="data-value green-text">145 milliseconds</span></div>
    <div className="data-row"><span className="data-label">Network Return Status</span><span className="data-value green-text">Confirmed</span></div>
    <div className="data-row"><span className="data-label">Final Task Status</span><span className="data-value green-text">Success</span></div>
  </div>
);

const PerformanceMonitoringPanel = ({ gbfs, pso }) => {
  if (!gbfs || !pso) {
    return (
      <div className="card" style={{height: "400px", display: "flex", justifyContent: "center", alignItems: "center"}}>
        <p style={{color: "var(--text-muted)"}}>No performance data available yet.</p>
      </div>
    );
  }

  const chartData = [
    { metric: 'Delay (milliseconds)', GBFS: Number(gbfs.latency || 0), PSO: Number(pso.latency || 0) },
    { metric: 'Processing Speed (tasks per second)', GBFS: Number(gbfs.throughput || 0), PSO: Number(pso.throughput || 0) },
    { metric: 'Energy (watts)', GBFS: Number(gbfs.energy || 0), PSO: Number(pso.energy || 0) },
    { metric: 'Resource Usage (percent)', GBFS: Number(gbfs.utilization || 0), PSO: Number(pso.utilization || 0) }
  ];

  console.log("Rendering Performance Chart Data:", chartData);

  return (
    <div className="card" style={{minHeight: "450px"}}>
      <PanelHeader title="PERFORMANCE MONITORING" description="Continuous tracking of system efficiency and utilization." />
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="metric" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip contentStyle={{backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", color: "#111827"}} />
          <Legend />
          <Bar dataKey="GBFS" fill="#06B6D4" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="GBFS" position="top" fill="#6B7280" fontSize={12} />
          </Bar>
          <Bar dataKey="PSO" fill="#A855F7" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="PSO" position="top" fill="#6B7280" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", marginTop: "15px" }}>
        Note: Lower delay is better. Higher processing speed is better. Lower resource usage is better.
      </div>
    </div>
  );
};



const ExecutionResultsView = ({ gbfs, pso, logs, setLogs }) => {
  const [viewMode, setViewMode] = useState("Single Run"); 
  
  const aggregateLogs = (mode) => {
    const groups = {};
    logs.forEach(L => {
      if (!L.timestamp) return;
      const d = new Date(L.timestamp);
      let key = "";
      if (mode === "Daily Analysis") {
        key = d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
      } else { 
        const start = new Date(d);
        start.setDate(d.getDate() - d.getDay()); // Sunday
        key = `Week of ${start.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}`;
      }
      
      if (!groups[key]) {
        groups[key] = {
           time: key,
           gbfsLat: 0, psoLat: 0,
           gbfsSpeed: 0, psoSpeed: 0,
           gbfsEng: 0, psoEng: 0,
           gbfsUtil: 0, psoUtil: 0,
           count: 0, t: d.getTime()
        };
      }
      groups[key].gbfsLat += (L.gbfsLat || 0);
      groups[key].psoLat += (L.psoLat || 0);
      groups[key].gbfsSpeed += (L.gbfsSpeed || 0);
      groups[key].psoSpeed += (L.psoSpeed || 0);
      groups[key].gbfsEng += (L.gbfsEng || 0);
      groups[key].psoEng += (L.psoEng || 0);
      groups[key].gbfsUtil += (L.gbfsUtil || 0);
      groups[key].psoUtil += (L.psoUtil || 0);
      groups[key].count += 1;
    });

    return Object.values(groups).map(g => {
      const c = g.count;
      return {
        time: g.time, t: g.t,
        GBFS_Delay: Number((g.gbfsLat / c).toFixed(2)),
        PSO_Delay: Number((g.psoLat / c).toFixed(2)),
        GBFS_Speed: Number((g.gbfsSpeed / c).toFixed(2)),
        PSO_Speed: Number((g.psoSpeed / c).toFixed(2)),
        GBFS_Energy: Number((g.gbfsEng / c).toFixed(2)),
        PSO_Energy: Number((g.psoEng / c).toFixed(2)),
        GBFS_Util: Number((g.gbfsUtil / c).toFixed(2)),
        PSO_Util: Number((g.psoUtil / c).toFixed(2)),
        TotalTasks: c,
        Winner: (g.psoLat / c) < (g.gbfsLat / c) ? "PSO" : "GBFS"
      };
    }).sort((a,b) => a.t - b.t);
  };

  const trendData = viewMode === "Single Run" ? [] : aggregateLogs(viewMode);
  
  let insightText = "";
  let improvement = 0;
  if (trendData.length > 0) {
     const avgGbfs = trendData.reduce((acc, curr) => acc + curr.GBFS_Delay, 0) / trendData.length;
     const avgPso = trendData.reduce((acc, curr) => acc + curr.PSO_Delay, 0) / trendData.length;
     improvement = (((avgGbfs - avgPso) / avgGbfs) * 100).toFixed(1);
     insightText = `Over the visualized period, PSO made the system ${improvement}% faster in response time compared to GBFS, showing robust and consistent performance improvement over time.`;
  }

  return (
    <div className="step-container" style={{paddingBottom: "40px"}}>
      <PanelHeader title="EXECUTION RESULTS" description="View performance results, graphs, and execution logs." variant="main" />
      
      <PerformanceMonitoringPanel gbfs={gbfs} pso={pso} />

      <div style={{display: 'flex', gap: '10px', margin: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--card-border)', alignItems: 'center'}}>
        {["Single Run", "Daily Analysis", "Weekly Analysis"].map(m => (
          <button 
            key={m} 
            onClick={() => setViewMode(m)}
            style={{
              padding: '10px 16px', 
              backgroundColor: viewMode === m ? 'var(--cyan)' : 'transparent',
              color: viewMode === m ? '#000000' : 'var(--text-main)',
              border: viewMode === m ? 'none' : '1px solid var(--card-border)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: viewMode === m ? 'bold' : 'normal'
            }}
          >
            {m}
          </button>
        ))}
        <div style={{flex: 1}}></div>
        <button 
           onClick={() => setLogs([])}
           style={{
             padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', 
             border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
           }}
        >
           Clear Execution Logs
        </button>
      </div>

      {viewMode === "Single Run" ? (
        <div className="card">
          <PanelHeader title="EXECUTION LOGS" description="Detailed timestamped records of all historical decisions." />
          <table className="data-table">
            <thead>
              <tr>
                <th>No.</th><th>Timestamp</th><th>Machine Category</th><th>Task Type</th><th>Delay (milliseconds)</th><th>Speed (tasks per second)</th><th>Better Result (Based on Performance)</th><th>Server</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((L, i) => (
                <tr key={i}>
                  <td className="text-muted">{L.id}</td>
                  <td>{L.timestamp ? new Date(L.timestamp).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : "-"}</td>
                  <td>{L.category}</td>
                  <td>{L.type}</td>
                  <td>{L.delay}</td>
                  <td>{L.speed}</td>
                  <td className={L.winner === 'GBFS' ? 'cyan-text val-bold' : 'magenta-text val-bold'}>{L.winner}</td>
                  <td className={L.server === 'Edge' ? 'cyan-text val-bold' : 'magenta-text val-bold'}>{L.server}</td>
                  <td><span className="status-badge">{L.status}</span></td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan="9" style={{textAlign: "center", fontStyle: "italic", paddingTop: "20px"}}>No execution records available. Run a simulation to generate results.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{minHeight: "450px"}}>
          <PanelHeader title={`${viewMode.toUpperCase()} TREND`} description={`Aggregated task offloading performance over time.`} />
          {trendData.length === 0 ? (
            <p style={{padding: '20px', color: 'var(--text-muted)'}}>No execution records available. Run a simulation to generate results.</p>
          ) : (
            <>
              <div style={{marginBottom: "20px", display: 'flex', gap: '20px'}}>
                <div style={{flex: 1, backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '15px', borderRadius: '4px', borderLeft: '3px solid var(--cyan)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px'}}>SUMMARY INSIGHT</div>
                  <div style={{color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.5'}}>{insightText}</div>
                </div>
                <div style={{backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '15px', borderRadius: '4px', borderLeft: '3px solid var(--magenta)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: '150px'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Faster Response Time (%)</div>
                  <div style={{color: 'var(--magenta)', fontSize: '24px', fontWeight: 'bold'}}>{improvement}%</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" stroke="#6B7280" angle={-15} textAnchor="end" />
                  <YAxis stroke="#6B7280" label={{ value: 'Delay (milliseconds)', angle: -90, position: 'insideLeft', style:{fill:'#6B7280'} }} />
                  <Tooltip contentStyle={{backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", color: "#111827"}} />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="GBFS_Delay" name="GBFS Delay" stroke="#06B6D4" strokeWidth={3} dot={{r:4}} />
                  <Line type="monotone" dataKey="PSO_Delay" name="PSO Delay" stroke="#A855F7" strokeWidth={3} dot={{r:4}} />
                </LineChart>
              </ResponsiveContainer>
              <table className="data-table" style={{marginTop: '20px'}}>
                <thead>
                  <tr>
                    <th>Time Period</th>
                    <th>Tasks</th>
                    <th>Avg Delay (GBFS / PSO)</th>
                    <th>Avg Speed (GBFS / PSO)</th>
                    <th>Avg Energy (GBFS / PSO)</th>
                    <th>Avg Util (GBFS / PSO)</th>
                    <th>Better Result (Based on Performance)</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((d, i) => (
                    <tr key={i}>
                      <td>{d.time}</td>
                      <td>{d.TotalTasks}</td>
                      <td>{d.GBFS_Delay} / {d.PSO_Delay}</td>
                      <td>{d.GBFS_Speed} / {d.PSO_Speed}</td>
                      <td>{d.GBFS_Energy} / {d.PSO_Energy}</td>
                      <td>{d.GBFS_Util} / {d.PSO_Util}</td>
                      <td className={`val-bold ${d.Winner === 'GBFS' ? 'cyan-text' : 'magenta-text'}`}>{d.Winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

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
  const [decisionData, setDecisionData] = useState({});
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);

  const category = "Cutting Machines";
  const autoTask = "Computation-Intensive";

  const handleRun = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Mock params
      let materialType = inputs["Material Type"] || "Mild Steel";
      let thickness_millimeters = parseFloat(inputs["Material Thickness (millimeters)"]) || 10;
      let current_amperes = parseFloat(inputs["Cutting Current (amperes)"]) || 45;
      
      const autoFill = lookupPlasmaMatrix(materialType, thickness_millimeters, current_amperes);
      let materialFactor = materialType === "Aluminum" ? 0.8 : (materialType === "Stainless Steel" ? 1.2 : 1.0);
      let maxCutSpeed = 6000;
      
      let processingSpeed = autoFill.cutSpeed / maxCutSpeed;
      let latency_milliseconds = autoFill.pierceDelayTime * 1000;
      let energy_watts = autoFill.voltage * current_amperes;
      let complexity_score = thickness_millimeters * materialFactor;
      
      const params = {
        "Net Latency (milliseconds)": latency_milliseconds,
        "CPU Load (percent)": Math.random() * 45 + 50,
        "Task Queue": Math.random() * 9 + 1,
        "Power Usage (watts)": energy_watts,
        "Temperature (degrees Celsius)": Math.random()*20+40,
        "Task Type": autoTask,
        
        "materialType": materialType,
        "thickness_mm": thickness_millimeters,
        "current_amperes": current_amperes,
        "cutSpeed_mm_per_min": autoFill.cutSpeed,
        "voltage_volts": autoFill.voltage,
        "pierceDelay_seconds": autoFill.pierceDelayTime,
        "torchDistance_mm": autoFill.torchDistance,
        "pierceHeight_mm": autoFill.pierceHeight,
        "processingSpeed": processingSpeed,
        "latency_milliseconds": latency_milliseconds,
        "energy_watts": energy_watts,
        "complexity_score": complexity_score
      };
      
      const gbfs = computeGbfsScore(params);
      const pso = computePsoScore(params);
      setGbfsData(gbfs);
      setPsoData(pso);

      let winner, server, reason;
      if (autoTask === "Latency-Sensitive") {
        winner = parseFloat(gbfs.latency) < parseFloat(pso.latency) ? "GBFS" : "PSO";
        reason = "it has a faster response (lower delay).";
        server = "Edge";
      } else if (autoTask === "Computation-Intensive") {
        winner = parseFloat(gbfs.throughput) > parseFloat(pso.throughput) ? "GBFS" : "PSO";
        reason = "it has higher processing speed.";
        server = "Cloud";
      } else {
        winner = parseFloat(gbfs.energy) < parseFloat(pso.energy) ? "GBFS" : "PSO";
        reason = "it has better energy efficiency.";
        server = parseFloat(pso.utilization) > 80 ? "Cloud" : "Edge";
      }
      
      setDecisionData({ winner, server, reason, taskType: autoTask });
      
      const newId = logs.length + 1;
      setHistory(prev => [...prev.slice(-10), { id: newId, gbfsLat: parseFloat(gbfs.latency), psoLat: parseFloat(pso.latency) }]);
      setLogs(prev => [...prev, {
        id: newId, category, type: autoTask, 
        timestamp: new Date().toISOString(),
        delay: `${gbfs.latency}/${pso.latency}`,
        speed: `${gbfs.throughput}/${pso.throughput}`,
        energy: `${gbfs.energy}/${pso.energy}`,
        utilization: `${gbfs.utilization}/${pso.utilization}`,
        gbfsLat: parseFloat(gbfs.latency), psoLat: parseFloat(pso.latency),
        gbfsSpeed: parseFloat(gbfs.throughput), psoSpeed: parseFloat(pso.throughput),
        gbfsEng: parseFloat(gbfs.energy), psoEng: parseFloat(pso.energy),
        gbfsUtil: parseFloat(gbfs.utilization), psoUtil: parseFloat(pso.utilization),
        winner, server, status: "SUCCESS"
      }]);

      setCurrentStep(1);
      setMaxReached(4);
      setIsProcessing(false);
    }, 800);
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="step-container">
            <PanelHeader 
              title="DATA INPUT & GENERATION" 
              description="Enter machine data and generate tasks for processing." 
              variant="main"
            />
            <div className="row-container">
              <OperationalMetricsPanel 
                {...{category, autoTask, inputs, setInputs, onRun: handleRun, isProcessing}}
              />
              <InputGuidePanel />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="step-container">
            <PanelHeader 
              title="ALGORITHMS APPLIED" 
              description="Evaluate tasks using Greedy Best-First Search (GBFS) and Particle Swarm Optimization (PSO) algorithms." 
              variant="main"
            />
            <PerformanceOverviewPanel gbfs={gbfsData} pso={psoData} />
            <div className="row-container">
              <AlgoPanel title="Greedy Best-First Search (GBFS) Evaluation" colorClass="cyan-text" data={gbfsData} />
              <AlgoPanel title="Particle Swarm Optimization (PSO) Evaluation" colorClass="magenta-text" data={psoData} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-container">
            <PanelHeader 
              title="DECISION EVALUATION" 
              description="Compare results and determine the best processing choice." 
              variant="main"
            />
            <div className="row-container">
              <ProcessingDecisionPanel decision={decisionData.server} reason={decisionData.reason} />
            </div>
            <div className="row-container">
              <ComparisonEvaluationPanel gbfs={gbfsData} pso={psoData} winner={decisionData.winner} />
              <InterpretationAnalysisPanel winner={decisionData.winner} server={decisionData.server} taskType={decisionData.taskType} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-container">
            <PanelHeader 
              title="TASK PROCESSING" 
              description="Assign and simulate task execution on Edge or Cloud." 
              variant="main"
            />
            <div className="row-container">
              <TaskAssignmentPanel taskType={decisionData.taskType} server={decisionData.server} summary={`${decisionData.winner} optimally assigned to ${decisionData.server} server.`} />
              <ResultTransmissionPanel />
            </div>
          </div>
        );
      case 4:
        return (
          <ExecutionResultsView gbfs={gbfsData} pso={psoData} logs={logs} setLogs={setLogs} />
        );
      default: return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="dashboard-layout">
        <SidebarNavigation currentStep={currentStep} onJump={(i) => setCurrentStep(i)} />
        <div className="content-area">
          <SystemFlow currentStep={currentStep} maxReached={maxReached} onJump={(i) => setCurrentStep(i)} />
          <div className="main-content">
            {renderStepContent()}
          </div>
          <StepNavigation 
            currentStep={currentStep} maxReached={maxReached} 
            onPrev={() => setCurrentStep(prev => prev - 1)}
            onNext={() => setCurrentStep(prev => prev + 1)} 
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
