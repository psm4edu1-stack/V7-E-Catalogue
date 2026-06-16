import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const LikesContext = createContext();

export const LikesProvider = ({ children }) => {
  const { user, useMock } = useAuth();
  const [likes, setLikes] = useState([]);
  
  // Custom mapping of product IDs to additional simulated like counts
  const [extraLikes, setExtraLikes] = useState({});

  useEffect(() => {
    if (useMock) {
      // In mock mode, load from localStorage using user-specific key
      const savedLikes = localStorage.getItem(`likes_${user?.id || 'guest'}`);
      setLikes(savedLikes ? JSON.parse(savedLikes) : []);
    } else if (!user) {
      // Not logged in and not mock: clear likes
      setLikes([]);
    } else {
      // Sync from backend
      fetch('http://localhost:5000/api/likes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setLikes(data.map(l => l.product_id)))
        .catch(() => {
          const savedLikes = localStorage.getItem(`likes_${user.id}`);
          setLikes(savedLikes ? JSON.parse(savedLikes) : []);
        });
    }
  }, [user, useMock]);

  useEffect(() => {
    localStorage.setItem(`likes_${user?.id || 'guest'}`, JSON.stringify(likes));
    if (!useMock && user) {
      fetch('http://localhost:5000/api/likes/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ likes })
      }).catch(err => console.error("Error syncing likes:", err));
    }
  }, [likes, user, useMock]);

  const toggleLike = (productId) => {
    setLikes((prevLikes) => {
      const isAlreadyLiked = prevLikes.includes(productId);
      const newLikes = isAlreadyLiked
        ? prevLikes.filter(id => id !== productId)
        : [...prevLikes, productId];

      // Update extraLikes counts
      setExtraLikes(prev => {
        const currentCount = prev[productId] || 0;
        return {
          ...prev,
          [productId]: isAlreadyLiked ? Math.max(0, currentCount - 1) : currentCount + 1
        };
      });

      return newLikes;
    });
  };

  const isLiked = (productId) => likes.includes(productId);

  const getLikesCount = (product) => {
    const baseCount = product?.likes_count || product?.likes || 0;
    const offset = extraLikes[product?.id] || 0;
    return baseCount + offset;
  };

  return (
    <LikesContext.Provider value={{ likes, toggleLike, isLiked, getLikesCount }}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => useContext(LikesContext);
