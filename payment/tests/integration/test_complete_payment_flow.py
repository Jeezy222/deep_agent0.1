#!/usr/bin/env python3
"""
完整的虚拟支付流程测试
"""
import requests
import json
import time

BASE_URL = "http://localhost:8001/api/v1"

def test_full_payment_flow():
    print("=== 完整虚拟支付流程测试 ===\n")
    
    # 1. 初始化演示数据
    print("1. 初始化演示数据...")
    response = requests.post(f"{BASE_URL}/init-demo-data")
    if response.status_code != 200:
        print(f"初始化失败: {response.status_code}")
        return
    
    init_data = response.json()
    org_id = init_data['org_id']
    print(f"组织ID: {org_id}")
    
    # 2. 检查初始订阅状态
    print("\n2. 检查初始订阅状态...")
    response = requests.get(f"{BASE_URL}/orgs/{org_id}/subscription")
    if response.status_code != 200:
        print(f"查询订阅失败: {response.status_code}")
        return
    
    initial_sub = response.json()
    print(f"当前计划: {initial_sub['plan']['name']}")
    print(f"当前积分: {initial_sub['plan']['monthly_credits']}")
    
    # 3. 创建结账会话（升级到Pro）
    print("\n3. 创建Pro计划结账会话...")
    checkout_data = {
        "plan_id": "pro",
        "billing_cycle": "monthly",
        "payment_method": "alipay",
        "org_id": org_id
    }
    
    response = requests.post(f"{BASE_URL}/checkout/create-session", json=checkout_data)
    if response.status_code != 200:
        print(f"创建结账会话失败: {response.status_code}")
        print(f"错误信息: {response.text}")
        return
    
    checkout_result = response.json()
    mock_url = checkout_result['url']
    print(f"模拟支付页面URL: {mock_url}")
    
    # 4. 模拟支付流程（直接调用API）
    print("\n4. 模拟支付验证...")
    
    # 获取当前订阅
    response = requests.get(f"{BASE_URL}/orgs/{org_id}/subscription")
    if response.status_code != 200:
        print(f"获取订阅失败: {response.status_code}")
        return
    
    current_sub = response.json()
    sub_id = current_sub['id']
    print(f"订阅ID: {sub_id}")
    
    # 模拟升级订阅（这是MockAlipayPage会调用的操作）
    upgrade_data = {
        "plan_id": "pro",
        "billing_cycle": "monthly"
    }
    
    response = requests.post(
        f"{BASE_URL}/subscriptions/{sub_id}/upgrade",
        params=upgrade_data
    )
    
    if response.status_code != 200:
        print(f"升级订阅失败: {response.status_code}")
        print(f"错误信息: {response.text}")
        return
    
    print("订阅升级成功！")
    
    # 5. 验证升级后的状态
    print("\n5. 验证升级后的状态...")
    response = requests.get(f"{BASE_URL}/orgs/{org_id}/subscription")
    if response.status_code != 200:
        print(f"查询升级后订阅失败: {response.status_code}")
        return
    
    upgraded_sub = response.json()
    print(f"升级后计划: {upgraded_sub['plan']['name']}")
    print(f"升级后积分: {upgraded_sub['plan']['monthly_credits']}")
    
    # 6. 检查用量限制
    print("\n6. 检查用量限制...")
    response = requests.get(f"{BASE_URL}/orgs/{org_id}/usage/current")
    if response.status_code != 200:
        print(f"查询用量失败: {response.status_code}")
        return
    
    usage_data = response.json()
    print(f"月度用量: {usage_data['current_month_usage']}/{usage_data['monthly_allowance']}")
    print(f"计划名称: {usage_data['plan_name']}")
    
    print("\n=== 测试完成！===")
    print(f"✅ 成功从 {initial_sub['plan']['name']} 升级到 {upgraded_sub['plan']['name']}")
    print(f"✅ 积分从 {initial_sub['plan']['monthly_credits']} 增加到 {upgraded_sub['plan']['monthly_credits']}")

if __name__ == "__main__":
    test_full_payment_flow()