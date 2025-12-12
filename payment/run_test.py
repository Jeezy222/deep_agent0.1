import subprocess
import sys

# Run the test script and capture output
result = subprocess.run([sys.executable, "test_debug.py"], 
                       capture_output=True, text=True, cwd="d:/Trae/支付")

print("STDOUT:")
print(result.stdout)
print("\nSTDERR:")
print(result.stderr)
print(f"\nReturn code: {result.returncode}")