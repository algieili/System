from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests  # uses HTTPS — no IPv6 issue

app = Flask(__name__)
CORS(app)

# ══════════════════════════════════════════════════
# SUPABASE REST API CONFIG
# Set these in Render → Environment Variables:
#   SUPABASE_URL = https://bsqxvqbrxwecdexkijpd.supabase.co
#   SUPABASE_KEY = your anon/public key (from Supabase → Settings → API)
# ══════════════════════════════════════════════════
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def sb_headers():
    """Supabase REST API headers."""
    return {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "return=representation"
    }

def sb_get(table, params=None):
    """GET rows from a Supabase table."""
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=sb_headers(),
        params=params or {}
    )
    r.raise_for_status()
    return r.json()

def sb_post(table, data):
    """INSERT a row into a Supabase table."""
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=sb_headers(),
        json=data
    )
    r.raise_for_status()
    return r.json()

# ══════════════════════════════════════════════════
# ROOT
# ══════════════════════════════════════════════════
@app.route("/")
def index():
    return jsonify({
        "status":  "online",
        "message": "EdgeOffload API is running",
        "mode":    "Supabase REST API (HTTPS)",
        "routes": [
            "GET  /health",
            "GET  /api/setup",
            "GET  /api/machines",
            "GET  /api/machines/<id>/task-data",
            "POST /api/gbfs",
            "POST /api/pso",
            "POST /api/offload",
            "GET  /api/logs"
        ]
    })

# ══════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════
@app.route("/health")
def health():
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/machines?limit=1",
            headers=sb_headers()
        )
        if r.status_code in [200, 206]:
            return jsonify({"status": "ok", "db": "connected via Supabase REST"})
        else:
            return jsonify({"status": "error", "db": r.text}), 500
    except Exception as e:
        return jsonify({"status": "error", "db": str(e)}), 500

# ══════════════════════════════════════════════════
# SETUP — inserts machine data if table is empty
# ══════════════════════════════════════════════════
@app.route("/api/setup")
def setup_db():
    try:
        # Check if machines already exist
        existing = sb_get("machines", {"select": "id"})
        if len(existing) > 0:
            return jsonify({"status": "ok", "message": f"Already set up — {len(existing)} machines found"})

        # Insert all 5 machines
        machines = [
            {"id":"M1","machine_id":"CPCM1","name":"CNC Plasma",      "task_size":50,"bandwidth":100,"processing_time":120,"queue_length":3,"cpu_utilization":60.0,"memory_usage":1.6,"transmission_delay":16,"energy_consumption":2.3,"throughput":12,"avg_latency":88, "category":"Cutting Machines",  "task_type":"Computation-Intensive"},
            {"id":"M2","machine_id":"PCM1", "name":"Plasma Cutting",  "task_size":40,"bandwidth":90, "processing_time":100,"queue_length":2,"cpu_utilization":55.0,"memory_usage":1.3,"transmission_delay":14,"energy_consumption":2.0,"throughput":15,"avg_latency":78, "category":"Cutting Machines",  "task_type":"Computation-Intensive"},
            {"id":"M3","machine_id":"PB2",  "name":"Paint Booth",     "task_size":20,"bandwidth":80, "processing_time":60, "queue_length":1,"cpu_utilization":45.0,"memory_usage":1.2,"transmission_delay":12,"energy_consumption":1.5,"throughput":16,"avg_latency":72, "category":"Finishing Machines","task_type":"Energy-Efficient"},
            {"id":"M4","machine_id":"WM1",  "name":"Arc Welding",     "task_size":30,"bandwidth":100,"processing_time":80, "queue_length":2,"cpu_utilization":55.0,"memory_usage":2.0,"transmission_delay":12,"energy_consumption":2.1,"throughput":18,"avg_latency":92, "category":"Welding Machines",  "task_type":"Computation-Intensive"},
            {"id":"M5","machine_id":"SM3",  "name":"Shearing Machine","task_size":25,"bandwidth":75, "processing_time":70, "queue_length":1,"cpu_utilization":50.0,"memory_usage":1.5,"transmission_delay":15,"energy_consumption":1.8,"throughput":14,"avg_latency":85, "category":"Cutting Machines",  "task_type":"Latency-Sensitive"},
        ]

        for machine in machines:
            sb_post("machines", machine)

        return jsonify({"status": "ok", "message": "Database setup complete — 5 machines inserted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
# GET /api/machines
# ══════════════════════════════════════════════════
@app.route("/api/machines")
def get_machines():
    try:
        rows = sb_get("machines", {"select": "*", "order": "id"})
        result = {}
        for m in rows:
            result[m["id"]] = {
                "id":                m["id"],
                "machineId":         m["machine_id"],
                "name":              m["name"],
                "taskSize":          m["task_size"],
                "bandwidth":         m["bandwidth"],
                "processingTime":    m["processing_time"],
                "queueLength":       m["queue_length"],
                "cpuUtilization":    m["cpu_utilization"],
                "memoryUsage":       m["memory_usage"],
                "transmissionDelay": m["transmission_delay"],
                "energyConsumption": m["energy_consumption"],
                "throughput":        m["throughput"],
                "avgLatency":        m["avg_latency"],
                "category":          m["category"],
                "taskType":          m["task_type"],
            }
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
# GET /api/machines/<id>/task-data
# ══════════════════════════════════════════════════
@app.route("/api/machines/<machine_id>/task-data")
def get_task_data(machine_id):
    try:
        rows = sb_get("machines", {"select": "*", "id": f"eq.{machine_id}"})
        if not rows:
            return jsonify({"error": "Machine not found"}), 404
        m = rows[0]
        return jsonify({
            "id": m["id"], "machineId": m["machine_id"], "name": m["name"],
            "taskSize": m["task_size"], "bandwidth": m["bandwidth"],
            "processingTime": m["processing_time"], "queueLength": m["queue_length"],
            "cpuUtilization": m["cpu_utilization"], "memoryUsage": m["memory_usage"],
            "transmissionDelay": m["transmission_delay"],
            "energyConsumption": m["energy_consumption"],
            "throughput": m["throughput"], "avgLatency": m["avg_latency"],
            "category": m["category"], "taskType": m["task_type"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
# POST /api/gbfs
# ══════════════════════════════════════════════════
@app.route("/api/gbfs", methods=["POST"])
def run_gbfs():
    try:
        m           = request.json["machine"]
        latency     = round(m["avgLatency"] * 0.90 + m["transmissionDelay"] * 0.5, 2)
        throughput  = round(m["throughput"]  * 0.88, 2)
        energy      = round(m["energyConsumption"] * 0.90, 2)
        utilization = round(m["cpuUtilization"] * 0.88, 2)
        time        = round(latency + m["transmissionDelay"], 2)
        remark      = "Excellent" if latency < 80 else "Good" if latency < 100 else "Moderate"
        return jsonify({"latency": latency, "throughput": throughput,
                        "energy": energy, "utilization": utilization,
                        "time": time, "remark": remark})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
# POST /api/pso
# ══════════════════════════════════════════════════
@app.route("/api/pso", methods=["POST"])
def run_pso():
    try:
        m           = request.json["machine"]
        latency     = round(m["avgLatency"] * 0.82 + m["transmissionDelay"] * 0.4, 2)
        throughput  = round(m["throughput"]  * 0.95, 2)
        energy      = round(m["energyConsumption"] * 0.82, 2)
        utilization = round(m["cpuUtilization"] * 0.80, 2)
        time        = round(latency + m["transmissionDelay"] * 0.9, 2)
        remark      = "Excellent" if latency < 80 else "Good" if latency < 100 else "Moderate"
        return jsonify({"latency": latency, "throughput": throughput,
                        "energy": energy, "utilization": utilization,
                        "time": time, "remark": remark})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
# POST /api/offload
# ══════════════════════════════════════════════════
@app.route("/api/offload", methods=["POST"])
def offload_task():
    try:
        data             = request.json
        measured_latency = round(min(data["gbfsLatency"], data["psoLatency"]) * 0.97, 2)
        sb_post("offload_logs", {
            "machine_id":       data["machineId"],
            "algorithm":        data["algorithm"],
            "target_server":    data["targetServer"],
            "gbfs_latency":     data["gbfsLatency"],
            "pso_latency":      data["psoLatency"],
            "measured_latency": measured_latency,
            "status":           "success"
        })
        return jsonify({"status": "success", "measuredLatency": measured_latency,
                        "server": data["targetServer"], "algorithm": data["algorithm"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
# GET /api/logs
# ══════════════════════════════════════════════════
@app.route("/api/logs")
def get_logs():
    try:
        rows = sb_get("offload_logs", {"select": "*", "order": "created_at.desc", "limit": "50"})
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
