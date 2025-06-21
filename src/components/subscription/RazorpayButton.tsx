import React from 'react';

const RAZORPAY_KEY_ID = 'rzp_live_jIyM6wEQQU9VPz';
const ORDER_API = 'http://localhost:3000/create-order'; // Change if backend runs elsewhere

export const RazorpayButton: React.FC<{ amount: number; billing: 'monthly' | 'yearly' }> = ({ amount, billing }) => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Failed to load Razorpay SDK.');
      return;
    }
    try {
      console.log('Creating order with:', { amount, billing });
      const orderRes = await fetch(ORDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, billing }),
      });
      
      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await orderRes.json();
      console.log('Order created:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'GrowEasy Tracker',
        description: `Premium Subscription (${billing})`,
        order_id: data.order_id,
        handler: function (response: any) {
          console.log('Payment successful:', response);
          alert(
            `Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}\nSignature: ${response.razorpay_signature}`
          );
        },
        prefill: {
          name: 'Test Customer',
          email: 'test@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            console.log('Checkout form closed');
          }
        }
      };

      try {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response.error);
          alert(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } catch (error) {
        console.error('Error opening Razorpay:', error);
        throw error;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Failed to initiate payment');
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
    >
      {`Subscribe (${billing === 'yearly' ? `₹${amount.toLocaleString()}/year` : `₹${amount.toLocaleString()}/month`})`}
    </button>
  );
};