import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, Palette, Type, Shield, Phone, FileText } from 'lucide-react';

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

const SettingsPage = () => {
  const { brandSettings, updateBrandSettings } = useTheme();
  const { admin } = useAuth();

  // Settings States
  const [brandName, setBrandName] = useState(brandSettings.brandName);
  const [brandLogo, setBrandLogo] = useState(brandSettings.brandLogo);
  const [tagline, setTagline] = useState(brandSettings.tagline || '');
  const [description, setDescription] = useState(brandSettings.brandDescription || '');
  
  const [phone, setPhone] = useState(brandSettings.contactInfo?.phone || '');
  const [instagram, setInstagram] = useState(brandSettings.contactInfo?.instagram || '');
  const [email, setEmail] = useState(brandSettings.contactInfo?.email || '');
  
  const [howToOrder, setHowToOrder] = useState(brandSettings.howToOrder || '');

  // Theme presets
  const [primaryColor, setPrimaryColor] = useState(brandSettings.primaryColor || '#3b82f6');
  const [fontFamily, setFontFamily] = useState(brandSettings.fontFamily || 'Outfit');

  const colorPresets = [
    { name: 'Classic Blue', value: '#3b82f6', hover: '#2563eb' },
    { name: 'Forest Green', value: '#10b981', hover: '#059669' },
    { name: 'Sunset Rose', value: '#f43f5e', hover: '#e11d48' },
    { name: 'Warm Amber', value: '#f59e0b', hover: '#d97706' },
    { name: 'Imperial Violet', value: '#8b5cf6', hover: '#7c3aed' },
    { name: 'Obsidian Dark', value: '#1e293b', hover: '#0f172a' }
  ];

  const fontPresets = [
    'Outfit',
    'Inter',
    'Space Grotesk',
    'Playfair Display',
    'Quicksand',
    'Plus Jakarta Sans'
  ];

  const handleSaveBrand = (e) => {
    e.preventDefault();
    updateBrandSettings({
      brandName,
      brandLogo,
      tagline,
      brandDescription: description,
      contactInfo: { phone, instagram, email },
      howToOrder
    });
    alert("Brand Identity details successfully updated!");
  };

  const handleSaveAesthetics = () => {
    // Find preset matching chosen color to set hover properly
    const preset = colorPresets.find(p => p.value === primaryColor);
    const hoverColor = preset ? preset.hover : `${primaryColor}dd`;

    updateBrandSettings({
      primaryColor,
      primaryHoverColor: hoverColor,
      fontFamily
    });

    // If backend is running, also persist admin session
    if (admin) {
      const savedAdmin = JSON.parse(localStorage.getItem('currentAdmin') || '{}');
      savedAdmin.theme_color = primaryColor;
      savedAdmin.font_family = fontFamily;
      localStorage.setItem('currentAdmin', JSON.stringify(savedAdmin));
    }

    alert("Color themes and Typography successfully loaded!");
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="font-display font-extrabold text-lg text-[var(--text-primary)]">Custom storefront Settings</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Control typography, brand details, social contacts, and custom order directions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Brand profile (Columns: 7/12) */}
        <form onSubmit={handleSaveBrand} className="lg:col-span-7 flex flex-col gap-5">
          <div className="glass-panel p-5 rounded-3xl border-opacity-40 flex flex-col gap-4">
            
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-[var(--border-color)] pb-2 mb-1">
              <Shield size={14} className="text-primary" /> Storefront Identity & Contacts
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Brand Name</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Brand Logo Image URL</label>
              <input
                type="url"
                value={brandLogo}
                onChange={(e) => setBrandLogo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Brand Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                  <Phone size={10} /> Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                  <InstagramIcon size={10} /> Instagram Handle
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                  Email Contact
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                <FileText size={10} /> Checkout Order Directions
              </label>
              <textarea
                value={howToOrder}
                onChange={(e) => setHowToOrder(e.target.value)}
                rows="2"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> Update Core Brand Details
            </button>

          </div>
        </form>

        {/* RIGHT COLUMN: Aesthetics Selection (Columns: 5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="glass-panel p-5 rounded-3xl border-opacity-40 flex flex-col gap-4">
            
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-[var(--border-color)] pb-2 mb-1">
              <Palette size={14} className="text-primary" /> Storefront Aesthetics Engine
            </span>

            {/* Presets color grid */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Brand Color Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => {
                  const isActive = primaryColor === preset.value;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setPrimaryColor(preset.value)}
                      className={`p-2 rounded-xl border text-[9px] font-bold transition-all text-center flex flex-col items-center gap-1.5 ${
                        isActive 
                          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-primary/20'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: preset.value }}></div>
                      {preset.name}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Selector */}
              <div className="flex items-center gap-3 mt-2 bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] flex-1">Or choose a custom HEX:</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-[var(--border-color)] cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 px-1.5 py-1 text-center font-mono text-[10px] font-bold rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)]"
                />
              </div>
            </div>

            {/* Custom Google Fonts */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                <Type size={12} /> Font Typography
              </label>
              <div className="flex flex-col gap-1">
                {fontPresets.map((fPreset) => {
                  const isActive = fontFamily === fPreset;
                  return (
                    <button
                      key={fPreset}
                      type="button"
                      onClick={() => setFontFamily(fPreset)}
                      className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        isActive 
                          ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-primary/20'
                      }`}
                      style={{ fontFamily: `'${fPreset}', sans-serif` }}
                    >
                      {fPreset} — Preview Typography
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAesthetics}
              className="mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> Inject theme Configurations
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
