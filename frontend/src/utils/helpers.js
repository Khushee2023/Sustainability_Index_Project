// Utility functions for sustainability scoring and formatting

export const getSustainabilityColor = (score) => {
  if (score === null || score === undefined) return 'gray';
  if (score >= 7.5) return 'green';
  if (score >= 4.5) return 'yellow';
  return 'red';
};

export const getSustainabilityBadge = (score) => {
  if (score === null || score === undefined) return '⚪';
  if (score >= 7.5) return '🟢';
  if (score >= 4.5) return '🟡';
  return '🔴';
};

export const getSustainabilityText = (score) => {
  if (score === null || score === undefined) return 'Not Rated';
  if (score >= 7.5) return 'Eco-Friendly';
  if (score >= 4.5) return 'Moderate';
  return 'Low Sustainability';
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};