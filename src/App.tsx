import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { Pricing } from './pages/Pricing';
import { Subscription } from './pages/Subscription';
import { Income } from './pages/Income';
import { Expenses } from './pages/Expenses';
import { Budgets } from './pages/Budgets';
import { Investments } from './pages/Investments';
import { Savings } from './pages/Savings';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { FeaturesPage } from './pages/FeaturesPage';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;