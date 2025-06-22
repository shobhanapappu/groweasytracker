import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: 'rzp_live_6XbictuHjDq9L1',
  key_secret: 'aIGvLEt9TZCHMfahSNDbS2co',
});

// Endpoint to create a subscription or a one-time order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, billing, paymentType } = req.body;

    if (paymentType === 'recurring') {
      // --- Create Subscription ---
      const planId = billing === 'monthly' ? 'plan_Qj9xEoZLc8BrGe' : 'YOUR_YEARLY_PLAN_ID'; // Replace with your yearly plan ID
      if (billing === 'yearly' && planId === 'YOUR_YEARLY_PLAN_ID') {
          return res.status(400).json({ error: 'Yearly plan ID not configured.' });
      }

      const subscriptionOptions = {
        plan_id: planId,
        customer_notify: 1,
        total_count: billing === 'monthly' ? 12 : 1, // 12 monthly payments or 1 yearly payment
      };

      const subscription = await razorpay.subscriptions.create(subscriptionOptions);
      return res.status(200).json({ subscription_id: subscription.id });

    } else if (paymentType === 'one-time') {
      // --- Create One-Time Order ---
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount for one-time payment.' });
      }

      const orderOptions = {
        amount: Math.round(amount * 100), // Amount in the smallest currency unit
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
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 