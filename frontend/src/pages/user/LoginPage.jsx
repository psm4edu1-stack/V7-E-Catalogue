import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const { userLogin, adminLogin } = useAuth();
  const navigate = useNavigate();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isAdmin) {
        await adminLogin(email, password);
        navigate('/admin');
      } else {
        await userLogin(email, password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl shadow-lg border-opacity-40">
        
        {/* Toggle between User & Admin */}
        <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setIsAdmin(false); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              !isAdmin 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User size={14} />
            Customer Account
          </button>
          <button
            type="button"
            onClick={() => { setIsAdmin(true); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              isAdmin 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ShieldCheck size={14} />
            Merchant Portal
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--text-primary)]">
            {isAdmin ? 'Merchant Login' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {isAdmin 
              ? 'Access your product catalog and view sales analytics.' 
              : 'Sign in to bookmark items and build your shopping cart.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-medium mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
              />
              <Mail size={14} className="absolute left-3 top-3.5 text-[var(--text-tertiary)]" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
              />
              <Lock size={14} className="absolute left-3 top-3.5 text-[var(--text-tertiary)]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <LogIn size={14} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer actions */}
        <div className="text-center mt-6 pt-4 border-t border-[var(--border-color)] border-dashed">
          <p className="text-xs text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link 
              to={isAdmin ? "/admin/register" : "/register"} 
              className="text-primary hover:underline font-bold"
            >
              Register Here
            </Link>
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mt-4"
          >
            <ArrowLeft size={12} />
            Back to catalogue
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
