import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Award, 
  Scale, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { usePropertyAuditor } from '../hooks/usePropertyAuditor';

export function VerixaPropertyAuditor({ property, builder }) {
  const { auditData, isLoading } = usePropertyAuditor(property, builder);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'price' | 'builder' | 'locality' | 'legal' | 'investment' | 'risks' | 'lifestyle' | 'decision'
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    builder: true,
    locality: true,
    legal: true,
    investment: true,
    risks: true,
    lifestyle: true,
    decision: true
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  if (isLoading) {
    return (
      <Card className="rounded-3xl border border-primary/30 bg-card p-6 shadow-md space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl bg-primary/20" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </Card>
    );
  }

  if (!auditData) return null;

  const {
    price_analysis: priceData,
    builder_analysis: builderData,
    locality_analysis: localityData,
    legal_analysis: legalData,
    investment_analysis: investData,
    risk_analysis: riskData,
    lifestyle_recommendation: lifestyleData,
    final_recommendation: finalData
  } = auditData;

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakhs`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Verdict Colors & Badges
  const getDecisionBadge = (decision, colorKey) => {
    switch (colorKey) {
      case 'emerald':
      case 'green':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs">
            <CheckCircle2 className="w-4 h-4 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
            {decision}
          </span>
        );
      case 'amber':
      case 'yellow':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs">
            <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            {decision}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            {decision}
          </span>
        );
    }
  };

  const getPriceVerdictBadge = (verdict, colorKey) => {
    switch (colorKey) {
      case 'emerald':
        return <Badge className="bg-emerald-600 text-white font-bold">{verdict}</Badge>;
      case 'blue':
        return <Badge className="bg-blue-600 text-white font-bold">{verdict}</Badge>;
      case 'amber':
        return <Badge className="bg-amber-500 text-white font-bold">{verdict}</Badge>;
      default:
        return <Badge className="bg-rose-600 text-white font-bold">{verdict}</Badge>;
    }
  };

  return (
    <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl overflow-hidden space-y-6">
      {/* 1. Header Banner & Executive Decision Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Verixa AI Property Auditor
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Database Audit
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Property Audit & Decision Report
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Objective AI analysis evaluating price fairness, developer credibility, title legalities, locality infrastructure, risk factors, and lifestyle suitability.
            </p>
          </div>

          {/* Download / Print Audit Summary Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.print()}
            className="self-start md:self-auto bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Print Audit Summary</span>
          </Button>
        </div>

        {/* Top Highlight Box: Final Executive Decision */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Executive Verdict
            </span>
            {getDecisionBadge(finalData?.decision || "Recommended with Negotiation", finalData?.color)}
          </div>

          <div className="space-y-2 pt-1 border-t border-white/10">
            <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Key Decision Rationale:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-200">
              {finalData?.rationale_bullets?.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-8">
        {/* Module Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/60 text-xs font-semibold">
          {[
            { id: 'all', label: 'All 8 Audit Modules' },
            { id: 'price', label: '1. Price Analysis' },
            { id: 'builder', label: '2. Builder Assessment' },
            { id: 'locality', label: '3. Locality Audit' },
            { id: 'legal', label: '4. Legal Records' },
            { id: 'investment', label: '5. Investment Forecast' },
            { id: 'risks', label: '6. Risk Factors' },
            { id: 'lifestyle', label: '7. Lifestyle Match' },
            { id: 'decision', label: '8. Final Decision' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: PRICE ANALYSIS */}
        {(activeTab === 'all' || activeTab === 'price') && (
          <div className="space-y-4">
            <div 
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                1. Price & Valuation Analysis
              </h3>
              {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {expandedSections.price && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Asking Price vs AI Fair Price */}
                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Asking Price</div>
                  <div className="text-2xl font-black text-foreground">{formatCurrency(priceData.listed_price)}</div>
                  <div className="text-xs text-muted-foreground">Seller's Listed Price</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center justify-between">
                    <span>AI Fair Valuation</span>
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="text-2xl font-black text-primary">{formatCurrency(priceData.fair_price)}</div>
                  <div className="text-xs text-muted-foreground">Algorithmic Comps Model</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center justify-between">
                    <span>Valuation Verdict</span>
                    {getPriceVerdictBadge(priceData.verdict, priceData.verdict_color)}
                  </div>
                  <div className="text-lg font-black text-foreground">
                    {priceData.difference_pct > 0 ? `+${priceData.difference_pct}%` : `${priceData.difference_pct}%`} Difference
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(priceData.difference)} variance
                  </div>
                </div>

                {/* Negotiation Advice */}
                <div className="md:col-span-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Scale className="w-4 h-4" /> AI Buyer Negotiation Strategy:
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">
                    {priceData.negotiation_tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: BUILDER ANALYSIS */}
        {(activeTab === 'all' || activeTab === 'builder') && (
          <div className="space-y-4 pt-2">
            <div 
              onClick={() => toggleSection('builder')}
              className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                2. Builder & Developer Credibility Analysis
              </h3>
              {expandedSections.builder ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {expandedSections.builder && (
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-[10px] text-muted-foreground uppercase block">Developer Name</span>
                    <span className="text-xs font-extrabold text-foreground">{builderData.builder_name}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-[10px] text-muted-foreground uppercase block">Industry Experience</span>
                    <span className="text-xs font-extrabold text-foreground">{builderData.years_experience} Years</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-[10px] text-muted-foreground uppercase block">Completed Projects</span>
                    <span className="text-xs font-extrabold text-foreground">{builderData.completed_projects}+ Projects</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-[10px] text-muted-foreground uppercase block">Trust Score Rating</span>
                    <span className="text-xs font-extrabold text-emerald-600">{builderData.trust_score}% Verified</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed border-t pt-3">
                  {builderData.assessment}
                </p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: LOCALITY ANALYSIS */}
        {(activeTab === 'all' || activeTab === 'locality') && (
          <div className="space-y-4 pt-2">
            <div 
              onClick={() => toggleSection('locality')}
              className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                3. Locality & Infrastructure Strengths / Weaknesses
              </h3>
              {expandedSections.locality ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {expandedSections.locality && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Locality Strengths ({localityData.locality_name})
                  </span>
                  <ul className="space-y-1.5 text-xs text-foreground">
                    {localityData.strengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Locality Constraints / Drawbacks
                  </span>
                  <ul className="space-y-1.5 text-xs text-foreground">
                    {localityData.weaknesses?.map((wk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: LEGAL ANALYSIS */}
        {(activeTab === 'all' || activeTab === 'legal') && (
          <div className="space-y-4 pt-2">
            <div 
              onClick={() => toggleSection('legal')}
              className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                4. Legal Title & Public Records Verification
              </h3>
              {expandedSections.legal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {expandedSections.legal && (
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Verified Database Legal Statement:</span>
                  <Badge 
                    className={
                      legalData.verification_status === 'VERIFIED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }
                  >
                    Legal Status: {legalData.verification_status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/30 p-3 rounded-xl border">
                  "{legalData.statement}"
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/30 border">
                    <span className="text-muted-foreground block text-[10px]">Survey No</span>
                    <span className="font-bold text-foreground">{legalData.survey_number}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/30 border">
                    <span className="text-muted-foreground block text-[10px]">Khata Reg</span>
                    <span className="font-bold text-foreground">{legalData.khata_number}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/30 border">
                    <span className="text-muted-foreground block text-[10px]">NA Land Approved</span>
                    <span className={`font-bold ${legalData.na_converted ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {legalData.na_converted ? 'Yes (NA Conversion Certified)' : 'Pending Certificate'}
                    </span>
                  </div>
                </div>

                {legalData.missing_records?.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                    <span className="font-bold text-amber-700 dark:text-amber-300 block">Pending / Unverified Documents Notice:</span>
                    {legalData.missing_records.map((item, idx) => (
                      <p key={idx} className="text-muted-foreground">• {item}</p>
                    ))}
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{legalData.disclaimer}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: INVESTMENT ANALYSIS */}
        {(activeTab === 'all' || activeTab === 'investment') && (
          <div className="space-y-4 pt-2">
            <div 
              onClick={() => toggleSection('investment')}
              className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                5. Investment & Capital Growth Outlook
              </h3>
              {expandedSections.investment ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {expandedSections.investment && (
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-[10px] text-muted-foreground uppercase block">Capital Appreciation</span>
                    <span className="text-xs font-black text-emerald-600">{investData.capital_growth}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-[10px] text-muted-foreground uppercase block">End-User Suitability</span>
                    <span className="text-xs font-black text-foreground">{investData.end_user_suitability}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border">
                    <span className="text-[10px] text-muted-foreground uppercase block">Rental Yield Forecast</span>
                    <span className="text-xs font-black text-primary">{investData.rental_yield}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {investData.summary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: RISK ANALYSIS */}
        {(activeTab === 'all' || activeTab === 'risks') && (
          <div className="space-y-4 pt-2">
            <div 
              onClick={() => toggleSection('risks')}
              className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                6. Identified Data-Backed Risk Factors
              </h3>
              {expandedSections.risks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {expandedSections.risks && (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                  Verified Data Risk Identifiers ({riskData.identified_risks?.length || 0} Factors):
                </span>
                <ul className="space-y-2 text-xs text-foreground">
                  {riskData.identified_risks?.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-card border border-rose-200 dark:border-rose-900/40">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* SECTION 7: LIFESTYLE RECOMMENDATION */}
        {(activeTab === 'all' || activeTab === 'lifestyle') && (
          <div className="space-y-4 pt-2">
            <div 
              onClick={() => toggleSection('lifestyle')}
              className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                7. Lifestyle & Target Buyer Match Matrix
              </h3>
              {expandedSections.lifestyle ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {expandedSections.lifestyle && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(lifestyleData || {}).map(([key, info]) => {
                  const label = key.replace(/_/g, ' ');
                  return (
                    <div key={key} className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{label}</span>
                        <Badge variant={info.suitable ? 'default' : 'secondary'} className="text-[10px]">
                          {info.rating}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {info.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 8: FINAL DECISION & EXECUTIVE RATIONALE */}
        {(activeTab === 'all' || activeTab === 'decision') && (
          <div className="space-y-4 pt-2">
            <div 
              onClick={() => toggleSection('decision')}
              className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                8. Final Verixa Recommendation & Rationale Summary
              </h3>
              {expandedSections.decision ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {expandedSections.decision && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Executive Property Recommendation
                    </span>
                    <h4 className="text-xl font-black text-foreground">{finalData.decision}</h4>
                  </div>
                  {getDecisionBadge(finalData.decision, finalData.color)}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    Reasoning Breakdown (4–6 Core Audit Findings):
                  </span>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {finalData.rationale_bullets?.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-muted/30 border">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-foreground font-medium leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VerixaPropertyAuditor;
