import React from 'react';
import { 
  Building2, MapPin, Shield, BedDouble, Calendar, 
  Heart, ArrowRight, Star, ExternalLink, ArrowLeftRight 
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';

export function PropertyCard({ 
  project, 
  onSelect, 
  onSelectLegal, 
  onToggleWishlist, 
  isWishlisted,
  onToggleCompare,
  isCompared 
}) {
  if (!project) return null;

  const targetId = project.id || project.property_id;

  return (
    <Card 
      onClick={() => onSelect && onSelect(targetId)}
      className="group relative overflow-hidden border bg-card hover:shadow-2xl transition-all duration-300 rounded-2xl flex flex-col justify-between cursor-pointer"
    >
      {/* Diagonal Light Sweep Shine Effect on Hover */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl">
        <div className="w-1/2 h-[250%] bg-gradient-to-r from-transparent via-white/35 dark:via-white/15 to-transparent -rotate-45 -translate-x-[200%] -translate-y-1/2 group-hover:translate-x-[350%] group-hover:translate-y-1/2 transition-transform duration-1000 ease-in-out" />
      </div>

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
            {project.badges
              ?.filter((badge) => badge && !badge.toLowerCase().includes('legal'))
              .map((badge, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-background/90 text-foreground backdrop-blur-md shadow-sm border border-white/20"
                >
                  {badge === "RERA Verified" && <Shield className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />}
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
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${
              isWishlisted
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                : "bg-black/40 text-white hover:bg-white hover:text-rose-600"
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white text-white" : ""}`} />
          </button>

          {/* Title & Price Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
            <div>
              <h3 className="text-lg font-bold tracking-tight drop-shadow-sm line-clamp-1">
                {project.name}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-white/70 block">Asking price</span>
              <span className="text-base font-extrabold text-amber-400">
                {project.price}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body Content */}
        <CardContent className="p-4 space-y-3">
          {/* Address / Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium" title={project.address || project.location}>
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{project.address || project.location}</span>
          </div>

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

      {/* Card Footer Action Buttons (Details | Compare | Legal) */}
      <div className="p-4 pt-0 grid grid-cols-3 gap-1.5">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(targetId);
          }}
          className="w-full flex items-center justify-center gap-1 rounded-xl text-[11px] font-bold"
          variant="outline"
        >
          <span>Details</span>
        </Button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare && onToggleCompare(targetId);
          }}
          className={`w-full flex items-center justify-center gap-1 rounded-xl text-[11px] font-bold ${
            isCompared 
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted/40 text-foreground border-border hover:bg-muted"
          }`}
          variant="outline"
        >
          <ArrowLeftRight className="w-3 h-3" />
          <span>{isCompared ? "Compared" : "Compare"}</span>
        </Button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectLegal) {
              onSelectLegal(targetId);
            } else if (onSelect) {
              onSelect(targetId, 'legal');
            }
          }}
          className="w-full flex items-center justify-center gap-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          variant="outline"
        >
          <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Legal</span>
        </Button>
      </div>
    </Card>
  );
}

export default PropertyCard;
