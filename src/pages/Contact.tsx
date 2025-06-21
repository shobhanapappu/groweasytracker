import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';
import emailjs from 'emailjs-com';

export const Contact: React.FC = () => {
  const { theme } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', title: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // Send to you
      await emailjs.send(
        'service_r1mhagw',
        'template_bok93lb',
        {
          name: form.name,
          email: form.email,
          title: form.title,
          message: form.message,
          time: new Date().toLocaleString(),
        },
        'cPiMJxqMC3bQeItey' // <-- Replace with your EmailJS public key
      );
      // Auto-reply to user
      await emailjs.send(
        'service_r1mhagw',
        'template_102gorr',
        {
          name: form.name,
          email: form.email,
          title: form.title,
        },
        'cPiMJxqMC3bQeItey'
      );
      setStatus('success');
      setForm({ name: '', email: '', title: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900">
      <Header />
      <main>
        <section className="py-20 px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have a question or feedback? Fill out the form and we'll get back to you!
          </p>
        </section>
        <section className="py-12 px-8">
          <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-teal-800/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-teal-700/50 rounded-lg bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-teal-700/50 rounded-lg bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-teal-700/50 rounded-lg bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-teal-700/50 rounded-lg bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-gradient-to-r from-primary-500 to-teal-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'success' && (
                <div className="text-green-600 dark:text-green-400 mt-4">Message sent! We'll reply soon.</div>
              )}
              {status === 'error' && (
                <div className="text-red-600 dark:text-red-400 mt-4">Something went wrong. Please try again.</div>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}; 