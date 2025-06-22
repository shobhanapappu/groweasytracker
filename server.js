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

// Create subscription endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { billing } = req.body;

    if (!billing || !['monthly', 'yearly'].includes(billing)) {
      return res.status(400).json({ error: 'Invalid billing type provided' });
    }

    // For now, we'll use the monthly plan ID
    // You can add yearly plan ID later if needed
    const planId = 'plan_Qj9xEoZLc8BrGe'; // Monthly Premium plan

    const subscriptionOptions = {
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // Number of payments to be made
      notes: {
        billing_type: billing,
        description: `Premium Subscription (${billing})`,
      },
    };

    const subscription = await razorpay.subscriptions.create(subscriptionOptions);
    
    res.status(200).json({
      subscription_id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      current_start: subscription.current_start,
      current_end: subscription.current_end,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create subscription',
      details: error.error?.description || 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 