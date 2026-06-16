require('dotenv').config();
console.log(process.env.DB_DATABASE);
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
const { verifyToken, verifyAdmin, JWT_SECRET } = require('./middleware/authMiddleware');
const upload = require('./config/multer');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public files / uploads routing
app.use('/uploads', express.static('uploads'));
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    postgres: db.isConfigured ? 'connected' : 'sandbox_fallback_mode',
    timestamp: new Date()
  });
});

// ==========================================
// SANDBOX FALLBACK DATABASE IN MEMORY
// ==========================================
let sandboxAdmins = [];
let sandboxUsers = [];
let sandboxProducts = [
{
id: 101,
name: 'Bridal Lehenga',
description: 'Premium embroidered bridal lehenga with handcrafted detailing.',
image_url: '/uploads/bridal-lehenga.jpg',
price: 5000,
special_price: 4500,
offer_percentage: 10,
is_active: true,
availability_status: 'in_stock',
category: 'Lehengas',
categories: [{ id: 1, name: 'Lehengas' }],
likes_count: 0,
variants: [
{ id: 201, name: 'Royal Red', price: 5000 },
{ id: 202, name: 'Deep Maroon', price: 5200 }
]
},

{
id: 102,
name: 'Cotton Saree',
description: 'Soft cotton saree suitable for daily and festive wear.',
image_url: '/uploads/cotton-saree.jpg',
price: 2999,
special_price: null,
offer_percentage: 0,
is_active: true,
availability_status: 'in_stock',
category: 'Sarees',
categories: [{ id: 2, name: 'Sarees' }],
likes_count: 0,
variants: []
},

{
id: 103,
name: 'Anarkali Kurti Set',
description: 'Elegant Anarkali kurti set with matching dupatta.',
image_url: '/uploads/anarkali-kurti.jpg',
price: 1499,
special_price: 1299,
offer_percentage: 15,
is_active: true,
availability_status: 'in_stock',
category: 'Kurtis & Kurtas',
categories: [{ id: 3, name: 'Kurtis & Kurtas' }],
likes_count: 0,
variants: []
},

{
id: 104,
name: 'Designer Wedding Gown',
description: 'Luxury designer gown for wedding and reception occasions.',
image_url: '/uploads/designer-gown.jpg',
price: 4299,
special_price: 3999,
offer_percentage: 7,
is_active: true,
availability_status: 'in_stock',
category: 'Gowns & Dresses',
categories: [{ id: 4, name: 'Gowns & Dresses' }],
likes_count: 0,
variants: []
}
];

let sandboxCategories = [
{
id: 1,
name: 'Lehengas',
description: 'Bridal and festive lehengas'
},
{
id: 2,
name: 'Sarees',
description: 'Traditional and designer sarees'
},
{
id: 3,
name: 'Kurtis & Kurtas',
description: 'Daily wear and festive kurtis'
},
{
id: 4,
name: 'Gowns & Dresses',
description: 'Designer gowns and dresses'
}
];

let sandboxCarts = {}; // user_id -> cart array
let sandboxLikes = {}; // user_id -> array of product_ids
let sandboxAnalytics = {
  views: 12450,
  likes: 713,
  sales: 348,
  virality: 84,
  productStats: [
    { id: 101, name: 'Acoustic Pro Headphones', views: 3200, likes: 142, sales: 85, virality: 92 },
    { id: 102, name: 'Smart Ambient Lightbar', views: 1800, likes: 89, sales: 54, virality: 75 }
  ]
};

// ==========================================
// AUTHENTICATION APIs
// ==========================================

// Register Admin (setup brand profile)
app.post('/api/auth/admin/register', async (req, res) => {
  const { email, password, brandName, tagline, description, contactInfo, howToOrder, themeColor, fontFamily, brandLogo } = req.body;

  if (!email || !password || !brandName) {
    return res.status(400).json({ message: 'Email, password, and brand name are required.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (db.isConfigured) {
    try {
      const exists = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
      if (exists.rows.length > 0) return res.status(400).json({ message: 'Admin email already exists.' });

      const result = await db.query(
        `INSERT INTO admins (email, password, brand_name, tagline, description, contact_info, how_to_order, theme_color, font_family, brand_logo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, email, brand_name, tagline, description, contact_info, how_to_order, theme_color, font_family, brand_logo`,
        [email, hashedPassword, brandName, tagline, description, JSON.stringify(contactInfo), howToOrder, themeColor, fontFamily, brandLogo]
      );

      const admin = result.rows[0];
      const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, admin });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Sandbox
    if (sandboxAdmins.find(a => a.email === email)) return res.status(400).json({ message: 'Admin email already exists.' });

    const admin = {
      id: Date.now(),
      email,
      brandName,
      brandLogo: brandLogo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80',
      tagline,
      description,
      contactInfo,
      howToOrder,
      primaryColor: themeColor || '#3b82f6',
      fontFamily: fontFamily || 'Outfit'
    };
    sandboxAdmins.push({ ...admin, password: hashedPassword });

    const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, admin });
  }
});

// Admin Login
app.post('/api/auth/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

  if (db.isConfigured) {
    try {
      const result = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
      if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid admin credentials.' });

      const admin = result.rows[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid admin credentials.' });

      const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      delete admin.password;
      return res.json({ token, admin });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Sandbox
    const admin = sandboxAdmins.find(a => a.email === email);
    if (!admin) return res.status(400).json({ message: 'Invalid admin credentials.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid admin credentials.' });

    const adminSession = { ...admin };
    delete adminSession.password;

    const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, admin: adminSession });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (db.isConfigured) {
    try {
      const exists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (exists.rows.length > 0) return res.status(400).json({ message: 'Email already exists.' });

      const result = await db.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
      );
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Sandbox
    if (sandboxUsers.find(u => u.email === email)) return res.status(400).json({ message: 'Email already exists.' });

    const user = { id: Date.now(), name, email };
    sandboxUsers.push({ ...user, password: hashedPassword });
    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

  if (db.isConfigured) {
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials.' });

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

      const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      delete user.password;
      return res.json({ token, user });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Sandbox
    const user = sandboxUsers.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    const userSession = { ...user };
    delete userSession.password;

    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: userSession });
  }
});

// ==========================================
// PRODUCT INVENTORY ROUTING (CRUD)
// ==========================================

// Get all products
app.get('/api/products', async (req, res) => {
  if (db.isConfigured) {
    try {
      const queryText = `
        SELECT p.*,
               COALESCE(
                 (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
                  FROM categories c
                  INNER JOIN product_categories pc ON c.id = pc.category_id
                  WHERE pc.product_id = p.id),
                 '[]'::json
               ) AS categories,
               COALESCE(
                 (SELECT json_agg(v.*)
                  FROM variants v
                  WHERE v.product_id = p.id),
                 '[]'::json
               ) AS variants
        FROM products p
        ORDER BY p.id DESC
      `;
      const prods = await db.query(queryText);
      const fullProds = prods.rows.map(p => {
        // Add a single category field for backward compatibility with the frontend
        const firstCategoryName = p.categories && p.categories.length > 0 ? p.categories[0].name : 'General';
        return {
          ...p,
          category: firstCategoryName
        };
      });
      return res.json(fullProds);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.json(sandboxProducts);
});

// Create product (Admin)
app.post('/api/products', verifyAdmin, async (req, res) => {
  const { name, description, price, special_price, offer_percentage, image_url, categoryIds, availability_status, variants, is_active } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Name and Price required.' });
  if (db.isConfigured) {
    try {
      const result = await db.query(
        `INSERT INTO products ( name, description, price, special_price, offer_percentage, image_url, availability_status, is_active )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [name, description, price, special_price, offer_percentage, image_url, availability_status, is_active !== false]
      );
      const newProd = result.rows[0];
      if (categoryIds && categoryIds.length > 0) {
        await Promise.all(
          categoryIds.map(categoryId =>
            db.query(
              `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)`,
              [newProd.id, categoryId]
            )
          )
        );
      }
      // Add variants
      if (variants && variants.length > 0) {
        await Promise.all(variants.map(v =>
          db.query(
            'INSERT INTO variants (product_id, name, price, special_price, availability_status) VALUES ($1, $2, $3, $4, $5)',
            [newProd.id, v.name, v.price, v.special_price, v.availability_status || 'in_stock']
          )
        ));
      }

      // Query the newly created product with its full structure (joins) to return to frontend
      const newProdWithDetails = await db.query(
        `SELECT p.*,
                COALESCE(
                  (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
                   FROM categories c
                   INNER JOIN product_categories pc ON c.id = pc.category_id
                   WHERE pc.product_id = p.id),
                  '[]'::json
                ) AS categories,
                COALESCE(
                  (SELECT json_agg(v.*)
                   FROM variants v
                   WHERE v.product_id = p.id),
                  '[]'::json
                ) AS variants
         FROM products p
         WHERE p.id = $1`,
        [newProd.id]
      );
      const finalProd = newProdWithDetails.rows[0];
      const firstCategoryName = finalProd.categories && finalProd.categories.length > 0 ? finalProd.categories[0].name : 'General';
      return res.status(201).json({
        ...finalProd,
        category: firstCategoryName
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Sandbox
    const productCategories = (categoryIds || []).map(catId => {
      const found = sandboxCategories.find(c => c.id === Number(catId));
      return found ? { id: found.id, name: found.name } : null;
    }).filter(Boolean);

    const firstCategoryName = productCategories.length > 0 ? productCategories[0].name : 'General';

    const newProduct = {
      id: Date.now(),
      name,
      description,
      price: Number(price),
      special_price: special_price ? Number(special_price) : null,
      offer_percentage: offer_percentage || 0,
      image_url: image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      categories: productCategories,
      category: firstCategoryName,
      availability_status: availability_status || 'in_stock',
      likes_count: 0,
      variants: variants ? variants.map((v, i) => ({ ...v, id: Date.now() + i })) : []
    };
    sandboxProducts.push(newProduct);
    return res.status(201).json(newProduct);
  }
});

// Update product (Admin)
app.put('/api/products/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, special_price, offer_percentage, image_url, categoryIds, availability_status, variants, is_active } = req.body;

  if (db.isConfigured) {
    try {
      await db.query(
        `UPDATE products SET name = $1, description = $2, price = $3, special_price = $4, offer_percentage = $5, image_url = $6, availability_status = $7, is_active = $8
         WHERE id = $9`,
        [name, description, price, special_price, offer_percentage, image_url, availability_status, is_active !== false, id]
      );

      // Refresh product_categories mappings
      await db.query('DELETE FROM product_categories WHERE product_id = $1', [id]);
      if (categoryIds && categoryIds.length > 0) {
        await Promise.all(
          categoryIds.map(categoryId =>
            db.query(
              `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)`,
              [id, categoryId]
            )
          )
        );
      }

      // Simple sync variants (delete existing and insert new ones)
      await db.query('DELETE FROM variants WHERE product_id = $1', [id]);
      if (variants && variants.length > 0) {
        await Promise.all(variants.map(v =>
          db.query(
            'INSERT INTO variants (product_id, name, price, special_price, availability_status) VALUES ($1, $2, $3, $4, $5)',
            [id, v.name, v.price, v.special_price, v.availability_status || 'in_stock']
          )
        ));
      }

      return res.json({ message: 'Product updated successfully.' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Sandbox
    const productCategories = (categoryIds || []).map(catId => {
      const found = sandboxCategories.find(c => c.id === Number(catId));
      return found ? { id: found.id, name: found.name } : null;
    }).filter(Boolean);

    const firstCategoryName = productCategories.length > 0 ? productCategories[0].name : 'General';

    sandboxProducts = sandboxProducts.map((p) => {
      if (p.id === Number(id)) {
        return {
          ...p,
          name,
          description,
          price: Number(price),
          special_price: special_price ? Number(special_price) : null,
          offer_percentage: offer_percentage || 0,
          image_url,
          categories: productCategories,
          category: firstCategoryName,
          availability_status,
          variants: variants ? variants.map((v, i) => ({ ...v, id: v.id || Date.now() + i })) : []
        };
      }
      return p;
    });
    return res.json({ message: 'Product updated successfully.' });
  }
});

// Delete product
app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  if (db.isConfigured) {
    try {
      await db.query('DELETE FROM products WHERE id = $1', [id]);
      return res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    sandboxProducts = sandboxProducts.filter(p => p.id !== Number(id));
    return res.json({ message: 'Product deleted successfully.' });
  }
});

// ==========================================
// CATEGORIES ROUTING
// ==========================================

// Get categories
app.get('/api/categories', async (req, res) => {
  if (db.isConfigured) {
    try {
      const cats = await db.query('SELECT * FROM categories ORDER BY id ASC');
      return res.json(cats.rows);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.json(sandboxCategories);
  }
});

// Create Category (Admin)
app.post('/api/categories', verifyAdmin, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required.' });

  if (db.isConfigured) {
    try {
      const result = await db.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    const newCat = { id: Date.now(), name, description };
    sandboxCategories.push(newCat);
    return res.status(201).json(newCat);
  }
});

// Delete Category
app.delete('/api/categories/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  if (db.isConfigured) {
    try {
      await db.query('DELETE FROM categories WHERE id = $1', [id]);
      return res.json({ message: 'Category deleted successfully.' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    const cat = sandboxCategories.find(c => c.id === Number(id));
    if (cat) {
      sandboxProducts = sandboxProducts.map(p => {
        const newCats = (p.categories || []).filter(c => c.id !== cat.id);
        if (newCats.length === 0) {
          newCats.push({ id: 999, name: 'General' });
        }
        return {
          ...p,
          categories: newCats,
          category: newCats[0].name
        };
      });
    }
    sandboxCategories = sandboxCategories.filter(c => c.id !== Number(id));
    return res.json({ message: 'Category deleted successfully.' });
  }
});

// ==========================================
// CART & LIKES ROUTING (GUESTS/LOGGED IN)
// ==========================================

// Get User Cart
app.get('/api/cart', verifyToken, async (req, res) => {
  const userId = req.user.id;
  if (db.isConfigured) {
    try {
      const result = await db.query(
        `SELECT c.quantity, p.*,
                (SELECT cat.name FROM categories cat
                 INNER JOIN product_categories pc ON cat.id = pc.category_id
                 WHERE pc.product_id = p.id LIMIT 1) AS category,
                v.id as var_id, v.name as var_name, v.price as var_price, v.special_price as var_spec_price
         FROM carts c
         JOIN products p ON c.product_id = p.id
         LEFT JOIN variants v ON c.variant_id = v.id
         WHERE c.user_id = $1`,
        [userId]
      );
      const parsedCart = result.rows.map((row) => ({
        product: {
          id: row.id,
          name: row.name,
          description: row.description,
          image_url: row.image_url,
          price: row.price,
          special_price: row.special_price,
          availability_status: row.availability_status,
          category: row.category || 'General'
        },
        variant: row.var_id ? {
          id: row.var_id, name: row.var_name, price: row.var_price, special_price: row.var_spec_price
        } : null,
        quantity: row.quantity
      }));
      return res.json(parsedCart);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.json(sandboxCarts[userId] || []);
  }
});

// Sync User Cart
app.post('/api/cart/sync', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { cart } = req.body; // array of { product: {id}, variant: {id} or null, quantity }

  if (db.isConfigured) {
    try {
      // Clear existing user cart items
      await db.query('DELETE FROM carts WHERE user_id = $1', [userId]);

      // Bulk insert
      if (cart && cart.length > 0) {
        await Promise.all(cart.map(item =>
          db.query(
            'INSERT INTO carts (user_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4)',
            [userId, item.product.id, item.variant?.id || null, item.quantity]
          )
        ));
      }
      return res.json({ message: 'Cart synced.' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    sandboxCarts[userId] = cart;
    return res.json({ message: 'Cart synced.' });
  }
});

// Get User Likes
app.get('/api/likes', verifyToken, async (req, res) => {
  const userId = req.user.id;
  if (db.isConfigured) {
    try {
      const result = await db.query('SELECT product_id FROM likes WHERE user_id = $1', [userId]);
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.json((sandboxLikes[userId] || []).map(id => ({ product_id: id })));
  }
});

// Sync User Likes
app.post('/api/likes/sync', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { likes } = req.body; // array of product_ids

  if (db.isConfigured) {
    try {
      await db.query('DELETE FROM likes WHERE user_id = $1', [userId]);
      if (likes && likes.length > 0) {
        await Promise.all(likes.map(prodId =>
          db.query('INSERT INTO likes (user_id, product_id) VALUES ($1, $2)', [userId, prodId])
        ));
      }
      return res.json({ message: 'Likes synced.' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    sandboxLikes[userId] = likes;
    return res.json({ message: 'Likes synced.' });
  }
});

// ==========================================
// ANALYTICS & STATS APIs
// ==========================================
app.get('/api/analytics', verifyAdmin, async (req, res) => {
  if (db.isConfigured) {
    try {
      const viewsSum = await db.query('SELECT SUM(views) as v, SUM(likes) as l, SUM(sales) as s FROM analytics');
      const breakdown = await db.query(
        `SELECT p.id, p.name, COALESCE(a.views, 0) as views, COALESCE(a.likes, 0) as likes, COALESCE(a.sales, 0) as sales, COALESCE(a.viral_clicks, 0) as virality
         FROM products p
         LEFT JOIN analytics a ON p.id = a.product_id`
      );

      const stats = {
        views: Number(viewsSum.rows[0].v || 0),
        likes: Number(viewsSum.rows[0].l || 0),
        sales: Number(viewsSum.rows[0].s || 0),
        virality: 85,
        productStats: breakdown.rows
      };
      return res.json(stats);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Sandbox
    return res.json(sandboxAnalytics);
  }
});

// Boot listening server
app.listen(PORT, () => {
  console.log(`Digital Catalogue Express server running on port: ${PORT}`);
});

app.post('/api/upload', upload.single('image'), (req, res) => {

  res.json({
    imageUrl:
      `http://localhost:5000/uploads/${req.file.filename}`
  });

});