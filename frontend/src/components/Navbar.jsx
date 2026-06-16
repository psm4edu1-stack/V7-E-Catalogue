import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLikes } from '../context/LikesContext';
import { Sun, Moon, ShoppingCart, Heart, User, LogOut, Package, Grid, Compass } from 'lucide-react';

const Navbar = () => {
  const { darkMode, toggleDarkMode, brandSettings } = useTheme();
  const { user, admin, logout } = useAuth();
  const { getCartCount } = useCart();
  const { likes } = useLikes();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();
  const likesCount = likes.length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300">
      <div className="glass-panel mx-auto max-w-7xl mt-4 px-4 sm:px-6 lg:px-8 py-3 rounded-2xl shadow-md border-opacity-40">
        <div className="flex items-center justify-between h-12">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            {brandSettings.brandLogo ? (
              <img
                src={brandSettings.brandLogo}
                alt={brandSettings.brandName}
                className="w-10 h-10 rounded-xl object-cover border border-opacity-10 border-primary interactive-hover"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-all">
                {brandSettings.brandName.charAt(0)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight tracking-tight text-primary">
                {brandSettings.brandName}
              </span>
              {brandSettings.tagline && (
                <span className="text-[10px] text-text-secondary opacity-70 tracking-wider uppercase font-medium">
                  {brandSettings.tagline}
                </span>
              )}
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/products"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive('/products') ? 'text-primary' : 'text-[var(--text-secondary)] hover:text-primary'
              }`}
            >
              <Compass size={16} />
              Browse
            </Link>
            <Link
              to="/categories"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive('/categories') ? 'text-primary' : 'text-[var(--text-secondary)] hover:text-primary'
              }`}
            >
              <Grid size={16} />
              Categories
            </Link>
            <Link
              to="/offers"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive('/offers') ? 'text-primary' : 'text-[var(--text-secondary)] hover:text-primary'
              }`}
            >
              <Package size={16} />
              Offers
            </Link>
            {admin && (
              <Link
                to="/admin"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Interactive Utilities */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-primary transition-all duration-200"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Favorites Icon */}
            <Link
              to="/likes"
              className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-primary transition-all duration-200 relative"
              title="Liked Products"
            >
              <Heart size={18} />
              {likesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[var(--bg-secondary)] shadow-sm animate-pulse">
                  {likesCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-primary transition-all duration-200 relative border border-transparent hover:border-primary/20"
              title="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[var(--bg-secondary)] shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-[var(--border-color)] mx-1"></div>

            {/* Login / Profile */}
            {user || admin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-semibold text-[var(--text-secondary)]">
                  Hi, {user?.name || 'Admin'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <User size={14} />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
