from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/health")
def health():
    return jsonify({"status": "online", "server": "B"})

@app.route("/api/gbfs", methods=["POST"])
def gbfs():
    data = request.json
    machine = data.get("machine", {})
    # Your GBFS logic here
    return jsonify({
        "latency":     42.5,
        "throughput":  18.2,
        "energy":      0.85,
        "utilization": 67,
        "time":        38,
        "remark":      "Excellent"
    })

@app.route("/api/pso", methods=["POST"])
def pso():
    data = request.json
    machine = data.get("machine", {})
    # Your PSO logic here
    return jsonify({
        "latency":     39.1,
        "throughput":  19.5,
        "energy":      0.78,
        "utilization": 61,
        "time":        35,
        "remark":      "Excellent"
    })

@app.route("/api/offload", methods=["POST"])
def offload():
    data = request.json
    # Your Supabase logging here
    return jsonify({
        "status":          "success",
        "measuredLatency": 40.3
    })

if __name__ == "__main__":
    app.run(debug=True)
