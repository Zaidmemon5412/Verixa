import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Tag 
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import apiClient from '../../../shared/services/apiClient';
import { mapApiBuilderProjectToUi } from '../../builders/services/builderService';

export function FeaturedNewLaunchesSection({ onNavigate, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Responsive cards per page calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch projects dynamically from backend REST APIs
  useEffect(() => {
    let isMounted = true;
    async function fetchFeaturedLaunches() {
      setIsLoading(true);
      try {
        // Query builder projects list endpoint
        const response = await apiClient.get('/builders/projects/?page_size=20');
        const resData = response?.data?.data || response?.data || response;
        const rawResults = resData?.results || (Array.isArray(resData) ? resData : []);

        let mapped = rawResults.map(mapApiBuilderProjectToUi).filter(Boolean);

        // Fallback to properties list if builder projects is empty
        if (mapped.length === 0) {
          const propsRes = await apiClient.get('/properties/?page_size=20');
          const rawProps = propsRes?.data?.results || propsRes?.results || (Array.isArray(propsRes) ? propsRes : []);
          mapped = rawProps.map(mapApiBuilderProjectToUi).filter(Boolean);
        }

        if (isMounted) {
          setProjects(mapped);
        }
      } catch (error) {
        console.warn('FeaturedNewLaunchesSection: Error fetching API projects:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFeaturedLaunches();
    return () => { isMounted = false; };
  }, []);

  const totalProjects = projects.length;
  const maxIndex = Math.max(0, totalProjects - cardsPerPage);

  const handleNext = useCallback(() => {
    if (totalProjects === 0) return;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [totalProjects, maxIndex]);

  const handlePrev = useCallback(() => {
    if (totalProjects === 0) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [totalProjects, maxIndex]);

  // Auto-slide every 5 seconds (5000ms) with pause on hover
  useEffect(() => {
    if (isPaused || totalProjects === 0 || isLoading) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, totalProjects, isLoading, handleNext]);

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  // Click Handlers
  const handleProjectClick = (projectId) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else if (onNavigate) {
      onNavigate('detail', projectId);
    }
  };

  const handleBuilderClick = (e, builderId) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate('builder', builderId);
    }
  };

  const handleViewAllClick = () => {
    if (onNavigate) {
      onNavigate('projects');
    }
  };

  // Render Skeleton when loading
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl hidden sm:block" />
          <Skeleton className="h-96 rounded-3xl hidden lg:block" />
        </div>
      </section>
    );
  }

  if (totalProjects === 0) {
    return null;
  }

  // Display slice of visible projects for current carousel slide
  const visibleProjects = projects.slice(currentIndex, currentIndex + cardsPerPage);
  // Pad if loop end reached
  if (visibleProjects.length < cardsPerPage && totalProjects >= cardsPerPage) {
    visibleProjects.push(...projects.slice(0, cardsPerPage - visibleProjects.length));
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* ─── SECTION HEADER ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Partnerships</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>✨ Featured New Launches</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Discover premium projects from our verified builder partners.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Navigation Prev / Next Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-border/70 hover:bg-primary/10 hover:text-primary transition-all shadow-xs"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-border/70 hover:bg-primary/10 hover:text-primary transition-all shadow-xs"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <Button
            onClick={handleViewAllClick}
            variant="ghost"
            className="text-primary hover:text-primary/80 font-bold gap-1 text-sm rounded-xl"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ─── CAROUSEL CONTAINER ──────────────────────────────────────────────── */}
      <div 
        className="relative overflow-hidden pt-2 pb-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out">
          {visibleProjects.map((project, idx) => (
            <Card 
              key={`${project.id}-${idx}`}
              onClick={() => handleProjectClick(project.id)}
              className="group relative rounded-3xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-2xl hover:scale-[1.015] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={project.image}
                    alt={project.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                  {/* Top Badges Bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    {/* NEW LAUNCH Ribbon */}
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3" /> NEW LAUNCH
                    </span>

                    {/* Transparent Sponsored Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/40 text-white/90 border border-white/20 backdrop-blur-md flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> Sponsored
                    </span>
                  </div>

                  {/* Price Tag Overlay on Image Bottom */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Starting Price</div>
                      <div className="text-xl font-black tracking-tight text-white drop-shadow-md">
                        {project.price}
                      </div>
                    </div>

                    {project.pricePerSqft && (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                        {project.pricePerSqft}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Body */}
                <CardContent className="p-5 space-y-4">
                  {/* Builder Name & RERA Badge */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={(e) => handleBuilderClick(e, project.builderId)}
                      className="font-extrabold text-primary hover:underline flex items-center gap-1.5 truncate text-left"
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span className="truncate">{project.builderName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500 fill-emerald-500/20" />
                    </button>

                    {project.isReraVerified && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        <span>RERA Verified</span>
                      </Badge>
                    )}
                  </div>

                  {/* Project Name & Location */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/40 text-muted-foreground">
                    <div className="bg-muted/40 p-2 rounded-xl">
                      <span className="text-[10px] font-semibold text-muted-foreground block">Type</span>
                      <strong className="text-foreground font-bold truncate block">{project.propertyType}</strong>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-xl">
                      <span className="text-[10px] font-semibold text-muted-foreground block">BHK Config</span>
                      <strong className="text-foreground font-bold truncate block">{project.primaryBhk}</strong>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Card Footer CTA Button */}
              <div className="p-5 pt-0">
                <Button 
                  onClick={() => handleProjectClick(project.id)}
                  className="w-full h-11 rounded-2xl font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 gap-2 shadow-xs group-hover:shadow-md"
                >
                  <span>Explore Project</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: Math.max(1, totalProjects - cardsPerPage + 1) }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCurrentIndex(dotIdx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === dotIdx 
                  ? 'w-8 bg-primary shadow-xs' 
                  : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedNewLaunchesSection;
