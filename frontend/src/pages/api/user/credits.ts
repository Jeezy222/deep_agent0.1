import type { NextApiRequest, NextApiResponse } from 'next'

const ORG_ID = '1a828e4d-0360-4422-8c68-983b1e8a1c43'; // Demo Org ID
const BACKEND_URL = 'http://localhost:8001/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(`${BACKEND_URL}/orgs/${ORG_ID}/usage/current`);
    
    if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Map backend usage data to frontend credits format
    // Backend returns usage, frontend wants remaining balance
    const remainingMonthly = data.monthly_allowance - data.current_month_usage;
    
    res.status(200).json({
      points: remainingMonthly,
      freePoints: remainingMonthly, // Simplified: assuming all are free/available
      dailyRefresh: data.daily_allowance,
      planName: data.plan_name,
      email: 'demo-user@example.com',
      username: 'Demo User'
    });
  } catch (error) {
    console.error('Failed to fetch credits from backend:', error);
    // Fallback to mock data if backend is down
    res.status(200).json({
      points: 1037,
      freePoints: 737,
      dailyRefresh: 300,
      email: '1935436821@qq.com',
      username: '俊杰 李 (Offline)'
    });
  }
}
