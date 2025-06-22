import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: 'rzp_test_EZTnpbOeFo5Ga6',
  key_secret: 'q3z8SYwyFbqs2fNzNzltvnjL',
});

// Helper to enable CORS
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { amount, billing } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    if (!billing || !['monthly', 'yearly'].includes(billing)) {
      return res.status(400).json({ error: 'Invalid billing type provided' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: 'INR',
      receipt: `receipt_${billing}_${Date.now()}`,
      notes: {
        billing_type: billing,
        description: `Premium Subscription (${billing})`,
      },
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create order',
      details: error.error?.description || 'Unknown error'
    });
  }
};

export default allowCors(handler); 