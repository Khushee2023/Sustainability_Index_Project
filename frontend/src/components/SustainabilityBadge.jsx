import React from 'react';
import { getSustainabilityColor, getSustainabilityBadge, getSustainabilityText } from '../utils/helpers';

const SustainabilityBadge = ({ score, size = 'normal' }) => {
  const color = getSustainabilityColor(score);
  const badge = getSustainabilityBadge(score);
  const text = getSustainabilityText(score);
  
  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    normal: 'text-base px-3 py-2',
    large: 'text-lg px-4 py-3'
  };
  
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    gray: 'bg-gray-100 text-gray-600 border-gray-300'
  };

  // Helper function to format score safely
  const formatScore = (score) => {
    if (score === null || score === undefined) return 'N/A';
    const numScore = Number(score);
    return isNaN(numScore) ? 'N/A' : numScore.toFixed(1);
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[color]}`}>
      {badge}
      {formatScore(score)}
      {size !== 'small' && <span className="text-xs opacity-75">({text})</span>}
    </div>
  );
};

export default SustainabilityBadge;