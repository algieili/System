import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

class PerformanceMonitor:
    """
    Handles the creation and updating of performance graphs using Matplotlib.
    Now supports comparative visualization (GBFS vs PSO).
    """
    def __init__(self, parent_frame):
        self.fig, self.axs = plt.subplots(2, 2, figsize=(14, 5))
        self.fig.patch.set_facecolor('#1e1e1e')  # Dark theme background
        
        # Data storage for segments (separate for GBFS and PSO)
        self.data = {
            'gbfs': { 'latency': [], 'throughput': [], 'energy': [], 'utilization': [] },
            'pso': { 'latency': [], 'throughput': [], 'energy': [], 'utilization': [] }
        }
        
        self.titles = ['Delay (milliseconds)', 'Speed (tasks per second)', 'Energy (watts)', 'Resource Usage (percent)']
        
        self.setup_plots()
        
        # Integration with Tkinter
        self.canvas = FigureCanvasTkAgg(self.fig, master=parent_frame)
        self.canvas.get_tk_widget().pack(fill='both', expand=True)

    def setup_plots(self):
        """Initialize plot styles and labels."""
        flat_axs = self.axs.flatten()
        for i, ax in enumerate(flat_axs):
            ax.set_facecolor('#2d2d2d')
            ax.set_title(self.titles[i].split(" (")[0] + " Comparison", color='white', fontsize=10, weight='bold')
            ax.set_ylabel(self.titles[i], color='white', fontsize=8)
            ax.set_xlabel('Time (seconds)', color='white', fontsize=8)
            ax.tick_params(colors='white', labelsize=8)
            for spine in ax.spines.values():
                spine.set_color('#444444')
            ax.grid(True, color='#444444', linestyle='--')

    def update_graphs(self, gbfs_metrics, pso_metrics):
        """Update data and redraw plots for both algorithms."""
        metrics_keys = ['latency', 'throughput', 'energy', 'utilization']
        
        # Append new values
        for key in metrics_keys:
            self.data['gbfs'][key].append(gbfs_metrics.get(key, 0))
            self.data['pso'][key].append(pso_metrics.get(key, 0))
        
        # Limit data points to last 20 for visibility
        for key in metrics_keys:
            if len(self.data['gbfs'][key]) > 20:
                self.data['gbfs'][key].pop(0)
                self.data['pso'][key].pop(0)

        flat_axs = self.axs.flatten()
        
        for i, key in enumerate(metrics_keys):
            ax = flat_axs[i]
            ax.clear()
            self.setup_plots() # Re-apply style after clear
            
            # Plot GBFS (Cyan/Blue)
            ax.plot(self.data['gbfs'][key], color='#00FFFF', marker='o', markersize=3, linewidth=2, label='GBFS')
            # Plot PSO (Orange)
            ax.plot(self.data['pso'][key], color='#FFA500', marker='^', markersize=3, linewidth=2, label='PSO')
            
            ax.legend(loc='upper right', fontsize=7, facecolor='#1e1e1e', edgecolor='#444444', labelcolor='white')
            
        self.canvas.draw()

class PerformancePieCharts:
    def __init__(self, parent_frame):
        self.fig, self.axs = plt.subplots(1, 2, figsize=(14, 4))
        self.fig.patch.set_facecolor('#1e293b')
        
        self.colors = ['#3b82f6', '#10b981', '#f97316', '#a855f7']
        self.labels = ['Delay', 'Processing Speed', 'Energy', 'Resource Usage']
        
        self.setup_plots()
        
        self.canvas = FigureCanvasTkAgg(self.fig, master=parent_frame)
        self.canvas.get_tk_widget().pack(fill='both', expand=True)

    def setup_plots(self):
        for ax in self.axs:
            ax.set_facecolor('#1e293b')
            ax.axis('equal')
            
    def update_graphs(self, gbfs_metrics, pso_metrics):
        for ax in self.axs:
            ax.clear()
        
        self.setup_plots()
        
        gbfs_data = [
            float(gbfs_metrics.get('latency', 0)),
            float(gbfs_metrics.get('throughput', 0)),
            float(gbfs_metrics.get('energy', 0)),
            float(gbfs_metrics.get('utilization', 0))
        ]
        
        pso_data = [
            float(pso_metrics.get('latency', 0)),
            float(pso_metrics.get('throughput', 0)),
            float(pso_metrics.get('energy', 0)),
            float(pso_metrics.get('utilization', 0))
        ]
        
        if sum(gbfs_data) > 0:
            wedges1, texts1, autotexts1 = self.axs[0].pie(gbfs_data, labels=None, autopct='%1.0f%%', startangle=90, colors=self.colors, textprops=dict(color="w", weight="bold", fontsize=10))
            self.axs[0].set_title('Greedy Best-First Search (GBFS)\nPerformance Distribution', color='white', fontsize=11, weight='bold', pad=15)

        if sum(pso_data) > 0:
            wedges2, texts2, autotexts2 = self.axs[1].pie(pso_data, labels=None, autopct='%1.0f%%', startangle=90, colors=self.colors, textprops=dict(color="w", weight="bold", fontsize=10))
            self.axs[1].set_title('Particle Swarm Optimization (PSO)\nPerformance Distribution', color='white', fontsize=11, weight='bold', pad=15)
            
        self.fig.legend(self.labels, loc='lower center', ncol=4, facecolor='#1e293b', edgecolor='#334155', labelcolor='white', bbox_to_anchor=(0.5, 0.0))
        
        self.fig.tight_layout(rect=[0, 0.05, 1, 1])
        self.canvas.draw()
