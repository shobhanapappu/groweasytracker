import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Download, Trash2, Save } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { Toast } from '../components/Toast';
import { getCurrentUser, getUserProfile, updateUserProfile, exportAllUserData, deleteUserAccount } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'freelancer' as 'freelancer' | 'e-commerce'
  });
  const [notifications, setNotifications] = useState({
    emailReports: true,
    budgetAlerts: true,
    goalReminders: true,
    securityUpdates: true
  });
  const { theme, toggleTheme } = useTheme();
  const { isDemoUser, canAccessPremiumFeatures } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      if (isDemoUser) {
        setFormData({
          name: 'Demo User',
          email: 'demo@example.com',
          userType: 'freelancer'
        });
        setLoading(false);
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (user) {
          setUser(user);
          setFormData({
            name: user.user_metadata?.name || '',
            email: user.email || '',
            userType: user.user_metadata?.user_type || 'freelancer'
          });

          const { data: profileData } = await getUserProfile(user.id);
          if (profileData) {
            setProfile(profileData);
            setFormData(prev => ({
              ...prev,
              name: profileData.name || prev.name,
              userType: profileData.user_type || prev.userType
            }));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setToast({ message: 'Failed to load user data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isDemoUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSaveProfile = async () => {
    if (isDemoUser) {
      setToast({ message: 'Demo users cannot save changes', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (user && profile) {
        await updateUserProfile(user.id, {
          name: formData.name,
          user_type: formData.userType
        });
        setToast({ message: 'Profile updated successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (isDemoUser || !user) {
      setToast({ message: 'Demo users cannot export data', type: 'error' });
      return;
    }

    try {
      const { data, error } = await exportAllUserData(user.id);
      if (error) {
        setToast({ message: 'Failed to export data', type: 'error' });
        return;
      }

      if (data) {
        const today = new Date().toISOString().split('T')[0];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financetracker_data_${today}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setToast({ message: 'Data exported successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setToast({ message: 'Failed to export data', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (isDemoUser || !user) {
      setToast({ message: 'Demo users cannot delete accounts', type: 'error' });
      return;
    }

    setDeleteLoading(true);
    try {
      const { error } = await deleteUserAccount(user.id);
      if (error) {
        setToast({ message: 'Failed to delete account', type: 'error' });
      } else {
        setToast({ message: 'Account deleted successfully', type: 'success' });
        // Redirect to home page after successful deletion
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setToast({ message: 'Failed to delete account', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences and application settings
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isDemoUser}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Type
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    disabled={isDemoUser}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <option value="freelancer">Freelancer</option>
                    <option value="e-commerce">E-commerce Business Owner</option>
                  </select>
                </div>
              </div>

              {!isDemoUser && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notification Preferences
                </h2>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {key === 'emailReports' && 'Email Reports'}
                        {key === 'budgetAlerts' && 'Budget Alerts'}
                        {key === 'goalReminders' && 'Goal Reminders'}
                        {key === 'securityUpdates' && 'Security Updates'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {key === 'emailReports' && 'Receive monthly financial reports via email'}
                        {key === 'budgetAlerts' && 'Get notified when approaching budget limits'}
                        {key === 'goalReminders' && 'Reminders about savings goals and deadlines'}
                        {key === 'securityUpdates' && 'Important security and account updates'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handleNotificationChange(key)}
                        disabled={isDemoUser}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Appearance
                </h2>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Switch between light and dark themes
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Data Management
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Export Data
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Download all your financial data as JSON
                    </p>
                    {!canAccessPremiumFeatures && !isDemoUser && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Premium feature - Upgrade to export data
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={isDemoUser || (!canAccessPremiumFeatures && !isDemoUser)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div>
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                      Delete Account
                    </h3>
                    <p className="text-xs text-red-500 dark:text-red-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDemoUser}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Security
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Change Password
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Update your account password
                    </p>
                  </div>
                  <button
                    disabled={isDemoUser}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    disabled={isDemoUser}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>

            {isDemoUser && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Demo Mode:</strong> Settings changes are not saved in demo mode. 
                  Sign up for a full account to save your preferences and access all features.
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        onExportData={handleExportData}
        loading={deleteLoading}
        canExport={canAccessPremiumFeatures}
        isDemoUser={isDemoUser}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};