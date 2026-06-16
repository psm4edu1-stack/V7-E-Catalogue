import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { updateBrandSettings } = useTheme();
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('currentAdmin');
    return saved ? JSON.parse(saved) : null;
  });

  // Check if server is running, otherwise use mock fallback
  const [useMock, setUseMock] = useState(true);

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:5000/api/health')
      .then(() => setUseMock(false))
      .catch(() => setUseMock(true));
  }, []);

  const userRegister = async (name, email, password) => {
    if (useMock) {
      const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      if (users.find(u => u.email === email)) {
        throw new Error('User email already exists');
      }
      const newUser = { id: Date.now(), name, email, password };
      users.push(newUser);
      localStorage.setItem('mockUsers', JSON.stringify(users));
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return newUser;
    } else {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data.user;
    }
  };

  const userLogin = async (email, password) => {
    if (useMock) {
      const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) throw new Error('Invalid email or password');
      setUser(found);
      localStorage.setItem('currentUser', JSON.stringify(found));
      return found;
    } else {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data.user;
    }
  };

  const adminRegister = async (brandData) => {
    // brandData contains: { email, password, brandName, tagline, description, contactInfo (phone, instagram, email), howToOrder, brandLogo }
    if (useMock) {
      const newAdmin = {
        id: 1,
        email: brandData.email,
        brandName: brandData.brandName,
        brandLogo: brandData.brandLogo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80',
        tagline: brandData.tagline,
        description: brandData.description,
        contactInfo: brandData.contactInfo,
        howToOrder: brandData.howToOrder,
        primaryColor: '#3b82f6',
        fontFamily: 'Outfit'
      };
      
      localStorage.setItem('mockAdmin', JSON.stringify({ ...newAdmin, password: brandData.password }));
      setAdmin(newAdmin);
      localStorage.setItem('currentAdmin', JSON.stringify(newAdmin));
      
      updateBrandSettings({
        brandName: brandData.brandName,
        brandLogo: brandData.brandLogo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80',
        tagline: brandData.tagline,
        brandDescription: brandData.description,
        contactInfo: brandData.contactInfo,
        howToOrder: brandData.howToOrder
      });
      return newAdmin;
    } else {
      const res = await fetch('http://localhost:5000/api/auth/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Admin setup failed');
      setAdmin(data.admin);
      localStorage.setItem('currentAdmin', JSON.stringify(data.admin));
      localStorage.setItem('token', data.token);
      updateBrandSettings(data.admin);
      return data.admin;
    }
  };

  const adminLogin = async (email, password) => {
    if (useMock) {
      const mockAdmin = JSON.parse(localStorage.getItem('mockAdmin'));
      if (!mockAdmin || mockAdmin.email !== email || mockAdmin.password !== password) {
        throw new Error('Invalid admin email or password');
      }
      const adminSession = { ...mockAdmin };
      delete adminSession.password;
      setAdmin(adminSession);
      localStorage.setItem('currentAdmin', JSON.stringify(adminSession));
      updateBrandSettings(adminSession);
      return adminSession;
    } else {
      const res = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Admin login failed');
      setAdmin(data.admin);
      localStorage.setItem('currentAdmin', JSON.stringify(data.admin));
      localStorage.setItem('token', data.token);
      updateBrandSettings(data.admin);
      return data.admin;
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAdmin');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, admin, userLogin, userRegister, adminLogin, adminRegister, logout, useMock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
