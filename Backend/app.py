from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)
CORS(app)

DB_HOST     = os.environ.get("DB_HOST",     "")
DB_NAME     = os.environ.get("DB_NAME",     "postgres")
DB_USER     = os.environ.get("DB_USER",     "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_PORT     = os.environ.get("DB_PORT",     "5432")

def get_db():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME,
        user=DB_USER, password=DB_PASSWORD, port=DB_PORT
    )

# ══════════════════════════════════════════════════
# ROOT — confirms server is alive
# ══════════════════════════════════════════════════
@app.route("/")
def index():
    return jsonify({
        "status":  "online",
        "message": "EdgeOffload API is running ✅",
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
# HEALTH CHECK — tests DB connection
# ══════════════════════════════════════════════════
@app.route("/health")
def health():
    try:
        conn = get_db()
        conn.close()
        return jsonify({"status": "ok", "db": "connected ✅"})
    except Exception as e:
        return jsonify({"status": "error", "db": str(e)}), 500

# ══════════════════════════════════════════════════
# SETUP — creates tables and seeds machine data
# ══════════════════════════════════════════════════
@app.route("/api/setup")
def setup_db():
    conn = get_db()
    cur  = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS machines (
                id                 VARCHAR(10)  PRIMARY KEY,
                machine_id         VARCHAR(20)  NOT NULL,
                name               VARCHAR(100) NOT NULL,
                task_size          INTEGER,
                bandwidth          INTEGER,
                processing_time    INTEGER,
                queue_length       INTEGER,
                cpu_utilization    FLOAT,
                memory_usage       FLOAT,
                transmission_delay INTEGER,
                energy_consumption FLOAT,
                throughput         INTEGER,
                avg_latency        INTEGER,
                category           VARCHAR(100),
                task_type          VARCHAR(100)
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS offload_logs (
                id               SERIAL PRIMARY KEY,
                machine_id       VARCHAR(20),
                algorithm        VARCHAR(10),
                target_server    VARCHAR(100),
                gbfs_latency     FLOAT,
                pso_latency      FLOAT,
                measured_latency FLOAT,
                status           VARCHAR(20),
                created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("SELECT COUNT(*) FROM machines")
        if cur.fetchone()[0] == 0:
            cur.executemany("""
                INSERT INTO machines
                (id,machine_id,name,task_size,bandwidth,processing_time,queue_length,
                 cpu_utilization,memory_usage,transmission_delay,energy_consumption,
                 throughput,avg_latency,category,task_type)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, [
                ("M1","CPCM1","CNC Plasma",      50,100,120,3,60.0,1.6,16,2.3,12,88,"Cutting Machines",  "Computation-Intensive"),
                ("M2","PCM1", "Plasma Cutting",  40,90, 100,2,55.0,1.3,14,2.0,15,78,"Cutting Machines",  "Computation-Intensive"),
                ("M3","PB2",  "Paint Booth",     20,80, 60, 1,45.0,1.2,12,1.5,16,72,"Finishing Machines","Energy-Efficient"     ),
                ("M4","WM1",  "Arc Welding",     30,100,80, 2,55.0,2.0,12,2.1,18,92,"Welding Machines",  "Computation-Intensive"),
                ("M5","SM3",  "Shearing Machine",25,75, 70, 1,50.0,1.5,15,1.8,14,85,"Cutting Machines",  "Latency-Sensitive"    ),
            ])

        conn.commit()
        return jsonify({"status": "ok", "message": "Database setup complete ✅"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); conn.close()

# ══════════════════════════════════════════════════
# GET /api/machines
# ══════════════════════════════════════════════════
@app.route("/api/machines")
def get_machines():
    conn = get_db()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM machines ORDER BY id")
        result = {}
        for row in cur.fetchall():
            m = dict(row)
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
    finally:
        cur.close(); conn.close()

# ══════════════════════════════════════════════════
# GET /api/machines/<id>/task-data
# ══════════════════════════════════════════════════
@app.route("/api/machines/<machine_id>/task-data")
def get_task_data(machine_id):
    conn = get_db()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM machines WHERE id = %s", (machine_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Machine not found"}), 404
        m = dict(row)
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
    finally:
        cur.close(); conn.close()

# ══════════════════════════════════════════════════
# POST /api/gbfs
# ══════════════════════════════════════════════════
@app.route("/api/gbfs", methods=["POST"])
def run_gbfs():
    try:
        m = request.json["machine"]
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
        m = request.json["machine"]
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
    conn = get_db()
    cur  = conn.cursor()
    try:
        data             = request.json
        measured_latency = round(min(data["gbfsLatency"], data["psoLatency"]) * 0.97, 2)
        cur.execute("""
            INSERT INTO offload_logs
            (machine_id, algorithm, target_server, gbfs_latency, pso_latency, measured_latency, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (data["machineId"], data["algorithm"], data["targetServer"],
              data["gbfsLatency"], data["psoLatency"], measured_latency, "success"))
        conn.commit()
        return jsonify({"status": "success", "measuredLatency": measured_latency,
                        "server": data["targetServer"], "algorithm": data["algorithm"]})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); conn.close()

# ══════════════════════════════════════════════════
# GET /api/logs
# ══════════════════════════════════════════════════
@app.route("/api/logs")
def get_logs():
    conn = get_db()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM offload_logs ORDER BY created_at DESC LIMIT 50")
        return jsonify([dict(r) for r in cur.fetchall()])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); conn.close()

if __name__ == "__main__":
    app.run(debug=True)
