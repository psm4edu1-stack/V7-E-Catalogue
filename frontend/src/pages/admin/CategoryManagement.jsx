import React, { useState, useEffect } from 'react';
import { getMockCategories, saveMockCategories, getMockProducts, saveMockProducts } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Check, FolderOpen, ArrowRight, FolderKanban } from 'lucide-react';

const CategoryManagement = () => {
  const { useMock } = useAuth();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Selected category for assigning products
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // New category inputs
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Bulk Product selection States
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkChecked, setBulkChecked] = useState([]);

  const fetchCategories = async () => {
    if (useMock) {
      setCategories(getMockCategories());
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
  };

  const fetchProducts = async () => {
    if (useMock) {
      setProducts(getMockProducts());
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [useMock]);

  useEffect(() => {
    if (selectedCategory) {
      // Find all products currently in this category
      const currentProducts = products
        .filter(p => p.categories?.some(c => c.id === selectedCategory.id) || p.category === selectedCategory.name)
        .map(p => p.id);
      setBulkChecked(currentProducts);
    } else {
      setBulkChecked([]);
    }
  }, [selectedCategory, products]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    if (useMock) {
      const newCat = {
        id: Date.now(),
        name: newCatName,
        description: newCatDesc
      };
      const updated = [...categories, newCat];
      setCategories(updated);
      saveMockCategories(updated);
    } else {
      try {
        const res = await fetch('http://localhost:5000/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ name: newCatName, description: newCatDesc })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to create category");
        }
        fetchCategories();
      } catch (err) {
        alert(err.message);
      }
    }
    
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete "${cat.name}"? Products in this category will be reset to General.`)) return;

    if (useMock) {
      const updatedCats = categories.filter(c => c.id !== cat.id);
      setCategories(updatedCats);
      saveMockCategories(updatedCats);

      // Update products mapping to 'General' or next category
      const updatedProducts = products.map((p) => {
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
      setProducts(updatedProducts);
      saveMockProducts(updatedProducts);
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/categories/${cat.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to delete category");
        }
        fetchCategories();
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }

    if (selectedCategory?.id === cat.id) {
      setSelectedCategory(null);
    }
  };

  const handleToggleProductChecked = (prodId) => {
    setBulkChecked((prev) => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSaveBulkMapping = async () => {
    if (!selectedCategory) return;

    if (useMock) {
      // Map checked products to selectedCategory, and unmapped ones away from it if they were previously in it
      const updatedProducts = products.map((p) => {
        const shouldBeInCat = bulkChecked.includes(p.id);
        let newCats = p.categories ? [...p.categories] : [];
        const hasCat = newCats.some(c => c.id === selectedCategory.id);

        if (shouldBeInCat && !hasCat) {
          newCats.push({ id: selectedCategory.id, name: selectedCategory.name });
        } else if (!shouldBeInCat && hasCat) {
          newCats = newCats.filter(c => c.id !== selectedCategory.id);
        }

        if (newCats.length === 0) {
          newCats.push({ id: 999, name: 'General' });
        }

        return {
          ...p,
          categories: newCats,
          category: newCats[0].name
        };
      });

      setProducts(updatedProducts);
      saveMockProducts(updatedProducts);
      alert(`Products successfully mapped to "${selectedCategory.name}"!`);
    } else {
      try {
        const promises = products.map(p => {
          const shouldBeInCat = bulkChecked.includes(p.id);
          const hasCat = p.categories?.some(c => c.id === selectedCategory.id) || p.category === selectedCategory.name;

          if (shouldBeInCat && !hasCat) {
            const currentCatIds = p.categories ? p.categories.map(c => c.id) : [];
            const newCatIds = [...currentCatIds, selectedCategory.id];
            return fetch(`http://localhost:5000/api/products/${p.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                name: p.name, description: p.description, price: p.price,
                special_price: p.special_price, offer_percentage: p.offer_percentage,
                image_url: p.image_url, availability_status: p.availability_status,
                categoryIds: newCatIds, variants: p.variants, is_active: p.is_active
              })
            });
          } else if (!shouldBeInCat && hasCat) {
            const currentCatIds = p.categories ? p.categories.map(c => c.id) : [];
            const newCatIds = currentCatIds.filter(id => id !== selectedCategory.id);
            return fetch(`http://localhost:5000/api/products/${p.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                name: p.name, description: p.description, price: p.price,
                special_price: p.special_price, offer_percentage: p.offer_percentage,
                image_url: p.image_url, availability_status: p.availability_status,
                categoryIds: newCatIds, variants: p.variants, is_active: p.is_active
              })
            });
          }
          return null;
        }).filter(Boolean);

        if (promises.length > 0) {
          const results = await Promise.all(promises);
          const failed = results.find(r => !r.ok);
          if (failed) throw new Error("Failed to map some products.");
        }
        fetchProducts();
        alert(`Products successfully mapped to "${selectedCategory.name}"!`);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Filtered products listed for mapping selection
  const filteredProducts = products.filter(p => {
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.categories?.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
             p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-display font-extrabold text-lg text-[var(--text-primary)]">Category Mapping & Management</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Organize items into departments, and perform bulk-assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Categories CRUD (Columns: 5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Create category Form */}
          <form onSubmit={handleCreateCategory} className="glass-panel p-4 rounded-2xl border-opacity-40 flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Plus size={12} /> Add New Category
            </span>
            <div className="flex flex-col gap-1">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name (e.g. Acoustics)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Short description..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Publish Category
            </button>
          </form>

          {/* Categories List */}
          <div className="glass-panel p-4 rounded-2xl border-opacity-40 flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Available Categories</span>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-primary/30'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-[var(--text-primary)] truncate">{cat.name}</span>
                      <span className="text-[9px] text-[var(--text-tertiary)] line-clamp-1">{cat.description || 'Browse products'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={12} />
                      </button>
                      <ArrowRight size={12} className="text-[var(--text-tertiary)]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bulk Products Mappings (Columns: 7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {selectedCategory ? (
            <div className="glass-panel p-5 rounded-3xl border-opacity-40 flex flex-col gap-4 animate-fadeIn">
              
              <div className="border-b border-[var(--border-color)] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">
                    Map Products: <span className="text-primary">{selectedCategory.name}</span>
                  </h3>
                  <p className="text-[10px] text-[var(--text-secondary)]">Check products you want to assign to this category, then save.</p>
                </div>
                <button
                  onClick={handleSaveBulkMapping}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1"
                >
                  <Check size={12} /> Save Mapping
                </button>
              </div>

              {/* Search filter inside mapping */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter product list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Products list with checkboxes */}
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {filteredProducts.map((prod) => {
                  const isChecked = bulkChecked.includes(prod.id);
                  return (
                    <label
                      key={prod.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-primary/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleProductChecked(prod.id)}
                        className="rounded border-[var(--border-color)] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <img 
                        src={prod.image_url} 
                        alt={prod.name} 
                        className="w-8 h-8 rounded-lg object-cover border border-[var(--border-color)]"
                      />
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="font-bold text-xs text-[var(--text-primary)] truncate">{prod.name}</span>
                        <span className="text-[9px] text-[var(--text-tertiary)] truncate">
                          Currently in: <span className="font-semibold text-primary">
                            {prod.categories && prod.categories.length > 0 
                              ? prod.categories.map(c => c.name).join(', ') 
                              : (prod.category || 'General')}
                          </span>
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl border-dashed">
              <FolderKanban size={40} className="text-[var(--text-tertiary)] mb-3" />
              <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">Select a Category</h3>
              <p className="text-xs text-[var(--text-secondary)] text-center max-w-xs mt-1 leading-relaxed">
                Click on one of the categories on the left side to load products and modify their assignments.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CategoryManagement;
