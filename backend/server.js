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

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];
    const category = getSustainabilityCategory(product.sustainability_index);

    res.json({
      ...product,
      sustainability_category: category.category,
      sustainability_color: category.color,
      sustainability_emoji: category.emoji
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ===== CART ENDPOINTS =====

// Get cart items for a user session
app.get('/api/cart', async (req, res) => {
  try {
    const { session = 'default' } = req.query;
    
    const result = await pool.query(`
      SELECT 
        ci.id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.sustainability_index,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_session = $1
      ORDER BY ci.created_at DESC
    `, [session]);

    const cartWithCategories = result.rows.map(item => {
      const category = getSustainabilityCategory(item.sustainability_index);
      return {
        ...item,
        sustainability_category: category.category,
        sustainability_color: category.color,
        sustainability_emoji: category.emoji
      };
    });

    res.json(cartWithCategories);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { product_id, quantity = 1, user_session = 'default' } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists and has stock
    const productResult = await pool.query(
      'SELECT id, stock_quantity FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE product_id = $1 AND user_session = $2',
      [product_id, user_session]
    );

    if (existingItem.rows.length > 0) {
      // Update existing item
      const newQuantity = existingItem.rows[0].quantity + quantity;
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }

      const updateResult = await pool.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [newQuantity, existingItem.rows[0].id]
      );

      res.json({ message: 'Cart updated successfully', item: updateResult.rows[0] });
    } else {
      // Add new item
      const insertResult = await pool.query(
        'INSERT INTO cart_items (product_id, quantity, user_session) VALUES ($1, $2, $3) RETURNING *',
        [product_id, quantity, user_session]
      );

      res.json({ message: 'Item added to cart successfully', item: insertResult.rows[0] });
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Check if cart item exists
    const cartItemResult = await pool.query(
      'SELECT ci.*, p.stock_quantity FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = $1',
      [id]
    );

    if (cartItemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const cartItem = cartItemResult.rows[0];
    if (quantity > cartItem.stock_quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const updateResult = await pool.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    res.json({ message: 'Cart item updated successfully', item: updateResult.rows[0] });
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteResult = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 RETURNING *',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (err) {
    console.error('Error removing cart item:', err);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// Clear entire cart for a session
app.delete('/api/cart', async (req, res) => {
  try {
    const { session = 'default' } = req.query;

    await pool.query('DELETE FROM cart_items WHERE user_session = $1', [session]);

    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Predict sustainability score for new product
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

    console.log('Flask API Response:', response.data);

    // Handle the correct field name from Flask API
    let score = null;
    if (response.data) {
      if ('sustainability_index' in response.data) {
        score = response.data.sustainability_index;
      } else if ('sustainability_score' in response.data) {
        score = response.data.sustainability_score;
      } else if ('score' in response.data) {
        score = response.data.score;
      } else {
        console.warn('⚠️ Unexpected Flask response structure:', response.data);
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler - Fixed to prevent path-to-regexp error
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET    /api/test`);
  console.log(`  GET    /api/products`);
  console.log(`  GET    /api/products/:id`);
  console.log(`  GET    /api/cart`);
  console.log(`  POST   /api/cart`);
  console.log(`  PUT    /api/cart/:id`);
  console.log(`  DELETE /api/cart/:id`);
  console.log(`  DELETE /api/cart`);
  console.log(`  POST   /api/predict`);
});