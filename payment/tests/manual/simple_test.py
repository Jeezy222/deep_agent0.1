import requests
import json

print("Starting checkout test...")

try:
    # Test getting plans
    print("Getting plans from http://localhost:8001/api/v1/plans")
    response = requests.get("http://localhost:8001/api/v1/plans")
    print(f"Plans response status: {response.status_code}")
    
    if response.status_code == 200:
        plans = response.json()
        print(f"Found {len(plans)} plans")
        
        # Find pro plan
        pro_plan = next((p for p in plans if p.get('id') == 'pro'), None)
        if pro_plan:
            print(f"Pro plan found: {pro_plan['name']} - ${pro_plan['price_monthly']}/month")
            
            # Test checkout with pro plan
            checkout_data = {
                "plan_id": "pro",
                "billing_cycle": "monthly",
                "payment_method": "alipay"
            }
            
            print(f"Testing checkout with data: {json.dumps(checkout_data, indent=2)}")
            
            checkout_response = requests.post(
                "http://localhost:8001/api/v1/checkout/create-session",
                json=checkout_data
            )
            
            print(f"Checkout response status: {checkout_response.status_code}")
            
            if checkout_response.status_code == 200:
                result = checkout_response.json()
                print(f"Checkout successful!")
                print(f"Payment URL: {result.get('url', 'No URL returned')}")
                
                # Check if it's an Alipay URL
                payment_url = result.get('url', '')
                if 'alipay' in payment_url.lower():
                    print("✓ Alipay integration is working!")
                else:
                    print("⚠ Payment URL doesn't appear to be Alipay-specific")
                    print(f"Full response: {json.dumps(result, indent=2)}")
            else:
                print(f"Checkout failed: {checkout_response.text}")
        else:
            print("Pro plan not found")
    else:
        print(f"Failed to get plans: {response.text}")
        
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("Test completed.")