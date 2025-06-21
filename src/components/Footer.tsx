import React from 'react';
import { Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-16 px-8 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-black dark:text-white bg-gradient-to-r from-primary-400 to-teal-400 bg-clip-text text-transparent">
              GrowEasy Tracker
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Simplify your finances with smart tracking tools designed for freelancers and small businesses.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com/GroweasyTracker"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 dark:bg-dark-800 rounded-lg hover:bg-gradient-to-r hover:from-primary-500 hover:to-teal-500 transition-all duration-200 hover:scale-110"
                aria-label="Follow us on X"
              >
                <Twitter className="w-5 h-5 text-gray-700 dark:text-white" />
              </a>
              <a
                href="https://www.linkedin.com/in/groweasy-tracker-86b90b36b/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 dark:bg-dark-800 rounded-lg hover:bg-gradient-to-r hover:from-primary-500 hover:to-teal-500 transition-all duration-200 hover:scale-110"
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-gray-700 dark:text-white" />
              </a>
              <a
                href="mailto:groweasytracker@gmail.com"
                className="p-3 bg-gray-200 dark:bg-dark-800 rounded-lg hover:bg-gradient-to-r hover:from-primary-500 hover:to-teal-500 transition-all duration-200 hover:scale-110"
                aria-label="Send us an email"
              >
                <Mail className="w-5 h-5 text-gray-700 dark:text-white" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-black dark:text-white">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-black dark:text-white">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-600 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-teal-800/30 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 GrowEasy Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};