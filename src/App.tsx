import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MarketPulseBanner } from './components/markets/MarketPulseBanner';
import { PortfolioOverviewView } from './components/portfolio/PortfolioOverviewView';
import { AssetPageView } from './components/asset/AssetPageView';
import { StockDirectoryView } from './components/markets/StockDirectoryView';
import { TradingTerminalView } from './components/trading/TradingTerminalView';
import { FinancialExplorerView } from './components/terminal/FinancialExplorerView';
import { EventArenaView } from './components/events/EventArenaView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { AcademyLabView } from './components/academy/AcademyLabView';
import { TradingFloorView } from './components/community/TradingFloorView';
import { ManagerStudioView } from './components/manager/ManagerStudioView';
import { SuperAdminStudioView } from './components/admin/SuperAdminStudioView';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { PriceAlertsModal } from './components/trading/PriceAlertsModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Stock } from './types';

const MainAppContent: React.FC = () => {
  const { 
    stocks, 
    setSelectedStock, 
    setActiveAccountId, 
    isAuthenticated, 
    currentUser,
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    clearTriggeredAlerts
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('portfolio');
  const [selectedAssetTicker, setSelectedAssetTicker] = useState<string>('ZENITHBANK');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPriceAlertsModalOpen, setIsPriceAlertsModalOpen] = useState<boolean>(false);
  const [leaderboardEventId, setLeaderboardEventId] = useState<string | undefined>(undefined);

  // When clicking on an asset from portfolio or stock directory
  const handleSelectAsset = (ticker: string) => {
    setSelectedAssetTicker(ticker);
    setActiveTab('asset-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStockToTrade = (stock: Stock) => {
    setSelectedStock(stock);
    setSelectedAssetTicker(stock.ticker);
    setActiveTab('asset-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectFundamentals = (stock: Stock) => {
    setSelectedStock(stock);
    setActiveTab('terminal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterEventTrading = (eventId: string) => {
    setActiveAccountId(eventId);
    setActiveTab('portfolio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewLeaderboard = (eventId: string) => {
    setLeaderboardEventId(eventId);
    setActiveTab('leaderboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 flex flex-col selection:bg-gold-500/30 selection:text-gold-300">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={
          activeTab === 'asset-detail' ? 'portfolio' : 
          activeTab === 'trade' ? 'markets' : 
          activeTab
        }
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenPriceAlerts={() => setIsPriceAlertsModalOpen(true)}
      />

      {/* Module 1: Live All-Share Index (ASI) Ticker & Market Pulse Strip */}
      <MarketPulseBanner onSelectStock={handleSelectAsset} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 lg:py-6">
        
        {/* Secondary Sub-Navigation for Markets / Live Terminal */}
        {(activeTab === 'markets' || activeTab === 'trade') && (
          <div className="flex items-center gap-2 mb-5 border-b border-navy-700/60 pb-3">
            <button
              onClick={() => setActiveTab('markets')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'markets'
                  ? 'bg-gold-500 text-navy-950 shadow-md font-extrabold'
                  : 'bg-navy-800 text-slate-400 hover:text-white'
              }`}
            >
              All NGX Equities Directory
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'trade'
                  ? 'bg-gold-500 text-navy-950 shadow-md font-extrabold'
                  : 'bg-navy-800 text-slate-400 hover:text-white'
              }`}
            >
              Multi-Asset Terminal & Depth
            </button>
          </div>
        )}

        {/* View Routing with Error Boundaries */}
        <ErrorBoundary fallbackMessage="Unable to load this section. Please click Retry View or choose another tab from the navigation.">
          
          {/* 1. Portfolio Overview (Default Home) */}
          {activeTab === 'portfolio' && (
            <PortfolioOverviewView
              onSelectAsset={handleSelectAsset}
              onExploreMarkets={() => setActiveTab('markets')}
            />
          )}

          {/* 2. Dedicated Single-Asset Page */}
          {activeTab === 'asset-detail' && (
            <AssetPageView
              ticker={selectedAssetTicker}
              onBack={() => setActiveTab('portfolio')}
              onInspectFundamentals={handleInspectFundamentals}
            />
          )}

          {/* 3. NGX Equities Markets Directory */}
          {activeTab === 'markets' && (
            <StockDirectoryView
              onSelectStockToTrade={handleSelectStockToTrade}
              onInspectFundamentals={handleInspectFundamentals}
            />
          )}

          {/* 4. Multi-Stock Trading Terminal */}
          {activeTab === 'trade' && (
            <TradingTerminalView
              onInspectFundamentals={handleInspectFundamentals}
            />
          )}

          {/* 5. PSA Terminal (3-Statement Teardown) */}
          {activeTab === 'terminal' && (
            <FinancialExplorerView
              onTradeStock={handleSelectStockToTrade}
            />
          )}

          {/* 6. Challenge Arena */}
          {activeTab === 'events' && (
            <EventArenaView
              onEnterEventTrading={handleEnterEventTrading}
              onViewLeaderboard={handleViewLeaderboard}
            />
          )}

          {/* 7. Realtime Leaderboard */}
          {activeTab === 'leaderboard' && (
            <LeaderboardView
              initialEventId={leaderboardEventId}
              onTradeNow={() => setActiveTab('portfolio')}
            />
          )}

          {/* 8. Module 2: Interactive Academy Lab & Guided Quests */}
          {activeTab === 'academy' && (
            <AcademyLabView
              onExploreStock={handleSelectAsset}
              onNavigateToTrade={() => setActiveTab('markets')}
            />
          )}

          {/* 9. Module 5: The Trading Floor (Community Theses & Certification) */}
          {activeTab === 'community' && (
            <TradingFloorView
              onSelectStock={handleSelectAsset}
            />
          )}

          {/* 10. Manager Studio */}
          {activeTab === 'manager' && (
            <ManagerStudioView />
          )}

          {/* 11. Super Admin Studio */}
          {activeTab === 'admin' && (
            <SuperAdminStudioView />
          )}

        </ErrorBoundary>
      </main>

      {/* Mandatory Attribution Footer */}
      <Footer />

      {/* User Progression & Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Authentication Modal (Shows if user clicks Sign In or if not authenticated) */}
      <AuthModal
        isOpen={isAuthModalOpen || !isAuthenticated}
        onClose={() => setIsAuthModalOpen(false)}
        canClose={isAuthenticated}
      />

      {/* Module 6: Real-Time Price Alerts Modal */}
      <PriceAlertsModal
        isOpen={isPriceAlertsModalOpen}
        onClose={() => setIsPriceAlertsModalOpen(false)}
        stocks={stocks}
        alerts={priceAlerts}
        onAddAlert={addPriceAlert}
        onRemoveAlert={removePriceAlert}
        onClearTriggered={clearTriggeredAlerts}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
