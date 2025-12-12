import requests
import json

# Simple manual test
print("=== Manual Test ===")

try:
    # Test 1: Get plans
    print("1. Testing GET /api/v1/plans")
    response = requests.get("http://localhost:8001/api/v1/plans")
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        plans = response.json()
        print(f"   Found {len(plans)} plans")
        for plan in plans:
            print(f"   - {plan['id']}: {plan['name']} (${plan['price_monthly']}/month)")
        
        # Test 2: Checkout with pro plan
        print("\n2. Testing POST /api/v1/checkout/create-session")
        pro_plan = next((p for p in plans if p['id'] == 'pro'), None)
        if pro_plan:
            checkout_data = {
                "plan_id": "pro",
                "billing_cycle": "monthly"
            }
            
            print(f"   Request data: {json.dumps(checkout_data)}")
            
            checkout_response = requests.post(
                "http://localhost:8001/api/v1/checkout/create-session",
                json=checkout_data
            )
            
            print(f"   Status: {checkout_response.status_code}")
            
            if checkout_response.status_code == 200:
                result = checkout_response.json()
                payment_url = result.get('url', '')
                print(f"   Payment URL: {payment_url}")
                
                if 'alipay' in payment_url.lower():
                    print("   ✓ Alipay integration is working!")
                else:
                    print("   ⚠ Payment URL doesn't contain 'alipay'")
                    print(f"   Full response: {json.dumps(result, indent=2)}")
            else:
                print(f"   Error: {checkout_response.text}")
        else:
            print("   Pro plan not found")
    else:
        print(f"   Error: {response.text}")
        
except Exception as e:
    print(f"Exception: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n=== Test Complete ===")