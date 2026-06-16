import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import { getMockProducts } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { Percent, Sparkles } from 'lucide-react';

const SpecialOffersPage = () => {
  // useState must be declared before useEffect
  const [products, setProducts] = useState([]);
  const { useMock } = useAuth();

  useEffect(() => {
    if (useMock) {
      const offers = getMockProducts().filter(
        (p) => p.is_active && p.special_price && Number(p.special_price) < Number(p.price)
      );
      setProducts(offers);
    } else {
      fetch('http://localhost:5000/api/products')
        .then((res) => res.json())
        .then((data) => {
          const offers = data.filter(
            (p) => p.is_active && p.special_price && Number(p.special_price) < Number(p.price)
          );
          setProducts(offers);
        })
        .catch((err) => console.error('Error loading offers:', err));
    }
  }, [useMock]);

  return (
    <div className="mx-auto max-w-7xl w-full flex flex-col gap-6 pb-16">
      
      {/* Banner / Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-opacity-40 bg-gradient-to-r from-rose-500/10 to-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles size={10} fill="currentColor" /> Live Promotions
          </span>
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--text-primary)]">
            Exclusive Deals &amp; Special Pricing
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
            Check out our products with limited-time deductions. Claim special prices on variants before stock sells out!
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-md animate-pulse">
          <Percent size={20} />
        </div>
      </div>

      {/* Grid Listings */}
      <div className="flex flex-col gap-6">
        <div className="border-b border-[var(--border-color)] pb-3 flex justify-between items-center">
          <h2 className="font-display font-bold text-sm text-[var(--text-primary)]">Active Promotion Catalog</h2>
          <span className="text-xs text-[var(--text-secondary)] font-medium">{products.length} products on sale</span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl border-dashed">
            <span className="text-2xl mb-2">🏷️</span>
            <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">No Active Offers</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">There are no special pricing promotions running at this second. Check back soon!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SpecialOffersPage;
