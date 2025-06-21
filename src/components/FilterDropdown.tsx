import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Calendar, Tag, DollarSign } from 'lucide-react';

interface FilterDropdownProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories?: string[];
  showAmountFilter?: boolean;
  showDateFilter?: boolean;
  showCategoryFilter?: boolean;
  className?: string;
}

export interface FilterOptions {
  category?: string;
  dateRange?: string;
  amountRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  onFilterChange,
  categories = [],
  showAmountFilter = true,
  showDateFilter = true,
  showCategoryFilter = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    dateRange: 'Last 30 Days',
    amountRange: { min: undefined, max: undefined },
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterUpdate = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      category: '',
      dateRange: 'All',
      amountRange: { min: undefined, max: undefined },
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.category || 
    filters.dateRange !== 'Last 30 Days' || 
    filters.amountRange?.min || 
    filters.amountRange?.max;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
          hasActiveFilters
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filter</span>
        {hasActiveFilters && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-4 z-50">
          <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Filter Options
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Category Filter */}
            {showCategoryFilter && categories.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-3 h-3" />
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterUpdate({ category: e.target.value })}
                  className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            {showDateFilter && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-3 h-3" />
                  Date Range
                </label>
                <select
                  value={filters.dateRange || 'Last 30 Days'}
                  onChange={(e) => handleFilterUpdate({ dateRange: e.target.value })}
                  className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 90 Days">Last 90 Days</option>
                  <option value="This Year">This Year</option>
                  <option value="All">All Time</option>
                </select>
              </div>
            )}

            {/* Amount Range Filter */}
            {showAmountFilter && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-3 h-3" />
                  Amount Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.amountRange?.min || ''}
                    onChange={(e) => handleFilterUpdate({
                      amountRange: {
                        ...filters.amountRange,
                        min: e.target.value ? Number(e.target.value) : undefined
                      }
                    })}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.amountRange?.max || ''}
                    onChange={(e) => handleFilterUpdate({
                      amountRange: {
                        ...filters.amountRange,
                        max: e.target.value ? Number(e.target.value) : undefined
                      }
                    })}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.sortBy || 'date'}
                  onChange={(e) => handleFilterUpdate({ sortBy: e.target.value })}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterUpdate({ sortOrder: e.target.value as 'asc' | 'desc' })}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};