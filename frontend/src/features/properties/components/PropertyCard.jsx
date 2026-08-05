import React from 'react';
import { 
  Building2, MapPin, Shield, BedDouble, Calendar, 
  Heart, ArrowRight, Star, ExternalLink 
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';

export function PropertyCard({ project, onSelect, onToggleWishlist, isWishlisted }) {
  if (!project) return null;

  return (
    <Card 
      onClick={() => onSelect && onSelect(project.id)}
      className="group overflow-hidden border bg-card hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Media Header */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {project.badges?.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-background/90 text-foreground backdrop-blur-md shadow-sm border border-white/20"
              >
                {badge === "RERA Verified" && <Shield className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />}
                {badge}
              </span>
            ))}
          </div>

          {/* Wishlist Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist && onToggleWishlist(project.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-rose-600 transition-colors z-10"
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
          </button>

          {/* Price & Location Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
            <div>
              <p className="text-xs text-white/80 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {project.location}
              </p>
              <h3 className="text-lg font-bold tracking-tight drop-shadow-sm">
                {project.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-white/70 block">Asking price</span>
              <span className="text-base font-extrabold text-amber-400">
                {project.price}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body Content */}
        <CardContent className="p-4 space-y-3">
          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/60 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-primary" />
              <span>{project.config}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{project.possession}</span>
            </div>
          </div>

          {/* Scores Overview */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-semibold border border-amber-200 dark:border-amber-800">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{project.trustScore}% Trust</span>
              </div>
              <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {project.investScore} Invest Score
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card Footer Button */}
      <div className="p-4 pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(project.id);
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl"
          variant="outline"
        >
          <span>View Property & Legal Specs</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
