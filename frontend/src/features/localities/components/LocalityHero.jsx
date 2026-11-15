import React from 'react';
import { MapPin, Shield, Activity } from 'lucide-react';

export function LocalityHero({ locality }) {
  if (!locality) return null;

  const trafficColor = 
    locality.traffic === 'Low' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
    locality.traffic === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
    'bg-amber-500/20 text-amber-300 border-amber-400/30';

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] min-h-[210px] sm:min-h-[280px] rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-xl bg-muted group">
      {/* Background Cover Image with Gradient */}
      <img
        src={locality.image}
        alt={locality.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

      {/* Traffic Badge Overlay (Top Right) */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10">
        <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold backdrop-blur-md border shadow-sm ${trafficColor}`}>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{locality.traffic || 'Medium'} Traffic</span>
        </span>
      </div>

      {/* Hero Header Details (Bottom Left) */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 z-10 space-y-1.5 sm:space-y-2 text-white">
        <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-400 block">
          {locality.city || 'AHMEDABAD'}
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
          {locality.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs md:text-sm font-medium text-white/90 drop-shadow">
          <span>Avg {locality.avgPrice}</span>
          <span className="text-white/40">•</span>
          <span>{locality.psf}/sqft</span>
          <span className="text-white/40">•</span>
          <span>Yield {locality.rentalYield}</span>
        </div>
      </div>
    </div>
  );
}
