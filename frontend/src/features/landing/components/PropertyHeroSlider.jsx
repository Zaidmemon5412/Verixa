import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PROJECTS } from '../../properties/constants/propertyData';

export function PropertyHeroSlider() {
  // 4 property photos in order
  const images = PROJECTS.slice(0, 4).map(p => p.image);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  // Auto slide every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [images.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) handleNext();
    else if (delta < -40) handlePrev();
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group select-none aspect-[16/11] sm:aspect-[4/3]"
    >
      {/* ─── PURE IMAGE SLIDESHOW ────────────────────────────────────────── */}
      {images.map((imgUrl, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={imgUrl}
              alt={`Property Photo ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}

      {/* Left / Right Arrows (always visible on mobile touch, hover on desktop) */}
      <button
        onClick={handlePrev}
        aria-label="Previous Image"
        className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Image"
        className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Sleek Dot Indicators at Bottom */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to photo ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
