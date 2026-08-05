import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Shield, BedDouble, Calendar, 
  Heart, ArrowLeft, Calculator, Phone, CheckCircle, 
  Share2, Award, Zap, Trees, Hospital, Train, ShoppingBag,
  FileCheck, AlertCircle, Check, Image as ImageIcon, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { builderService } from '../../builders/services/builderService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { EMICalculatorModal } from '../components/EMICalculatorModal';

const DEFAULT_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop&auto=format";

export function PropertyDetailPage({ projectId, isLegalView = false, onBack, onSelectBuilder }) {
  const [project, setProject] = useState(null);
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEMIModal, setShowEMIModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);


  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      try {
        const pData = await propertyService.getPropertyById(projectId);
        setProject(pData);
        if (pData?.image) {
          setSelectedImage(pData.image);
        }
        if (pData?.builderId) {
          const bData = await builderService.getBuilderById(pData.builderId);
          setBuilder(bData);
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (projectId) {
      loadDetails();
    }
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

  useEffect(() => {
    function handleKeyDown(e) {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, galleryImages?.length]);


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
        <div className="flex items-center gap-2 text-sm text-primary font-bold">
          <Building2 className="w-4 h-4 animate-bounce" />
          <span>Loading Property Details & Legal Specifications...</span>
        </div>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
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


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Main Title & Hero Banner */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Shield className="w-3.5 h-3.5 mr-1" />
                RERA Number: {project.rera}
              </Badge>
              <Badge variant="secondary">{project.status}</Badge>
              {legalInfo?.verification_status && (
                <Badge 
                  className={
                    legalInfo.verification_status === 'VERIFIED'
                      ? 'bg-emerald-600 text-white'
                      : legalInfo.verification_status === 'PENDING'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }
                >
                  Legal {legalInfo.verification_status}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-primary" />
              {project.location}
            </p>
          </div>

          <div className="text-left md:text-right bg-card p-4 rounded-2xl border shadow-sm">
            <span className="text-xs text-muted-foreground block">Asking Price</span>
            <span className="text-3xl font-extrabold text-primary">{project.price}</span>
            <span className="text-xs text-muted-foreground block mt-0.5 font-medium">{project.pricePerSqft}</span>
          </div>
        </div>

        {/* Hero Gallery Main Image Banner */}
        <div 
          onClick={() => {
            const idx = galleryImages.indexOf(currentImage);
            setLightboxIndex(idx !== -1 ? idx : 0);
          }}
          className="relative aspect-[21/9] rounded-3xl overflow-hidden border shadow-lg bg-muted cursor-pointer group"
        >
          <img
            src={currentImage || DEFAULT_IMAGE_FALLBACK}
            alt={project.name}
            onError={(e) => { e.target.src = DEFAULT_IMAGE_FALLBACK; }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white space-y-1 z-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
              Verified Property Gallery
            </span>
            <h2 className="text-2xl font-bold pt-1">{project.name} by {project.builder}</h2>
          </div>
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            Click for Fullscreen Gallery
          </div>
        </div>

        {/* Thumbnails Gallery Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-primary" />
              Property Photo Gallery ({galleryImages.length} Photos Available)
            </span>
            <span>Click thumbnail to switch main view</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                onDoubleClick={() => setLightboxIndex(idx)}
                className={`relative w-28 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 group ${
                  currentImage === imgUrl ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img 
                  src={imgUrl || DEFAULT_IMAGE_FALLBACK} 
                  alt={`Photo ${idx + 1}`} 
                  onError={(e) => { e.target.src = DEFAULT_IMAGE_FALLBACK; }}
                  className="w-full h-full object-cover" 
                />
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                  Photo {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Specs & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2-Cols: Overview, Legal & Amenities */}
        <div className="lg:col-span-2 space-y-8">
          {/* PostgreSQL Legal Audit Card */}
          {legalInfo && (
            <Card id="legal-audit-section" className="rounded-2xl border bg-card shadow-sm scroll-mt-24">
              <CardHeader className="border-b pb-4">

                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    Legal Title & Verification Audit (PostgreSQL Sync)
                  </span>
                  <Badge 
                    className={
                      legalInfo.verification_status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : legalInfo.verification_status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }
                  >
                    {legalInfo.verification_status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-muted/40 rounded-xl border">
                    <span className="text-muted-foreground block text-[10px]">Survey Number</span>
                    <span className="font-bold text-foreground">{legalInfo.survey_number || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border">
                    <span className="text-muted-foreground block text-[10px]">Khata Registration</span>
                    <span className="font-bold text-foreground">{legalInfo.khata_number || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border">
                    <span className="text-muted-foreground block text-[10px]">NA Converted</span>
                    <span className={`font-bold ${legalInfo.na_converted ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {legalInfo.na_converted ? 'Yes (NA Approved)' : 'No (Agricultural)'}
                    </span>
                  </div>
                </div>

                {legalInfo.remarks && (
                  <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-primary block">Legal Auditor Audit Remarks:</span>
                    <p className="text-foreground leading-relaxed">{legalInfo.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Key Specs Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Property Specifications</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground block">Configurations</span>
                <span className="font-bold text-foreground">{project.config}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground block">Carpet Area</span>
                <span className="font-bold text-foreground">{project.area}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground block">Furnishing Status</span>
                <span className="font-bold text-foreground">{project.furnishingStatus}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground block">Facing Direction</span>
                <span className="font-bold text-foreground">{project.facing}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground block">Bathrooms</span>
                <span className="font-bold text-foreground">{project.bathrooms} Baths</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground block">Floor Level</span>
                <span className="font-bold text-foreground">Floor {project.floorNumber} of {project.totalFloors}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground block">Possession Status</span>
                <span className="font-bold text-foreground">{project.possession}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border">
                <span className="text-xs text-muted-foreground block">Trust Rating</span>
                <span className="font-bold text-emerald-600">{project.trustScore}% Verified</span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>{project.overview}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Project Amenities</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {project.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-xl border text-xs font-semibold text-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{amenity}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1-Col: Builder & Inquiry Actions */}
        <div className="space-y-6">
          {/* Builder Card */}
          {builder && (
            <Card className="rounded-2xl border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Developer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-lg"
                    style={{ backgroundColor: builder.color || '#2563EB' }}
                  >
                    {builder.abbr}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{builder.name}</h3>
                    <p className="text-xs text-muted-foreground">{builder.yearsExp} Years Experience</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-center border-y py-3">
                  <div>
                    <span className="text-muted-foreground block">Completed</span>
                    <span className="font-bold text-foreground">{builder.completedProjects} Projects</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Trust Score</span>
                    <span className="font-bold text-emerald-600">{builder.trustScore}% Verified</span>
                  </div>
                </div>

                <Button
                  onClick={() => onSelectBuilder && onSelectBuilder(builder.id)}
                  variant="outline"
                  className="w-full text-xs rounded-xl"
                >
                  View Full Builder Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Action Box */}
          <Card className="rounded-2xl border bg-primary/5 border-primary/20">
            <CardContent className="p-6 space-y-4 text-center">
              <h4 className="font-bold text-foreground">Financial & Site Visit Tools</h4>
              <Button
                onClick={() => setShowEMIModal(true)}
                className="w-full rounded-xl gap-2"
                variant="default"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate Monthly EMI</span>
              </Button>
              <Button
                className="w-full rounded-xl gap-2"
                variant="outline"
              >
                <Phone className="w-4 h-4" />
                <span>Request Site Visit & Callback</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* EMI Calculator Modal */}
      <EMICalculatorModal
        isOpen={showEMIModal}
        onClose={() => setShowEMIModal(false)}
        defaultPrice={project.priceNum}
      />

      {/* Fullscreen Gallery Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-amber-400">
                Photo {lightboxIndex + 1} of {galleryImages.length}
              </span>
              <span className="text-xs text-white/70 hidden sm:inline">
                • {project.name}
              </span>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Fullscreen Viewer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image Container */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={galleryImages[lightboxIndex] || DEFAULT_IMAGE_FALLBACK}
              alt={`Photo ${lightboxIndex + 1}`}
              onError={(e) => { e.target.src = DEFAULT_IMAGE_FALLBACK; }}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {/* Prev / Next Buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                  className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all backdrop-blur-md"
                  title="Previous Photo (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all backdrop-blur-md"
                  title="Next Photo (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  lightboxIndex === idx ? 'border-amber-400 scale-105 ring-2 ring-amber-400/50' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img || DEFAULT_IMAGE_FALLBACK} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default PropertyDetailPage;

