import React, { useState, useEffect } from 'react';
import { MainLayout } from './shared/layouts/MainLayout';
import { LandingPage } from './features/landing/pages/LandingPage';
import { PropertiesPage } from './features/properties/pages/PropertiesPage';
import { PropertyDetailPage } from './features/properties/pages/PropertyDetailPage';
import { BuildersPage } from './features/builders/pages/BuildersPage';
import { LocalitiesPage } from './features/localities/pages/LocalitiesPage';
import { ComparisonPage } from './features/comparison/pages/ComparisonPage';
import { MarketTrendsPage } from './features/market/pages/MarketTrendsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedBuilderId, setSelectedBuilderId] = useState(null);
  const [wishlist, setWishlist] = useState(['1', '3']);
  const [isDark, setIsDark] = useState(false);

  // Sync dark mode class with root html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  const handleNavigate = (page, id = null) => {
    setActiveTab(page);
    if (page === 'detail') {
      setSelectedProjectId(id || '1');
    } else if (page === 'builder') {
      setSelectedBuilderId(id || '1');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectProject={(id) => handleNavigate('detail', id)}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        );
      case 'projects':
        return (
          <PropertiesPage
            onSelectProject={(id) => handleNavigate('detail', id)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        );
      case 'detail':
        return (
          <PropertyDetailPage
            projectId={selectedProjectId}
            onBack={() => handleNavigate('projects')}
            onSelectBuilder={(bId) => handleNavigate('builder', bId)}
          />
        );
      case 'builders':
      case 'builder':
        return (
          <BuildersPage
            onSelectBuilder={(bId) => handleNavigate('builder', bId)}
          />
        );
      case 'localities':
      case 'locality':
        return <LocalitiesPage />;
      case 'compare':
        return (
          <ComparisonPage
            selectedIds={wishlist.length >= 2 ? wishlist.slice(0, 2) : ['1', '2']}
            onSelectProject={(id) => handleNavigate('detail', id)}
          />
        );
      case 'market':
        return <MarketTrendsPage />;
      case 'wishlist':
        return (
          <PropertiesPage
            onSelectProject={(id) => handleNavigate('detail', id)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        );
      default:
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectProject={(id) => handleNavigate('detail', id)}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        );
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onNavigate={handleNavigate}
      wishlistCount={wishlist.length}
      isDark={isDark}
      toggleDarkMode={toggleDarkMode}
    >
      {renderContent()}
    </MainLayout>
  );
}
