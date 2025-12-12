
import psutil
import sys

def kill_port(port):
    print(f"Checking port {port}...")
    found = False
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            for conn in proc.connections(kind='inet'):
                if conn.laddr.port == port:
                    print(f"Killing process {proc.info['name']} (PID: {proc.info['pid']}) on port {port}")
                    proc.kill()
                    found = True
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    
    if not found:
        print(f"No process found on port {port}")

if __name__ == "__main__":
    try:
        kill_port(8001)
    except Exception as e:
        print(f"Error: {e}")
