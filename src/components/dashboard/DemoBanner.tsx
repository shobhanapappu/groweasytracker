import React from 'react';
import { Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">You're in Demo Mode</h3>
            <p className="text-sm text-purple-100">
              Sign up to save your data and unlock all features!
            </p>
          </div>
        </div>
        <Link
          to="/auth"
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
        >
          Sign Up Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};