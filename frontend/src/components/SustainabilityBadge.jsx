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

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-full border-2 font-semibold
      ${sizeClasses[size]}
      ${colorClasses[color]}
    `}>
      <span className="text-lg">{badge}</span>
      <span>{score !== null && score !== undefined ? score.toFixed(1) : 'N/A'}</span>
      {size !== 'small' && <span className="text-xs opacity-75">({text})</span>}
    </div>
  );
};

export default SustainabilityBadge;