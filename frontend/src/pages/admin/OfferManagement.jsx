import React, { useState, useEffect } from 'react';
import { getMockProducts, saveMockProducts } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/currency';
import { Check, Tag, Percent, ArrowRight, Sparkles } from 'lucide-react';

const OfferManagement = () => {
  const { useMock } = useAuth();

  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  
  // Promotion settings
  const [discountPercent, setDiscountPercent] = useState('20');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [categoriesList, setCategoriesList] = useState([]);

  const fetchProducts = async () => {
    if (useMock) {
      const prods = getMockProducts();
      setProducts(prods);
      
      const cats = new Set();
      prods.forEach(p => {
        if (p.categories && p.categories.length > 0) {
          p.categories.forEach(c => cats.add(c.name));
        } else if (p.category) {
          cats.add(p.category);
        }
      });
      setCategoriesList(['All', ...cats]);
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const prods = await res.json();
        setProducts(prods);

        const cats = new Set();
        prods.forEach(p => {
          if (p.categories && p.categories.length > 0) {
            p.categories.forEach(c => cats.add(c.name));
          } else if (p.category) {
            cats.add(p.category);
          }
        });
        setCategoriesList(['All', ...cats]);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [useMock]);

  const handleToggleProductChecked = (id) => {
    setSelectedProductIds((prev) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = (visibleProducts) => {
    const visibleIds = visibleProducts.map(p => p.id);
    const allChecked = visibleIds.every(id => selectedProductIds.includes(id));

    if (allChecked) {
      // Uncheck all visible
      setSelectedProductIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Check all visible
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleApplyPromo = async () => {
    if (selectedProductIds.length === 0) {
      alert("Please select at least one product to apply promotions!");
      return;
    }

    const multiplier = (100 - Number(discountPercent)) / 100;

    if (useMock) {
      const updated = products.map((p) => {
        if (selectedProductIds.includes(p.id)) {
          const specPrice = Math.round(Number(p.price) * multiplier * 100) / 100;
          
          // Also update variants if any
          const updatedVariants = p.variants?.map(v => ({
            ...v,
            special_price: Math.round(Number(v.price) * multiplier * 100) / 100
          })) || [];

          return {
            ...p,
            special_price: specPrice,
            offer_percentage: Number(discountPercent),
            variants: updatedVariants
          };
        }
        return p;
      });

      setProducts(updated);
      saveMockProducts(updated);
      setSelectedProductIds([]);
      alert(`Bulk applied ${discountPercent}% discount to selected products!`);
    } else {
      try {
        const promises = selectedProductIds.map(id => {
          const p = products.find(prod => prod.id === id);
          if (!p) return null;
          const specPrice = Math.round(Number(p.price) * multiplier * 100) / 100;
          const updatedVariants = p.variants?.map(v => ({
            ...v,
            special_price: Math.round(Number(v.price) * multiplier * 100) / 100
          })) || [];
          const currentCatIds = p.categories ? p.categories.map(c => c.id) : [];

          return fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              name: p.name, description: p.description, price: p.price,
              special_price: specPrice, offer_percentage: Number(discountPercent),
              image_url: p.image_url, availability_status: p.availability_status,
              categoryIds: currentCatIds, variants: updatedVariants, is_active: p.is_active
            })
          });
        }).filter(Boolean);

        if (promises.length > 0) {
          const results = await Promise.all(promises);
          const failed = results.find(r => !r.ok);
          if (failed) throw new Error("Failed to apply promotion to some products.");
        }
        fetchProducts();
        setSelectedProductIds([]);
        alert(`Bulk applied ${discountPercent}% discount to selected products!`);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleClearPromo = async () => {
    if (selectedProductIds.length === 0) {
      alert("Please select products to remove active promotions!");
      return;
    }

    if (useMock) {
      const updated = products.map((p) => {
        if (selectedProductIds.includes(p.id)) {
          const updatedVariants = p.variants?.map(v => ({
            ...v,
            special_price: null
          })) || [];

          return {
            ...p,
            special_price: null,
            offer_percentage: 0,
            variants: updatedVariants
          };
        }
        return p;
      });

      setProducts(updated);
      saveMockProducts(updated);
      setSelectedProductIds([]);
      alert("Promotions removed from selected products!");
    } else {
      try {
        const promises = selectedProductIds.map(id => {
          const p = products.find(prod => prod.id === id);
          if (!p) return null;
          const updatedVariants = p.variants?.map(v => ({
            ...v,
            special_price: null
          })) || [];
          const currentCatIds = p.categories ? p.categories.map(c => c.id) : [];

          return fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              name: p.name, description: p.description, price: p.price,
              special_price: null, offer_percentage: 0,
              image_url: p.image_url, availability_status: p.availability_status,
              categoryIds: currentCatIds, variants: updatedVariants, is_active: p.is_active
            })
          });
        }).filter(Boolean);

        if (promises.length > 0) {
          const results = await Promise.all(promises);
          const failed = results.find(r => !r.ok);
          if (failed) throw new Error("Failed to clear promotion on some products.");
        }
        fetchProducts();
        setSelectedProductIds([]);
        alert("Promotions removed from selected products!");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Perform filtration for list
  const visibleProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || 
                       p.categories?.some(c => c.name === categoryFilter) || 
                       p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-display font-extrabold text-lg text-[var(--text-primary)]">Bulk Offer & Campaign Manager</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Apply bulk discounts, offer percentage overrides, or clean active promotions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls (Columns: 4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="glass-panel p-5 rounded-2xl border-opacity-40 flex flex-col gap-4 sticky top-24">
            
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <Tag size={12} /> Bulk Promotion Actions
            </span>

            {/* Percent Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Discount Percentage (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-rose-500 font-bold"
                />
                <Percent size={14} className="absolute left-3 top-3.5 text-[var(--text-tertiary)]" />
              </div>
            </div>

            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-tertiary)]/50 p-3 rounded-lg border border-[var(--border-color)]">
              Select products on the right grid, input a discount rate, then trigger <strong>Apply Discount</strong>. All prices (including variant overrides) will adjust automatically.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleApplyPromo}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Apply {discountPercent}% Discount
              </button>

              <button
                type="button"
                onClick={handleClearPromo}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] text-rose-500 text-xs font-bold rounded-xl transition-all"
              >
                Clear Selected Active Offers
              </button>
            </div>

            <div className="h-[1px] bg-[var(--border-color)] border-dashed my-1"></div>
            
            <div className="flex justify-between items-center text-[10px] font-semibold text-[var(--text-secondary)]">
              <span>Selected Products:</span>
              <span className="font-bold text-rose-500">{selectedProductIds.length} checked</span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Products Selector (Columns: 8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Filtering row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] cursor-pointer"
            >
              {categoriesList.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Grid Selection */}
          <div className="glass-panel p-4 rounded-3xl border-opacity-40 flex flex-col gap-3">
            
            {/* Header select all */}
            <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-color)] border-dashed">
              <button
                type="button"
                onClick={() => handleToggleAll(visibleProducts)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Toggle Selection (Visible)
              </button>
              <span className="text-[10px] text-[var(--text-secondary)]">Showing {visibleProducts.length} items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {visibleProducts.map((prod) => {
                const isChecked = selectedProductIds.includes(prod.id);
                const isPromo = prod.special_price && Number(prod.special_price) < Number(prod.price);
                
                return (
                  <label
                    key={prod.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked 
                        ? 'bg-rose-500/5 border-rose-500/20' 
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-primary/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleProductChecked(prod.id)}
                      className="rounded border-[var(--border-color)] text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <img 
                      src={prod.image_url} 
                      alt={prod.name} 
                      className="w-10 h-10 rounded-lg object-cover border border-[var(--border-color)]"
                    />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="font-bold text-xs text-[var(--text-primary)] truncate">{prod.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold">
                          {formatPrice(prod.special_price || prod.price)}
                        </span>
                        {isPromo && (
                          <span className="inline-flex px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 text-[8px] font-bold uppercase">
                            Active {prod.offer_percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default OfferManagement;
