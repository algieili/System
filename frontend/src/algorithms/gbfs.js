export function computeGbfsScore(taskParams) {
  try {
    const netLatency = parseFloat(taskParams["Net Latency (milliseconds)"] || 0);
    const cpuLoad = parseFloat(taskParams["CPU Load (percent)"] || 0);
    const taskQueue = parseFloat(taskParams["Task Queue"] || 0);
    const powerUsage = parseFloat(taskParams["Power Usage (watts)"] || 0);
    const temp = parseFloat(taskParams["Temperature (degrees Celsius)"] || 0);
    const taskType = taskParams["Task Type"] || "Balanced";

    const gbfsScore = (netLatency * 0.35) + (cpuLoad * 0.30) + (taskQueue * 0.20) + (powerUsage * 0.15);
    
    const estLatency = netLatency + (taskQueue * 5) + (cpuLoad * 0.5);
    const estThroughput = Math.max(10, 100 - (cpuLoad * 0.5) - (temp * 0.2));
    const estEnergy = powerUsage + (cpuLoad * 0.05);
    const estUtilization = Math.min(100, cpuLoad + (taskQueue * 2));
    
    let suggestedLocation = "Edge";
    if (taskType === "Latency-Sensitive" && netLatency > 20 && taskQueue < 10) {
        suggestedLocation = "Edge";
    } else if (taskType === "Computation-Intensive" && cpuLoad > 60) {
        suggestedLocation = "Cloud";
    } else {
        suggestedLocation = gbfsScore < 40 ? "Edge" : "Cloud";
    }

    return {
        score: gbfsScore.toFixed(2),
        latency: estLatency.toFixed(2),
        throughput: estThroughput.toFixed(2),
        energy: estEnergy.toFixed(2),
        utilization: estUtilization.toFixed(2),
        location: suggestedLocation,
        time: "12",
        remark: "Greedy Best-First Search approach applied"
    };
  } catch (err) {
    return { score: 0, latency: 0, throughput: 0, energy: 0, utilization: 0, location: "Edge", time: "0", remark: "Error" };
  }
}
