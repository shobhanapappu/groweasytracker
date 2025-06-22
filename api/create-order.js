import Razorpay from 'razorpay';

// Helper to enable CORS
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
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

const razorpay = new Razorpay({
  key_id: 'rzp_live_6XbictuHjDq9L1',
  key_secret: 'aIGvLEt9TZCHMfahSNDbS2co',
});

// Main handler for creating subscriptions or one-time orders
const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { amount, billing, paymentType } = req.body;

    if (paymentType === 'recurring') {
      // --- Create Subscription ---
      const planId = billing === 'monthly' ? 'plan_Qj9xEoZLc8BrGe' : 'YOUR_YEARLY_PLAN_ID'; // Replace if you have one
      if (billing === 'yearly' && planId === 'YOUR_YEARLY_PLAN_ID') {
        return res.status(400).json({ error: 'Yearly plan ID not configured.' });
      }
      
      const subscriptionOptions = {
        plan_id: planId,
        customer_notify: 1,
        total_count: billing === 'monthly' ? 12 : 1,
      };

      const subscription = await razorpay.subscriptions.create(subscriptionOptions);
      return res.status(200).json({ subscription_id: subscription.id });

    } else if (paymentType === 'one-time') {
      // --- Create One-Time Order ---
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount for one-time payment.' });
      }

      const orderOptions = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `receipt_${billing}_${Date.now()}`,
      };

      const order = await razorpay.orders.create(orderOptions);
      return res.status(200).json({ order_id: order.id, amount: order.amount });

    } else {
      return res.status(400).json({ error: 'Invalid payment type provided.' });
    }
  } catch (error) {
    console.error('Error processing payment creation:', error);
    res.status(500).json({
      error: error.message || 'Failed to process payment.',
      details: error.error?.description || 'Unknown Razorpay error.'
    });
  }
};

export default allowCors(handler); 