-- Schema definitions for ecatalogue_db in PostgreSQL

-- Admins table (stores credentials and brand settings configurations)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    brand_logo VARCHAR(500),
    tagline VARCHAR(255),
    description TEXT,
    contact_info JSONB, -- stores {phone: string, instagram: string, email: string}
    how_to_order TEXT,  -- custom order DM/whatsapp directions
    theme_color VARCHAR(50) DEFAULT '#3b82f6',
    font_family VARCHAR(100) DEFAULT 'Outfit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    special_price DECIMAL(10, 2),
    offer_percentage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    availability_status VARCHAR(50) DEFAULT 'in_stock', -- 'in_stock', 'pre_order', 'out_of_stock'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    image_url TEXT
);

-- Product Variants table
CREATE TABLE IF NOT EXISTS variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- e.g. "Size: M", "Carbon Black"
    price DECIMAL(10, 2) NOT NULL,
    special_price DECIMAL(10, 2),
    availability_status VARCHAR(50) DEFAULT 'in_stock'
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product-Category Join table
CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Cart table
CREATE TABLE IF NOT EXISTS carts (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES variants(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS carts_user_product_variant_idx ON carts (user_id, product_id, variant_id) WHERE variant_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS carts_user_product_novariant_idx ON carts (user_id, product_id) WHERE variant_id IS NULL;

-- Likes (Favorites) table
CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, product_id)
);

-- Product Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    viral_clicks INTEGER DEFAULT 0
);
