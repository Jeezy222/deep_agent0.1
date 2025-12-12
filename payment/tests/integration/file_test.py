import requests
import json
import sys

# Redirect stdout and stderr to file
sys.stdout = open('test_debug.log', 'w')
sys.stderr = open('test_error.log', 'w')

print("=== Starting Test ===")

try:
    base_url = "http://localhost:8001"
    
    # Test plans endpoint
    print("Getting plans...")
    response = requests.get(f"{base_url}/api/v1/plans", timeout=10)
    print(f"Plans status: {response.status_code}")
    
    if response.status_code == 200:
        plans = response.json()
        print(f"Found {len(plans)} plans")
        
        # Find pro plan
        pro_plan = next((p for p in plans if p.get('id') == 'pro'), None)
        if pro_plan:
            print(f"Pro plan: {pro_plan['name']} - ${pro_plan['price_monthly']}/month")
            
            # Test checkout
            checkout_data = {
                "plan_id": "pro",
                "billing_cycle": "monthly"
            }
            
            print(f"Testing checkout with: {checkout_data}")
            
            checkout_response = requests.post(
                f"{base_url}/api/v1/checkout/create-session",
                json=checkout_data,
                timeout=10
            )
            
            print(f"Checkout status: {checkout_response.status_code}")
            
            if checkout_response.status_code == 200:
                result = checkout_response.json()
                payment_url = result.get('url', '')
                print(f"Payment URL: {payment_url}")
                
                if 'alipay' in payment_url.lower():
                    print("✓ Alipay integration working!")
                else:
                    print("⚠ Not an Alipay URL")
                    
                print(f"Full response: {json.dumps(result, indent=2)}")
            else:
                print(f"Checkout failed: {checkout_response.text}")
        else:
            print("Pro plan not found")
    else:
        print(f"Plans failed: {response.text}")
        
except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()

print("=== Test Complete ===")
sys.stdout.close()
sys.stderr.close()