-- ✅ STEP 1: Create products table first
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    sustainability_index DECIMAL(3, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ STEP 2: Create cart_items table (now that products exists)
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    user_session VARCHAR(255) NOT NULL DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ STEP 3: Indexes for cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_session ON cart_items(user_session);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_unique_product_session ON cart_items(product_id, user_session);

-- ✅ STEP 4: Trigger function for cart_items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ✅ STEP 5: Insert sample data (only if products is empty)
INSERT INTO products (name, description, price, image_url, sustainability_index, stock_quantity)
SELECT * FROM (VALUES
    ('Bamboo Water Bottle', 'Eco-friendly bamboo water bottle with steel interior', 24.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 8.5, 50),
    ('Organic Cotton T-Shirt', 'Soft organic cotton t-shirt made from sustainable materials', 29.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 7.8, 30),
    ('Solar Phone Charger', 'Portable solar-powered phone charger for outdoor use', 39.99, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 9.2, 25),
    ('Recycled Paper Notebook', 'Notebook made from 100% recycled paper', 12.99, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 6.5, 100),
    ('Biodegradable Phone Case', 'Compostable phone case made from plant-based materials', 19.99, 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400', 8.0, 40),
    ('Plastic Water Bottle', 'Standard plastic water bottle', 5.99, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 2.1, 200),
    ('LED Desk Lamp', 'Energy-efficient LED desk lamp with adjustable brightness', 45.99, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 5.5, 15),
    ('Reusable Food Wraps', 'Beeswax food wraps as plastic wrap alternative', 16.99, 'https://images.unsplash.com/photo-1543059509-040ba2bccf9e?w=400', 8.8, 75)
) AS v(name, description, price, image_url, sustainability_index, stock_quantity)
WHERE NOT EXISTS (SELECT 1 FROM products);
