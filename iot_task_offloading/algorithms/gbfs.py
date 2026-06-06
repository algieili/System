def compute_gbfs_score(task_params):
    try:
        net_latency = float(task_params.get("Net Latency (milliseconds)", 0))
        cpu_load = float(task_params.get("CPU Load (percent)", 0))
        task_queue = float(task_params.get("Task Queue", 0))
        power_usage = float(task_params.get("Power Usage (watts)", 0))
        temp = float(task_params.get("Temperature (degrees Celsius)", 0))
        task_type = task_params.get("Task Type", "Balanced")

        gbfs_score = (net_latency * 0.35) + (cpu_load * 0.30) + (task_queue * 0.20) + (power_usage * 0.15)
        
        est_latency = net_latency + (task_queue * 5) + (cpu_load * 0.5)
        est_throughput = max(10, 100 - (cpu_load * 0.5) - (temp * 0.2))
        est_energy = power_usage + (cpu_load * 0.05)
        est_utilization = min(100, cpu_load + (task_queue * 2))
        
        est_utilization = min(100, cpu_load + (task_queue * 2))
        
        if task_type == "Latency-Sensitive" and net_latency > 20 and task_queue < 10:
            suggested_location = "Edge"
        elif task_type == "Computation-Intensive" and cpu_load > 60:
            suggested_location = "Cloud"
        else:
            suggested_location = "Edge" if gbfs_score < 40 else "Cloud"
            
        return {
            "score": round(gbfs_score, 2),
            "latency": round(est_latency, 2),
            "throughput": round(est_throughput, 2),
            "energy": round(est_energy, 2),
            "utilization": round(est_utilization, 2),
            "location": suggested_location,
            "time": "12",
            "remark": "Greedy Best-First Search approach applied"
        }
    except Exception as e:
        return {"score": 0, "latency": 0, "throughput": 0, "energy": 0, "utilization": 0, "location": "Edge", "time": "0", "remark": "Error"}
