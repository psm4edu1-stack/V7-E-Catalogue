import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, useMock } = useAuth();
  const [cart, setCart] = useState([]);

  // Load cart
  useEffect(() => {
    if (useMock) {
      // In mock mode, load from localStorage using user-specific key
      const savedCart = localStorage.getItem(`cart_${user?.id || 'guest'}`);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } else if (!user) {
      // Not logged in, load guest cart from localStorage
      const savedCart = localStorage.getItem('cart_guest');
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } else {
      // Fetch cart from backend API
      fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed');
          return res.json();
        })
        .then(data => {
          setCart(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          const savedCart = localStorage.getItem(`cart_${user.id}`);
          setCart(savedCart ? JSON.parse(savedCart) : []);
        });
    }
  }, [user, useMock]);

  // Save cart
  useEffect(() => {
    localStorage.setItem(`cart_${user?.id || 'guest'}`, JSON.stringify(cart));
    if (!useMock && user) {
      // Sync with backend API
      fetch('http://localhost:5000/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cart })
      }).catch(err => console.error("Error syncing cart:", err));
    }
  }, [cart, user, useMock]);

  const addToCart = (product, variant = null, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && (!variant || item.variant?.id === variant.id)
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { product, variant, quantity }];
      }
    });
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && (!variantId || item.variant?.id === variantId)))
    );
  };

  const updateQuantity = (productId, variantId = null, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && (!variantId || item.variant?.id === variantId)
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    if (!Array.isArray(cart)) return 0;

    return cart.reduce((total, item) => {
      const price = item.variant
        ? (item.variant.special_price || item.variant.price)
        : (item.product.special_price || item.product.price);
      return total + Number(price) * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    if (!Array.isArray(cart)) return 0;

    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
