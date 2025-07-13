import React from 'react';

const ProductFilter = ({ onFilterChange, currentFilter, onSortChange, currentSort }) => {
  const filters = [
    { value: 'all', label: 'All Products', icon: '🏪' },
    { value: 'eco-friendly', label: 'Eco-Friendly', icon: '🟢' },
    { value: 'moderate', label: 'Moderate', icon: '🟡' },
    { value: 'low-sustainability', label: 'Low Sustainability', icon: '🔴' },
    { value: 'not-rated', label: 'Not Rated', icon: '⚪' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'sustainability-high', label: 'Most Sustainable' },
    { value: 'sustainability-low', label: 'Least Sustainable' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors
                ${currentFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;