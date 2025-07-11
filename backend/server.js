const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pool = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to get sustainability category
function getSustainabilityCategory(score) {
  if (score === null || score === undefined) {
    return { category: 'Unknown', color: 'gray', emoji: '❓' };
  }

  if (score >= 7.5) {
    return { category: 'High', color: 'green', emoji: '🟢' };
  } else if (score >= 4.5) {
    return { category: 'Medium', color: 'yellow', emoji: '🟡' };
  } else {
    return { category: 'Low', color: 'red', emoji: '🔴' };
  }
}

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is working!' });
});

// Get all products with sustainability info
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        description, 
        price, 
        image_url, 
        sustainability_index, 
        stock_quantity 
      FROM products 
      ORDER BY id
    `);

    const productsWithCategory = result.rows.map(product => {
      const category = getSustainabilityCategory(product.sustainability_index);
      return {
        ...product,
        sustainability_category: category.category,
        sustainability_color: category.color,
        sustainability_emoji: category.emoji
      };
    });

    res.json(productsWithCategory);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Predict sustainability score for new product - FIXED VERSION
app.post('/api/predict', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Call Flask API
    const response = await axios.post(`${FLASK_API_URL}/predict`, {
      description: description
    }, {
      timeout: 30000
    });

    console.log('Flask API Response:', response.data); // ✅ Debug log

    // FIXED: Handle the correct field name from Flask API
    let score = null;
    if (response.data) {
      // Check for sustainability_index first (what Flask actually returns)
      if ('sustainability_index' in response.data) {
        score = response.data.sustainability_index;
      } else if ('sustainability_score' in response.data) {
        score = response.data.sustainability_score;
      } else if ('score' in response.data) {
        score = response.data.score;
      } else {
        console.warn('⚠️ Unexpected Flask response structure:', response.data);
        // Try to extract any numeric value as fallback
        const numericValues = Object.values(response.data).filter(val => 
          typeof val === 'number' && !isNaN(val)
        );
        if (numericValues.length > 0) {
          score = numericValues[0];
          console.log('🔧 Using fallback numeric value:', score);
        }
      }
    }

    // Ensure score is a number
    if (score !== null) {
      score = parseFloat(score);
      if (isNaN(score)) {
        score = null;
      }
    }

    const category = getSustainabilityCategory(score);

    res.json({
      sustainability_score: score,
      sustainability_category: category.category,
      sustainability_color: category.color,
      sustainability_emoji: category.emoji
    });
  } catch (err) {
    console.error('Error predicting sustainability:', err);
    if (err.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'ML service unavailable. Please ensure Flask API is running.' });
    } else {
      res.status(500).json({ error: 'Failed to predict sustainability score' });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});