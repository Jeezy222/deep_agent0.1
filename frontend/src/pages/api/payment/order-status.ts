import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  status?: 'pending' | 'success' | 'failed';
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { orderId } = req.query;

  if (!orderId || Array.isArray(orderId)) {
    return res.status(400).json({ message: 'Missing or invalid orderId' });
  }

  try {
    // 模拟随机状态变化
    // 为了方便测试，我们使用随机数来决定返回的状态
    // 实际应用中，这里会查询数据库或调用支付网关接口
    
    const random = Math.random();
    let status: 'pending' | 'success' | 'failed';

    // 50% 概率为 pending
    // 40% 概率为 success
    // 10% 概率为 failed
    if (random < 0.5) {
      status = 'pending';
    } else if (random < 0.9) {
      status = 'success';
    } else {
      status = 'failed';
    }

    return res.status(200).json({ status });
  } catch (error) {
    console.error('Check order status error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
