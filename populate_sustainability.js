const axios = require('axios');
const pool = require('./backend/database');

require('dotenv').config();

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

// Function to get sustainability score from Flask API
async function getSustainabilityScore(description) {
  try {
    console.log(`Calling Flask API for: "${description.substring(0, 50)}..."`);
    
    const response = await axios.post(`${FLASK_API_URL}/predict`, {
      description: description
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    const score = response.data.sustainability_index;
    console.log(`✅ Received score: ${score}`);
    return score;
  } catch (error) {
    console.error(`❌ Error getting sustainability score:`, error.message);
    return null;
  }
}

// Function to update product sustainability score in database
async function updateProductSustainability(productId, score) {
  try {
    await pool.query(
      'UPDATE products SET sustainability_index = $1 WHERE id = $2',
      [score, productId]
    );
    console.log(`✅ Updated product ${productId} with score ${score}`);
  } catch (error) {
    console.error(`❌ Error updating product ${productId}:`, error.message);
  }
}

// Function to get sustainability category and color
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

// Main function to populate all sustainability scores
async function populateAllSustainabilityScores() {
  try {
    console.log('🚀 Starting sustainability score population...\n');
    
    // Get all products that don't have sustainability scores
    const result = await pool.query(
      'SELECT id, name, description FROM products WHERE sustainability_index IS NULL ORDER BY id'
    );
    
    const products = result.rows;
    console.log(`📋 Found ${products.length} products without sustainability scores\n`);
    
    if (products.length === 0) {
      console.log('✅ All products already have sustainability scores!');
      return;
    }
    
    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n[${i + 1}/${products.length}] Processing: ${product.name}`);
      
      // Get sustainability score from Flask API
      const score = await getSustainabilityScore(product.description);
      
      if (score !== null) {
        // Update database
        await updateProductSustainability(product.id, score);
        
        // Show category
        const category = getSustainabilityCategory(score);
        console.log(`${category.emoji} Category: ${category.category} (${score}/10)`);
      } else {
        console.log('⚠️  Skipping due to API error');
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 Sustainability score population completed!');
    
    // Show summary
    await showSummary();
    
  } catch (error) {
    console.error('❌ Error in main function:', error.message);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Function to show summary of results - FIXED VERSION
async function showSummary() {
  try {
    console.log('\n📊 SUSTAINABILITY SCORE SUMMARY:');
    console.log('=' .repeat(50));
    
    const result = await pool.query(`
      SELECT 
        id,
        name,
        sustainability_index,
        CASE 
          WHEN sustainability_index >= 7.5 THEN 'High 🟢'
          WHEN sustainability_index >= 4.5 THEN 'Medium 🟡'
          WHEN sustainability_index < 4.5 THEN 'Low 🔴'
          ELSE 'Unknown ❓'
        END as category
      FROM products 
      ORDER BY sustainability_index DESC NULLS LAST
    `);
    
    result.rows.forEach(product => {
      // FIX: Properly handle the sustainability_index value
      let score = 'N/A';
      if (product.sustainability_index !== null && product.sustainability_index !== undefined) {
        const numericScore = parseFloat(product.sustainability_index);
        if (!isNaN(numericScore)) {
          score = numericScore.toFixed(1);
        }
      }
      console.log(`${product.category.padEnd(12)} | ${score.padEnd(6)} | ${product.name}`);
    });
    
    // Count by category
    const counts = await pool.query(`
      SELECT 
        CASE 
          WHEN sustainability_index >= 7.5 THEN 'High'
          WHEN sustainability_index >= 4.5 THEN 'Medium'
          WHEN sustainability_index < 4.5 THEN 'Low'
          ELSE 'Unknown'
        END as category,
        COUNT(*) as count
      FROM products 
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📈 CATEGORY BREAKDOWN:');
    counts.rows.forEach(row => {
      console.log(`${row.category}: ${row.count} products`);
    });
    
  } catch (error) {
    console.error('Error showing summary:', error.message);
  }
}

// Function to test Flask API connection
async function testFlaskAPI() {
  try {
    console.log('🔍 Testing Flask API connection...');
    
    const testDescription = "LED desk lamp with plastic body";
    const response = await axios.post(`${FLASK_API_URL}/predict`, {
      description: testDescription
    }, {
      timeout: 10000
    });
    
    console.log('✅ Flask API is working!');
    console.log(`Test prediction: ${response.data.sustainability_score}`);
    return true;
  } catch (error) {
    console.error('❌ Flask API test failed:', error.message);
    console.error('Make sure your Flask API is running on:', FLASK_API_URL);
    return false;
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Main execution
async function main() {
  if (command === 'test') {
    await testFlaskAPI();
  } else if (command === 'summary') {
    await showSummary();
    await pool.end();
  } else {
    // Test Flask API first
    const apiWorking = await testFlaskAPI();
    
    if (apiWorking) {
      console.log('\n');
      await populateAllSustainabilityScores();
    } else {
      console.log('\n❌ Cannot proceed without working Flask API');
      console.log('Please start your Flask API first: cd flask-api && python app.py');
      await pool.end();
    }
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});