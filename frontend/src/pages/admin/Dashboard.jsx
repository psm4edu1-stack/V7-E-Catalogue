import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMockProducts, getMockCategories, getMockAnalytics } from '../../utils/mockData';
import { ShoppingBag, FolderOpen, Tag, Settings, BarChart3, ArrowRight, Eye, Heart, BarChart4 } from 'lucide-react';

const Dashboard = () => {
  const { admin } = useAuth();
  
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    activeOffersCount: 0,
    totalViews: 0
  });

  useEffect(() => {
    const products = getMockProducts();
    const categories = getMockCategories();
    const analytics = getMockAnalytics();

    const activeOffers = products.filter(
      p => p.is_active && p.special_price && Number(p.special_price) < Number(p.price)
    ).length;

    setStats({
      productsCount: products.length,
      categoriesCount: categories.length,
      activeOffersCount: activeOffers,
      totalViews: analytics.views || 0
    });
  }, []);

  const cards = [
    {
      title: 'Product Management',
      description: 'Add new items, manage variants, upload images, adjust details and configure pricing models.',
      icon: <ShoppingBag size={24} className="text-blue-500" />,
      color: 'border-blue-500/10 hover:border-blue-500/30',
      link: '/admin/products'
    },
    {
      title: 'Category Management',
      description: 'Define product departments dynamically. Bulk-assign or map products under navigation hierarchies.',
      icon: <FolderOpen size={24} className="text-emerald-500" />,
      color: 'border-emerald-500/10 hover:border-emerald-500/30',
      link: '/admin/categories'
    },
    {
      title: 'Offer Management',
      description: 'Activate special prices, discount percentages, and promotional headers for featured lists.',
      icon: <Tag size={24} className="text-rose-500" />,
      color: 'border-rose-500/10 hover:border-rose-500/30',
      link: '/admin/offers'
    },
    {
      title: 'Brand Settings',
      description: 'Personalize colors, fonts, logo images, checkout directions, contact numbers and storefront meta.',
      icon: <Settings size={24} className="text-amber-500" />,
      color: 'border-amber-500/10 hover:border-amber-500/30',
      link: '/admin/settings'
    },
    {
      title: 'Sales Analytics',
      description: 'Examine catalog views, user bookmarks, click-through counters, and product viral index metrics.',
      icon: <BarChart3 size={24} className="text-indigo-500" />,
      color: 'border-indigo-500/10 hover:border-indigo-500/30',
      link: '/admin/analytics'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Greetings block */}
      <div className="glass-panel p-6 rounded-3xl border-opacity-40 select-none">
        <h1 className="font-display font-extrabold text-xl text-[var(--text-primary)]">
          Welcome to Your Store Dashboard
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Review, expand, and personalize your digital customer catalog experience.
        </p>
      </div>

      {/* Snapshots row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border-opacity-30">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Total Products</span>
          <span className="text-lg font-black text-primary mt-1 block">{stats.productsCount} items</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-opacity-30">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Categories</span>
          <span className="text-lg font-black text-emerald-500 mt-1 block">{stats.categoriesCount} lists</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-opacity-30">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Active Promotions</span>
          <span className="text-lg font-black text-rose-500 mt-1 block">{stats.activeOffersCount} offers</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-opacity-30">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Catalogue Views</span>
          <span className="text-lg font-black text-indigo-500 mt-1 block">{stats.totalViews.toLocaleString()} views</span>
        </div>

      </div>

      {/* Admin Modules Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
          Management Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className={`glass-panel p-5 rounded-2xl flex flex-col gap-3 interactive-hover border ${card.color}`}
            >
              <div className="flex justify-between items-center">
                {card.icon}
                <ArrowRight size={14} className="text-[var(--text-tertiary)] group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                  {card.title}
                </h3>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
