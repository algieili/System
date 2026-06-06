import random

class ServerSimulator:
    """
    Simulates different server tiers in an Edge-enabled IoT system.
    """
    def __init__(self):
        self.servers = {
            "Edge": {"lat_range": (5, 15), "proc_range": (100, 300), "energy_coeff": 0.5},
            "Fog": {"lat_range": (20, 50), "proc_range": (50, 150), "energy_coeff": 1.2},
            "Cloud": {"lat_range": (100, 300), "proc_range": (10, 50), "energy_coeff": 5.0}
        }

    def simulate_execution(self, server_name):
        return {
            "latency": random.randint(5, 100),
            "energy": round(random.uniform(0.5, 4.0), 2)
        }
