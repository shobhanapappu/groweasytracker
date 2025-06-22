import React, { useState } from 'react';

interface RazorpayButtonProps {
  amount: number;
  billing: 'monthly' | 'yearly';
}

export const RazorpayButton: React.FC<RazorpayButtonProps> = ({ amount, billing }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billing }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      
      const options = {
        key: 'rzp_live_6XbictuHjDq9L1', // Using the provided test key
        subscription_id: data.subscription_id,
        name: 'GrowEasy Tracker',
        description: `Premium Subscription (${billing})`,
        handler: function (response: any) {
          alert(`Subscription successful! Payment ID: ${response.razorpay_payment_id}`);
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
      {loading ? 'Processing...' : `Subscribe (₹${amount}/${billing === 'monthly' ? 'month' : 'year'})`}
    </button>
  );
};