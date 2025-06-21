import React from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { User } from 'lucide-react';

export const Profile: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This is your profile page. More content will be added soon!
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Your profile details will be displayed here.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}; 