import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../services/feeEngine';
import { 
  TrendingUp, 
  Wallet, 
  Award, 
  Shield, 
  Play, 
  Pause, 
  Layers, 
  UserCheck, 
  Menu, 
  X, 
  ChevronDown,
  BarChart3,
  BookOpen,
  Trophy,
  Sliders,
  Sparkles,
  Briefcase,
  ShieldCheck,
  LogOut,
  LogIn,
  GraduationCap,
  MessageSquare,
  Bell,
  RefreshCw,
  CheckCircle2,
  MoreHorizontal,
  Download,
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenAuthModal: () => void;
  onOpenPriceAlerts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenProfile, 
  onOpenAuthModal,
  onOpenPriceAlerts 
}) => {
  const { 
    currentUser, 
    users, 
    switchUserById, 
    activeAccountId, 
    setActiveAccountId, 
    activeAccount, 
    userAccounts,
    isSimulating,
    toggleSimulation,
    isLiveTradingViewSynced,
    lastTradingViewSyncTime,
    syncTradingViewQuotes,
    isAuthenticated,
    logout,
    priceAlerts
  } = useApp();

  const [isSyncingTV, setIsSyncingTV] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      alert('To install PSA Broker on your device:\n\n• On iPhone / iPad (Safari): Tap the Share button at the bottom, then choose "Add to Home Screen".\n• On Android (Chrome): Tap the three dots menu in the browser, then select "Install app" or "Add to Home screen".\n• On Desktop (Chrome/Edge): Click the Install icon in the browser address bar.');
    }
  };

  const primaryNavItems = [
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'markets', label: 'Markets', icon: BarChart3 },
    { id: 'academy', label: 'Academy Lab', icon: GraduationCap },
    { id: 'community', label: 'Trading Floor', icon: MessageSquare },
    { id: 'terminal', label: 'Terminal', icon: BookOpen },
    { id: 'events', label: 'Challenge Arena', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    ...(currentUser.role === 'ADMIN'
      ? [{ id: 'admin', label: 'Super Admin', icon: ShieldCheck }]
      : currentUser.role === 'MANAGER'
        ? [{ id: 'manager', label: 'Manager Studio', icon: Sliders }]
        : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur-md border-b border-navy-700/80 shadow-lg">
      
      {/* Top Institutional Partner Sub-Bar */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border-b border-navy-700/50 px-3 sm:px-6 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 text-slate-300 shrink-0">
            <span className={`flex h-2 w-2 rounded-full shrink-0 ${isSimulating ? 'bg-bull animate-pulse' : 'bg-gold-500'}`}></span>
            <span className="font-semibold text-gold-400 hidden xs:inline">NGX:</span>
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px] sm:max-w-none">
              {isSimulating ? 'Simulation Active' : 'NGX Official Live Fix'}
            </span>
            <button 
              onClick={toggleSimulation}
              className={`flex items-center gap-1 ml-1 px-2 py-0.5 rounded transition-all font-semibold text-[10px] shrink-0 ${
                isSimulating 
                  ? 'bg-gold-500 text-navy-950 font-bold shadow-sm' 
                  : 'bg-navy-700 hover:bg-navy-600 text-slate-300 border border-navy-600'
              }`}
              title={isSimulating ? 'Freeze prices to official NGX close' : 'Enable educational tick generator'}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-2.5 h-2.5 text-navy-950" />
                  <span className="hidden sm:inline">Active</span>
                </>
              ) : (
                <>
                  <Play className="w-2.5 h-2.5 text-gold-400" />
                  <span className="hidden sm:inline">Off</span>
                </>
              )}
            </button>

            {/* TradingView Live Feed Status & Quick Sync */}
            <div className="flex items-center gap-1.5 ml-1.5 pl-1.5 border-l border-navy-700/60 shrink-0">
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isLiveTradingViewSynced ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gold-400'}`}></span>
              <span className="text-[10px] text-slate-300 font-medium hidden sm:inline">
                TradingView: <span className="font-semibold text-white">{isLiveTradingViewSynced ? '10s Sync' : 'Cache'}</span>
              </span>
              {lastTradingViewSyncTime && (
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  ({lastTradingViewSyncTime})
                </span>
              )}
              <button
                onClick={async () => {
                  setIsSyncingTV(true);
                  await syncTradingViewQuotes();
                  setTimeout(() => setIsSyncingTV(false), 500);
                }}
                disabled={isSyncingTV}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-navy-800 hover:bg-navy-700 text-gold-400 border border-gold-500/30 hover:border-gold-500 transition-all shrink-0 disabled:opacity-50"
                title="Sync latest live prices, volumes and market rates from TradingView official NGX scanner"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncingTV ? 'animate-spin' : ''}`} />
                <span>{isSyncingTV ? '...' : 'Sync'}</span>
              </button>
            </div>
          </div>

          {/* Demo Persona Switcher & Auth State */}
          <div className="flex items-center gap-2 shrink-0">
            {!isAppInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow transition-all shrink-0 border border-emerald-500/40"
                title="Install PSA Broker Progressive Web App on your phone or desktop"
              >
                <Download className="w-2.5 h-2.5" />
                <span>Install App</span>
              </button>
            )}

            <div className="relative flex items-center gap-1.5">
              <button
                onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy-700/80 hover:bg-navy-600 border border-gold-500/30 text-gold-300 transition-all text-[10px] sm:text-[11px] font-medium"
              >
                <UserCheck className="w-3 h-3 text-gold-400 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-none">{currentUser.fullName}</span>
                <span className="text-[9px] font-bold uppercase text-slate-400">({currentUser.role})</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-70" />
              </button>

              {isUserSwitcherOpen && (
                <div className="absolute right-0 top-7 w-64 bg-navy-900 border border-navy-600 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 border-b border-navy-700/60 text-[11px] font-semibold text-slate-400">
                    Switch Active Persona
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserById(u.id);
                        setIsUserSwitcherOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-navy-800 transition-colors ${
                        u.id === currentUser.id ? 'bg-navy-800/80 text-gold-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{u.fullName}</div>
                        <div className="text-[10px] text-slate-400">{u.handle} • {u.rankTier}</div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40' :
                        u.role === 'MANAGER' ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40' :
                        'bg-navy-700 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 hover:text-bear transition-colors px-2 py-0.5 rounded border border-navy-700 hover:border-bear/40 shrink-0"
                title="Sign Out of Session"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-2 py-0.5 rounded transition-all shadow-sm shrink-0"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo & Strategic Partner */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('portfolio')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-navy-950 font-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
                    PSA <span className="text-gold-400 font-black">Broker</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30 font-semibold tracking-wider">
                    NGX
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 hidden sm:flex items-center gap-1">
                  <span>Partnership with</span>
                  <span className="text-gold-300 font-medium">Naira Stock Academy</span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Responsive layout for all screen widths) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-hidden">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-navy-800 text-gold-400 border border-gold-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Toolbar: Account Selector, Alerts & XP Wallet */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Active Account Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-navy-800/90 hover:bg-navy-700 border border-navy-600 text-left transition-all shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-bull animate-pulse shrink-0" />
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold hidden sm:flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5 text-gold-400" />
                    <span>{activeAccount.type === 'SANDBOX' ? 'Sandbox' : 'Event Account'}</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono whitespace-nowrap">
                    {formatNaira(activeAccount.cashBalance)}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
              </button>

              {isAccountDropdownOpen && (
                <div className="absolute right-0 top-12 w-72 bg-navy-900 border border-navy-600 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1 border-b border-navy-700/60 text-[11px] font-semibold text-slate-400">
                    Switch Active Portfolio Account
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {userAccounts.map(acc => {
                      const isSelected = acc.id === activeAccountId;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => {
                            setActiveAccountId(acc.id);
                            setIsAccountDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-start justify-between text-xs hover:bg-navy-800 transition-colors ${
                            isSelected ? 'bg-navy-800 text-gold-400 font-semibold' : 'text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-slate-200">{acc.name}</div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              Cash: <span className="text-slate-200">{formatNaira(acc.cashBalance)}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Val: {formatNaira(acc.portfolioValue)}
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            acc.type === 'SANDBOX' ? 'bg-navy-700 text-slate-300' : 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                          }`}>
                            {acc.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Price Alerts Bell Button */}
            <button
              onClick={onOpenPriceAlerts}
              className="relative p-2 rounded-xl bg-navy-800/90 hover:bg-navy-700 border border-navy-600 text-gold-400 transition-all shadow-sm flex items-center justify-center shrink-0"
              title="Real-Time Price Alerts"
            >
              <Bell className="w-4 h-4 text-gold-400" />
              {priceAlerts && priceAlerts.filter(a => a.isTriggered).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-bull text-white text-[9px] font-mono font-bold flex items-center justify-center animate-bounce">
                  {priceAlerts.filter(a => a.isTriggered).length}
                </span>
              )}
            </button>

            {/* Academy XP Wallet Pill */}
            <button
              onClick={onOpenProfile}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-navy-800/80 hover:bg-navy-700 border border-gold-500/30 text-gold-300 transition-all shrink-0"
              title="Academy XP & Progression Tier"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse shrink-0" />
              <div className="text-left">
                <div className="text-[9px] text-slate-400 font-semibold uppercase leading-none">XP</div>
                <div className="text-xs font-bold font-mono text-gold-400 leading-tight">{currentUser.academyXp} pts</div>
              </div>
            </button>

            {/* User Avatar & Rank Badge */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 group shrink-0"
              title="View Profile & Progression"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-gold-500/50 group-hover:border-gold-400 transition-colors shrink-0">
                <img 
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'} 
                  alt={currentUser.fullName} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </button>

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-navy-800 border border-navy-700 text-slate-300 hover:text-white shrink-0 ml-1"
              title="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-gold-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Accessible from top burger icon) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-navy-700/80 bg-navy-950/98 px-4 pt-3 pb-8 space-y-4 animate-in slide-in-from-top-2 shadow-2xl">
          {/* Mobile Account Switcher */}
          <div className="bg-navy-900 p-3 rounded-xl border border-navy-700">
            <div className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gold-400" />
              <span>Select Active Account</span>
            </div>
            <select
              value={activeAccountId}
              onChange={(e) => setActiveAccountId(e.target.value)}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white font-medium"
            >
              {userAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatNaira(acc.cashBalance)})
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Nav Links Grid */}
          <div className="grid grid-cols-2 gap-2">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-navy-800 text-gold-400 border border-gold-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-navy-850 border border-navy-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Profile & XP in Mobile Drawer */}
          <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-xs text-slate-300">Academy XP:</span>
              <span className="text-sm font-bold font-mono text-gold-400">{currentUser.academyXp} pts</span>
            </div>
            <button
              onClick={() => {
                onOpenProfile();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30 font-medium"
            >
              Profile ({currentUser.rankTier})
            </button>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Friendly) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 border-t border-navy-700/80 backdrop-blur-md lg:hidden flex items-center justify-around py-2 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-all ${
            activeTab === 'portfolio' ? 'text-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Portfolio</span>
        </button>

        <button
          onClick={() => setActiveTab('markets')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-all ${
            activeTab === 'markets' ? 'text-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Markets</span>
        </button>

        <button
          onClick={() => setActiveTab('trade')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-all ${
            activeTab === 'trade' ? 'text-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Trade</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-all ${
            activeTab === 'terminal' ? 'text-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Terminal</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-all ${
            isMobileMenuOpen ? 'text-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </div>
    </header>
  );
};
