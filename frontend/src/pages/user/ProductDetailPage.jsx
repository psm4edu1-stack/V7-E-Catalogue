import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLikes } from '../../context/LikesContext';
import { getMockProducts } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/currency';
import ProductCard from '../../components/ProductCard';
import { Heart, ShoppingCart, ArrowLeft, Percent, PackageOpen, Award } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleLike, isLiked, getLikesCount } = useLikes();
  const { useMock, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    if (useMock) {
      const allProducts = getMockProducts();
      const foundProduct = allProducts.find(p => p.id === Number(id));
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Select first variant by default if variants exist
        if (foundProduct.variants && foundProduct.variants.length > 0) {
          setSelectedVariant(foundProduct.variants[0]);
        } else {
          setSelectedVariant(null);
        }

        // Filter similar products (same category, excluding current product)
        const similar = allProducts.filter(
          p => p.category === foundProduct.category && p.id !== foundProduct.id && p.is_active
        ).slice(0, 3);
        setSimilarProducts(similar);
      } else {
        navigate('/products');
      }
    } else {
      const loadProduct = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/products');
          const allProducts = await res.json();
          const foundProduct = allProducts.find(p => p.id === Number(id));
          
          if (foundProduct) {
            setProduct(foundProduct);
            if (foundProduct.variants && foundProduct.variants.length > 0) {
              setSelectedVariant(foundProduct.variants[0]);
            } else {
              setSelectedVariant(null);
            }

            const similar = allProducts.filter(
              p => p.category === foundProduct.category && p.id !== foundProduct.id && p.is_active
            ).slice(0, 3);
            setSimilarProducts(similar);
          } else {
            navigate('/products');
          }
        } catch (err) {
          console.error("Error loading product detail page:", err);
          navigate('/products');
        }
      };
      loadProduct();
    }
  }, [id, navigate, useMock]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const liked = isLiked(product.id);
  const likesCount = getLikesCount(product);
  
  // Decide current prices based on variant or base product
  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const specPrice = selectedVariant ? selectedVariant.special_price : product.special_price;
  const hasOffer = specPrice && Number(specPrice) < Number(basePrice);
  const currentPrice = hasOffer ? specPrice : basePrice;

  const discountPercentage = product.offer_percentage || (hasOffer 
    ? Math.round(((Number(basePrice) - Number(specPrice)) / Number(basePrice)) * 100)
    : 0);

  const handleAddToCart = () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    addToCart(product, selectedVariant, quantity);
  };

  const handleToggleLike = () => {
    if (!user) {
      alert('Please login to add products to favourites');
      navigate('/login');
      return;
    }
    toggleLike(product.id);
  };

  return (
    <div className="mx-auto max-w-7xl w-full flex flex-col gap-6 pb-16">
      
      {/* Back link */}
      <div>
        <Link 
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-primary transition-colors font-bold"
        >
          <ArrowLeft size={14} />
          Back to Catalogue
        </Link>
      </div>

      {/* Main Splits: Left Details, Right Similar recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT HALF: Product Details & Requirements (Columns: 7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl border-opacity-40 flex flex-col md:flex-row gap-6">
            
            {/* Left Column: Image Area */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-2xl bg-[var(--bg-tertiary)] overflow-hidden border border-[var(--border-color)]">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                
                {hasOffer && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Percent size={10} />
                    {discountPercentage}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Actions & Selectors */}
            <div className="w-full md:w-1/2 flex flex-col">
              
              {/* Category */}
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                {product.category || 'General'}
              </span>

              {/* Title */}
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-[var(--text-primary)] leading-tight mb-2">
                {product.name}
              </h1>

              {/* Likes counter badge */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    liked 
                      ? 'bg-rose-50 border-rose-100 text-rose-500' 
                      : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500'
                  }`}
                >
                  <Heart size={12} fill={liked ? "currentColor" : "none"} />
                  {liked ? 'Favorited' : 'Add to Favorites'}
                </button>
                <span className="text-xs text-[var(--text-tertiary)] font-bold">
                  {likesCount} users liked this
                </span>
              </div>

              {/* Pricing Display */}
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] mb-4">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-primary">
                    {formatPrice(currentPrice)}
                  </span>
                  {hasOffer && (
                    <span className="text-xs text-[var(--text-tertiary)] line-through">
                      {formatPrice(basePrice)}
                    </span>
                  )}
                </div>
                {hasOffer && (
                  <span className="text-[10px] text-rose-500 font-bold block mt-0.5">
                    Promo Discount applied: Save {formatPrice(Number(basePrice) - Number(specPrice))}
                  </span>
                )}
              </div>

              {/* Availability Status */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${
                  product.availability_status === 'in_stock' 
                    ? 'bg-emerald-500' 
                    : product.availability_status === 'pre_order' 
                      ? 'bg-amber-500' 
                      : 'bg-rose-500'
                }`}></div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] capitalize">
                  {product.availability_status.replace('_', ' ')}
                </span>
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Select Variant</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-sm' 
                              : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-primary/40'
                          }`}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Select & Add to Cart button */}
              <div className="flex items-center gap-3 mt-auto">
                <div className="flex items-center rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-1">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] hover:text-primary transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[var(--text-primary)]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] hover:text-primary transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.availability_status === 'out_of_stock'}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </button>
              </div>

            </div>
          </div>

          {/* Description Block below Image/Form */}
          <div className="glass-panel p-6 rounded-3xl border-opacity-40">
            <h2 className="font-display font-extrabold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-3">
              Product Specifications & Details
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {product.description || 'No descriptive information available for this catalogue item.'}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--border-color)] border-dashed">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Award size={14} className="text-primary" />
                <span>100% Quality Inspected</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <PackageOpen size={14} className="text-primary" />
                <span>Express Order Compilation</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HALF: Similar Products (Columns: 5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="pb-3 border-b border-[var(--border-color)]">
            <h2 className="font-display font-extrabold text-sm text-[var(--text-primary)]">
              Similar Products in {product.category}
            </h2>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Explore corresponding products from our inventory.</p>
          </div>

          {similarProducts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {similarProducts.map((prod) => (
                <div key={prod.id} className="w-full">
                  {/* Smaller compact card structure or normal card */}
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl border-dashed">
              <span className="text-xl mb-1">🎁</span>
              <h3 className="font-display font-bold text-xs text-[var(--text-primary)]">Exclusive Item</h3>
              <p className="text-[10px] text-[var(--text-secondary)] text-center mt-1 px-4">
                This product is a unique piece in its category. Browse other products to see more!
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProductDetailPage;
