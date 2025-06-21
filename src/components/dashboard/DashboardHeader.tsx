import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, User, Settings, LogOut, ChevronDown, Menu, X, Moon, Sun } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useNavigate, Link } from 'react-router-dom';
import { signOut, getCurrentUser } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

export const DashboardHeader: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkUser = async () => {
      const demoMode = localStorage.getItem('isDemoUser') === 'true';
      if (demoMode) {
        setIsDemoUser(true);
        return;
      }

      const { user } = await getCurrentUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isDemoUser) {
      localStorage.removeItem('isDemoUser');
      navigate('/');
      return;
    }

    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', active: true },
    { name: 'Income', href: '/income' },
    { name: 'Expenses', href: '/expenses' },
    { name: 'Budgets', href: '/budgets' },
    { name: 'Investments', href: '/investments' },
    { name: 'Savings', href: '/savings' },
    { name: 'Reports', href: '/reports' },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              GrowEasy Tracker
            </span>
          </div>

          {/* Hamburger Menu for Screens <= 1300px */}
          <div className="hidden max-[1300px]:block">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Navigation for Screens > 1300px */}
          <nav className="hidden min-[1300px]:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu for Screens <= 1300px */}
          {isMobileMenuOpen && (
            <nav className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-lg min-[1300px]:hidden border-b border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[calc(100vh-4rem)]">
              {/* Navigation Items */}
              <div className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        item.active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Profile, Actions & Theme Section */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                {/* User Profile */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDemoUser 
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                      : 'bg-gradient-to-br from-blue-500 to-teal-500'
                  }`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {isDemoUser ? 'Demo User' : user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isDemoUser ? 'Demo Mode' : user?.email || 'User'}
                    </p>
                  </div>
                </div>
                
                {/* Theme Toggle for Mobile */}
                <div className="flex items-center justify-between py-3 my-3 border-y border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Theme</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Light</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Dark</span>
                      </>
                    )}
                  </button>
                </div>

                {/* User Actions */}
                {!isDemoUser && (
                  <div className="space-y-2 mb-4">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>
                )}
                
                {/* Logout Button */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {isDemoUser ? 'Exit Demo' : 'Logout'}
                </button>
              </div>
            </nav>
          )}

          {/* User Actions (Visible only on Screens > 1300px) */}
          <div className="hidden min-[1300px]:flex items-center gap-4">
            <ThemeToggle />
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="User menu"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDemoUser 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 to-teal-500'
                }`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isDemoUser ? 'Demo User' : user?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {!isDemoUser && (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    {isDemoUser ? 'Exit Demo' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};