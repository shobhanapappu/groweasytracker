import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Enable CORS for all origins (for development)
app.use(cors());

const razorpay = new Razorpay({
  key_id: 'rzp_live_jIyM6wEQQU9VPz',
  key_secret: 'f0xceex8E3mnCcVY3fWrIiTC',
});

app.use(express.static(__dirname));
app.use(express.json());

app.post('/create-order', async (req, res) => {
  const { amount, billing } = req.body;
  console.log('Received order request:', { amount, billing });

  // Validate amount
  if (!amount || isNaN(amount) || amount <= 0) {
    console.error('Invalid amount:', amount);
    return res.status(400).json({ error: 'Invalid amount provided' });
  }

  // Validate billing
  if (!billing || !['monthly', 'yearly'].includes(billing)) {
    console.error('Invalid billing:', billing);
    return res.status(400).json({ error: 'Invalid billing type provided' });
  }

  const options = {
    amount: Math.round(amount * 100), // Convert to paise, ensure integer
    currency: 'INR',
    receipt: `receipt_${billing}_${Date.now()}`,
    notes: {
      billing_type: billing,
      description: `Premium Subscription (${billing})`
    },
    payment_capture: 1
  };

  try {
    console.log('Creating Razorpay order with options:', JSON.stringify(options, null, 2));
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', JSON.stringify(order, null, 2));
    res.json({ 
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', JSON.stringify(error.error || {}, null, 2));
    res.status(500).json({ 
      error: error.message || 'Failed to create order',
      details: error.error?.description || 'Unknown error'
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});