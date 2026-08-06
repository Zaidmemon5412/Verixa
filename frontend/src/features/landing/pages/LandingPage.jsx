import React, { useState } from 'react';
import { 
  Building2, Search, ArrowRight, Shield, Star, 
  CheckCircle, XCircle, Sparkles, TrendingUp, Award, 
  Check, AlertTriangle, FileText, Lock, Users, HelpCircle, 
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { PropertyHeroSlider } from '../components/PropertyHeroSlider';
import { PropertyCard } from '../../properties/components/PropertyCard';
import { PROJECTS } from '../../properties/constants/propertyData';

export function LandingPage({ onNavigate, onSelectProject, onToggleWishlist, wishlist = [] }) {
  const featuredProjects = PROJECTS.slice(0, 3);

  return (
    <div className="space-y-20 pb-20">
      {/* ─── SECTION 0: STICKY TOP ANNOUNCEMENT / OFFER BAR ──────────────────── */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white text-xs py-2.5 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
              NEW RELEASE
            </span>
            <span className="font-medium">
              Free AI Legal Title Audit & Builder Delay Benchmark for your first 3 property searches!
            </span>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('projects')}
            className="underline underline-offset-4 hover:text-amber-300 font-bold flex items-center gap-1 shrink-0 text-[11px]"
          >
            <span>Claim Free Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── SECTION 1: HERO SECTION ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & CTA Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Verixa AI Real Estate Decision Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Buy Verified Properties with <span className="text-primary">100% Legal Confidence</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Verixa audits RERA filings, builder delivery track records, and legal title deeds so you never get trapped in delayed or disputed real estate.
            </p>

            {/* CTA Buttons & Ratings */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  onClick={() => onNavigate && onNavigate('projects')}
                  size="lg"
                  className="h-13 px-8 text-base font-bold rounded-2xl shadow-xl shadow-primary/20 gap-2"
                >
                  <span>Explore Verified Properties</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => onNavigate && onNavigate('projects')}
                  variant="outline"
                  size="lg"
                  className="h-13 px-6 text-base font-semibold rounded-2xl gap-2"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Browse Featured Homes</span>
                </Button>
              </div>

              {/* Star Rating Social Proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground">
                  5.0 ★★★★★ Rating
                </span>
                <span className="text-xs text-muted-foreground border-l pl-3">
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
      <section className="border-y bg-muted/30 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            Trusted by Top Real Estate Developers, Banks & Legal Counsel
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 pt-2 opacity-80 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 font-black text-lg tracking-wider text-slate-700 dark:text-slate-300">
              <Building2 className="w-6 h-6 text-primary" />
              <span>ADANI REALTY</span>
            </div>
            <div className="flex items-center gap-2 font-black text-lg tracking-wider text-slate-700 dark:text-slate-300">
              <Shield className="w-6 h-6 text-teal-500" />
              <span>GODREJ PROPERTIES</span>
            </div>
            <div className="flex items-center gap-2 font-black text-lg tracking-wider text-slate-700 dark:text-slate-300">
              <Award className="w-6 h-6 text-violet-500" />
              <span>SOBHA DEVELOPERS</span>
            </div>
            <div className="flex items-center gap-2 font-black text-lg tracking-wider text-slate-700 dark:text-slate-300">
              <Building2 className="w-6 h-6 text-amber-500" />
              <span>SHIVALIK GROUP</span>
            </div>
            <div className="flex items-center gap-2 font-black text-lg tracking-wider text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span>CREDAI APPROVED</span>
            </div>
          </div>
        </div>
      </section>

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
            Verixa AI Decision Engine Solutions
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
          <Button
            onClick={() => onNavigate && onNavigate('projects')}
            size="lg"
            className="rounded-2xl px-8 font-bold gap-2"
          >
            <span>Start Exploring Verified Features</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
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
          <h2 className="text-3xl font-extrabold tracking-tight">
            The Old Risky Way vs The Verixa Smart Way
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Risky Way */}
          <Card className="rounded-3xl border-rose-200 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 p-8 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
              <XCircle className="w-6 h-6" />
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
          <Card className="rounded-3xl border-emerald-200 dark:border-emerald-950 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
              <CheckCircle className="w-6 h-6" />
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
          <h2 className="text-3xl font-extrabold tracking-tight">
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

      {/* ─── SECTION 8: ENCOURAGING CLOSING ("RESTATE VALUE WITH SUBTLE ENCOURAGEMENT") ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-primary via-blue-700 to-indigo-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden space-y-6">
          <div className="max-w-2xl space-y-4 relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
              Ready to Buy Your Dream Property?
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Start Exploring Verified Real Estate Today
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Join over 4,800+ smart homebuyers who use Verixa to verify legal titles, builder delivery scores, and price fairness before making a decision.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                onClick={() => onNavigate && onNavigate('projects')}
                size="lg"
                className="h-14 px-8 text-base font-bold bg-white text-slate-950 hover:bg-slate-100 rounded-2xl shadow-xl gap-2"
              >
                <span>Find Your Verified Property</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;

