import React, { useState, useEffect } from 'react';
import { getMockAnalytics } from '../../utils/mockData';
import { BarChart3, Eye, Heart, ShoppingBag, Flame, TrendingUp } from 'lucide-react';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    setAnalytics(getMockAnalytics());
  }, []);

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-display font-extrabold text-lg text-[var(--text-primary)]">Storefront Performance Analytics</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Observe catalog interaction, bookmarking counts, and product viral indices.</p>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        
        <div className="glass-panel p-5 rounded-2xl border-opacity-30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <Eye size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Total Views</span>
            <span className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-0.5 block">{analytics.views.toLocaleString()}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-opacity-30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <Heart size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Favorites</span>
            <span className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-0.5 block">{analytics.likes} bookmarks</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-opacity-30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Compiled Sales</span>
            <span className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-0.5 block">{analytics.sales} conversions</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-opacity-30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Flame size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Viral Index</span>
            <span className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-0.5 block">{analytics.virality}% Score</span>
          </div>
        </div>

      </div>

      {/* Main Stats table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
          <TrendingUp size={16} className="text-primary" />
          <h2 className="font-display font-bold text-sm text-[var(--text-primary)]">Product-by-Product breakdown</h2>
        </div>

        <div className="glass-panel rounded-2xl border-opacity-40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-bold">
                  <th className="p-4">Catalogue Item</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Bookmarks (Likes)</th>
                  <th className="p-4">Compiled Sales</th>
                  <th className="p-4">Viral Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {analytics.productStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="p-4 font-bold text-[var(--text-primary)]">{stat.name}</td>
                    <td className="p-4 font-semibold text-[var(--text-secondary)]">{stat.views.toLocaleString()}</td>
                    <td className="p-4 font-semibold text-rose-500 font-bold">{stat.likes}</td>
                    <td className="p-4 font-semibold text-emerald-500 font-bold">{stat.sales}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Custom visual progress bar for virality */}
                        <div className="w-24 bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full" 
                            style={{ width: `${stat.virality}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-[10px] text-[var(--text-secondary)]">{stat.virality}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
