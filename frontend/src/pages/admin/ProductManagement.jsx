import React, { useState, useEffect } from 'react';
import { getMockProducts, saveMockProducts, getMockCategories } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/currency';
import { Plus, Edit2, Trash2, X, Percent, Check, PlusCircle, AlertCircle } from 'lucide-react';

const ProductManagement = () => {
  const { useMock } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Form States
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [availability, setAvailability] = useState('in_stock');
  const [isActive, setIsActive] = useState(true);
  
  // Variants Subform
  const [variants, setVariants] = useState([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [newVarSpecPrice, setNewVarSpecPrice] = useState('');

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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [useMock]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setSpecialPrice('');
    setImageUrl('');
    setSelectedCategoryIds(categories.length > 0 ? [categories[0].id] : []);
    setAvailability('in_stock');
    setIsActive(true);
    setVariants([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description || '');
    setPrice(prod.price);
    setSpecialPrice(prod.special_price || '');
    setImageUrl(prod.image_url || '');
    
    const prodCatIds = prod.categories ? prod.categories.map(c => c.id) : [];
    if (prodCatIds.length === 0 && prod.category) {
      const found = categories.find(c => c.name === prod.category);
      if (found) prodCatIds.push(found.id);
    }
    setSelectedCategoryIds(prodCatIds);

    setAvailability(prod.availability_status || 'in_stock');
    setIsActive(prod.is_active !== false);
    setVariants(prod.variants ? [...prod.variants] : []);
    setIsFormOpen(true);
  };

  const handleCategoryToggle = (id) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddVariant = () => {
    if (!newVarName || !newVarPrice) return;
    const newVar = {
      id: Date.now() + Math.random(),
      name: newVarName,
      price: Number(newVarPrice),
      special_price: newVarSpecPrice ? Number(newVarSpecPrice) : null,
      availability_status: 'in_stock'
    };
    setVariants(prev => [...prev, newVar]);
    setNewVarName('');
    setNewVarPrice('');
    setNewVarSpecPrice('');
  };

  const handleRemoveVariant = (id) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    if (useMock) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      saveMockProducts(updated);
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to delete product");
        }
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  setUploading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    
    const data = await response.json();

    if (data.imageUrl) {
      setImageUrl(data.imageUrl);
    }
  } catch (error) {
    console.error("Upload Error:", error);
    alert("Image upload failed");
  }

  setUploading(false);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const selectedCategories = categories.filter((c) =>
    selectedCategoryIds.includes(c.id)
  );

  const productData = {
    name,
    description,
    price: Number(price),
    special_price: specialPrice
      ? Number(specialPrice)
      : null,
    image_url: imageUrl,
    availability_status: availability,
    is_active: isActive,
    categories: selectedCategories,
    variants,
  };

  try {
    if (useMock) {
      let updatedProducts;

      if (editingProduct) {
        updatedProducts = products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...editingProduct,
                ...productData,
              }
            : p
        );
      } else {
        const newProduct = {
          id: Date.now(),
          ...productData,
        };

        updatedProducts = [
          ...products,
          newProduct,
        ];
      }

      setProducts(updatedProducts);
      saveMockProducts(updatedProducts);
    } else {
      alert(
        "Backend save not configured yet."
      );
    }

    setIsFormOpen(false);
  } catch (err) {
    console.error(err);
    alert("Error saving product");
  }
};

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="font-display font-extrabold text-lg text-[var(--text-primary)]">Product Inventory Manager</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Control items in database, specify custom variants and discounts.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <Plus size={14} /> Create Product
        </button>
      </div>

      {/* Product list */}
      {!isFormOpen ? (
        <div className="glass-panel rounded-2xl border-opacity-40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-bold">
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Promo</th>
                  <th className="p-4">Variants</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img 
                        src={prod.image_url} 
                        alt={prod.name} 
                        className="w-10 h-10 rounded-lg object-cover bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[var(--text-primary)] truncate">{prod.name}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] line-clamp-1 max-w-xs">{prod.description}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[var(--text-secondary)]">
                      {prod.categories && prod.categories.length > 0
                        ? prod.categories.map(c => c.name).join(', ')
                        : (prod.category || 'General')}
                    </td>
                    <td className="p-4 font-bold text-[var(--text-primary)]">
                      {prod.special_price ? (
                        <div className="flex flex-col">
                          <span className="text-primary">{formatPrice(prod.special_price)}</span>
                          <span className="text-[9px] text-[var(--text-tertiary)] line-through">{formatPrice(prod.price)}</span>
                        </div>
                      ) : (
                        <span>{formatPrice(prod.price)}</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-[var(--text-secondary)]">
                      {prod.variants?.length > 0 ? `${prod.variants.length} options` : 'None'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        prod.availability_status === 'in_stock' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : prod.availability_status === 'pre_order' 
                            ? 'bg-amber-500/10 text-amber-500' 
                            : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {prod.availability_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form view */
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border-opacity-40 flex flex-col gap-6 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="font-display font-extrabold text-sm text-[var(--text-primary)]">
              {editingProduct ? `Modify: ${editingProduct.name}` : 'New Catalogue Item'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Left Inputs */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Leather Bag"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize product specifications..."
                  rows="4"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Base Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 999"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Offer / Promo Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={specialPrice}
                    onChange={(e) => setSpecialPrice(e.target.value)}
                    placeholder="e.g. 799"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Right Inputs */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
  Product Image
</label>

<input
  type="file"
  accept="image/*"
  multiple
  onChange={handleImageUpload}
  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
/>

{uploading && (
  <p className="text-xs text-primary mt-2">
    Uploading image...
  </p>
)}

{imageUrl && (
  <img
    src={imageUrl}
    alt="Preview"
    className="w-32 h-32 object-cover rounded-xl mt-3 border"
  />
)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Categories</label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
                    {categories.map(c => {
                      const isChecked = selectedCategoryIds.includes(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none hover:text-[var(--text-primary)]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(c.id)}
                            className="rounded border-[var(--border-color)] text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                          />
                          {c.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Stock Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="pre_order">Pre-Order</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <label className="flex items-center justify-between text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] select-none mt-2">
                <span className="font-bold uppercase tracking-wider text-[10px]">Activate / Deactivate Product</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={() => setIsActive(!isActive)} 
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-[var(--bg-tertiary)] rounded-full peer peer-focus:ring-1 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </label>

              {/* Dynamic Variants Builder block */}
              <div className="border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-3 mt-1 bg-[var(--bg-tertiary)]/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <PlusCircle size={12} className="text-primary" /> Create Custom Product Variants
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Size: M"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    className="col-span-1 px-2.5 py-1.5 text-[10px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(e.target.value)}
                    className="col-span-1 px-2.5 py-1.5 text-[10px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  />
                  <input
                    type="number"
                    placeholder="Promo (₹)"
                    value={newVarSpecPrice}
                    onChange={(e) => setNewVarSpecPrice(e.target.value)}
                    className="col-span-1 px-2.5 py-1.5 text-[10px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full py-1 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg border border-primary/20 transition-all text-center"
                >
                  Add Variant to Item
                </button>

                {variants.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 max-h-24 overflow-y-auto pr-1">
                    {variants.map((v) => (
                      <div key={v.id} className="flex justify-between items-center bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--border-color)] text-[10px]">
                        <span className="font-bold text-[var(--text-primary)]">{v.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-[var(--text-secondary)]">
                            {v.special_price ? `${formatPrice(v.special_price)} (${formatPrice(v.price)})` : formatPrice(v.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-rose-500 hover:text-rose-600 transition-colors font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border-color)] pt-4 border-dashed mt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <Check size={14} /> {editingProduct ? 'Save Modifications' : 'Publish Product'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default ProductManagement;
