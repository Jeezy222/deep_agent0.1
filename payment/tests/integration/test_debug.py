#!/usr/bin/env python3
import requests
import json
import sys

def test_checkout():
    print("=== Starting Checkout Test ===", file=sys.stderr)
    
    try:
        # Test getting plans
        print("Getting plans...", file=sys.stderr)
        response = requests.get("http://localhost:8001/api/v1/plans", timeout=10)
        print(f"Plans status: {response.status_code}", file=sys.stderr)
        
        if response.status_code == 200:
            plans = response.json()
            print(f"Found {len(plans)} plans", file=sys.stderr)
            
            # Find pro plan
            pro_plan = next((p for p in plans if p.get('id') == 'pro'), None)
            if pro_plan:
                print(f"Pro plan: {pro_plan['name']} - ${pro_plan['price_monthly']}/month", file=sys.stderr)
                
                # Test checkout
                checkout_data = {
                    "plan_id": "pro",
                    "billing_cycle": "monthly"
                }
                
                print(f"Testing checkout with: {checkout_data}", file=sys.stderr)
                
                checkout_response = requests.post(
                    "http://localhost:8001/api/v1/checkout/create-session",
                    json=checkout_data,
                    timeout=10
                )
                
                print(f"Checkout status: {checkout_response.status_code}", file=sys.stderr)
                
                if checkout_response.status_code == 200:
                    result = checkout_response.json()
                    print(f"SUCCESS! Payment URL: {result.get('url', 'No URL')}", file=sys.stderr)
                    
                    # Check if Alipay
                    payment_url = result.get('url', '')
                    if 'alipay' in payment_url.lower():
                        print("✓ Alipay integration working!", file=sys.stderr)
                    else:
                        print("⚠ Not an Alipay URL", file=sys.stderr)
                        
                    print(json.dumps(result, indent=2))
                else:
                    print(f"Checkout failed: {checkout_response.text}", file=sys.stderr)
            else:
                print("Pro plan not found", file=sys.stderr)
        else:
            print(f"Plans failed: {response.text}", file=sys.stderr)
            
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)

if __name__ == "__main__":
    test_checkout()