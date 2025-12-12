import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8001/api/v1/debug/orgs") as response:
        if response.status == 200:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.status}")
except Exception as e:
    print(f"Connection failed: {e}")
