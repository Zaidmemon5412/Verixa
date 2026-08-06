import React, { useState, useEffect } from 'react';
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
import { InquiryModal } from '../../inquiries/components/InquiryModal';
import PropertyMapSection from '../components/PropertyMap';
import { AIFairPriceCard } from '../components/AIFairPriceCard';
import { VerixaPropertyAuditor } from '../components/VerixaPropertyAuditor';
import { EMICalculatorCard } from '../components/EMICalculatorCard';

export function PropertyDetailPage({ projectId, isLegalView = false, onBack, onSelectBuilder }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject] = useState(null);
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryType, setInquiryType] = useState('site_visit'); // 'site_visit' or 'callback'

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
        <div className="flex items-center gap-2 text-sm text-primary font-bold">
          <Building2 className="w-4 h-4 animate-bounce" />
          <span>Loading Property Details & Legal Specifications...</span>
        </div>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="h-96 lg:col-span-8 rounded-2xl" />
          <Skeleton className="h-96 lg:col-span-4 rounded-2xl" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Back Navigation & Share */}
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

      {/* Header Info & Price Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
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
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>{project.address || project.location}</span>
          </p>
        </div>

        <div className="text-left md:text-right bg-card p-4 rounded-2xl border shadow-sm">
          <span className="text-xs text-muted-foreground block">Asking Price</span>
          <span className="text-3xl font-extrabold text-primary">{project.price}</span>
          <span className="text-xs text-muted-foreground block mt-0.5 font-medium">{project.pricePerSqft}</span>
        </div>
      </div>

      {/* HIGH CONVERSION TWO-COLUMN RESPONSIVE LAYOUT (70% Left / 30% Sticky Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT MAIN CONTENT COLUMN (lg:col-span-8 / 70%) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Property Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border shadow-lg bg-muted">
              <img
                src={currentImage}
                alt={project.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white space-y-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 fill-emerald-400/20" /> Verified Property Gallery
                </span>
                <h2 className="text-2xl font-bold">{project.name}{project.builder ? ` by ${project.builder}` : ''}</h2>
              </div>
            </div>

            {/* Thumbnails Gallery Strip */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Property Photo Gallery ({galleryImages.length} Photos)
                </span>
                <span>Click thumbnail to switch main view</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-28 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 group ${
                      currentImage === imgUrl ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                      Photo {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Property Information & Specifications */}
          <Card className="rounded-2xl border bg-card">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold">Property Information & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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

          {/* 3. AI Verdict Card & Compact Tabbed Property Auditor */}
          <VerixaPropertyAuditor property={project} builder={builder} />

          {/* 4. Property Description / Project Overview */}
          <Card className="rounded-2xl border bg-card">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold">Project Overview & Description</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-sm text-muted-foreground leading-relaxed">
              <p>{project.overview}</p>
            </CardContent>
          </Card>

          {/* 5. Amenities */}
          <Card className="rounded-2xl border bg-card">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold">Project Amenities</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {project.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-xl border text-xs font-semibold text-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 6. Location Map */}
          <PropertyMapSection property={project} />

          {/* 7. AI Fair Price Prediction Card */}
          <AIFairPriceCard propertyId={project.id} property={project} />
        </div>

        {/* RIGHT PERMANENT STICKY SIDEBAR COLUMN (lg:col-span-4 / 30%) */}
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
              {/* 1. Request Site Visit Button */}
              <Button
                onClick={handleRequestSiteVisit}
                size="lg"
                className="w-full rounded-xl gap-2 font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Site Visit</span>
              </Button>

              {/* 2. Request Callback Button */}
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

          {/* 3. EMI Calculator Card (Permanently Embedded in Sticky Sidebar) */}
          <EMICalculatorCard defaultPrice={project.priceNum} />

          {/* 4. Developer Profile Card */}
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
