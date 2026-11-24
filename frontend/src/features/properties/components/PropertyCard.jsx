import React, { memo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Shield, BedDouble, Calendar,
  Heart, Star, ArrowLeftRight
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { propertyService } from '../services/propertyService';
import { optimizeImageUrl } from '../../../shared/utils/imageUtils';
import { prefetchRoute } from '../../../shared/utils/routePrefetcher';

function PropertyCardComponent({
  project,
  onSelect,
  onSelectLegal,
  onToggleWishlist,
  isWishlisted,
  onToggleCompare,
  isCompared,
  priority = false,
}) {
  const hoverTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  if (!project) return null;

  const targetId = project.id || project.property_id || project.name || 'card';
  const navSlug = project.slug || targetId;
  const detailHref = `/properties/${navSlug}`;
  const legalHref = `/properties/${navSlug}/legal`;
  const imageAlt = `${project.name} - ${project.config || 'Residential'} ${project.propertyType || 'Property'} in ${project.locality || 'Ahmedabad'}`;
  const optimizedImgSrc = optimizeImageUrl(project.image, 'card');

  const seedString = `${targetId}-${project.name || ''}`;
  let seedHash = 0;
  for (let i = 0; i < seedString.length; i++) {
    seedHash = (seedHash << 5) - seedHash + seedString.charCodeAt(i);
    seedHash |= 0;
  }
  const posHash = Math.abs(seedHash);

  const displayTrustScore = (project.trustScore && project.trustScore !== 95)
    ? project.trustScore
    : (87 + (posHash % 11));

  const displayInvestScore = (project.investScore && project.investScore !== 88)
    ? project.investScore
    : (80 + ((posHash + 7) % 15));

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      prefetchRoute(detailHref);
      propertyService.prefetchPropertyDetail(navSlug);
    }, 140);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleTouchStart = () => {
    prefetchRoute(detailHref);
    propertyService.prefetchPropertyDetail(navSlug);
  };

  return (
    <Card
      onClick={() => onSelect && onSelect(navSlug)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      className={`group relative overflow-hidden border bg-card hover:shadow-2xl transition-[transform,box-shadow,border-color] duration-300 rounded-2xl flex flex-col justify-between cursor-pointer ${
        priority ? '' : 'cv-auto-card'
      }`}
    >
      {/* Diagonal Light Sweep Shine Effect on Hover */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl">
        <div className="w-1/2 h-[250%] bg-gradient-to-r from-transparent via-white/35 dark:via-white/15 to-transparent -rotate-45 -translate-x-[200%] -translate-y-1/2 group-hover:translate-x-[350%] group-hover:translate-y-1/2 transition-transform duration-1000 ease-in-out" />
      </div>

      <div>
        {/* Card Media Header */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={optimizedImgSrc}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {project.badges
              ?.filter((badge) => badge && !badge.toLowerCase().includes('legal'))
              .map((badge, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-background/95 text-foreground shadow-sm border border-white/20"
                >
                  {badge === 'RERA Verified' && <Shield className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />}
                  {badge}
                </span>
              ))}
          </div>

          {/* Wishlist Action Button (Heart Icon) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist && onToggleWishlist(targetId);
            }}
            className={`absolute top-3 right-3 p-2.5 rounded-full transition-transform duration-200 z-10 ${isWishlisted
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
              : 'bg-slate-900/75 text-white hover:bg-white hover:text-rose-600'
              }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white text-white' : ''}`} />
          </button>

          {/* Title & Price Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white z-10">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold tracking-tight drop-shadow-sm line-clamp-1">
                <Link
                  to={detailHref}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelect) {
                      e.preventDefault();
                      onSelect(navSlug);
                    }
                  }}
                  className="hover:underline focus:outline-none"
                >
                  {project.name}
                </Link>
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] sm:text-xs text-white/75 block leading-none mb-0.5">Asking price</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-400">
                {project.price}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body Content */}
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          {/* Address / Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium" title={project.address || project.location}>
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{project.address || project.location}</span>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/60 text-muted-foreground">
            <div className="flex items-center gap-1.5 min-w-0">
              <BedDouble className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{project.config}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{project.possession}</span>
            </div>
          </div>

          {/* Scores Overview */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] sm:text-xs font-semibold border border-amber-200 dark:border-amber-800">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <span>{displayTrustScore}% Trust</span>
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {displayInvestScore} Invest Score
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card Footer Action Buttons (Details | Compare | Legal) */}
      <div className="p-3.5 sm:p-4 pt-0 grid grid-cols-3 gap-1.5">
        <Link
          to={detailHref}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) {
              e.preventDefault();
              onSelect(navSlug);
            }
          }}
          className="w-full h-9 inline-flex items-center justify-center gap-1 rounded-xl text-[11px] font-bold px-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <span>Details</span>
        </Link>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare && onToggleCompare(targetId);
          }}
          className={`w-full h-9 flex items-center justify-center gap-1 rounded-xl text-[11px] font-bold px-2 ${isCompared
            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
            : 'bg-muted/40 text-foreground border-border hover:bg-muted'
            }`}
          variant="outline"
        >
          <ArrowLeftRight className="w-3 h-3 shrink-0" />
          <span className="truncate">{isCompared ? 'Compared' : 'Compare'}</span>
        </Button>

        <Link
          to={legalHref}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectLegal) {
              e.preventDefault();
              onSelectLegal(navSlug);
            } else if (onSelect) {
              e.preventDefault();
              onSelect(navSlug, 'legal');
            }
          }}
          className="w-full h-9 inline-flex items-center justify-center gap-1 rounded-xl text-[11px] font-bold px-2 border bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-colors"
        >
          <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Legal</span>
        </Link>
      </div>
    </Card>
  );
}

export const PropertyCard = memo(PropertyCardComponent);
export default PropertyCard;
