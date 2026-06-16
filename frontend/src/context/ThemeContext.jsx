import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [brandSettings, setBrandSettings] = useState(() => {
    const saved = localStorage.getItem('brandSettings');
    return saved ? JSON.parse(saved) : {
      primaryColor: '#3b82f6',
      primaryHoverColor: '#2563eb',
      fontFamily: 'Outfit',
      brandName: 'ECatalogue',
      brandLogo: '',
      brandDescription: 'A premium digital catalogue showcasing our finest products.',
      tagline: 'Quality. Elegance. Simplicity.',
      contactInfo: { phone: '', instagram: '', email: '' },
      howToOrder: 'Add items to your cart, click checkout, and send the generated summary via Instagram DM or WhatsApp!'
    };
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Inject dynamic CSS variables based on brandSettings
    const root = window.document.documentElement;
    root.style.setProperty('--primary-color', brandSettings.primaryColor);
    root.style.setProperty('--primary-hover-color', brandSettings.primaryHoverColor || `${brandSettings.primaryColor}dd`);
    root.style.setProperty('--font-family', `'${brandSettings.fontFamily}', 'Inter', sans-serif`);
    
    // Dynamically load Google Font if it's not Outfit or Inter
    if (brandSettings.fontFamily && !['Outfit', 'Inter'].includes(brandSettings.fontFamily)) {
      const linkId = 'dynamic-google-font';
      let linkElement = document.getElementById(linkId);
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.id = linkId;
        linkElement.rel = 'stylesheet';
        document.head.appendChild(linkElement);
      }
      linkElement.href = `https://fonts.googleapis.com/css2?family=${brandSettings.fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    }
    
    localStorage.setItem('brandSettings', JSON.stringify(brandSettings));
  }, [brandSettings]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const updateBrandSettings = (newSettings) => {
    setBrandSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, brandSettings, updateBrandSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);