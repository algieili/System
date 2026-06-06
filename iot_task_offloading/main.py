import tkinter as tk
import sys
import os

# Ensure the root directory is in sys.path for relative imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ui.dashboard import DashboardApp

def main():
    """
    Main entry point for the Task Offloading Simulation System.
    Initialized the Tkinter root and starts the Dashboard application.
    """
    try:
        root = tk.Tk()
        app = DashboardApp(root)
        
        # Set window icon placeholder or title
        # root.iconbitmap('icon.ico') # If available
        
        print("Task Offloading Simulation System Started.")
        root.mainloop()
        
    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    main()
