import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, Settings, Phone, FileText, ArrowLeft, Image } from 'lucide-react';

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

const AdminRegisterPage = () => {
  const { adminRegister } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  
  // Social media / contact
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Checkout path
  const [howToOrder, setHowToOrder] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const brandData = {
        email,
        password,
        brandName,
        brandLogo: brandLogo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80',
        tagline,
        description,
        contactInfo: {
          phone: phone || 'N/A',
          instagram: instagram || 'N/A',
          email: contactEmail || email
        },
        howToOrder: howToOrder || 'Add items to your cart, click checkout, and send the generated summary via Instagram DM or WhatsApp!'
      };

      await adminRegister(brandData);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Setup failed. Try a different merchant email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-3xl shadow-xl border-opacity-40">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-sm mx-auto mb-3">
            <ShieldCheck size={24} />
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--text-primary)]">
            Create Merchant Brand Profile
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Build your beautiful digital storefront. Configure your catalogue identity.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-medium mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section A: Credentials */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider pb-1 border-b border-[var(--border-color)]">
              1. Portal Credentials
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Merchant Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brand.com"
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                />
                <Mail size={14} className="absolute left-3 top-3.5 text-[var(--text-tertiary)]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Access Password</label>
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

            {/* Section B: Brand Identity */}
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider pb-1 border-b border-[var(--border-color)] mt-3">
              2. Brand Identity
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Brand Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Modern Acoustics"
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                />
                <Settings size={14} className="absolute left-3 top-3.5 text-[var(--text-tertiary)]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Brand Logo URL</label>
              <div className="relative">
                <input
                  type="url"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                />
                <Image size={14} className="absolute left-3 top-3.5 text-[var(--text-tertiary)]" />
              </div>
            </div>
          </div>

          {/* Section C: Store Details & Contact info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider pb-1 border-b border-[var(--border-color)]">
              3. Store Details
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Tagline (Optional)</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Quality. Design. Excellence."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your brand and products..."
                rows="2"
                className="w-full px-4 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <h3 className="text-xs font-bold text-primary uppercase tracking-wider pb-1 border-b border-[var(--border-color)] mt-1">
              4. Customer Contacts
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Phone / WhatsApp</label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                  />
                  <Phone size={12} className="absolute left-2.5 top-3 text-[var(--text-tertiary)]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Instagram Handle</label>
                <div className="relative">
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@modernbrand"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                  />
                  <InstagramIcon size={12} className="absolute left-2.5 top-3 text-[var(--text-tertiary)]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">How To Order Instructions</label>
              <div className="relative">
                <textarea
                  required
                  value={howToOrder}
                  onChange={(e) => setHowToOrder(e.target.value)}
                  placeholder="Where should users DM or contact you to finalize their orders? (e.g. DM us on Instagram @brand or WhatsApp at +1 234...)"
                  rows="2"
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors resize-none"
                />
                <FileText size={14} className="absolute left-3 top-3.5 text-[var(--text-tertiary)]" />
              </div>
            </div>
          </div>

          {/* Buttons across columns */}
          <div className="md:col-span-2 flex flex-col items-center gap-4 mt-4 pt-4 border-t border-[var(--border-color)] border-dashed">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-sm flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck size={14} />
              {loading ? 'Initializing Storefront...' : 'Launch Storefront & Enter Dashboard'}
            </button>

            <p className="text-xs text-[var(--text-secondary)]">
              Already have a store registered?{' '}
              <Link to="/login" className="text-primary hover:underline font-bold">
                Sign In Here
              </Link>
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={12} />
              Back to catalogue
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AdminRegisterPage;
