export const INITIAL_CATEGORIES = [
  { id: 1, name: 'Sarees', description: 'Elegant handwoven and designer sarees for every occasion.' },
  { id: 2, name: 'Kurtis & Kurtas', description: 'Trendy kurtis and kurtas for daily wear and festive occasions.' },
  { id: 3, name: 'Lehengas', description: 'Bridal and festive lehengas with intricate embroidery.' },
  { id: 4, name: 'Gowns & Dresses', description: 'Designer gowns and western dresses for special occasions.' },
];

export const INITIAL_PRODUCTS = [
  {
    id: 101,
    name: 'Banarasi Silk Saree',
    description: 'Luxurious Banarasi silk saree with golden zari border and rich pallu. Perfect for weddings and grand celebrations. Comes with matching blouse piece.',
    image_url: 'https://images.unsplash.com/photo-1610189020272-6fd0a4a77a5b?w=600&q=80',
    price: 4999,
    special_price: 3499,
    offer_percentage: 30,
    is_active: true,
    availability_status: 'in_stock',
    category: 'Sarees',
    likes_count: 142,
    variants: [
      { id: 201, name: 'Royal Red', price: 4999, special_price: 3499, availability_status: 'in_stock' },
      { id: 202, name: 'Deep Maroon', price: 5499, special_price: 3999, availability_status: 'in_stock' },
    ],
  },
  {
    id: 102,
    name: 'Anarkali Kurti Set',
    description: 'Flowy Anarkali kurti with palazzo pants and dupatta. Features elegant floral embroidery on the yoke. Available in multiple colours and sizes.',
    image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',
    price: 1499,
    special_price: null,
    offer_percentage: 0,
    is_active: true,
    availability_status: 'in_stock',
    category: 'Kurtis & Kurtas',
    likes_count: 89,
    variants: [
      { id: 203, name: 'S / Powder Blue', price: 1499, special_price: null, availability_status: 'in_stock' },
      { id: 204, name: 'M / Powder Blue', price: 1499, special_price: null, availability_status: 'in_stock' },
      { id: 205, name: 'L / Powder Blue', price: 1499, special_price: null, availability_status: 'in_stock' },
    ],
  },
  {
    id: 103,
    name: 'Bridal Lehenga Choli',
    description: 'Opulent bridal lehenga with heavy embroidered choli and net dupatta. Adorned with zardozi work and mirror embellishments. A dream for the perfect wedding day.',
    image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80',
    price: 14999,
    special_price: 11999,
    offer_percentage: 20,
    is_active: true,
    availability_status: 'in_stock',
    category: 'Lehengas',
    likes_count: 214,
    variants: [
      { id: 206, name: 'Peach Gold', price: 14999, special_price: 11999, availability_status: 'in_stock' },
      { id: 207, name: 'Red Silver', price: 16999, special_price: 13499, availability_status: 'in_stock' },
    ],
  },
  {
    id: 104,
    name: 'Printed Cotton Kurti',
    description: 'Breezy printed cotton kurti perfect for daily wear and casual outings. Made from 100% pure cotton with block print design. Easy wash and wear.',
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=600&q=80',
    price: 799,
    special_price: null,
    offer_percentage: 0,
    is_active: true,
    availability_status: 'in_stock',
    category: 'Kurtis & Kurtas',
    likes_count: 67,
    variants: [],
  },
  {
    id: 105,
    name: 'Designer Evening Gown',
    description: 'Elegant floor-length designer gown with sequin embellishment on the bodice. Features a sweetheart neckline and a flowing A-line silhouette. Ideal for parties and receptions.',
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
    price: 5999,
    special_price: 4299,
    offer_percentage: 28,
    is_active: true,
    availability_status: 'in_stock',
    category: 'Gowns & Dresses',
    likes_count: 156,
    variants: [
      { id: 208, name: 'Midnight Blue / S', price: 5999, special_price: 4299, availability_status: 'in_stock' },
      { id: 209, name: 'Midnight Blue / M', price: 5999, special_price: 4299, availability_status: 'in_stock' },
      { id: 210, name: 'Midnight Blue / L', price: 5999, special_price: 4299, availability_status: 'in_stock' },
    ],
  },
  {
    id: 106,
    name: 'Chanderi Silk Saree',
    description: 'Lightweight Chanderi silk saree with delicate woven motifs and sheer drape. Perfect for office wear and daytime functions. Comes stitched blouse ready.',
    image_url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
    price: 2999,
    special_price: null,
    offer_percentage: 0,
    is_active: true,
    availability_status: 'pre_order',
    category: 'Sarees',
    likes_count: 45,
    variants: [],
  },
];

export const INITIAL_ANALYTICS = {
  views: 12450,
  likes: 713,
  sales: 348,
  virality: 84, // out of 100
  productStats: [
    { id: 101, name: 'Banarasi Silk Saree', views: 3200, likes: 142, sales: 85, virality: 92 },
    { id: 102, name: 'Anarkali Kurti Set', views: 1800, likes: 89, sales: 54, virality: 75 },
    { id: 103, name: 'Bridal Lehenga Choli', views: 4100, likes: 214, sales: 120, virality: 95 },
    { id: 104, name: 'Printed Cotton Kurti', views: 950, likes: 67, sales: 24, virality: 50 },
    { id: 105, name: 'Designer Evening Gown', views: 2400, likes: 156, sales: 65, virality: 88 },
  ],
};

// Increment this version whenever the seed data is updated (e.g. USD→INR migration).
// On version mismatch, stale localStorage data is cleared and re-seeded.
const DATA_VERSION = 'v2-inr';

export const initializeMockDatabase = () => {
  if (localStorage.getItem('data_version') !== DATA_VERSION) {
    // Clear stale data from previous versions
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
    localStorage.removeItem('analytics');
    localStorage.setItem('data_version', DATA_VERSION);
  }
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem('analytics')) {
    localStorage.setItem('analytics', JSON.stringify(INITIAL_ANALYTICS));
  }
};

export const getMockProducts = () => {
  initializeMockDatabase();
  return JSON.parse(localStorage.getItem('products'));
};

export const saveMockProducts = (products) => {
  localStorage.setItem('products', JSON.stringify(products));
};

export const getMockCategories = () => {
  initializeMockDatabase();
  return JSON.parse(localStorage.getItem('categories'));
};

export const saveMockCategories = (categories) => {
  localStorage.setItem('categories', JSON.stringify(categories));
};

export const getMockAnalytics = () => {
  initializeMockDatabase();
  return JSON.parse(localStorage.getItem('analytics'));
};

export const saveMockAnalytics = (analytics) => {
  localStorage.setItem('analytics', JSON.stringify(analytics));
};
