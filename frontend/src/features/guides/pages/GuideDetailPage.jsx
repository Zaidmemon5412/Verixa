import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  List,
  ShieldCheck,
} from 'lucide-react';
import { SEO_GUIDES } from '../constants/guidesData';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildArticleSchema, buildBreadcrumbSchema } from '../../../shared/utils/seoUtils';

export function GuideDetailPage() {
  const { slug } = useParams();
  const guide = SEO_GUIDES.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-5">
        <SEOHead
          title="Guide Not Found – Verixa"
          description="The requested real estate guide could not be found."
          noindex={true}
        />
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Guide Not Found</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          The guide URL may have moved or been updated. Explore all verified Ahmedabad buyer guides below.
        </p>
        <Link to="/guides">
          <Button className="rounded-xl gap-2 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Guides</span>
          </Button>
        </Link>
      </div>
    );
  }

  const otherGuides = SEO_GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const canonicalPath = `/guides/${guide.slug}`;
  const articleSchemas = [
    ...buildArticleSchema(guide),
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Guides', path: '/guides' },
      { name: guide.title, path: canonicalPath },
    ]),
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <SEOHead
        title={guide.metaTitle || guide.title}
        description={guide.metaDescription || guide.summary}
        canonicalPath={canonicalPath}
        ogImage={guide.heroImage}
        ogType="article"
        keywords={guide.keywords}
        schema={articleSchemas}
      />

      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/guides" className="hover:text-primary transition-colors">Guides</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-bold truncate max-w-[200px] sm:max-w-md">{guide.category}</span>
        </nav>

        <Link to="/guides">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Guides</span>
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
            {guide.category}
          </Badge>
          <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
            <Clock className="w-3.5 h-3.5" /> {guide.readTime}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
            <Calendar className="w-3.5 h-3.5" /> Updated {guide.updatedAt}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight max-w-4xl">
          {guide.title}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          {guide.summary}
        </p>

        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Authored by {guide.author}</span>
        </div>
      </header>

      {/* Hero Cover */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden border bg-muted shadow-md">
        <img
          src={guide.heroImage}
          alt={guide.title}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Key Takeaways Box */}
      {Array.isArray(guide.keyTakeaways) && guide.keyTakeaways.length > 0 && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Key Takeaways</span>
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm text-foreground/90">
            {guide.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Main Content + Sidebar Table of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Sections */}
        <article className="lg:col-span-8 space-y-8 min-w-0">
          {guide.sections?.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {section.heading}
              </h2>

              {section.paragraphs?.map((para, pIdx) => (
                <p key={pIdx} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {para}
                </p>
              ))}

              {Array.isArray(section.bullets) && section.bullets.length > 0 && (
                <ul className="space-y-2 bg-muted/30 rounded-2xl p-4 border text-xs sm:text-sm text-foreground/90">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.comparisonTable && (
                <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-muted/40 border-b text-foreground font-bold">
                          {section.comparisonTable.headers.map((header, hIdx) => (
                            <th key={hIdx} className="py-3 px-4 whitespace-nowrap">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {section.comparisonTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-3 px-4 ${cIdx === 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Article FAQs */}
          {Array.isArray(guide.faqs) && guide.faqs.length > 0 && (
            <section className="space-y-4 pt-4 border-t">
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-3">
                {guide.faqs.map((faq, fIdx) => (
                  <details
                    key={fIdx}
                    open={fIdx === 0}
                    className="group rounded-2xl border bg-card p-4 shadow-xs open:border-primary/40"
                  >
                    <summary className="list-none cursor-pointer flex items-start justify-between gap-3 font-bold text-xs sm:text-sm text-foreground">
                      <span>{faq.q}</span>
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Right Sidebar: Table of Contents & Related Verixa Pages */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <Card className="rounded-2xl border bg-card">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <List className="w-4 h-4 text-primary" />
                <span>In This Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs">
              {guide.sections?.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block py-1.5 px-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 font-semibold transition-colors"
                >
                  {sec.heading}
                </a>
              ))}
            </CardContent>
          </Card>

          {Array.isArray(guide.relatedLinks) && guide.relatedLinks.length > 0 && (
            <Card className="rounded-2xl border bg-card">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Explore Related Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {guide.relatedLinks.map((lnk) => (
                  <Link
                    key={lnk.to}
                    to={lnk.to}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 text-xs font-bold text-foreground hover:text-primary transition-colors"
                  >
                    <span>{lnk.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {/* More Guides */}
      <section className="pt-6 border-t space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">More Real Estate Guides</h2>
          <Link to="/guides" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {otherGuides.map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="group">
              <Card className="rounded-2xl border bg-card p-4 space-y-2 hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {g.category}
                  </span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {g.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
                  <span>{g.readTime}</span>
                  <span className="text-primary font-bold flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default GuideDetailPage;
