
import requests
import json
import asyncio
import websockets
import sys

ORG_ID = '1a828e4d-0360-4422-8c68-983b1e8a1c43' # Matches frontend constant

async def test_websocket():
    uri = f"ws://localhost:8001/ws/{ORG_ID}"
    async with websockets.connect(uri) as websocket:
        print(f"Connected to {uri}")
        
        # Keep listening
        try:
            while True:
                message = await websocket.recv()
                print(f"Received: {message}")
                data = json.loads(message)
                if data['type'] == 'credit_update':
                    print("✓ Credit update received verified")
                    return # Success
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    # Note: This test requires the server to be running and something to trigger an update.
    # For a self-contained test, we'd need to trigger an API call here too.
    print("Run this script while the server is running.")
    try:
        asyncio.run(test_websocket())
    except KeyboardInterrupt:
        pass
