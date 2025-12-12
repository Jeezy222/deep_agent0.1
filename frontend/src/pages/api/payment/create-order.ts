import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  orderId?: string;
  paymentUrl?: string;
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // 模拟生成订单ID
    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // 模拟支付链接 (在实际应用中，这里会是去往支付网关的链接)
    // 这里我们简单指向一个带有订单ID的模拟页面或仅返回ID供前端处理
    const paymentUrl = `https://mock-payment-gateway.com/pay?orderId=${orderId}`;

    return res.status(200).json({ 
      orderId, 
      paymentUrl 
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
