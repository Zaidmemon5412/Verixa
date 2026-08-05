import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Shield, School, Hospital, ShoppingBag, ArrowRight } from 'lucide-react';
import { localityService } from '../services/localityService';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Button } from '../../../shared/components/ui/button';

export function LocalitiesPage({ onSelectLocality }) {
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadLocalities() {
      setLoading(true);
      try {
        const data = await localityService.getLocalities();
        setLocalities(data);
      } catch (err) {
        console.error('Failed to load localities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLocalities();
  }, []);

  const handleCardClick = (loc) => {
    if (onSelectLocality) {
      onSelectLocality(loc.slug || loc.id);
    } else {
      navigate(`/locality/${loc.slug || loc.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Neighborhood Appreciation & Infrastructure Index</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Locality Growth Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
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
                    src={loc.image} 
                    alt={loc.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg font-bold drop-shadow-sm">{loc.name}</h3>
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
                <Button variant="outline" className="w-full text-xs font-semibold rounded-xl gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <span>Explore Locality Insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocalitiesPage;
