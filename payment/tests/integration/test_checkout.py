import requests
import json

# Test the checkout endpoint with Alipay integration
base_url = "http://localhost:8001"

# First, get available plans
print("Getting available plans...")
response = requests.get(f"{base_url}/api/v1/plans")
if response.status_code == 200:
    plans = response.json()
    print(f"Available plans: {plans}")
    
    # Find the pro plan
    pro_plan = next((p for p in plans if p.get('id') == 'pro'), None)
    if pro_plan:
        print(f"Found pro plan: {pro_plan}")
        
        # Test checkout with pro plan and Alipay
        checkout_data = {
            "plan_id": "pro",
            "payment_method": "alipay",  # This should trigger Alipay integration
            "success_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        }
        
        print(f"Testing checkout with data: {json.dumps(checkout_data, indent=2)}")
        
        response = requests.post(
            f"{base_url}/api/v1/checkout/create-session",
            json=checkout_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"Checkout session created successfully!")
            print(f"Session ID: {result.get('session_id')}")
            print(f"Payment URL: {result.get('payment_url')}")
            
            # Check if this is an Alipay URL
            payment_url = result.get('payment_url', '')
            if 'alipay' in payment_url.lower() or 'alipay' in str(result).lower():
                print("✓ Alipay integration is working!")
                print(f"Redirect URL: {payment_url}")
            else:
                print("⚠ Payment URL doesn't appear to be Alipay-specific")
                print(f"Full response: {json.dumps(result, indent=2)}")
        else:
            print(f"Checkout failed with status {response.status_code}")
            print(f"Error: {response.text}")
    else:
        print("Pro plan not found in available plans")
else:
    print(f"Failed to get plans: {response.status_code}")
    print(f"Error: {response.text}")