import requests
import json

# Test the virtual checkout endpoint
base_url = "http://localhost:8001"

# Test checkout with virtual redirect
print("Testing virtual checkout...")

checkout_data = {
    "plan_id": "pro",
    "billing_cycle": "monthly",
    "payment_method": "alipay",
    "org_id": "test-org-123"
}

print(f"Sending request: {json.dumps(checkout_data, indent=2)}")

response = requests.post(
    f"{base_url}/api/v1/checkout/create-session",
    json=checkout_data
)

if response.status_code == 200:
    result = response.json()
    print(f"✓ Checkout session created successfully!")
    print(f"Redirect URL: {result.get('url')}")
    
    # Check if this is the virtual Alipay page
    url = result.get('url', '')
    if 'mock-alipay' in url:
        print("✓ Virtual Alipay page redirect is working!")
        print(f"Full URL: {url}")
    else:
        print("⚠ URL doesn't appear to be the virtual page")
        print(f"Full response: {json.dumps(result, indent=2)}")
else:
    print(f"✗ Checkout failed with status {response.status_code}")
    print(f"Error: {response.text}")