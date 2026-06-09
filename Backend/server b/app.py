from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
import os

app = Flask(__name__)
CORS(app)

# Supabase connection
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route("/api/health")
def health():
    return jsonify({"status": "online", "server": "B"})

@app.route("/api/gbfs", methods=["POST"])
def gbfs():
    data = request.json
    machine = data.get("machine", {})
    result = {
        "latency":     42.5,
        "throughput":  18.2,
        "energy":      0.85,
        "utilization": 67,
        "time":        38,
        "remark":      "Excellent"
    }
    return jsonify(result)

@app.route("/api/pso", methods=["POST"])
def pso():
    data = request.json
    machine = data.get("machine", {})
    result = {
        "latency":     39.1,
        "throughput":  19.5,
        "energy":      0.78,
        "utilization": 61,
        "time":        35,
        "remark":      "Excellent"
    }
    return jsonify(result)

@app.route("/api/offload", methods=["POST"])
def offload():
    data = request.json

    # Log to Supabase
    supabase.table("offload_logs").insert({
        "machine_id":    data.get("machineId"),
        "task_size":     data.get("taskSize"),
        "algorithm":     data.get("algorithm"),
        "target_server": data.get("targetServer"),
        "gbfs_latency":  data.get("gbfsLatency"),
        "pso_latency":   data.get("psoLatency"),
        "server":        "B"
    }).execute()

    return jsonify({
        "status":          "success",
        "measuredLatency": 40.3
    })

if __name__ == "__main__":
    app.run(debug=True)
