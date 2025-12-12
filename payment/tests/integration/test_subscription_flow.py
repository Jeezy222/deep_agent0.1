import requests
import json
import time

# 完整的订阅流程测试
base_url = "http://localhost:8001"
frontend_url = "http://localhost:5173"

def test_full_subscription_flow():
    print("🚀 开始测试完整的订阅流程...")
    
    # 1. 获取可用的计划
    print("\n📋 获取可用的订阅计划...")
    response = requests.get(f"{base_url}/api/v1/plans")
    if response.status_code == 200:
        plans = response.json()
        print(f"✓ 找到 {len(plans)} 个计划")
        
        # 显示计划详情
        for plan in plans:
            print(f"  - {plan['name']}: ${plan['price_monthly']}/月 (月度积分: {plan['monthly_credits']})")
        
        # 选择pro计划进行测试
        pro_plan = next((p for p in plans if p.get('id') == 'pro'), None)
        if pro_plan:
            print(f"\n🎯 选择计划: {pro_plan['name']}")
            
            # 2. 创建结账会话（应该返回虚拟页面URL）
            print("\n💳 创建结账会话...")
            checkout_data = {
                "plan_id": "pro",
                "billing_cycle": "monthly",
                "payment_method": "alipay",
                "org_id": "test-org-123"
            }
            
            response = requests.post(
                f"{base_url}/api/v1/checkout/create-session",
                json=checkout_data
            )
            
            if response.status_code == 200:
                result = response.json()
                redirect_url = result.get('url', '')
                
                print(f"✓ 结账会话创建成功!")
                print(f"🔄 重定向URL: {redirect_url}")
                
                # 检查是否是虚拟支付宝页面
                if 'mock-alipay' in redirect_url:
                    print("✅ 虚拟支付宝页面跳转功能正常!")
                    print(f"🌐 前端访问地址: {frontend_url}/mock-alipay")
                    
                    # 解析URL参数
                    if '?' in redirect_url:
                        params = redirect_url.split('?')[1]
                        print(f"📊 URL参数: {params}")
                        
                        # 提取金额和计划信息
                        if 'amount=' in redirect_url:
                            amount = redirect_url.split('amount=')[1].split('&')[0]
                            print(f"💰 支付金额: ${amount}")
                        
                        if 'plan_id=' in redirect_url:
                            plan_id = redirect_url.split('plan_id=')[1].split('&')[0]
                            print(f"📋 计划ID: {plan_id}")
                    
                    print(f"\n🎉 测试成功! 用户订阅时将跳转到虚拟支付页面")
                    print(f"🔗 完整流程: 前端定价页 → 后端结账 → 虚拟支付宝页面 → 支付成功")
                    
                else:
                    print("❌ 没有跳转到虚拟页面")
                    print(f"响应: {json.dumps(result, indent=2)}")
                    
            else:
                print(f"❌ 结账会话创建失败: {response.status_code}")
                print(f"错误: {response.text}")
        else:
            print("❌ 未找到pro计划")
    else:
        print(f"❌ 获取计划失败: {response.status_code}")
        print(f"错误: {response.text}")

if __name__ == "__main__":
    test_full_subscription_flow()