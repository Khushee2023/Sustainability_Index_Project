const pool = require('./database');

async function testDB() {
  try {
    console.log('🔍 Testing database connection and tables...\n');
    
    // Test connection
    const timeResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connected at:', timeResult.rows[0].now);
    
    // Check products table
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    console.log('📦 Products in database:', productCount.rows[0].count);
    
    // Check if cart_items table exists
    const cartTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cart_items'
      )
    `);
    console.log('🛒 Cart table exists:', cartTableExists.rows[0].exists);
    
    if (cartTableExists.rows[0].exists) {
      const cartCount = await pool.query('SELECT COUNT(*) FROM cart_items');
      console.log('🛒 Cart items in database:', cartCount.rows[0].count);
    }
    
    // Sample products
    const products = await pool.query(`
      SELECT id, name, sustainability_index, stock_quantity 
      FROM products 
      ORDER BY sustainability_index DESC NULLS LAST
      LIMIT 5
    `);
    
    console.log('\n📋 Sample products:');
    products.rows.forEach(product => {
      console.log(`  ${product.id}: ${product.name} (Score: ${product.sustainability_index || 'N/A'}, Stock: ${product.stock_quantity})`);
    });
    
    // Test cart operations
    console.log('\n🧪 Testing cart operations...');
    
    // Add a test item to cart
    const testProduct = products.rows[0];
    if (testProduct) {
      try {
        const addResult = await pool.query(
          'INSERT INTO cart_items (product_id, quantity, user_session) VALUES ($1, $2, $3) RETURNING *',
          [testProduct.id, 2, 'test_session']
        );
        console.log('✅ Test cart item added:', addResult.rows[0]);
        
        // Fetch cart
        const cartResult = await pool.query(`
          SELECT ci.id, ci.quantity, p.name, p.price 
          FROM cart_items ci 
          JOIN products p ON ci.product_id = p.id 
          WHERE ci.user_session = 'test_session'
        `);
        console.log('✅ Cart items fetched:', cartResult.rows);
        
        // Clean up test data
        await pool.query('DELETE FROM cart_items WHERE user_session = $1', ['test_session']);
        console.log('✅ Test cart cleaned up');
        
      } catch (err) {
        console.error('❌ Cart test failed:', err.message);
      }
    }
    
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (err) {
    console.error('❌ Database test failed:', err.message);
  } finally {
    await pool.end();
  }
}

testDB();