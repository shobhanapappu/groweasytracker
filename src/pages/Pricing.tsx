import React from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: [
      'Track income & expenses',
      'Basic analytics',
      'Set savings goals',
      'Export data (CSV)',
      'Light & dark mode',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: 'per month',
    yearlyPrice: '₹3,229',
    yearlyInfo: 'Billed annually (10% off)',
    features: [
      'Everything in Free',
      'Advanced analytics & charts',
      'Investment tracking',
      'Priority support',
      'Unlimited budgets & goals',
    ],
    cta: 'Upgrade Now',
    highlight: true,
  },
  // {
  //   name: 'Business',
  //   price: '₹799',
  //   period: 'per month',
  //   features: [
  //     'Everything in Pro',
  //     'Multi-user collaboration',
  //     'Custom reports',
  //     'Dedicated account manager',
  //     'Early access to new features',
  //   ],
  //   cta: 'Contact Sales',
  //   highlight: false,
  // },
];

export const Pricing: React.FC = () => {
  const { theme } = useTheme();
  const [billing, setBilling] = React.useState<'monthly' | 'yearly'>('monthly');
  const [paymentType, setPaymentType] = React.useState<'recurring' | 'one-time'>('recurring');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Simple & Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees. Cancel anytime.
          </p>
        </section>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none ${billing === 'monthly' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none ${billing === 'yearly' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setBilling('yearly')}
            >
              Yearly <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-bold">10% OFF</span>
            </button>
          </div>
        </div>

        {/* Payment Type Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none ${paymentType === 'recurring' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setPaymentType('recurring')}
            >
              Recurring
            </button>
            <button
              className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none ${paymentType === 'one-time' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setPaymentType('one-time')}
            >
              One-Time
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <section className="py-12 px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl shadow-xl border transition-all duration-300 p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-teal-800/30 ${
                  plan.highlight ? 'ring-2 ring-primary-500 scale-105 z-10' : 'hover:scale-105 hover:shadow-2xl'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h2>
                  {plan.highlight && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-xs font-semibold">
                      <Star className="w-4 h-4" /> Popular
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {plan.name === 'Pro' && billing === 'yearly' ? plan.yearlyPrice : plan.price}
                  </span>
                  <span className="text-base text-gray-500 dark:text-gray-400 ml-2">
                    {plan.name === 'Pro' && billing === 'yearly' ? 'per year' : plan.period}
                  </span>
                  {plan.name === 'Pro' && billing === 'yearly' && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">{plan.yearlyInfo}</div>
                  )}
                </div>
                <ul className="mb-8 space-y-4 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-auto w-full py-3 rounded-xl font-bold transition-all duration-200 shadow-lg text-white ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600'
                      : 'bg-gray-700 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    if (plan.name === 'Pro') {
                      const amount = billing === 'yearly' ? 3229 : 299;
                      navigate('/subscription', { state: { billing, amount, paymentType } });
                    }
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ or CTA Section (optional) */}
        <section className="py-16 px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Contact our team and we'll help you choose the right plan for your needs.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gradient-to-r from-primary-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Contact Us
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
};