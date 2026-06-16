import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarFilter from '../../components/SidebarFilter';
import ProductCard from '../../components/ProductCard';
import { getMockProducts, getMockCategories } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';

const AllProductsPage = () => {
  const location = useLocation();
  const { useMock } = useAuth();
  
  // Extract query parameters if any (e.g. ?category=Electronics)
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variantsList, setVariantsList] = useState([]);

  // Dynamically compute the highest product price from fetched data
  const highestPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(
      ...products.map(
        p => Number(p.special_price || p.price || 0)
      )
    );
  }, [products]);

  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'recent',
    categories: initialCategory ? [initialCategory] : [],
    maxPrice: 0,  // Will be set dynamically once products load
    variants: [],
    onlyOffers: false,
    inStockOnly: false
  });

  // Track whether filters have been initialized with real product data
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Once products are loaded and highestPrice is computed, set initial maxPrice
  useEffect(() => {
    if (highestPrice > 0 && !filtersInitialized) {
      setFilters(prev => ({ ...prev, maxPrice: highestPrice }));
      setFiltersInitialized(true);
    }
  }, [highestPrice, filtersInitialized]);

  useEffect(() => {
    if (useMock) {
      const allProducts = getMockProducts().filter(p => p.is_active);
      setProducts(allProducts);

      const allCategories = getMockCategories().map(c => c.name);
      setCategories(allCategories);

      // Dynamic extraction of unique variants
      const allVariants = new Set();
      allProducts.forEach(p => {
        p.variants?.forEach(v => {
          // extract descriptor (e.g., "Carbon Black" -> "Black" or use name directly)
          const parts = v.name.split(':');
          const cleanName = parts.length > 1 ? parts[1].trim() : v.name;
          allVariants.add(cleanName);
        });
      });
      setVariantsList(Array.from(allVariants));
    } else {
      const loadData = async () => {
        try {
          const [productsRes, categoriesRes] = await Promise.all([
            fetch('http://localhost:5000/api/products'),
            fetch('http://localhost:5000/api/categories')
          ]);
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          
          const allProducts = productsData.filter(p => p.is_active);
          setProducts(allProducts);

          const allCategories = categoriesData.map(c => c.name);
          setCategories(allCategories);

          // Dynamic extraction of unique variants
          const allVariants = new Set();
          allProducts.forEach(p => {
            p.variants?.forEach(v => {
              const parts = v.name.split(':');
              const cleanName = parts.length > 1 ? parts[1].trim() : v.name;
              allVariants.add(cleanName);
            });
          });
          setVariantsList(Array.from(allVariants));
        } catch (err) {
          console.error("Error loading products page data:", err);
        }
      };
      loadData();
    }
  }, [useMock]);

  // Update categories filter if URL parameter changes
  useEffect(() => {
    if (initialCategory) {
      setFilters(prev => ({
        ...prev,
        categories: [initialCategory]
      }));
    }
  }, [initialCategory]);

  const resetFilters = () => {
    setFilters({
      search: '',
      sortBy: 'recent',
      categories: [],
      maxPrice: highestPrice,  // Reset to dynamic highest price, not a hardcoded value
      variants: [],
      onlyOffers: false,
      inStockOnly: false
    });
  };

  // Perform client side filtration
  const filteredProducts = products.filter((prod) => {
    // 1. Search Query
    if (
      filters.search &&
      !prod.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !(prod.description || '').toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    // 2. Categories
    if (filters.categories.length > 0 && !filters.categories.includes(prod.category)) {
      return false;
    }
    // 3. Max Price — use Number() to avoid string vs number comparison bugs
    const basePrice = Number(prod.special_price || prod.price || 0);
    if (filters.maxPrice > 0 && basePrice > Number(filters.maxPrice)) {
      return false;
    }
    // 4. Special Offers Only
    if (filters.onlyOffers && (!prod.special_price || Number(prod.special_price) >= Number(prod.price))) {
      return false;
    }
    // 5. In Stock Only
    if (filters.inStockOnly && prod.availability_status === 'out_of_stock') {
      return false;
    }
    // 6. Variants
    if (filters.variants.length > 0) {
      const productHasMatchingVariant = prod.variants?.some(v => 
        filters.variants.some(fv => v.name.toLowerCase().includes(fv.toLowerCase()))
      );
      if (!productHasMatchingVariant) return false;
    }

    return true;
  }).sort((a, b) => {
    const priceA = Number(a.special_price || a.price || 0);
    const priceB = Number(b.special_price || b.price || 0);

    if (filters.sortBy === 'price_asc') return priceA - priceB;
    if (filters.sortBy === 'price_desc') return priceB - priceA;
    if (filters.sortBy === 'alpha_asc') return a.name.localeCompare(b.name);
    if (filters.sortBy === 'alpha_desc') return b.name.localeCompare(a.name);
    
    // Default 'recent': product ID order reversed
    return b.id - a.id;
  });

  return (
    <div className="mx-auto max-w-7xl w-full flex flex-col lg:flex-row gap-8 pb-16">
      
      {/* Sidebar Filters */}
      <SidebarFilter 
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        variants={variantsList}
        resetFilters={resetFilters}
        highestPrice={highestPrice}
      />

      {/* Product Listings Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <h1 className="font-display font-extrabold text-xl text-[var(--text-primary)]">
            {initialCategory ? `Browse ${initialCategory}` : 'All Products'}
          </h1>
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            Showing {filteredProducts.length} results
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl border-dashed">
            <span className="text-2xl mb-2">🔍</span>
            <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">No products found</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Try resetting the filters or modifying search criteria.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AllProductsPage;
