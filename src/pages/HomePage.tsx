import React from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { SignUpForm } from '../components/SignUpForm';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <Hero />
      <Features />
      <SignUpForm />
      <Testimonials />
      <Footer />
    </div>
  );
};