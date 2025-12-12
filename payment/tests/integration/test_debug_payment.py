#!/usr/bin/env python3
"""
调试虚拟支付流程的脚本
"""
import requests
import json

BASE_URL = "http://localhost:8001/api/v1"

def test_payment_flow():
    # 1. 首先初始化演示数据
    print("=== 1. 初始化演示数据 ===")
    try:
        response = requests.post(f"{BASE_URL}/init-demo-data")
        print(f"初始化响应: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"初始化数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            org_id = data.get('org_id')
        else:
            print("初始化失败，使用默认org_id")
            org_id = "org_demo"
    except Exception as e:
        print(f"初始化失败: {e}")
        org_id = "org_demo"
    
    # 2. 检查组织订阅状态
    print(f"\n=== 2. 检查组织 {org_id} 的订阅状态 ===")
    try:
        response = requests.get(f"{BASE_URL}/orgs/{org_id}/subscription")
        print(f"订阅查询响应: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"订阅数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"订阅查询失败: {response.text}")
    except Exception as e:
        print(f"订阅查询失败: {e}")
    
    # 3. 检查所有可用计划
    print(f"\n=== 3. 检查可用计划 ===")
    try:
        response = requests.get(f"{BASE_URL}/plans")
        print(f"计划查询响应: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"可用计划: {json.dumps(data, indent=2, ensure_ascii=False)}")
            if data:
                plan_id = data[0]['id']
                print(f"使用第一个计划ID: {plan_id}")
        else:
            print(f"计划查询失败: {response.text}")
    except Exception as e:
        print(f"计划查询失败: {e}")
    
    # 4. 创建结账会话
    print(f"\n=== 4. 创建结账会话 ===")
    checkout_data = {
        "plan_id": "pro",  # 使用pro计划
        "billing_cycle": "monthly",
        "payment_method": "alipay",
        "org_id": org_id
    }
    try:
        response = requests.post(f"{BASE_URL}/checkout/create-session", json=checkout_data)
        print(f"结账会话响应: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"结账会话数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            mock_url = data.get('url')
            print(f"模拟支付页面URL: {mock_url}")
        else:
            print(f"结账会话创建失败: {response.text}")
    except Exception as e:
        print(f"结账会话创建失败: {e}")

if __name__ == "__main__":
    test_payment_flow()