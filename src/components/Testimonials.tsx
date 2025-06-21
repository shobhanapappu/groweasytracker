import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Freelance Designer',
    image: '/testimonials/sarah.jpg',
    content: 'This platform has completely transformed how I manage my freelance business. The automation features save me hours every week!',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'E-commerce Owner',
    image: '/testimonials/michael.jpg',
    content: 'The analytics and insights have helped me make data-driven decisions that increased my store\'s revenue by 40%.',
    rating: 5
  },
  {
    name: 'Emma Rodriguez',
    role: 'Digital Artist',
    image: '/testimonials/emma.jpg',
    content: 'I love how intuitive and user-friendly the platform is. It\'s made managing my client projects so much easier.',
    rating: 5
  }
];

export const Testimonials: React.FC = () => {
  const { theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    observerRef.current = observer;

    const testimonials = sectionRef.current?.querySelectorAll('.testimonial-card');
    testimonials?.forEach((testimonial) => {
      observer.observe(testimonial);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-800 dark:to-dark-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by{' '}
          <span className="bg-gradient-to-r from-primary-400 to-teal-400 bg-clip-text text-transparent">
              Thousands
          </span>
        </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join our community of successful freelancers and e-commerce entrepreneurs who have transformed their businesses with our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card opacity-0 transition-opacity duration-700 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-teal-800/30 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-500"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{testimonial.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary-500 text-primary-500" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};