import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';

// User Pages
import LandingPage from './pages/user/LandingPage';
import AllProductsPage from './pages/user/AllProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import SpecialOffersPage from './pages/user/SpecialOffersPage';
import LikedProductsPage from './pages/user/LikedProductsPage';
import CartPage from './pages/user/CartPage';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OfferManagement from './pages/admin/OfferManagement';
import SettingsPage from './pages/admin/SettingsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';

// User Layout wrapper to consistently render the Navbar
const UserLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {children}
      </div>
      <footer className="py-6 text-center border-t border-[var(--border-color)] border-dashed text-[10px] text-[var(--text-tertiary)] select-none">
        © {new Date().getFullYear()} Digital Catalogue Platform. Elegant design. Mobile Optimized.
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* User routes wrapped inside UserLayout */}
        <Route path="/" element={<UserLayout><LandingPage /></UserLayout>} />
        <Route path="/products" element={<UserLayout><AllProductsPage /></UserLayout>} />
        <Route path="/categories" element={<UserLayout><AllProductsPage /></UserLayout>} />
        <Route path="/product/:id" element={<UserLayout><ProductDetailPage /></UserLayout>} />
        <Route path="/offers" element={<UserLayout><SpecialOffersPage /></UserLayout>} />
        <Route path="/likes" element={<UserLayout><LikedProductsPage /></UserLayout>} />
        <Route path="/cart" element={<UserLayout><CartPage /></UserLayout>} />
        <Route path="/login" element={<UserLayout><LoginPage /></UserLayout>} />
        <Route path="/register" element={<UserLayout><RegisterPage /></UserLayout>} />
        <Route path="/admin/register" element={<UserLayout><AdminRegisterPage /></UserLayout>} />

        {/* Admin layouts & nested portal paths */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="offers" element={<OfferManagement />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Fallback Catch */}
        <Route path="*" element={
          <UserLayout>
            <div className="text-center py-20">
              <span className="text-3xl">⚠️</span>
              <h2 className="font-display font-extrabold text-base mt-2 text-[var(--text-primary)]">Page Not Found</h2>
              <Link to="/" className="mt-4 text-xs font-bold text-primary hover:underline block">Return to home catalogue</Link>
            </div>
          </UserLayout>
        } />

      </Routes>
    </Router>
  );
}

export default App;
