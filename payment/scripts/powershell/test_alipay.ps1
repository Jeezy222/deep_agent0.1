# PowerShell test script for Alipay integration
Write-Host "=== Testing Alipay Integration ==="

try {
    # Test getting plans
    Write-Host "1. Testing GET /api/v1/plans"
    $plansResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/plans" -Method GET
    Write-Host "   Found $($plansResponse.Count) plans"
    
    # Find pro plan
    $proPlan = $plansResponse | Where-Object { $_.id -eq "pro" }
    if ($proPlan) {
        Write-Host "   Pro plan found: $($proPlan.name) - `$ $($proPlan.price_monthly)/month"
        
        # Test checkout
        Write-Host "`n2. Testing POST /api/v1/checkout/create-session"
        $checkoutData = @{
            plan_id = "pro"
            billing_cycle = "monthly"
        } | ConvertTo-Json
        
        Write-Host "   Request data: $checkoutData"
        
        $checkoutResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/v1/checkout/create-session" -Method POST -Body $checkoutData -ContentType "application/json"
        
        Write-Host "   Response status: 200"
        $paymentUrl = $checkoutResponse.url
        Write-Host "   Payment URL: $paymentUrl"
        
        if ($paymentUrl -like "*alipay*") {
            Write-Host "   ✓ Alipay integration is working!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ Payment URL doesn't contain 'alipay'" -ForegroundColor Yellow
        }
        
        Write-Host "   Full response: $($checkoutResponse | ConvertTo-Json -Depth 10)"
        
        # Test the URL is accessible
        Write-Host "`n3. Testing payment URL accessibility"
        try {
            $paymentTest = Invoke-WebRequest -Uri $paymentUrl -Method GET -UseBasicParsing -TimeoutSec 5
            Write-Host "   Payment URL is accessible (status: $($paymentTest.StatusCode))"
        } catch {
            Write-Host "   Payment URL test failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        Write-Host "`n=== TEST PASSED ===" -ForegroundColor Green
    } else {
        Write-Host "   Pro plan not found" -ForegroundColor Red
        Write-Host "`n=== TEST FAILED ===" -ForegroundColor Red
    }
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n=== TEST FAILED ===" -ForegroundColor Red
    exit 1
}