import React, { useState } from 'react';

interface RazorpayButtonProps {
  amount: number;
  billing: 'monthly' | 'yearly';
  paymentType: 'recurring' | 'one-time';
}

export const RazorpayButton: React.FC<RazorpayButtonProps> = ({ amount, billing, paymentType }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, billing, paymentType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      
      const options: any = {
        key: 'rzp_live_6XbictuHjDq9L1', // Using your live key
        name: 'GrowEasy Tracker',
        description: `Premium Subscription - ${billing} (${paymentType})`,
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          window.location.href = `/subscription?success=true`;
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      // Add order_id for one-time or subscription_id for recurring
      if (paymentType === 'one-time') {
        options.amount = data.amount;
        options.order_id = data.order_id;
      } else {
        options.subscription_id = data.subscription_id;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }
    handlePayment();
  };

  return (
    <button
      onClick={displayRazorpay}
      disabled={loading}
      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Processing...' : `Pay ₹${amount} (${paymentType})`}
    </button>
  );
};