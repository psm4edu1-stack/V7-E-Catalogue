import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/currency';
import { ShoppingBag, Trash2, ArrowRight, MessageSquare, Clipboard, Check, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { brandSettings } = useTheme();
  const { user } = useAuth();
  
  const [copied, setCopied] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);

  const cartTotal = getCartTotal();

  // Compile Order Text Script for WhatsApp or Instagram DM
  const compileOrderText = () => {
    let message = `*NEW ORDER - DIGITAL CATALOGUE*\n`;
    message += `--------------------------------------\n`;
    
    cart.forEach((item, index) => {
      const price = item.variant 
        ? (item.variant.special_price || item.variant.price) 
        : (item.product.special_price || item.product.price);
      
      const variantText = item.variant ? ` [${item.variant.name}]` : '';
      message += `${index + 1}. ${item.product.name}${variantText}\n   Qty: ${item.quantity} x ₹${Number(price).toLocaleString('en-IN')} = ₹${(price * item.quantity).toLocaleString('en-IN')}\n`;
    });
    
    message += `--------------------------------------\n`;
    message += `*Total Order Value: ₹${cartTotal.toLocaleString('en-IN')}*\n\n`;
    
    if (user) {
      message += `*Customer Details:*\n`;
      message += `• Name: ${user.name}\n`;
      message += `• Email: ${user.email}\n\n`;
    }
    
    message += `Please confirm availability and share payment/delivery instructions!`;
    return message;
  };

  const handleCopyToClipboard = () => {
    const text = compileOrderText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppCheckout = () => {
    const text = encodeURIComponent(compileOrderText());
    // Get phone number from settings (remove non-digits or keep +)
    const phone = brandSettings.contactInfo?.phone || '';
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      alert("Merchant's phone number is not fully configured. Copied the text to clipboard; you can manually message them!");
      handleCopyToClipboard();
    }
  };

  const handleInstagramCheckout = () => {
    handleCopyToClipboard();
    const handle = brandSettings.contactInfo?.instagram || '';
    const cleanHandle = handle.replace('@', '');
    
    if (cleanHandle) {
      // Direct Instagram DM link or profile link
      window.open(`https://instagram.com/${cleanHandle}`, '_blank');
    } else {
      window.open('https://instagram.com', '_blank');
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full flex flex-col gap-6 pb-16">
      
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-display font-extrabold text-xl text-[var(--text-primary)] flex items-center gap-2">
          <ShoppingBag size={20} className="text-primary" />
          Shopping Cart Summary
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Review items in list before compiling checkout messages.</p>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT HALF: Cart Items List (Columns: 7/12) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {cart.map((item, idx) => {
              const basePrice = item.variant ? item.variant.price : item.product.price;
              const specPrice = item.variant ? item.variant.special_price : item.product.special_price;
              const hasOffer = specPrice && Number(specPrice) < Number(basePrice);
              const currentPrice = hasOffer ? specPrice : basePrice;

              return (
                <div 
                  key={`${item.product.id}-${item.variant?.id || 'base'}`}
                  className="glass-panel p-4 rounded-2xl border-opacity-40 flex items-center gap-4 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80'}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[var(--border-color)]"
                  />

                  {/* Descriptions */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider mb-0.5">
                      {item.product.category}
                    </span>
                    <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                      {item.product.name}
                    </h3>
                    {item.variant && (
                      <span className="text-[10px] text-[var(--text-secondary)] font-semibold mt-0.5 bg-[var(--bg-tertiary)] w-fit px-2 py-0.5 rounded-md">
                        Option: {item.variant.name}
                      </span>
                    )}
                    
                    {/* Prices */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-extrabold text-primary">
                        {formatPrice(currentPrice)}
                      </span>
                      {hasOffer && (
                        <span className="text-[10px] text-[var(--text-tertiary)] line-through">
                          {formatPrice(basePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity adjusters */}
                  <div className="flex items-center rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-0.5">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] hover:text-primary transition-colors"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-[11px] font-bold text-[var(--text-primary)]">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] hover:text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.variant?.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}

            {/* Clear Cart Trigger */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-xs text-[var(--text-secondary)] hover:text-rose-500 transition-colors flex items-center gap-1 font-bold"
              >
                <Trash2 size={12} />
                Clear entire cart
              </button>
            </div>
          </div>

          {/* RIGHT HALF: Checkout compiler Panel (Columns: 5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="glass-panel p-5 rounded-3xl border-opacity-40 flex flex-col gap-4">
              
              {/* Order total */}
              <div className="pb-3 border-b border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                  Subtotal
                </span>
                <div className="flex justify-between items-baseline">
                  <span className="font-display font-extrabold text-xl text-[var(--text-primary)]">
                    Order Total:
                  </span>
                  <span className="text-xl font-black text-primary">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Step indicator or action panel */}
              {!checkoutStep ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Orders are collected via text compilation. When you checkout, a clean itemized summary is created for you to submit to the merchant.
                  </p>
                  <button
                    onClick={() => setCheckoutStep(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Proceed to Order Channels
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-left flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
                      Generated Message Preview
                    </span>
                    <pre className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-primary)] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed border border-[var(--border-color)] max-h-36">
                      {compileOrderText()}
                    </pre>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {/* Copy to Clipboard first */}
                    <button
                      onClick={handleCopyToClipboard}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        copied 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-primary/40'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={14} /> Order copied!
                        </>
                      ) : (
                        <>
                          <Clipboard size={14} /> Copy Order Summary
                        </>
                      )}
                    </button>

                    <div className="h-[1px] bg-[var(--border-color)] border-dashed my-1"></div>

                    {/* Channel 1: WhatsApp Checkout */}
                    <button
                      onClick={handleWhatsAppCheckout}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <MessageCircle size={16} />
                      Send via WhatsApp
                    </button>

                    {/* Channel 2: Instagram Direct Message */}
                    <button
                      onClick={handleInstagramCheckout}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 hover:shadow-lg text-white text-xs font-bold transition-all"
                    >
                      <InstagramIcon size={16} />
                      Message on Instagram DM
                    </button>
                  </div>

                  {/* Back to cart state link */}
                  <button
                    onClick={() => setCheckoutStep(false)}
                    className="text-[10px] text-[var(--text-secondary)] font-bold hover:text-primary transition-colors text-center"
                  >
                    Modify Cart Items
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl border-dashed">
          <span className="text-4xl mb-3">🛒</span>
          <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">Your cart is empty</h3>
          <p className="text-xs text-[var(--text-secondary)] text-center max-w-xs mt-1 leading-relaxed">
            Take a look at our live offers or browse the product listings to populate your cart!
          </p>
          <Link
            to="/products"
            className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            Explore Catalogue
          </Link>
        </div>
      )}

    </div>
  );
};

export default CartPage;
