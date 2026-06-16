import React, { useState, useEffect } from 'react';
import { useLikes } from '../../context/LikesContext';
import { getMockProducts } from '../../utils/mockData';
import ProductCard from '../../components/ProductCard';
import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const LikedProductsPage = () => {
  const { likes } = useLikes();
  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    const allProducts = getMockProducts();
    const filtered = allProducts.filter(p => likes.includes(p.id) && p.is_active);
    setLikedProducts(filtered);
  }, [likes]);

  return (
    <div className="mx-auto max-w-7xl w-full flex flex-col gap-6 pb-16">
      
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-xl text-[var(--text-primary)] flex items-center gap-2">
            <Heart size={20} className="text-rose-500" fill="currentColor" />
            My Bookmarked Products
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Your catalog bookmarks in one location.</p>
        </div>
        <span className="text-xs text-[var(--text-secondary)] font-semibold px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)]">
          {likedProducts.length} bookmarks
        </span>
      </div>

      {/* Grid Listings */}
      {likedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {likedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl border-dashed">
          <Heart size={40} className="text-[var(--text-tertiary)] mb-3 animate-pulse" />
          <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">Your list is empty</h3>
          <p className="text-xs text-[var(--text-secondary)] text-center max-w-xs mt-1 leading-relaxed">
            Start browsing the catalogue and tap the heart icon on any card to save products you love!
          </p>
          <Link
            to="/products"
            className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles size={12} fill="currentColor" />
            Browse Catalogue
          </Link>
        </div>
      )}

    </div>
  );
};

export default LikedProductsPage;
