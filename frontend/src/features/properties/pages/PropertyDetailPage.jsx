import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Building2, MapPin, Shield, BedDouble, Calendar, 
  Heart, ArrowLeft, Calculator, Phone, CheckCircle, 
  Share2, Award, Zap, Trees, Hospital, Train, ShoppingBag,
  FileCheck, AlertCircle, Check, Image as ImageIcon, CalendarCheck
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { builderService } from '../../builders/services/builderService';
import useAuth from '../../auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { PropertyDetailSkeleton } from '../../../shared/components/skeletons';
import { InquiryModal } from '../../inquiries/components/InquiryModal';
import { EMICalculatorCard } from '../components/EMICalculatorCard';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildBreadcrumbSchema, buildPropertySchema, slugify } from '../../../shared/utils/seoUtils';

// Route-level Code-Splitting & Lazy Loading for Heavy Below-the-Fold Components
const PropertyMapSection = lazy(() => import('../components/PropertyMap'));
const AIFairPriceCard = lazy(() => import('../components/AIFairPriceCard').then(m => ({ default: m.AIFairPriceCard })));
const VerixaPropertyAuditor = lazy(() => import('../components/VerixaPropertyAuditor').then(m => ({ default: m.VerixaPropertyAuditor })));

// Sleek Skeleton Placeholders for Progressive Component Hydration
const ComponentSkeleton = ({ height = "h-32", title = "Loading AI & Spatial Data..." }) => (
  <Card className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 animate-pulse">
    <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
      <Building2 className="w-3.5 h-3.5 animate-spin text-primary" />
      <span>{title}</span>
    </div>
    <Skeleton className={`${height} w-full rounded-xl`} />
  </Card>
);

export function PropertyDetailPage({ projectId, isLegalView = false, onBack, onSelectBuilder }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialCached = projectId ? propertyService.getCachedProperty(projectId) : null;

  const [project, setProject] = useState(initialCached);
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(!initialCached);
  const [selectedImage, setSelectedImage] = useState(initialCached?.image || null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryType, setInquiryType] = useState('site_visit');

  // Instant 0ms render from cached card/SWR + seamless background full-detail hydration
  useEffect(() => {
    let isCancelled = false;

    async function loadDetails() {
      const cached = propertyService.getCachedProperty(projectId);
      if (cached) {
        setProject(cached);
        setSelectedImage((prev) => prev || cached.image || null);
        setLoading(false);
        if (cached.builderId) {
          builderService.getBuilderById(cached.builderId)
            .then((bData) => {
              if (!isCancelled && bData) setBuilder(bData);
            })
            .catch(() => {});
        }
      } else {
        setLoading(true);
        setSelectedImage(null);
      }

      // Skip extra network hit if full detail is already fresh in memory
      if (cached && cached._isFullDetail) {
        return;
      }

      try {
        const pData = await propertyService.getPropertyById(projectId);
        if (isCancelled) return;

        if (pData) {
          setProject(pData);
          setSelectedImage((prev) => {
            if (!prev) return pData.image || null;
            if (Array.isArray(pData.images) && pData.images.includes(prev)) return prev;
            return pData.image || prev;
          });
        } else if (!cached) {
          setProject(null);
        }
        setLoading(false);

        if (pData?.builderId) {
          builderService.getBuilderById(pData.builderId)
            .then((bData) => {
              if (!isCancelled && bData) setBuilder(bData);
            })
            .catch((e) => console.warn('Non-blocking builder fetch notice:', e));
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
        if (!isCancelled) setLoading(false);
      }
    }

    if (projectId) {
      loadDetails();
    }

    return () => {
      isCancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!loading && project && isLegalView) {
      setTimeout(() => {
        const elem = document.getElementById('legal-audit-section');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [loading, project, isLegalView]);

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xl">
          <Building2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground">Property Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            The property you requested could not be located in our real estate database or has been unlisted.
          </p>
        </div>
        <Button onClick={onBack} size="lg" className="gap-2 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Button>
      </div>
    );
  }

  const legalInfo = project.legalInfo;
  const currentImage = selectedImage || project.image;
  const galleryImages = project.images && project.images.length > 0 ? project.images : [project.image];
  const canonicalSlug = project.slug || project.id;
  const localitySlug = slugify(project.locality || 'satellite');
  const canonicalPath = `/properties/${canonicalSlug}${isLegalView ? '/legal' : ''}`;
  const seoTitle = `${project.name} in ${project.locality || 'Ahmedabad'} – ${project.config} Price ${project.price}, RERA & Legal Audit`;
  const seoDescription = `${project.name}${project.builder ? ` by ${project.builder}` : ''} in ${project.location || 'Ahmedabad'}. Asking price ${project.price} (${project.pricePerSqft}), ${project.config}, ${project.area} carpet area, RERA: ${project.rera}, Trust Score ${project.trustScore}%.`;
  const propertySchemas = [
    buildPropertySchema(project, builder),
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: project.locality || 'Ahmedabad', path: `/localities/${localitySlug}` },
      { name: project.name, path: `/properties/${canonicalSlug}` },
    ]),
  ].filter(Boolean);

  const handleRequestSiteVisit = () => {
    if (!user) {
      toast.info('Please sign in to schedule a site visit.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setInquiryType('site_visit');
    setShowInquiryModal(true);
  };

  const handleRequestCallback = () => {
    if (!user) {
      toast.info('Please sign in to request a callback.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setInquiryType('callback');
    setShowInquiryModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        ogImage={currentImage}
        ogType="article"
        keywords={`${project.name}, ${project.locality || 'Ahmedabad'} properties, ${project.config}, ${project.builder || 'RERA verified'}, Verixa`}
        schema={propertySchemas}
      />
      {/* Top Back Navigation & Share */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 -ml-2 sm:ml-0 text-xs sm:text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: project.name, url: window.location.href }).catch(() => {});
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Property link copied to clipboard!');
              }
            }}
            className="gap-1.5 rounded-xl h-8 sm:h-9 text-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Above-The-Fold Header Info & Price Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 max-w-full truncate text-[10px] sm:text-xs">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 shrink-0" />
              <span className="truncate">RERA: {project.rera}</span>
            </Badge>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">{project.status}</Badge>
            {legalInfo?.verification_status && (
              <Badge 
                className={`text-[10px] sm:text-xs ${
                  legalInfo.verification_status === 'VERIFIED'
                    ? 'bg-emerald-600 text-white'
                    : legalInfo.verification_status === 'PENDING'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                Legal {legalInfo.verification_status}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">{project.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-start sm:items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
            <span className="line-clamp-2 sm:line-clamp-1">{project.address || project.location}</span>
          </p>
        </div>

        <div className="flex md:block items-center justify-between bg-card p-3.5 sm:p-4 rounded-2xl border shadow-sm shrink-0">
          <div>
            <span className="text-[11px] sm:text-xs text-muted-foreground block">Asking Price</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-primary">{project.price}</span>
          </div>
          <span className="text-xs text-muted-foreground block md:mt-0.5 font-semibold bg-muted/60 md:bg-transparent px-2.5 py-1 md:p-0 rounded-lg">
            {project.pricePerSqft}
          </span>
        </div>
      </div>

      {/* Mobile Quick Concierge CTAs (Visible on mobile/tablet right below price) */}
      <div className="grid grid-cols-2 gap-2.5 lg:hidden">
        <Button
          onClick={handleRequestSiteVisit}
          className="w-full h-11 rounded-xl gap-1.5 font-bold bg-primary text-primary-foreground shadow-sm text-xs"
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Book Site Visit</span>
        </Button>
        <Button
          onClick={handleRequestCallback}
          variant="outline"
          className="w-full h-11 rounded-xl gap-1.5 font-bold border-primary/40 text-foreground text-xs"
        >
          <Phone className="w-4 h-4 text-primary shrink-0" />
          <span>Request Callback</span>
        </Button>
      </div>

      {/* HIGH-PERFORMANCE TWO-COLUMN LAYOUT (70% Left / 30% Sticky Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT MAIN CONTENT COLUMN (70%) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          {/* 1. Above-The-Fold: Optimized Hero Property Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border shadow-lg bg-muted">
              <img
                src={currentImage}
                alt={`${project.name} - ${project.config} in ${project.location}`}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-0.5 sm:space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-emerald-400/20" /> Verified Property Gallery
                </span>
                <h2 className="text-base sm:text-2xl font-bold line-clamp-1">{project.name}{project.builder ? ` by ${project.builder}` : ''}</h2>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span>Photo Gallery ({galleryImages.length})</span>
                </span>
                <span className="hidden sm:inline">Tap thumbnail to switch view</span>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1 snap-x">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 snap-start group ${
                      currentImage === imgUrl ? 'border-primary ring-2 ring-primary/40 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Photo ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Above-The-Fold: Property Specifications Card */}
          <Card className="rounded-2xl border bg-card">
            <CardHeader className="border-b p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-bold">Property Information & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs sm:text-sm">
              <div className="p-2.5 sm:p-3 bg-muted/40 rounded-xl border min-w-0">
                <span className="text-[11px] text-muted-foreground block">Configurations</span>
                <span className="font-bold text-foreground truncate block">{project.config}</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/40 rounded-xl border min-w-0">
                <span className="text-[11px] text-muted-foreground block">Carpet Area</span>
                <span className="font-bold text-foreground truncate block">{project.area}</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/40 rounded-xl border min-w-0">
                <span className="text-[11px] text-muted-foreground block">Furnishing</span>
                <span className="font-bold text-foreground truncate block">{project.furnishingStatus}</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/40 rounded-xl border min-w-0">
                <span className="text-[11px] text-muted-foreground block">Facing Direction</span>
                <span className="font-bold text-foreground truncate block">{project.facing}</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/40 rounded-xl border min-w-0">
                <span className="text-[11px] text-muted-foreground block">Bathrooms</span>
                <span className="font-bold text-foreground truncate block">{project.bathrooms} Baths</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/40 rounded-xl border min-w-0">
                <span className="text-[11px] text-muted-foreground block">Floor Level</span>
                <span className="font-bold text-foreground truncate block">Floor {project.floorNumber} of {project.totalFloors}</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/40 rounded-xl border min-w-0">
                <span className="text-[11px] text-muted-foreground block">Possession</span>
                <span className="font-bold text-foreground truncate block">{project.possession}</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/40 rounded-xl border min-w-0">
                <span className="text-[11px] text-muted-foreground block">Trust Rating</span>
                <span className="font-bold text-emerald-600 truncate block">{project.trustScore}% Verified</span>
              </div>
            </CardContent>
          </Card>

          {/* 3. Below-The-Fold: Progressive Lazy Loading for Verixa AI Property Auditor */}
          <Suspense fallback={<ComponentSkeleton height="h-44" title="Generating AI Property Audit Report..." />}>
            <VerixaPropertyAuditor property={project} builder={builder} initialTab={isLegalView ? 'legal' : 'advisor'} />
          </Suspense>

          {/* 4. Below-The-Fold: Progressive Lazy Loading for AI Fair Price Prediction */}
          <Suspense fallback={<ComponentSkeleton height="h-32" title="Calculating Algorithmic Fair Price..." />}>
            <AIFairPriceCard propertyId={project.id} property={project} />
          </Suspense>

          {/* 5. Project Overview */}
          <Card className="rounded-2xl border bg-card">
            <CardHeader className="border-b p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-bold">Project Overview & Description</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>{project.overview}</p>
            </CardContent>
          </Card>

          {/* 6. Amenities */}
          <Card className="rounded-2xl border bg-card">
            <CardHeader className="border-b p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-bold">Project Amenities</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {project.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-xl border text-xs font-semibold text-foreground min-w-0">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PERMANENT STICKY SIDEBAR COLUMN (30% - Above-The-Fold Immediate Render) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
          {/* Action CTAs Box */}
          <Card className="rounded-2xl border-2 border-primary/30 bg-card shadow-md">
            <CardHeader className="p-4 bg-primary/5 border-b">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <span>Buyer Concierge & Visits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button
                onClick={handleRequestSiteVisit}
                size="lg"
                className="w-full rounded-xl gap-2 font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Site Visit</span>
              </Button>

              <Button
                onClick={handleRequestCallback}
                size="lg"
                variant="outline"
                className="w-full rounded-xl gap-2 font-bold border-primary/40 text-foreground hover:bg-primary/5"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>Request Callback</span>
              </Button>
            </CardContent>
          </Card>

          {/* EMI Calculator Card */}
          <EMICalculatorCard defaultPrice={project.priceNum} />

          {/* Developer Profile Card */}
          {builder && (
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Developer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-lg shrink-0"
                    style={{ backgroundColor: builder.color || '#2563EB' }}
                  >
                    {builder.abbr}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{builder.name}</h3>
                    <p className="text-xs text-muted-foreground">{builder.yearsExp} Years Experience</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-center border-y py-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Completed</span>
                    <span className="font-bold text-foreground">{builder.completedProjects} Projects</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Trust Rating</span>
                    <span className="font-bold text-emerald-600">{builder.trustScore}% Verified</span>
                  </div>
                </div>

                <Button
                  onClick={() => onSelectBuilder && onSelectBuilder(builder.id)}
                  variant="outline"
                  className="w-full text-xs rounded-xl font-semibold"
                >
                  View Developer Portfolio
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* FULL WIDTH LOCATION & SURROUNDING ECOSYSTEM SECTION (Lazy Loaded Below 2-Column Grid) */}
      <div className="w-full pt-4">
        <Suspense fallback={<ComponentSkeleton height="h-64" title="Loading Spatial Engine & Nearby Places..." />}>
          <PropertyMapSection property={project} />
        </Suspense>
      </div>

      {/* Request Site Visit / Callback Modal */}
      <InquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        property={project}
        initialType={inquiryType}
      />
    </div>
  );
}

export default PropertyDetailPage;
