import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Globe, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Check, 
  Award, 
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react';

import { getBuilderBrandInfo } from '../utils/builderLogos';

export function BuilderHero({ builder, onContactBuilder, onScheduleVisit }) {
  const [copied, setCopied] = useState(false);

  if (!builder) return null;

  const brandInfo = getBuilderBrandInfo(builder.name, builder.logoUrl);
  const logoUrl = brandInfo.logo || builder.logoUrl;
  const trustScore = builder.trustScore || 94;

  const handleCopyRera = () => {
    if (builder.reraRegistrationNo) {
      navigator.clipboard.writeText(builder.reraRegistrationNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/80 border border-sky-100 dark:border-slate-800 shadow-xl shadow-sky-500/5 p-6 sm:p-8 md:p-10 mb-8 transition-all">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-gradient-to-br from-sky-400/10 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-gradient-to-tr from-sky-300/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left Column: Avatar & Main Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
          {/* Logo / Monogram Avatar */}
          <div className="relative group shrink-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={builder.name} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-contain bg-white p-2 border-2 border-sky-200/80 dark:border-sky-900/50 shadow-md shadow-sky-500/10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}

            <div 
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl text-white font-extrabold text-3xl sm:text-4xl items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30 ${
                logoUrl ? 'hidden' : 'flex'
              }`}
              style={{ backgroundColor: brandInfo.color || '#0284c7' }}
            >
              {brandInfo.abbr}
            </div>
            
            {/* Verified Badge Icon */}
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-900" title="Verified Developer">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Builder Information */}
          <div className="space-y-3 flex-1">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Developer</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>Est. {builder.establishedYear} ({builder.yearsOfExperience} Yrs Exp)</span>
              </div>
            </div>

            {/* Builder Name & Company */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {builder.name}
              </h1>
              {builder.companyName && builder.companyName !== builder.name && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {builder.companyName}
                </p>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
              {builder.about}
            </p>

            {/* Metadata Footer Items: Address, Website, RERA */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
              {builder.officeAddress && (
                <div className="flex items-center gap-1.5" title={builder.officeAddress}>
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="truncate max-w-xs">{builder.officeAddress}</span>
                </div>
              )}

              {builder.reraRegistrationNo && (
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">RERA:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{builder.reraRegistrationNo}</span>
                  <button 
                    onClick={handleCopyRera}
                    className="ml-1 text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors p-0.5"
                    title="Copy RERA Number"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}

              {builder.website && (
                <a 
                  href={builder.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Trust Score Circular Ring */}
        <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center justify-between lg:justify-center p-4 lg:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-sky-100 dark:border-slate-700 shadow-sm shrink-0 gap-4">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="7"
                className="text-slate-100 dark:text-slate-700"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - trustScore / 100)}
                strokeLinecap="round"
                className="text-sky-500 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {trustScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                /100
              </span>
            </div>
          </div>

          <div className="text-left lg:text-center">
            <div className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-600 dark:text-sky-400">
              <Award className="w-3.5 h-3.5" />
              <span>Verixa Trust Score</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Audited for Legal & Delivery History
            </p>
          </div>

          {/* Primary Action CTAs */}
          <div className="w-full flex flex-col sm:flex-row lg:flex-col gap-2 pt-2 border-t border-sky-100 dark:border-slate-700/80">
            <button
              onClick={() => onContactBuilder && onContactBuilder()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Developer</span>
            </button>
            <button
              onClick={() => onScheduleVisit && onScheduleVisit()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>Schedule Site Visit</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BuilderHero;
