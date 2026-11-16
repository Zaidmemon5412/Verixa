import React, { useState, useEffect, useCallback } from 'react';
import { marketService } from '../services/marketService';

import { MarketHeroHeader } from '../components/MarketHeroHeader';
import { MarketKpiCards } from '../components/MarketKpiCards';
import { PriceTrendChart } from '../components/PriceTrendChart';
import { MarketHeatMapTable } from '../components/MarketHeatMapTable';
import { DemandSupplySection } from '../components/DemandSupplySection';
import { BuilderIntelligenceSection } from '../components/BuilderIntelligenceSection';
import { PropertyTypeRentalSection } from '../components/PropertyTypeRentalSection';
import { SearchTrendsInvestmentSection } from '../components/SearchTrendsInvestmentSection';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildBreadcrumbSchema } from '../../../shared/utils/seoUtils';

export function MarketTrendsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Global Smart Filters State
  const [filters, setFilters] = useState({
    city: 'Ahmedabad',
    locality: 'All',
    propertyType: 'All',
    bhk: 'All',
    budget: 'All',
    timeframe: '6M'
  });

  // Market Intelligence Data State
  const [marketData, setMarketData] = useState(null);

  const fetchAnalytics = useCallback(async (activeFilters) => {
    setIsLoading(true);
    try {
      const data = await marketService.getMarketTrends(activeFilters);
      setMarketData(data);
    } catch (error) {
      console.warn("Market analytics fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(filters);
  }, [filters, fetchAnalytics]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      city: 'Ahmedabad',
      locality: 'All',
      propertyType: 'All',
      bhk: 'All',
      budget: 'All',
      timeframe: '6M'
    });
  };

  const handleTimeframeChange = (timeframe) => {
    setFilters(prev => ({ ...prev, timeframe }));
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <SEOHead
        title="Ahmedabad Real Estate Market Trends, Price per Sqft & Investment Heat Map"
        description="Live real estate price trajectory, demand vs supply velocity, locality heat map rankings, builder market share, and rental yield analytics in Ahmedabad."
        canonicalPath="/market"
        keywords="Ahmedabad real estate market trends, property price per sqft Ahmedabad, locality heat map, rental yield forecast, Verixa"
        schema={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Market Trends', path: '/market' },
        ])}
      />
      {/* 1. Hero Header & Global Smart Filters */}
      <MarketHeroHeader 
        healthData={marketData?.marketHealth}
        marketInsights={marketData?.marketInsights || marketData?.aiInsights}
        isLiveDb={marketData?.isLiveDb}
        totalDbRecords={marketData?.totalDbRecords}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        availableLocalities={marketData?.availableLocalities}
      />

      {/* 2. Key Market Metrics Cards */}
      <MarketKpiCards 
        isLoading={isLoading} 
        totalListings={marketData?.totalDbRecords}
        kpiMetrics={marketData?.kpiMetrics}
      />

      {/* 3. Interactive Price Trend Trajectory Chart */}
      <PriceTrendChart 
        trendData={marketData?.historicalTrends}
        isLoading={isLoading}
        activeTimeframe={filters.timeframe}
        onTimeframeChange={handleTimeframeChange}
      />

      {/* 4. Demand vs Supply Analytics */}
      <DemandSupplySection 
        demandSupplyData={marketData?.demandSupply}
        isLoading={isLoading}
      />

      {/* 5. Locality Performance Heat Map Table */}
      <MarketHeatMapTable 
        localityData={marketData?.localityHeatmap}
        isLoading={isLoading}
      />

      {/* 6. Builder Intelligence & Market Share */}
      <BuilderIntelligenceSection 
        buildersData={marketData?.builderIntelligence}
        isLoading={isLoading}
      />

      {/* 7. Property Asset Class & Rental Analytics */}
      <PropertyTypeRentalSection 
        propertyTypes={marketData?.propertyTypes}
        rentalData={marketData?.rentalAnalytics}
        isLoading={isLoading}
      />

      {/* 8. Consumer Search Trends & Investment Opportunity Scoring */}
      <SearchTrendsInvestmentSection 
        searchData={marketData?.searchTrends}
        investmentData={marketData?.investmentScore}
        isLoading={isLoading}
      />
    </div>
  );
}

export default MarketTrendsPage;
