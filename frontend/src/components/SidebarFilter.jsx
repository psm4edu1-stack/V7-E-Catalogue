import React from 'react';
import { SlidersHorizontal, Search, RefreshCw } from 'lucide-react';

const SidebarFilter = ({ 
  filters, 
  setFilters, 
  categories = [], 
  variants = [],
  resetFilters,
  highestPrice = 1000  // Dynamic ceiling from parent; falls back to 1000 if not provided
}) => {

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryToggle = (categoryName) => {
    setFilters(prev => {
      const active = prev.categories.includes(categoryName)
        ? prev.categories.filter(c => c !== categoryName)
        : [...prev.categories, categoryName];
      return { ...prev, categories: active };
    });
  };

  const handlePriceChange = (e) => {
    setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }));
  };

  const handleVariantToggle = (variantName) => {
    setFilters(prev => {
      const active = prev.variants.includes(variantName)
        ? prev.variants.filter(v => v !== variantName)
        : [...prev.variants, variantName];
      return { ...prev, variants: active };
    });
  };

  const handleToggleOnlyOffers = () => {
    setFilters(prev => ({ ...prev, onlyOffers: !prev.onlyOffers }));
  };

  const handleToggleInStock = () => {
    setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  // Compute the effective slider max — use highestPrice or a sensible fallback
  const sliderMax = highestPrice > 0 ? highestPrice : 1000;

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl h-fit sticky top-24">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary" />
          <h2 className="font-display font-bold text-sm text-[var(--text-primary)]">Filters & Sort</h2>
        </div>
        <button 
          onClick={resetFilters}
          className="text-xs text-[var(--text-tertiary)] hover:text-primary transition-colors flex items-center gap-1.5 font-semibold"
          title="Reset all filters"
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
          />
          <Search size={14} className="absolute left-3 top-3 text-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* Sorting Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="recent">Recently Added</option>
          <option value="alpha_asc">Alphabetical (A - Z)</option>
          <option value="alpha_desc">Alphabetical (Z - A)</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Categories</label>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  className="rounded border-[var(--border-color)] text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                {cat}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Slider — dynamic max from highestPrice */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Max Price</label>
          <span className="text-xs font-bold text-primary">${filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max={sliderMax}
          value={filters.maxPrice}
          onChange={handlePriceChange}
          className="w-full accent-primary bg-[var(--bg-tertiary)] h-1 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
          <span>$0</span>
          <span>${sliderMax}</span>
        </div>
      </div>

      {/* Variants Filter */}
      {variants.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Variants</label>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => {
              const isActive = filters.variants.includes(v);
              return (
                <button
                  key={v}
                  onClick={() => handleVariantToggle(v)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-primary/40'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Filter Switches */}
      <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border-color)] border-dashed">
        {/* Special Offer switch */}
        <label className="flex items-center justify-between text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] select-none">
          <span>Special Offers Only</span>
          <div className="relative">
            <input 
              type="checkbox" 
              checked={filters.onlyOffers} 
              onChange={handleToggleOnlyOffers} 
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-[var(--bg-tertiary)] rounded-full peer peer-focus:ring-1 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>

        {/* Availability Switch */}
        <label className="flex items-center justify-between text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] select-none">
          <span>In Stock Only</span>
          <div className="relative">
            <input 
              type="checkbox" 
              checked={filters.inStockOnly} 
              onChange={handleToggleInStock} 
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-[var(--bg-tertiary)] rounded-full peer peer-focus:ring-1 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>
      </div>
    </aside>
  );
};

export default SidebarFilter;
