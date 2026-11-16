import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { localityService } from '../services/localityService';
import { LocalityTabs } from '../components/LocalityTabs';
import { LocalityHero } from '../components/LocalityHero';
import { LocalityStats } from '../components/LocalityStats';
import { TrafficCard } from '../components/TrafficCard';
import { SafetyCard } from '../components/SafetyCard';
import { LocalityScorecard } from '../components/LocalityScorecard';
import { InfrastructureSection } from '../components/InfrastructureSection';
import { MarketTrendChart } from '../components/MarketTrendChart';
import { LocalityProjects } from '../components/LocalityProjects';
import { ErrorState } from '../components/ErrorState';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildBreadcrumbSchema, buildLocalitySchema } from '../../../shared/utils/seoUtils';
import {
  LocalityHeroSkeleton,
  LocalityStatsSkeleton,
  LocalityScorecardSkeleton,
  LocalityChartSkeleton
} from '../components/Skeletons';

export function LocalityDetailsPage({ localityId: propLocalityId, onSelectProject }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const activeId = propLocalityId || urlId || '1';

  const [localities, setLocalities] = useState([]);
  const [locality, setLocality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [allLocs, targetLoc] = await Promise.all([
          localityService.getLocalities(),
          localityService.getLocalityById(activeId)
        ]);
        setLocalities(allLocs || []);
        setLocality(targetLoc);
      } catch (err) {
        console.error('Failed to load locality details:', err);
        setError('Failed to fetch locality intelligence data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeId]);

  const handleSelectTab = (selected) => {
    const targetPath = `/localities/${selected.slug || selected.id}`;
    navigate(targetPath);
  };

  const handleSelectProject = (projectId) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      navigate(`/properties/${projectId}`);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState
          title="Locality Data Unavailable"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const localityCanonicalSlug = locality?.slug || activeId;
  const localityCanonicalPath = `/localities/${localityCanonicalSlug}`;

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {locality && (
        <SEOHead
          title={`${locality.name}, Ahmedabad Real Estate – Avg Price ${locality.psf}/sqft, Yield & Projects`}
          description={`In-depth real estate intelligence for ${locality.name}, Ahmedabad: average price ${locality.avgPrice} (${locality.psf}/sqft), ${locality.rentalYield} rental yield, ${locality.growthScore}/100 growth score, and verified RERA projects.`}
          canonicalPath={localityCanonicalPath}
          ogImage={locality.image}
          keywords={`${locality.name} Ahmedabad real estate, ${locality.name} property rates per sqft, ${locality.name} rental yield, Verixa`}
          schema={[
            ...buildLocalitySchema(locality),
            buildBreadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Localities', path: '/localities' },
              { name: `${locality.name}, Ahmedabad`, path: localityCanonicalPath },
            ]),
          ]}
        />
      )}
      {/* 1. Locality Tabs Header */}
      <LocalityTabs
        localities={localities}
        selectedId={locality?.id || locality?.slug || activeId}
        onSelect={handleSelectTab}
      />

      {loading ? (
        <div className="space-y-8">
          <LocalityHeroSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <LocalityStatsSkeleton />
              <LocalityChartSkeleton />
            </div>
            <div>
              <LocalityScorecardSkeleton />
            </div>
          </div>
        </div>
      ) : locality ? (
        <div className="space-y-8">
          {/* 2. Hero Banner */}
          <LocalityHero locality={locality} />

          {/* Main Content Grid: Left 2 Cols (Overview & Charts) + Right 1 Col (Scorecard) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2-Columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* 3. Analytics KPI Cards */}
              <LocalityStats locality={locality} />

              {/* 4. Traffic & Safety Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TrafficCard locality={locality} />
                <SafetyCard locality={locality} />
              </div>

              {/* 6. Infrastructure & Connectivity Section */}
              <InfrastructureSection locality={locality} />

              {/* 7. Market Trend Chart */}
              <MarketTrendChart locality={locality} />
            </div>

            {/* Right 1-Column (Sticky AI Scorecard) */}
            <div className="lg:col-span-1">
              <LocalityScorecard locality={locality} />
            </div>
          </div>

          {/* 8. Projects in Locality (Full Width 4-Column Responsive Grid) */}
          <div className="pt-4 border-t">
            <LocalityProjects
              locality={locality}
              onSelectProject={handleSelectProject}
            />
          </div>
        </div>
      ) : null}

    </div>
  );
}

export default LocalityDetailsPage;
