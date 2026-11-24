import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Shield, School, Hospital, ShoppingBag, ArrowRight } from 'lucide-react';
import { localityService } from '../services/localityService';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Button } from '../../../shared/components/ui/button';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildBreadcrumbSchema, buildItemListSchema } from '../../../shared/utils/seoUtils';
import { optimizeImageUrl } from '../../../shared/utils/imageUtils';

export function LocalitiesPage({ onSelectLocality }) {
  const [localities, setLocalities] = useState(() => localityService.getCachedLocalities() || []);
  const [loading, setLoading] = useState(() => (localityService.getCachedLocalities() || []).length === 0);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadLocalities() {
      const cached = localityService.getCachedLocalities();
      if (!cached || cached.length === 0) {
        setLoading(true);
      }
      try {
        const data = await localityService.getLocalities();
        if (isMounted && Array.isArray(data)) {
          setLocalities(data);
        }
      } catch (err) {
        console.error('Failed to load localities:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadLocalities();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (loc) => {
    if (onSelectLocality) {
      onSelectLocality(loc.slug || loc.id);
    } else {
      navigate(`/localities/${loc.slug || loc.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <SEOHead
        title="Ahmedabad Micro-Market Intelligence – Price Trends, Rental Yield & Infrastructure"
        description="Compare property rates per sqft, rental yields, metro connectivity, schools, and hospital access across Satellite, Thaltej, Gota, Sola, Chandkheda & Maninagar in Ahmedabad."
        canonicalPath="/localities"
        keywords="Ahmedabad localities, Satellite Thaltej Gota Sola Chandkheda Maninagar property rates, rental yield Ahmedabad, Verixa"
        schema={[
          buildBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Localities', path: '/localities' },
          ]),
          localities.length > 0
            ? buildItemListSchema(
                localities.map((l) => ({
                  name: `${l.name}, Ahmedabad`,
                  path: `/localities/${l.slug || l.id}`,
                })),
                'Ahmedabad Real Estate Micro-Markets'
              )
            : null,
        ].filter(Boolean)}
      />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Neighborhood Appreciation & Infrastructure Index</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Locality Growth Engine</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          In-depth market growth ratings, average sqft pricing, school density, and hospital access
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-2xl p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localities.map((loc) => (
            <Card 
              key={loc.id} 
              onClick={() => handleCardClick(loc)}
              className="group overflow-hidden rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <img 
                    src={optimizeImageUrl(loc.image, 'card')} 
                    alt={`${loc.name}, Ahmedabad Real Estate – Avg Price ${loc.psf}/sqft`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg font-bold drop-shadow-sm">
                      <Link
                        to={`/localities/${loc.slug || loc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {loc.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-white/90">Avg Price: {loc.avgPrice} ({loc.psf}/sqft)</p>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center border-b pb-3">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Rental Yield</span>
                      <span className="font-bold text-emerald-600">{loc.rentalYield}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Growth Score</span>
                      <span className="font-bold text-primary">{loc.growthScore}/100</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Metro Access</span>
                      <span className="font-bold text-foreground">{loc.infra?.metro || loc.metro}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-primary" /> {loc.infra?.schools || loc.schools} Schools
                    </span>
                    <span className="flex items-center gap-1">
                      <Hospital className="w-3.5 h-3.5 text-rose-500" /> {loc.infra?.hospitals || loc.hospitals} Hospitals
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> {loc.infra?.shopping || loc.shopping} Malls
                    </span>
                  </div>
                </CardContent>
              </div>

              <div className="px-4 pb-4">
                <Link
                  to={`/localities/${loc.slug || loc.id}`}
                  onClick={(e) => {
                    if (onSelectLocality) {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectLocality(loc.slug || loc.id);
                    } else {
                      e.stopPropagation();
                    }
                  }}
                  className="w-full h-10 inline-flex items-center justify-center rounded-xl text-xs font-semibold gap-1.5 border border-input bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  <span>Explore Locality Insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocalitiesPage;
