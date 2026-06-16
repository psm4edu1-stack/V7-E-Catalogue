import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getMockProducts, getMockCategories } from '../../utils/mockData';
import ProductCard from '../../components/ProductCard';
import { ChevronRight, ArrowRight, ShoppingCart, MessageSquare, Heart, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  const { brandSettings } = useTheme();
  const { useMock } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (useMock) {
      setProducts(getMockProducts().filter(p => p.is_active));
      setCategories(getMockCategories());
    } else {
      const loadData = async () => {
        try {
          const [productsRes, categoriesRes] = await Promise.all([
            fetch('http://localhost:5000/api/products'),
            fetch('http://localhost:5000/api/categories')
          ]);
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          setProducts(productsData.filter(p => p.is_active));
          setCategories(categoriesData);
        } catch (err) {
          console.error("Error loading landing page data:", err);
        }
      };
      loadData();
    }
  }, [useMock]);

  // Filter products for scrolls
  const featuredProducts = products.slice(0, 4);
  const specialOffers = products.filter(p => p.special_price && Number(p.special_price) < Number(p.price));

  return (
    <div className="flex flex-col gap-10 pb-16">
      
      {/* Brand Hero Section - Height optimized for logo, name and description only */}
      <header className="glass-panel mx-auto max-w-7xl w-full rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-md border-opacity-40 select-none">
        {brandSettings.brandLogo ? (
          <img
            src={brandSettings.brandLogo}
            alt={brandSettings.brandName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md border-2 border-primary"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-3xl shadow-lg">
            {brandSettings.brandName.charAt(0)}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-center sm:justify-start">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-primary leading-tight">
              {brandSettings.brandName}
            </h1>
            {brandSettings.tagline && (
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] opacity-80 tracking-wide">
                — {brandSettings.tagline}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {brandSettings.brandDescription}
          </p>
        </div>
      </header>

      {/* Category Horizontal Scroll */}
      <section className="mx-auto max-w-7xl w-full px-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)]">
            Explore Categories
          </h2>
          <Link to="/categories" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar snap-x">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="snap-start flex-none w-40 sm:w-48 glass-panel p-4 rounded-xl text-center interactive-hover cursor-pointer border-opacity-30 hover:border-primary/20"
            >
              <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                {cat.name}
              </h3>
              <p className="mt-1 text-[10px] text-[var(--text-tertiary)] line-clamp-1">
                {cat.description || 'Browse products'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Horizontal Scroll */}
      <section className="mx-auto max-w-7xl w-full px-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)]">
            Featured Products
          </h2>
          <Link to="/products" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
            See More <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x">
          {featuredProducts.map((prod) => (
            <div key={prod.id} className="snap-start flex-none w-56 sm:w-64">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </section>

      {/* Special Offer Horizontal Scroll */}
      {specialOffers.length > 0 && (
        <section className="mx-auto max-w-7xl w-full px-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h2 className="font-display font-bold text-base sm:text-lg text-rose-500">
                Special Offers & Promotions
              </h2>
            </div>
            <Link to="/offers" className="text-xs font-semibold text-rose-500 flex items-center gap-1 hover:underline">
              All Offers <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x">
            {specialOffers.map((prod) => (
              <div key={prod.id} className="snap-start flex-none w-56 sm:w-64">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* "How to Order" Section */}
      <section className="glass-panel mx-auto max-w-7xl w-full rounded-2xl p-6 sm:p-8 border-opacity-40">
        <h2 className="font-display font-bold text-base sm:text-lg text-center mb-6 text-[var(--text-primary)]">
          How to Place Your Order
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-110 transition-transform mb-3">
              <ShoppingCart size={20} />
            </div>
            <h3 className="font-display font-bold text-sm text-[var(--text-primary)] mb-1">1. Build Your Cart</h3>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
              Browse our catalogue, select your desired variants, and add them to your cart.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-110 transition-transform mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-display font-bold text-sm text-[var(--text-primary)] mb-1">2. Review & Confirm</h3>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
              Open your shopping cart, verify the items, and click the Checkout button.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-110 transition-transform mb-3">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-display font-bold text-sm text-[var(--text-primary)] mb-1">3. DM to Order</h3>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
              Our checkout compiles a clean text list. Send this summary directly to our DM to finalize payment!
            </p>
          </div>
        </div>

        {/* Custom Instructions */}
        {brandSettings.howToOrder && (
          <div className="mt-6 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] border-dashed text-center">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">Merchant Note</span>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-3xl mx-auto">
              "{brandSettings.howToOrder}"
            </p>
          </div>
        )}
      </section>

    </div>
  );
};

export default LandingPage;
