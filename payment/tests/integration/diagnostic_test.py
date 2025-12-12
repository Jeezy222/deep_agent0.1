import requests
import json
import sys

def test_connection():
    print("=== Starting Diagnostic Test ===", file=sys.stderr)
    
    try:
        # Test 1: Basic connectivity
        print("1. Testing basic connectivity...", file=sys.stderr)
        base_url = "http://localhost:8001"
        
        # Test if server is running
        try:
            response = requests.get(f"{base_url}/api/v1/plans", timeout=5)
            print(f"   Response status: {response.status_code}", file=sys.stderr)
            
            if response.status_code == 200:
                plans = response.json()
                print(f"   Found {len(plans)} plans", file=sys.stderr)
                
                # Find pro plan
                pro_plan = next((p for p in plans if p.get('id') == 'pro'), None)
                if pro_plan:
                    print(f"   Pro plan found: {pro_plan['name']} - ${pro_plan['price_monthly']}/month", file=sys.stderr)
                    
                    # Test checkout
                    print("\n2. Testing checkout endpoint...", file=sys.stderr)
                    checkout_data = {
                        "plan_id": "pro",
                        "billing_cycle": "monthly"
                    }
                    
                    print(f"   Request data: {json.dumps(checkout_data)}", file=sys.stderr)
                    
                    checkout_response = requests.post(
                        f"{base_url}/api/v1/checkout/create-session",
                        json=checkout_data,
                        timeout=10
                    )
                    
                    print(f"   Response status: {checkout_response.status_code}", file=sys.stderr)
                    
                    if checkout_response.status_code == 200:
                        result = checkout_response.json()
                        payment_url = result.get('url', '')
                        print(f"   Payment URL: {payment_url}", file=sys.stderr)
                        
                        if 'alipay' in payment_url.lower():
                            print("   ✓ Alipay integration is working!", file=sys.stderr)
                        else:
                            print("   ⚠ Payment URL doesn't contain 'alipay'", file=sys.stderr)
                            
                        print(f"   Full response: {json.dumps(result, indent=2)}", file=sys.stderr)
                        return True
                    else:
                        print(f"   Error response: {checkout_response.text}", file=sys.stderr)
                        return False
                else:
                    print("   Pro plan not found", file=sys.stderr)
                    return False
            else:
                print(f"   Error: {response.text}", file=sys.stderr)
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"   Connection error: {str(e)}", file=sys.stderr)
            return False
            
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return False

if __name__ == "__main__":
    success = test_connection()
    print(f"\n=== Test {'PASSED' if success else 'FAILED'} ===", file=sys.stderr)
    sys.exit(0 if success else 1)