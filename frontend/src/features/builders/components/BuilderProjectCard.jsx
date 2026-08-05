import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  ArrowRightLeft, 
  Check, 
  Home, 
  Maximize2,
  Tag,
  Layers
} from 'lucide-react';
import { toast } from 'react-toastify';

export function BuilderProjectCard({ project, onSelectProject }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  if (!project) return null;

  const handleCompareClick = (e) => {
    e.stopPropagation();
    setIsComparing(!isComparing);
    if (!isComparing) {
      toast.info(`Added "${project.name}" to property comparison tray.`, {
        toastId: `compare-${project.id}`
      });
    } else {
      toast.default(`Removed "${project.name}" from comparison tray.`);
    }
  };

  const handleCardClick = () => {
    if (onSelectProject) {
      onSelectProject(project.id);
    }
  };

  const isReadyToMove = project.projectStatus?.toLowerCase().includes('ready') || project.projectStatus?.toLowerCase().includes('completed');

  // Format amenities array cleanly
  let parsedAmenities = [];
  if (Array.isArray(project.amenities) && project.amenities.length > 0) {
    const raw = project.amenities;
    if (raw.length === 1 && typeof raw[0] === 'string' && raw[0].startsWith('[')) {
      try {
        parsedAmenities = JSON.parse(raw[0]);
      } catch (e) {
        parsedAmenities = raw;
      }
    } else {
      parsedAmenities = raw;
    }
  }

  const topAmenities = parsedAmenities.slice(0, 3);

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
            <Building2 className="w-8 h-8 text-slate-400 opacity-40" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md ${
            isReadyToMove
              ? 'bg-emerald-500/90 text-white'
              : 'bg-amber-500/90 text-white'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            {project.projectStatus}
          </span>

          {/* AI Score Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-900/80 text-sky-400 border border-sky-500/30 backdrop-blur-md shadow-md">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>AI {project.aiScore}/100</span>
          </span>
        </div>

        {/* Bottom Floating RERA Badge */}
        {project.isReraVerified && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>RERA Registered</span>
            </span>
          </div>
        )}
      </div>

      {/* Main Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Type & Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
            <span className="uppercase tracking-wider truncate">{project.propertyType}</span>
            <span className="shrink-0 text-slate-400 font-normal">• {project.transactionType}</span>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
            {project.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">{project.locality}, {project.city}</span>
          </div>
        </div>

        {/* Structured 2x2 Specs Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
          
          <div className="flex items-center gap-2">
            <Home className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">BHK Variants</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{project.bhkVariants}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Carpet Area</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{project.carpetArea}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Rate / Sqft</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{project.pricePerSqft}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Possession</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{project.completionDate}</div>
            </div>
          </div>

        </div>

        {/* Top Amenities Pills (if available) */}
        {topAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {topAmenities.map((amenity, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40 truncate max-w-[120px]"
              >
                {amenity}
              </span>
            ))}
            {parsedAmenities.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                +{parsedAmenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer: Price & Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Price Range</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {project.price}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare Button */}
            <button
              onClick={handleCompareClick}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                isComparing
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700'
              }`}
              title={isComparing ? 'Remove from Comparison' : 'Compare Project'}
            >
              {isComparing ? <Check className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
            </button>

            {/* View Details Button */}
            <button
              onClick={handleCardClick}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition-all hover:gap-1.5"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BuilderProjectCard;
