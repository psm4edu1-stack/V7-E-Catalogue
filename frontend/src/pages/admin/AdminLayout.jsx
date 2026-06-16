import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, FolderOpen, Tag, Settings, BarChart3, LogOut, ArrowLeft, ExternalLink } from 'lucide-react';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Protect Admin route
  if (!admin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm glass-panel p-6 text-center rounded-2xl border-opacity-40 shadow-md">
          <span className="text-3xl">🔒</span>
          <h2 className="font-display font-extrabold text-lg text-[var(--text-primary)] mt-3">Access Denied</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-2">You must login as a merchant to access the admin panel.</p>
          <Link
            to="/login"
            className="mt-6 w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm"
          >
            Login to Portal
          </Link>
        </div>
      </div>
    );
  }

  const links = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} />, exact: true },
    { path: '/admin/products', label: 'Product Manager', icon: <ShoppingBag size={16} /> },
    { path: '/admin/categories', label: 'Category Manager', icon: <FolderOpen size={16} /> },
    { path: '/admin/offers', label: 'Offer Manager', icon: <Tag size={16} /> },
    { path: '/admin/settings', label: 'Brand Settings', icon: <Settings size={16} /> },
    { path: '/admin/analytics', label: 'Sales Analytics', icon: <BarChart3 size={16} /> }
  ];

  return (
    <div className="mx-auto max-w-7xl w-full flex flex-col md:flex-row gap-6 pb-16 min-h-[80vh]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-60 flex flex-col gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl h-fit">
        
        {/* Merchant Header */}
        <div className="pb-3 border-b border-[var(--border-color)] text-center md:text-left flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest block">Merchant Portal</span>
          <span className="font-display font-extrabold text-sm text-[var(--text-primary)] truncate">
            {admin.brandName}
          </span>
        </div>

        {/* Action list */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const active = link.exact 
              ? location.pathname === link.path 
              : location.pathname.startsWith(link.path) && link.path !== '/admin';
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  active 
                    ? 'bg-primary border-primary text-white shadow-sm' 
                    : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-primary'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-[1px] bg-[var(--border-color)] my-1 border-dashed"></div>

        {/* Footer shortcuts */}
        <div className="flex flex-col gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 text-[11px] font-bold rounded-xl text-[var(--text-secondary)] hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            View Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 text-[11px] font-bold rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all text-left"
          >
            <LogOut size={14} />
            Exit Portal
          </button>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
