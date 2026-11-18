import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Building2,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { SEO_GUIDES } from '../constants/guidesData';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildBreadcrumbSchema, buildItemListSchema } from '../../../shared/utils/seoUtils';

const CATEGORIES = [
  'All',
  'Legal & RERA Verification',
  'Micro-Market Comparison',
  'AI Valuation & Pricing',
  'Investment & Rental Yield',
];

export function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredGuides =
    selectedCategory === 'All'
      ? SEO_GUIDES
      : SEO_GUIDES.filter((g) => g.category === selectedCategory);

  const featuredGuide = SEO_GUIDES[0];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-8 animate-in fade-in duration-300">
      <SEOHead
        title="Ahmedabad Real Estate Guides – RERA Verification, NA Check & Investment Intelligence"
        description="Expert buyer guides on Gujarat RERA verification, NA land conversion, 7/12 title deeds, AI fair price valuation, and Ahmedabad locality price & yield comparisons."
        canonicalPath="/guides"
        keywords="Gujarat RERA guide, NA land verification Ahmedabad, 7/12 title check, Ahmedabad property investment guide, Verixa"
        schema={[
          buildBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Buyer & RERA Guides', path: '/guides' },
          ]),
          buildItemListSchema(
            SEO_GUIDES.map((g) => ({
              name: g.title,
              path: `/guides/${g.slug}`,
            })),
            'Ahmedabad Real Estate & Legal Verification Guides'
          ),
        ].filter(Boolean)}
      />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-primary/10 text-primary border border-primary/20">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>Verixa Real Estate Research & Legal Knowledge Hub</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Ahmedabad Real Estate Verification &amp; Investment Guides
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Data-backed checklists for verifying Gujarat RERA, 7/12 revenue deeds, developer delivery accuracy, AI fair valuation, and micro-market rental yields before buying property in Ahmedabad.
        </p>
      </div>

      {/* Featured Guide Banner */}
      {featuredGuide && (
        <Link to={`/guides/${featuredGuide.slug}`} className="block group">
          <Card className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto bg-muted overflow-hidden">
                <img
                  src={featuredGuide.heroImage}
                  alt={featuredGuide.title}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                    Featured Legal Guide
                  </Badge>
                </div>
              </div>
              <CardContent className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-bold text-primary">{featuredGuide.category}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {featuredGuide.readTime}
                    </span>
                    <span>•</span>
                    <span>Updated {featuredGuide.updatedAt}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {featuredGuide.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {featuredGuide.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Includes 10-Point Verification Matrix
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Read Complete Guide <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      )}

      {/* Category Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <Link key={guide.slug} to={`/guides/${guide.slug}`} className="group flex">
            <Card className="rounded-2xl border bg-card hover:shadow-xl hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col justify-between w-full">
              <div>
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <img
                    src={guide.heroImage}
                    alt={guide.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                    <span className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
                      {guide.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {guide.readTime}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 space-y-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {guide.summary}
                  </p>
                  {guide.keyTakeaways?.[0] && (
                    <div className="pt-2 border-t border-border/50 flex items-start gap-2 text-[11px] text-foreground/85">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{guide.keyTakeaways[0]}</span>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="px-5 pb-5">
                <Button
                  variant="outline"
                  className="w-full rounded-xl text-xs font-bold gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Platform Quick Links Hub */}
      <Card className="rounded-2xl border bg-muted/30 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Verify Any Property Using Live Verixa Intelligence</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Jump directly from our research guides into verified RERA listings, developer trust scores, and locality price trajectories.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/properties">
              <Button size="sm" className="rounded-xl text-xs gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Properties
              </Button>
            </Link>
            <Link to="/localities">
              <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Localities
              </Button>
            </Link>
            <Link to="/builders">
              <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Builders
              </Button>
            </Link>
            <Link to="/market">
              <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Market Trends
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default GuidesPage;
