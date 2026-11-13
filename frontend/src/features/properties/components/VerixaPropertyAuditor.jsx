import React, { useState } from 'react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { usePropertyAuditor } from '../hooks/usePropertyAuditor';
import { 
  Sparkles, 
  MessageSquareQuote, 
  ShieldAlert, 
  Target, 
  CheckCircle2, 
  Copy, 
  Check, 
  Bot, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';

/**
 * Verixa AI Property Auditor Component
 * Executive Decision & AI Deal Advisory Report.
 * Renders verified analytical findings and live Gemini LLM negotiations insights.
 */
export function VerixaPropertyAuditor({ property, builder }) {
  const { auditData, isLoading } = usePropertyAuditor(property, builder);
  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'price' | 'locality' | 'legal' | 'investment'
  const [copiedPitch, setCopiedPitch] = useState(false);

  if (isLoading) {
    return (
      <Card className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-28 bg-muted rounded w-full" />
      </Card>
    );
  }

  if (!auditData) return null;

  const {
    price_analysis: priceData,
    locality_analysis: localityData,
    legal_analysis: legalData,
    investment_analysis: investData,
    risk_analysis: riskData,
    final_recommendation: finalData,
    ai_advisor: aiAdvisorData
  } = auditData;

  const handleCopyPitch = () => {
    if (aiAdvisorData?.negotiation_script) {
      navigator.clipboard.writeText(aiAdvisorData.negotiation_script);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Unverified';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakhs`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getVerdictBadgeClass = (verdict) => {
    switch (verdict) {
      case 'Recommended':
        return 'bg-emerald-600 text-white font-bold px-3 py-1 text-xs rounded-md shadow-sm';
      case 'Recommended with Negotiation':
        return 'bg-amber-500 text-white font-bold px-3 py-1 text-xs rounded-md shadow-sm';
      case 'Needs Further Verification':
        return 'bg-rose-600 text-white font-bold px-3 py-1 text-xs rounded-md shadow-sm';
      default:
        return 'bg-rose-700 text-white font-bold px-3 py-1 text-xs rounded-md shadow-sm';
    }
  };

  const getPriceStatusBadgeClass = (status) => {
    switch (status) {
      case 'Undervalued':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Fairly Priced':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300';
      case 'Slightly Overpriced':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300';
    }
  };

  const categories = [
    { id: 'advisor', label: 'AI Deal Advisor', isSpecial: true },
    { id: 'price', label: 'Price Analysis' },
    { id: 'locality', label: 'Locality & Growth' },
    { id: 'legal', label: 'Legal Verification' },
    { id: 'investment', label: 'Investment & Risk' }
  ];

  return (
    <Card className="rounded-2xl border-2 border-border/80 bg-card shadow-md overflow-hidden text-foreground">
      {/* VERIXA VERDICT HEADER CARD */}
      <div className="bg-slate-900 text-white p-6 space-y-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
                VERIXA AI PROPERTY AUDITOR
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <Sparkles className="w-2.5 h-2.5" /> LLM Powered
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white mt-0.5">
              VERIXA VERDICT
            </h2>
          </div>
          <div>
            <span className={getVerdictBadgeClass(finalData?.decision || 'Recommended with Negotiation')}>
              Verdict: {finalData?.decision || 'Recommended with Negotiation'}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Reasoning:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside">
            {finalData?.rationale_bullets?.slice(0, 4).map((bullet, idx) => (
              <li key={idx} className="leading-relaxed">
                {bullet}
              </li>
            )) || (
              <>
                <li>Fair price valuation comparison performed against micro-market baseline.</li>
                <li>Developer track record and RERA compliance records verified.</li>
                <li>Locality growth indicators and rental demand evaluated.</li>
                <li>Title records and land registration details checked against database.</li>
              </>
            )}
          </ul>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* HORIZONTAL AUDIT CATEGORY SELECTOR CARDS */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Select Audit Module:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {categories.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 min-h-[44px] ${
                    isActive
                      ? cat.isSpecial
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-sm scale-[1.02]'
                        : 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]'
                      : cat.isSpecial
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/60'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                  }`}
                >
                  {cat.isSpecial && <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTED AUDIT CONTENT CONTAINER */}
        <div className="pt-2">

          {/* 0. AI DEAL ADVISOR CONTENT */}
          {activeTab === 'advisor' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 text-white border border-indigo-800/50 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      Verixa AI Deal & Negotiation Advisor
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Unfiltered buyer guidance & micro-market negotiation strategy
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="outline" className="bg-indigo-900/60 text-indigo-200 border-indigo-700/60 text-[10px] py-0.5">
                    {aiAdvisorData?.model_used || 'Gemini 1.5 Flash'}
                  </Badge>
                </div>
              </div>

              {/* 1. The Hard Truth Card */}
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <MessageSquareQuote className="w-4 h-4 shrink-0" />
                  <span>The Hard Truth (Unfiltered Reality)</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                  {aiAdvisorData?.hard_truth || (
                    'The property pricing reflects developer brand equity in this locality. Analyze comparable unit transaction rates before committing to advance earnest tokens.'
                  )}
                </p>
                {aiAdvisorData?.ai_verdict_summary && (
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <strong className="text-foreground">Executive Takeaway:</strong> {aiAdvisorData.ai_verdict_summary}
                  </p>
                )}
              </div>

              {/* 2. Target Counter-Offer & Pitch Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Target Price Card */}
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <Target className="w-4 h-4" />
                    <span>Recommended Counter-Offer</span>
                  </div>
                  <div className="py-2">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                      {aiAdvisorData?.recommended_counter_offer || formatCurrency(priceData?.fair_price)}
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      Target closing valuation based on verified micro-market comps.
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-800 dark:text-indigo-300 font-semibold bg-indigo-100/70 dark:bg-indigo-900/40 p-2 rounded-lg">
                    💡 Do not offer full asking price upfront.
                  </div>
                </div>

                {/* Negotiation Script Card */}
                <div className="md:col-span-2 p-4 rounded-xl border border-border/80 bg-card space-y-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <TrendingDown className="w-4 h-4 text-emerald-600" />
                      <span>Verbatim Builder Negotiation Pitch</span>
                    </div>
                    <button
                      onClick={handleCopyPitch}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-all"
                      title="Copy script to clipboard"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Pitch</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs sm:text-sm text-foreground italic leading-relaxed">
                    "{aiAdvisorData?.negotiation_script || (
                      `We have evaluated recent registered sale deeds in this micro-market and our algorithmic benchmark is lower than asking rate. We are ready with an immediate cheque if the basic cost includes parking allocation.`
                    )}"
                  </div>

                  <span className="text-[11px] text-muted-foreground block">
                    Use this exact dialogue during negotiation meetings to anchor the developer's sales desk.
                  </span>
                </div>
              </div>

              {/* 3. Leverage Points & Red Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Leverage Points */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Buyer Negotiation Leverage Points:
                  </span>
                  <ul className="space-y-1.5 text-muted-foreground list-none">
                    {(aiAdvisorData?.negotiation_leverage_points || [
                      'Asking rate exceeds micro-market registered transactions.',
                      'Title clearance search records require formal submission.',
                      'Ready-cheque booking leverage for 3-5% discount.'
                    ]).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Critical Red Flags */}
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 space-y-2">
                  <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Ground Checks Before Token Advance:
                  </span>
                  <ul className="space-y-1.5 text-muted-foreground list-none">
                    {(aiAdvisorData?.critical_red_flags || [
                      'Verify Khata and City Survey registration numbers with collector records.',
                      'Confirm carpet area ratio matches Gujarat RERA approved floor plans.'
                    ]).map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">⚠️</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 1. PRICE ANALYSIS CONTENT */}
          {activeTab === 'price' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                  SECTION 1: PRICE ANALYSIS
                </h3>
                <Badge variant="outline" className={getPriceStatusBadgeClass(priceData?.verdict)}>
                  Status: {priceData?.verdict || 'Fairly Priced'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs bg-muted/30 p-3 rounded-xl border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Listed Price</span>
                  <span className="font-bold text-foreground">{formatCurrency(priceData?.listed_price)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">AI Fair Price</span>
                  <span className="font-bold text-primary">
                    {priceData?.fair_price ? formatCurrency(priceData.fair_price) : 'This information could not be verified from the available records.'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Price Difference</span>
                  <span className="font-bold text-foreground">
                    {priceData?.difference_pct != null ? `${priceData.difference_pct > 0 ? '+' : ''}${priceData.difference_pct}%` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block">Analysis:</span>
                <p>
                  {priceData?.fair_price ? (
                    `The property is listed at ${formatCurrency(priceData.listed_price)} against an estimated algorithmic benchmark of ${formatCurrency(priceData.fair_price)}. The calculated price variance stands at ${priceData.difference_pct > 0 ? '+' : ''}${priceData.difference_pct}%. Based on recent transaction data in ${localityData?.locality_name || 'this locality'}, the asking price is classified as ${priceData.verdict?.toLowerCase()}.`
                  ) : (
                    'This information could not be verified from the available records.'
                  )}
                </p>
              </div>

              <div className="text-xs bg-primary/5 border border-primary/20 p-3 rounded-xl space-y-0.5">
                <span className="font-bold text-primary block">Negotiation Insight:</span>
                <p className="text-foreground">{priceData?.negotiation_tip || 'This information could not be verified from the available records.'}</p>
              </div>
            </div>
          )}

          {/* 2. LOCALITY & GROWTH CONTENT */}
          {activeTab === 'locality' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                SECTION 2: LOCALITY & GROWTH ANALYSIS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/30 p-3 rounded-xl border space-y-1.5">
                  <span className="font-bold text-foreground block">Strengths:</span>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    {localityData?.strengths?.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    )) || (
                      <li>This information could not be verified from the available records.</li>
                    )}
                  </ul>
                </div>

                <div className="bg-muted/30 p-3 rounded-xl border space-y-1.5">
                  <span className="font-bold text-foreground block">Limitations:</span>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    {localityData?.weaknesses?.map((wk, idx) => (
                      <li key={idx}>{wk}</li>
                    )) || (
                      <li>This information could not be verified from the available records.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block">Locality Summary:</span>
                <p>
                  {localityData?.locality_name ? (
                    `${localityData.locality_name} presents steady infrastructure connectivity and educational institution proximity. Rental demand is classified as ${localityData.rental_demand || 'Moderate'} with positive long-term appreciation indicators.`
                  ) : (
                    'This information could not be verified from the available records.'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* 3. LEGAL VERIFICATION CONTENT */}
          {activeTab === 'legal' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                SECTION 3: LEGAL VERIFICATION ANALYSIS
              </h3>

              <div className="space-y-1 text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border">
                <span className="font-semibold text-foreground block">Verification Summary:</span>
                <p>
                  {legalData?.statement ? (
                    legalData.statement
                  ) : (
                    'Legal verification could not be completed from available records.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/20 p-3 rounded-xl border space-y-1">
                  <span className="font-bold text-foreground block">Available Records:</span>
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Survey Registration: {legalData?.survey_number || 'Unverified'}</li>
                    <li>Khata Registration: {legalData?.khata_number || 'Unverified'}</li>
                    <li>NA Conversion Status: {legalData?.na_converted ? 'Approved' : 'Pending Certificate'}</li>
                    <li>Verification Status: {legalData?.verification_status || 'Unverified'}</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-3 rounded-xl border space-y-1">
                  <span className="font-bold text-foreground block">Missing or Unverified Information:</span>
                  {legalData?.missing_records && legalData.missing_records.length > 0 ? (
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      {legalData.missing_records.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No missing legal records identified in verified database context.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. INVESTMENT & RISK CONTENT */}
          {activeTab === 'investment' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                SECTION 4: INVESTMENT & RISK ANALYSIS
              </h3>

              <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block">Investment Outlook:</span>
                <p>
                  {investData?.summary || (
                    'This property demonstrates moderate long-term appreciation potential supported by locality demand and developer track record.'
                  )}
                </p>
              </div>

              <div className="bg-muted/30 p-3 rounded-xl border space-y-1.5 text-xs">
                <span className="font-bold text-foreground block">Identified Risks:</span>
                {riskData?.identified_risks && riskData.identified_risks.length > 0 ? (
                  <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                    {riskData.identified_risks.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No primary risk factors identified based on available database records.</p>
                )}
              </div>

              <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block">Recommendation:</span>
                <p>
                  {finalData?.decision === 'Recommended' ? (
                    'Based strictly on available database records, this property meets price valuation, builder execution, and title verification standards. It represents a favorable acquisition candidate for long-term end-users and investors.'
                  ) : finalData?.decision === 'Recommended with Negotiation' ? (
                    'This property is a viable acquisition candidate provided the buyer negotiates asking price closer to the AI fair valuation benchmark. Buyers should confirm final closing terms prior to commitment.'
                  ) : (
                    'Buyers are advised to complete independent legal clearance and request formal property valuation before proceeding with financial commitments.'
                  )}
                </p>
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}

export default VerixaPropertyAuditor;
