import React, { useState, useEffect, useRef } from 'react';
import { UserProfileData, NavigationTab } from '../types';
import { User } from '../lib/firebase';
import { ClimateModal } from './ClimateModal';

interface HeaderProps {
  profile: UserProfileData;
  activeTab: NavigationTab;
  currentUser: User | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSearch: () => void;
  onOpenAuthModal: () => void;
  onUpdateProfile: (updated: Partial<UserProfileData>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  currentUser,
  theme,
  onToggleTheme,
  onSelectTab,
  onOpenSearch,
  onOpenAuthModal,
  onUpdateProfile
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClimateModalOpen, setIsClimateModalOpen] = useState(false);
  const [tempName, setTempName] = useState(profile.name || 'User');
  const [tempAvatarUrl, setTempAvatarUrl] = useState(profile.avatarUrl || '');
  const [tempCurrency, setTempCurrency] = useState(profile.currencySymbol || '$');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live real-time clock & time-based greeting
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const dynamicGreeting = (() => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  })();

  const currencies = [
    { symbol: '$', code: 'USD / Dollar' },
    { symbol: '₹', code: 'INR / Rupee' },
    { symbol: '€', code: 'EUR / Euro' },
    { symbol: '£', code: 'GBP / Pound' },
    { symbol: '¥', code: 'JPY / Yuan/Yen' },
    { symbol: 'A$', code: 'AUD / Australian $' },
    { symbol: 'C$', code: 'CAD / Canadian $' },
    { symbol: 'R$', code: 'BRL / Real' },
    { symbol: 'S$', code: 'SGD / Singapore $' },
    { symbol: 'AED ', code: 'AED / Dirham' }
  ];

  const handleOpenProfileModal = () => {
    setTempName(profile.name || 'User');
    setTempAvatarUrl(profile.avatarUrl || '');
    setTempCurrency(profile.currencySymbol || '$');
    setIsProfileModalOpen(true);
  };

  // Handle uploading photo from user's gallery / device
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setTempAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setTempAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: tempName.trim() || 'User',
      avatarUrl: tempAvatarUrl,
      currencySymbol: tempCurrency
    });
    setIsProfileModalOpen(false);
  };

  const currentDisplayTemp =
    profile.tempUnit === 'F'
      ? `${profile.tempF ?? 82}°F`
      : `${profile.tempC ?? 28}°C`;

  const hasCustomLocation = profile.location && profile.location !== 'Add City';

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center px-4 sm:px-6 h-16 w-full glass-header border-b border-[#424754]/30 transition-colors">
      <div className="flex items-center gap-3">
        {/* User Avatar - Common default or user-uploaded photo from gallery */}
        <button
          id="header-user-avatar-btn"
          onClick={handleOpenProfileModal}
          className="w-9 h-9 rounded-full overflow-hidden micro-border focus:outline-none focus:ring-2 focus:ring-[#adc6ff]/50 transition-all hover:scale-105 cursor-pointer relative group bg-[#181c24] flex items-center justify-center text-[#adc6ff]"
          title="Change Profile Photo & Name"
        >
          {profile.avatarUrl || currentUser?.photoURL ? (
            <img
              className="w-full h-full object-cover"
              src={profile.avatarUrl || currentUser?.photoURL || ''}
              alt={profile.name || 'User Profile'}
            />
          ) : (
            <div className="w-full h-full bg-[#1e2330] flex items-center justify-center text-[#adc6ff]">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </div>
        </button>

        <div className="flex flex-col justify-center">
          <span className="text-[18px] font-bold text-[#adc6ff] leading-none flex items-center gap-1.5 whitespace-nowrap">
            LifeHub
            <span className="text-[9px] px-1.5 py-0.5 bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 rounded font-mono font-medium">
              LIVE
            </span>
          </span>
          <span className="text-[10px] font-medium text-[#c2c6d6] leading-tight mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <span>{dynamicGreeting}, {profile.name || 'User'}</span>
            <span className="text-[9px] font-mono text-[#adc6ff] bg-[#181c24] px-1.5 py-0.5 rounded micro-border">
              {timeStr}
            </span>
          </span>
        </div>
      </div>

      {/* Desktop Nav Links */}
      <nav className="hidden md:flex items-center gap-1 bg-[#181c24] p-1 rounded-xl micro-border">
        <button
          id="nav-desktop-home-btn"
          onClick={() => onSelectTab('home')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'home'
              ? 'bg-[#adc6ff] text-[#00285d] shadow-sm'
              : 'text-[#c2c6d6] hover:text-[#dfe2ee] hover:bg-[#262a33]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          Home
        </button>
        <button
          id="nav-desktop-tasks-btn"
          onClick={() => onSelectTab('tasks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-[#adc6ff] text-[#00285d] shadow-sm'
              : 'text-[#c2c6d6] hover:text-[#dfe2ee] hover:bg-[#262a33]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Tasks
        </button>
        <button
          id="nav-desktop-money-btn"
          onClick={() => onSelectTab('money')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'money'
              ? 'bg-[#adc6ff] text-[#00285d] shadow-sm'
              : 'text-[#c2c6d6] hover:text-[#dfe2ee] hover:bg-[#262a33]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
          Money
        </button>
        <button
          id="nav-desktop-habits-btn"
          onClick={() => onSelectTab('habits')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'habits'
              ? 'bg-[#adc6ff] text-[#00285d] shadow-sm'
              : 'text-[#c2c6d6] hover:text-[#dfe2ee] hover:bg-[#262a33]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">rebase_edit</span>
          Habits
        </button>
        <button
          id="nav-desktop-more-btn"
          onClick={() => onSelectTab('more')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'more'
              ? 'bg-[#adc6ff] text-[#00285d] shadow-sm'
              : 'text-[#c2c6d6] hover:text-[#dfe2ee] hover:bg-[#262a33]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">more_horiz</span>
          More
        </button>
      </nav>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Top Climate / Weather Widget Trigger - Opens Climate Settings */}
        <button
          id="header-climate-btn"
          onClick={() => setIsClimateModalOpen(true)}
          className="text-right flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-[#181c24] hover:bg-[#262a33] micro-border rounded-xl transition-all cursor-pointer group shrink-0"
          title="Click to Add Climate & configure City and Degrees"
        >
          <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">
            {profile.weatherIconSymbol || 'wb_sunny'}
          </span>
          <div className="text-left">
            <p className="text-[10px] sm:text-[11px] font-bold text-[#dfe2ee] flex items-center gap-1 leading-tight">
              <span>{hasCustomLocation ? currentDisplayTemp : 'Add Climate'}</span>
              <span className="text-[8px] sm:text-[9px] text-[#adc6ff] font-mono">
                [{profile.tempUnit || 'C'}]
              </span>
            </p>
            <p className="text-[9px] sm:text-[10px] text-[#8c909f] truncate max-w-[70px] sm:max-w-[100px] leading-none">
              {profile.location || 'Add City'}
            </p>
          </div>
          <span className="material-symbols-outlined text-[13px] sm:text-[14px] text-[#8c909f] group-hover:text-[#adc6ff] hidden xs:inline">
            tune
          </span>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          id="header-theme-toggle-btn"
          onClick={onToggleTheme}
          className="p-2 bg-[#181c24] text-[#c2c6d6] hover:text-[#adc6ff] hover:bg-[#262a33] micro-border rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Cloud Login Account Trigger */}
        <button
          id="header-cloud-auth-btn"
          onClick={onOpenAuthModal}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            currentUser
              ? 'bg-[#181c24] text-[#4edea3] micro-border hover:bg-[#262a33]'
              : 'bg-[#adc6ff] text-[#00285d] hover:bg-[#adc6ff]/90 shadow-xs'
          }`}
          title={currentUser ? 'Cloud Account Active' : 'Sign In / Cloud Sync'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {currentUser ? 'cloud_done' : 'cloud_upload'}
          </span>
          <span className="hidden lg:inline">
            {currentUser ? 'Cloud Active' : 'Sign In'}
          </span>
        </button>

        {/* Global Search Button */}
        <button
          id="header-search-btn"
          onClick={onOpenSearch}
          className="p-2 text-[#c2c6d6] hover:text-[#adc6ff] hover:bg-[#1c2028] rounded-xl transition-colors cursor-pointer"
          title="Search LifeHub"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>
      </div>

      {/* Climate Modal */}
      <ClimateModal
        isOpen={isClimateModalOpen}
        profile={profile}
        onClose={() => setIsClimateModalOpen(false)}
        onUpdateProfile={onUpdateProfile}
      />

      {/* Profile & Custom Photo Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#181c24] border border-[#21262d] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#21262d]">
              <div>
                <h3 className="text-base font-bold text-[#dfe2ee]">Profile & Photo</h3>
                <p className="text-[11px] text-[#8c909f]">Upload your photo and set your display name</p>
              </div>
              <button
                id="close-profile-modal-btn"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-[#8c909f] hover:text-white cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Photo Upload Section */}
              <div className="flex flex-col items-center gap-3 p-4 bg-[#0a0e16] rounded-xl micro-border">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#adc6ff]/40 bg-[#1e2330] flex items-center justify-center text-[#adc6ff] shadow-md">
                  {tempAvatarUrl ? (
                    <img
                      src={tempAvatarUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[40px]">person</span>
                  )}
                </div>

                {/* Hidden File Input for Gallery / Device Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="profile-gallery-upload-input"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#adc6ff] text-[#00285d] rounded-lg text-xs font-bold hover:bg-[#adc6ff]/90 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_library</span>
                    Choose from Gallery
                  </button>
                  {tempAvatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 bg-[#262a33] text-[#ffb4ab] hover:bg-[#31353e] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#8c909f]">
                  Upload any JPG, PNG or WEBP photo directly from your device
                </p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                  Your Display Name
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  placeholder="Enter your name..."
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#424754] rounded-xl px-3 py-2 text-xs text-[#dfe2ee] focus:border-[#adc6ff] outline-none"
                />
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#c2c6d6] mb-1">
                  Currency Symbol
                </label>
                <select
                  id="profile-currency-select"
                  value={tempCurrency}
                  onChange={(e) => setTempCurrency(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-[#424754] rounded-xl px-3 py-2 text-xs text-[#dfe2ee] focus:border-[#adc6ff] outline-none font-mono"
                >
                  {currencies.map((c) => (
                    <option key={c.symbol} value={c.symbol}>
                      {c.symbol} — {c.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Direct Link to Climate Settings */}
              <div className="p-3 bg-[#0a0e16] rounded-xl micro-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#dfe2ee]">Climate & Location</p>
                  <p className="text-[10px] text-[#8c909f]">{profile.location} ({profile.temperature})</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setIsClimateModalOpen(true);
                  }}
                  className="px-3 py-1 bg-[#262a33] hover:bg-[#31353e] text-[#adc6ff] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  Settings
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#c2c6d6] hover:bg-[#262a33] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-profile-btn"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#adc6ff] text-[#00285d] rounded-xl hover:bg-[#adc6ff]/90 cursor-pointer flex items-center gap-1.5"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
