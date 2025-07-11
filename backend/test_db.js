const pool = require('./database');

async function testDB() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM products');
    console.log('Products in database:', result.rows[0].count);
    
    const products = await pool.query('SELECT id, name, sustainability_index FROM products LIMIT 3');
    console.log('Sample products:', products.rows);
    
    pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

testDB();