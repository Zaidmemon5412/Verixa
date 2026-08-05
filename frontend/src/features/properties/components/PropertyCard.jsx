import React, { useState } from 'react';
import { 
  Building2, MapPin, Shield, BedDouble, Calendar, 
  Heart, ArrowRight, Star, ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';

const DEFAULT_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop&auto=format";

export function PropertyCard({ project, onSelect, onSelectLegal, onToggleWishlist, isWishlisted }) {
  if (!project) return null;

  const targetId = project.id || project.property_id;
  const rawGallery = Array.isArray(project.images) && project.images.length > 0
    ? project.images
    : [project.image || DEFAULT_IMAGE_FALLBACK];

  const galleryImages = rawGallery.map(img => typeof img === 'string' ? img : (img.image || img.image_url || DEFAULT_IMAGE_FALLBACK));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setImageError(false);
    setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setImageError(false);
    setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, idx) => {
    e.stopPropagation();
    setImageError(false);
    setCurrentImageIndex(idx);
  };

  const activeImageUrl = imageError
    ? DEFAULT_IMAGE_FALLBACK
    : (galleryImages[currentImageIndex] || DEFAULT_IMAGE_FALLBACK);

  return (
    <Card 
      onClick={() => onSelect && onSelect(targetId)}
      className="group relative overflow-hidden border bg-card hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 rounded-2xl flex flex-col justify-between cursor-pointer"
    >
      {/* Diagonal Light Sweep Shine Effect on Hover */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl">
        <div className="w-1/2 h-[250%] bg-gradient-to-r from-transparent via-white/35 dark:via-white/15 to-transparent -rotate-45 -translate-x-[200%] -translate-y-1/2 group-hover:translate-x-[350%] group-hover:translate-y-1/2 transition-transform duration-1000 ease-in-out" />
      </div>

      <div>
        {/* Card Media Header & Image Carousel */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            key={currentImageIndex}
            src={activeImageUrl}
            alt={project.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
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
              onToggleWishlist && onToggleWishlist(targetId);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-rose-600 transition-colors z-20"
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
          </button>

          {/* Image Count Badge */}
          {galleryImages.length > 1 && (
            <div className="absolute top-12 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold z-20 flex items-center gap-1 border border-white/10">
              <ImageIcon className="w-3 h-3" />
              <span>{currentImageIndex + 1}/{galleryImages.length}</span>
            </div>
          )}

          {/* Carousel Next & Prev Controls (Visible on Hover) */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-sm"
                title="Previous Image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-sm"
                title="Next Image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Carousel Pagination Dots */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-1.5 z-20 pointer-events-auto">
              {galleryImages.slice(0, 7).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentImageIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Price & Location Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-20">
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

      {/* Card Footer Dual Action Buttons */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2 z-20 relative">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect && onSelect(targetId);
          }}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold"
          variant="outline"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
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
          className="w-full flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          variant="outline"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Legal Specs</span>
        </Button>
      </div>
    </Card>
  );
}
