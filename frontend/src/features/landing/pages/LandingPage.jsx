import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Search, ArrowRight, Shield, Star,
  CheckCircle, XCircle, Sparkles, TrendingUp, Award,
  Check, AlertTriangle, FileText, Lock, Users, HelpCircle,
  ChevronRight, ArrowUpRight, BookOpen, Clock
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { PropertyHeroSlider } from '../components/PropertyHeroSlider';
import { FeaturedNewLaunchesSection } from '../components/FeaturedNewLaunchesSection';
import { PropertyCard } from '../../properties/components/PropertyCard';
import { PROJECTS } from '../../properties/constants/propertyData';
import { prefetchRoute } from '../../../shared/utils/routePrefetcher';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildWebsiteSchema } from '../../../shared/utils/seoUtils';
import { SEO_GUIDES } from '../../guides/constants/guidesData';

export function LandingPage({ onNavigate, onSelectProject, onToggleWishlist, wishlist = [] }) {
  const featuredProjects = PROJECTS.slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-20 pb-10 sm:pb-20">
      <SEOHead
        title="Verixa – RERA Verified Properties, AI Fair Price & Legal Title Audit in Ahmedabad"
        description="Buy verified properties in Ahmedabad with 100% legal confidence. Verixa audits RERA filings, builder delivery track records, and XGBoost fair price valuations across Thaltej, Satellite, Sola, Gota, Chandkheda & Maninagar."
        canonicalPath="/"
        keywords="Ahmedabad real estate, RERA verified flats Ahmedabad, legal title verification, AI fair price calculator, Verixa"
        schema={buildWebsiteSchema()}
      />
      {/* ─── SECTION 0: STICKY TOP ANNOUNCEMENT / OFFER BAR ──────────────────── */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white text-[11px] sm:text-xs py-2 sm:py-2.5 px-3 sm:px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <span className="bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider shrink-0">
              NEW RELEASE
            </span>
            <span className="font-medium leading-snug">
              Free AI Legal Title Audit & Builder Delay Benchmark for your first 3 searches!
            </span>
          </div>
          <Link
            to="/properties"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('projects');
              }
            }}
            className="underline underline-offset-4 hover:text-amber-300 font-bold inline-flex items-center gap-1 shrink-0 text-[11px]"
          >
            <span>Claim Free Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── SECTION 1: HERO SECTION ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text & CTA Column */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Buy Verified Properties with <span className="text-primary">100% Legal Confidence</span>
            </h1>

            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Verixa audits RERA filings, builder delivery track records, and legal title deeds so you never get trapped in delayed or disputed real estate.
            </p>

            {/* CTA Buttons & Ratings */}
            <div className="space-y-4 pt-1 sm:pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/properties"
                  onMouseEnter={() => prefetchRoute('/properties')}
                  onTouchStart={() => prefetchRoute('/properties')}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('projects');
                    }
                  }}
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-2xl shadow-xl shadow-primary/20 gap-2 w-full sm:w-auto transition-colors"
                >
                  <span>Explore Verified Properties</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link
                  to="/properties"
                  onMouseEnter={() => prefetchRoute('/properties')}
                  onTouchStart={() => prefetchRoute('/properties')}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('projects');
                    }
                  }}
                  className="inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 sm:h-13 px-6 text-sm sm:text-base font-semibold rounded-2xl gap-2 w-full sm:w-auto transition-colors"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Browse Featured Homes</span>
                </Link>
              </div>

              {/* Star Rating Social Proof */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground">
                  5.0 ★★★★★ Rating
                </span>
                <span className="text-xs text-muted-foreground sm:border-l sm:pl-3">
                  Trusted by 4,800+ Homebuyers in Gujarat
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Auto Property Photo Slider */}
          <div className="lg:col-span-5">
            <PropertyHeroSlider
              onSelectProject={onSelectProject}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: SOCIAL PROOF LOGOS ("TRUSTED BY...") ─────────────────── */}
      <section className="border-y bg-muted/30 py-7 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 text-center">
          <p className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Trusted by Top Real Estate Developers, Banks & Legal Counsel
          </p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-10 pt-1 opacity-85">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-black text-xs sm:text-lg tracking-wider text-slate-700 dark:text-slate-300 bg-background/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-border/50">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-primary shrink-0" />
              <span className="truncate">ADANI REALTY</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-black text-xs sm:text-lg tracking-wider text-slate-700 dark:text-slate-300 bg-background/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-border/50">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-teal-500 shrink-0" />
              <span className="truncate">GODREJ PROPERTIES</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-black text-xs sm:text-lg tracking-wider text-slate-700 dark:text-slate-300 bg-background/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-border/50">
              <Award className="w-4 h-4 sm:w-6 sm:h-6 text-violet-500 shrink-0" />
              <span className="truncate">SOBHA DEVELOPERS</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 font-black text-xs sm:text-lg tracking-wider text-slate-700 dark:text-slate-300 bg-background/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-border/50">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
              <span className="truncate">SHIVALIK GROUP</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 font-black text-xs sm:text-lg tracking-wider text-slate-700 dark:text-slate-300 bg-background/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-border/50">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
              <span>CREDAI APPROVED</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2.5: FEATURED NEW LAUNCHES CAROUSEL ────────────────────── */}
      <FeaturedNewLaunchesSection onNavigate={onNavigate} onSelectProject={onSelectProject} />

      {/* ─── SECTION 3: PROBLEM IDENTIFICATION ("RELATABLE PAIN POINTS") ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            Relatable Pain Points
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Why 68% of Real Estate Buyers Get Trapped
          </h2>
          <p className="text-sm text-muted-foreground">
            Without automated verification, buying property in India is filled with hidden legal and financial risks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-rose-100 dark:border-rose-950/50 bg-rose-50/40 dark:bg-rose-950/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Hidden Legal Disputes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Disputed land titles, unverified B-Khata properties, or unapproved agricultural conversions that freeze resale.
            </p>
          </Card>

          <Card className="rounded-2xl border-rose-100 dark:border-rose-950/50 bg-rose-50/40 dark:bg-rose-950/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Builder Delivery Delays</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Projects stalled for 2 to 5 years beyond RERA deadlines without compensation or accountability.
            </p>
          </Card>

          <Card className="rounded-2xl border-rose-100 dark:border-rose-950/50 bg-rose-50/40 dark:bg-rose-950/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Inflated Price Quotes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paying 15% - 25% above true market fair value due to broker markups and misleading super-builtup area math.
            </p>
          </Card>

          <Card className="rounded-2xl border-rose-100 dark:border-rose-950/50 bg-rose-50/40 dark:bg-rose-950/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Unverified RERA Claims</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Brokers claiming "RERA Registered" without valid documentation, municipal approval plans, or OC certificates.
            </p>
          </Card>
        </div>
      </section>

      {/* ─── SECTION 4: SOFT SELL SOLUTIONS ("EASY-TO-IMPLEMENT FEATURES") ────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Easy-to-Implement Features
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Verixa Decision Engine Solutions
          </h2>
          <p className="text-sm text-muted-foreground">
            Smart tools that eliminate property buying stress and protect your lifelong savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border bg-card p-6 space-y-4 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex text-amber-400">
                {[1, 2, 3].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <h3 className="font-bold text-base text-foreground">AI Legal Title Verification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated OCR inspection of survey numbers, Khata certificates, and sub-registrar deeds for 100% legal safety.
            </p>
          </Card>

          <Card className="rounded-2xl border bg-card p-6 space-y-4 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex text-amber-400">
                {[1, 2, 3].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <h3 className="font-bold text-base text-foreground">Builder Delay Index</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track developer delivery timelines, historical delay months, and financial solvent ratings.
            </p>
          </Card>

          <Card className="rounded-2xl border bg-card p-6 space-y-4 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex text-amber-400">
                {[1, 2, 3].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <h3 className="font-bold text-base text-foreground">XGBoost Fair Price Score</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ML pricing engine trained on 50,000+ transaction records to tell you if a property is overpriced or fair value.
            </p>
          </Card>

          <Card className="rounded-2xl border bg-card p-6 space-y-4 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex text-amber-400">
                {[1, 2, 3].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            <h3 className="font-bold text-base text-foreground">Locality & Yield Radar</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Neighborhood infrastructure metrics, metro proximity, school density, and 5-year rental yield projections.
            </p>
          </Card>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/properties"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('projects');
              }
            }}
            className="inline-flex items-center justify-center h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-8 text-sm font-bold gap-2 transition-colors"
          >
            <span>Start Exploring Verified Features</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── SECTION 5: ASPIRATIONAL TESTIMONIALS ("FOCUS ON TRANSFORMATION") ───── */}
      <section className="border-y bg-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Focus on Transformation & Ease
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Real Stories from Verified Homebuyers
            </h2>
            <p className="text-sm text-muted-foreground">
              See how families and real estate investors made confident, stress-free decisions with Verixa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground italic leading-relaxed">
                "Verixa saved me from buying a 3 BHK in Shela that had an unapproved B-Khata issue. The legal audit flag saved me ₹85 Lakhs of my hard-earned savings!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                  RP
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Rajesh Patel</h4>
                  <p className="text-xs text-muted-foreground">Bought 3 BHK at Adani Shantigram • Ahmedabad</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground italic leading-relaxed">
                "The XGBoost fair-price score showed me that the builder's quote was 12% above market value. I negotiated ₹14 Lakhs off the asking price!"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center text-sm">
                  SS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Sneha Sharma</h4>
                  <p className="text-xs text-muted-foreground">Investor • GIFT City Gandhinagar</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: PASSIVE FEATURES / USE CASES ("BEFORE VS AFTER") ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Relatable Scenarios for Easy Adoption
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            The Old Risky Way vs The Verixa Smart Way
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Old Risky Way */}
          <Card className="rounded-3xl border-rose-200 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 p-5 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base sm:text-lg">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span>Without Verixa (Risky & Stressful)</span>
            </div>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Weeks spent visiting sub-registrar offices to verify title deeds manually.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Relying on broker word-of-mouth for project delivery timelines.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Paying inflated price-per-sqft quotes without market transaction benchmarks.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Constant anxiety over hidden litigation or delayed possession dates.</span>
              </li>
            </ul>
          </Card>

          {/* Verixa Smart Way */}
          <Card className="rounded-3xl border-emerald-200 dark:border-emerald-950 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-base sm:text-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span>With Verixa (Smart & Effortless)</span>
            </div>
            <ul className="space-y-3 text-xs text-foreground font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Instant 1-click legal title check with 100% verified survey & Khata records.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Objective developer delay rating showing historical completion accuracy.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>XGBoost ML model trained on 50,000+ real transactions for fair price evaluation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Complete peace of mind knowing your family's investment is 100% safe.</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* ─── SECTION 7: SOFT SELL CASE STUDY ("HIGHLIGHT SMALL ACHIEVABLE WINS") ─ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Highlight Small, Achievable Wins
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Real Buyer Success Case Studies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border bg-card p-6 space-y-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-md">
              Saved ₹14.5 Lakhs
            </span>
            <h3 className="font-bold text-base text-foreground">Fair Value Negotiation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Buyer used Verixa's ML price score to prove overpricing in South Bopal and negotiated ₹14.5 Lakhs reduction.
            </p>
          </Card>

          <Card className="rounded-2xl border bg-card p-6 space-y-3">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-md">
              Avoided Dispute
            </span>
            <h3 className="font-bold text-base text-foreground">B-Khata Boundary Flag</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verixa's automated legal audit flagged a boundary discrepancy in Shela prior to token payment.
            </p>
          </Card>

          <Card className="rounded-2xl border bg-card p-6 space-y-3">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-md">
              4.8% Rental Yield
            </span>
            <h3 className="font-bold text-base text-foreground">GIFT City Investment Win</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Investor selected top-ranked yield project in GIFT City generating ₹68,000 monthly rental income.
            </p>
          </Card>
        </div>
      </section>

      {/* ─── SECTION 7.25: AHMEDABAD BUYER & RERA VERIFICATION GUIDES ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge Hub</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Latest Ahmedabad Buyer &amp; RERA Verification Guides
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Research checklists for GujRERA audits, NA land verification, and micro-market ROI comparisons.
            </p>
          </div>
          <Link
            to="/guides"
            onMouseEnter={() => prefetchRoute('/guides')}
            onTouchStart={() => prefetchRoute('/guides')}
            className="text-xs sm:text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Explore All 6 Guides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SEO_GUIDES.slice(0, 3).map((guide) => (
            <Link
              key={guide.slug}
              to={`/guides/${guide.slug}`}
              onMouseEnter={() => prefetchRoute(`/guides/${guide.slug}`)}
              onTouchStart={() => prefetchRoute(`/guides/${guide.slug}`)}
              className="group flex"
            >
              <Card className="rounded-2xl border bg-card p-5 space-y-3 hover:border-primary/40 hover:shadow-lg transition-all w-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-primary font-bold">{guide.category}</span>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {guide.readTime}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {guide.summary}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary pt-1">
                  Read Verification Guide <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── SECTION 7.5: E-E-A-T FREQUENTLY ASKED QUESTIONS (FAQ) ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Buyer Intelligence Guide</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions About Buying Verified Property in Ahmedabad
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Clear answers on RERA legal checks, XGBoost fair valuation, rental yields, and builder trust scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[
            {
              q: 'How does Verixa verify RERA registration and legal land titles in Ahmedabad?',
              a: 'Verixa cross-checks Gujarat RERA filings, NA (Non-Agricultural) land conversion status, Khata and survey records, and sub-registrar title documents through automated OCR and compliance verification checks before listing any project as verified.',
            },
            {
              q: "How accurate is Verixa's XGBoost AI Fair Price Valuation?",
              a: 'Verixa trains gradient-boosted valuation models on 50,000+ historical micro-market transactions, carpet-area benchmarks, and builder reputation signals to detect overpriced listings and calculate an objective Fair Market Price band.',
            },
            {
              q: 'Which micro-markets in Ahmedabad offer the best rental yield and price appreciation?',
              a: 'Key high-momentum micro-markets tracked on Verixa include Thaltej, Satellite, Sola, Gota, Chandkheda, and Maninagar, each benchmarked on rental yield, metro connectivity, schools, hospitals, and 5-year appreciation trajectories.',
            },
            {
              q: 'How is the Verixa Builder Trust & Delivery Score calculated?',
              a: 'The Builder Trust Score evaluates RERA registration compliance, years of development experience, completed-to-ongoing project ratio, and historical on-time delivery accuracy across Ahmedabad developments.',
            },
          ].map((faq, idx) => (
            <details
              key={idx}
              open={idx < 2}
              className="group rounded-2xl border bg-card p-5 shadow-xs open:border-primary/40 transition-colors"
            >
              <summary className="list-none cursor-pointer flex items-start justify-between gap-3 font-bold text-sm sm:text-base text-foreground">
                <span>{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-1 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── SECTION 8: ENCOURAGING CLOSING ("RESTATE VALUE WITH SUBTLE ENCOURAGEMENT") ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-primary via-blue-700 to-indigo-900 text-white rounded-3xl p-6 sm:p-14 shadow-2xl relative overflow-hidden space-y-5 sm:space-y-6">
          <div className="max-w-2xl space-y-4 relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
              Ready to Buy Your Dream Property?
            </Badge>
            <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Start Exploring Verified Real Estate Today
            </h2>
            <p className="text-xs sm:text-base text-blue-100 leading-relaxed">
              Join over 4,800+ smart homebuyers who use Verixa to verify legal titles, builder delivery scores, and price fairness before making a decision.
            </p>

            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/properties"
                onMouseEnter={() => prefetchRoute('/properties')}
                onTouchStart={() => prefetchRoute('/properties')}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate('projects');
                  }
                }}
                className="inline-flex items-center justify-center h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold bg-white text-slate-950 hover:bg-slate-100 rounded-2xl shadow-xl gap-2 w-full sm:w-auto transition-colors"
              >
                <span>Find Your Verified Property</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;

