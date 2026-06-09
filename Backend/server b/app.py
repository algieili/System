from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

# ══════════════════════════════════════════════════
# SUPABASE REST API CONFIG
# Set these in Render → Environment Variables:
#   SUPABASE_URL = https://bsqxvqbrxwecdexkijpd.supabase.co
#   SUPABASE_KEY = your anon/public key
# ══════════════════════════════════════════════════
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def sb_headers():
    return {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "return=representation"
    }

def sb_post(table, data):
    """INSERT a row into a Supabase table."""
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=sb_headers(),
        json=data
    )
    r.raise_for_status()
    return r.json()

def sb_get(table, params=None):
    """GET rows from a Supabase table."""
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=sb_headers(),
        params=params or {}
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
        "message": "EdgeOffload API — Server B",
        "routes": [
            "GET  /health",
            "GET  /api/health",
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
            f"{SUPABASE_URL}/rest/v1/offload_logs?limit=1",
            headers=sb_headers()
        )
        if r.status_code in [200, 206]:
            return jsonify({"status": "ok", "db": "connected via Supabase REST", "server": "B"})
        else:
            return jsonify({"status": "error", "db": r.text}), 500
    except Exception as e:
        return jsonify({"status": "error", "db": str(e)}), 500

@app.route("/api/health")
def api_health():
    return jsonify({"status": "online", "server": "B"})

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
        return jsonify({
            "latency":     latency,
            "throughput":  throughput,
            "energy":      energy,
            "utilization": utilization,
            "time":        time,
            "remark":      remark
        })
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
        return jsonify({
            "latency":     latency,
            "throughput":  throughput,
            "energy":      energy,
            "utilization": utilization,
            "time":        time,
            "remark":      remark
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
# POST /api/offload  ← logs to Supabase with server = "B"
# ══════════════════════════════════════════════════
@app.route("/api/offload", methods=["POST"])
def offload_task():
    try:
        data             = request.json
        measured_latency = round(min(data["gbfsLatency"], data["psoLatency"]) * 0.97, 2)

        # Log to Supabase — tagged as Server B
        sb_post("offload_logs", {
            "machine_id":       data["machineId"],
            "algorithm":        data["algorithm"],
            "target_server":    data["targetServer"],
            "gbfs_latency":     data["gbfsLatency"],
            "pso_latency":      data["psoLatency"],
            "measured_latency": measured_latency,
            "status":           "success",
            "server":           "B"
        })

        return jsonify({
            "status":          "success",
            "measuredLatency": measured_latency,
            "server":          "B",
            "algorithm":       data["algorithm"]
        })
    except Exception as e:
        # Return the exact Supabase error so you can debug it
        return jsonify({"error": str(e), "server": "B"}), 500

# ══════════════════════════════════════════════════
# GET /api/logs  ← only shows Server B logs
# ══════════════════════════════════════════════════
@app.route("/api/logs")
def get_logs():
    try:
        rows = sb_get("offload_logs", {
            "select": "*",
            "server": "eq.B",
            "order":  "created_at.desc",
            "limit":  "50"
        })
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
# RUN
# ══════════════════════════════════════════════════
if __name__ == "__main__":
    app.run(debug=True)
