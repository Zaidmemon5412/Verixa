import React, { useState } from 'react';
import {
  Bot, TrendingUp, TrendingDown, Minus, Sparkles,
  BadgeCheck, AlertCircle, Loader2, Info, ArrowUpRight, ArrowDownRight, Equal,
  HelpCircle, BrainCircuit, Scale, Target, ShieldCheck, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { useAIFairPrice } from '../hooks/useAIFairPrice';

/* ─── INR Price Formatting Helper ─────────────────────── */
function formatPriceINR(val) {
  if (val == null || isNaN(val) || val === 0) return 'N/A';
  const num = Number(val);
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  } else if (num >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

/* ─── Verdict Styling Helper ─────────────────────────── */
function getVerdictConfig(verdict, color) {
  switch (color) {
    case 'green':
      return {
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        icon: <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        statusText: 'Good Deal (Below Fair Market Price)',
        pillColor: 'bg-emerald-500',
      };
    case 'red':
      return {
        badgeBg: 'bg-rose-50 dark:bg-rose-950/50',
        badgeBorder: 'border-rose-200 dark:border-rose-800',
        badgeText: 'text-rose-700 dark:text-rose-300',
        icon: <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        statusText: 'Overpriced (Above Fair Market Price)',
        pillColor: 'bg-rose-500',
      };
    case 'yellow':
    default:
      return {
        badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
        badgeBorder: 'border-amber-200 dark:border-amber-800',
        badgeText: 'text-amber-700 dark:text-amber-300',
        icon: <Equal className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        statusText: 'Fairly Priced (At Market Value)',
        pillColor: 'bg-amber-500',
      };
  }
}

/* ─── Skeleton Loader ────────────────────────────────── */
function AIFairPriceSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
        ))}
      </div>
      <div className="h-20 bg-blue-50/50 dark:bg-slate-800/30 rounded-xl" />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function AIFairPriceCard({ propertyId, property }) {
  const { data, isLoading, isError, error } = useAIFairPrice(propertyId, property);

  if (isLoading) return <AIFairPriceSkeleton />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">AI Valuation Unavailable</p>
          <p className="text-xs text-rose-600/80 dark:text-rose-300/70 mt-0.5">
            {error?.message || 'Could not load valuation inference data.'}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Normalized values
  const fairPriceNum = data.predicted_fair_price ?? data.ai_predicted_price ?? 0;
  const listedPriceNum = data.listed_price ?? property?.priceNum ?? 0;
  
  let rawConfidence = data.confidence_score ?? 95;
  if (rawConfidence > 0 && rawConfidence <= 1) {
    rawConfidence = rawConfidence * 100;
  }
  const confidenceScore = Number(rawConfidence.toFixed(1));

  const listedPriceFormatted = data.listed_price_formatted || (property?.price ? String(property.price) : formatPriceINR(listedPriceNum));
  const aiPredictedPriceFormatted = data.ai_predicted_price_formatted || formatPriceINR(fairPriceNum);

  const diffVal = listedPriceNum - fairPriceNum;
  const diffAbs = Math.abs(diffVal);
  const priceDiffFormatted = data.price_difference_formatted || formatPriceINR(diffAbs);
  const diffPct = data.difference_percentage ?? (fairPriceNum ? ((listedPriceNum - fairPriceNum) / fairPriceNum * 100) : 0);

  let verdict = data.verdict;
  let verdictColor = data.verdict_color;

  if (!verdict || !verdictColor) {
    if (listedPriceNum < fairPriceNum * 0.97) {
      verdict = "Good Deal";
      verdictColor = "green";
    } else if (listedPriceNum > fairPriceNum * 1.03) {
      verdict = "Overpriced";
      verdictColor = "red";
    } else {
      verdict = "Fairly Priced";
      verdictColor = "yellow";
    }
  }

  const cfg = getVerdictConfig(verdict, verdictColor);
  const isGoodDeal = verdictColor === 'green';
  const isOverpriced = verdictColor === 'red';
  const sign = isGoodDeal ? '-' : (isOverpriced ? '+' : '±');

  return (
    <div
      id="ai-fair-price-section"
      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
    >
      {/* ── Card Header ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/40 border-b border-slate-100 dark:border-slate-800 p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/25 shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Verixa AI Fair Price
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  AI Model Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {data.model_type || 'XGBoost & Random Forest Engine'} · Automated Market Valuation
              </p>
            </div>
          </div>

          {/* Verdict Status Badge & Compact Hover Tooltip */}
          <div className={`group relative cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wide shadow-xs shrink-0 transition-all hover:scale-105 active:scale-95 ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`}>
            {cfg.icon}
            <span className="uppercase">{verdict}</span>
            <HelpCircle className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />

            {/* Sleek Compact Hover Tooltip */}
            <div className="pointer-events-none absolute right-0 top-full mt-2 w-72 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-3.5 shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-30 border border-slate-700/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-1">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>How Verdict & Prediction Work</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Predicted via ML model evaluating carpet area, BHK, floor & locality transaction trends.
              </p>
              <div className="mt-2 pt-2 border-t border-slate-700/80 text-[10.5px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 font-bold">Good Deal:</span>
                  <span className="text-slate-300">Listed &lt; 97% Fair Price</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-400 font-bold">Fairly Priced:</span>
                  <span className="text-slate-300">Within ±3% Equilibrium</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-rose-400 font-bold">Overpriced:</span>
                  <span className="text-slate-300">Listed &gt; 103% Fair Price</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────────── */}
      <div className="p-5 md:p-6 space-y-6">

        {/* ── Primary Price Metrics Grid ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Listed Price */}
          <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Listed Price
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {listedPriceFormatted}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Seller asking price
            </p>
          </div>

          {/* 2. AI Fair Price (Primary Focus) */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 transition-colors hover:border-indigo-300 dark:hover:border-indigo-800">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                AI Fair Price
              </p>
              <BadgeCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {aiPredictedPriceFormatted}
            </p>
            <p className="text-[11px] text-indigo-700/70 dark:text-indigo-300/70 mt-1 font-medium">
              Estimated market valuation
            </p>
          </div>

          {/* 3. Compact Stat: Difference Amount */}
          <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Price Difference
            </p>
            <div className="my-1">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                {sign}{priceDiffFormatted}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Abs variance vs. fair price
            </p>
          </div>

          {/* 4. Compact Stat: Market Variance % */}
          <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 flex flex-col justify-between">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Market Variance
            </p>
            <div className="my-1">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                {sign}{Math.abs(diffPct).toFixed(1)}%
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {cfg.statusText}
            </p>
          </div>
        </div>

        {/* ── Model Confidence Score Progress Bar ──────────── */}
        <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Model Confidence Score
              </span>
            </div>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900">
              {confidenceScore}%
            </span>
          </div>

          {/* Sleek Progress Bar */}
          <div className="w-full h-2 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(Math.max(confidenceScore, 0), 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Based on carpet area, BHK, locality price trends, and decision tree ensemble variance.
          </p>
        </div>

        {/* ── AI Insight Card (Light Blue Highlight) ──────── */}
        <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/30 p-4 md:p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              AI Valuation Insight
            </h4>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {data.insight || `${cfg.statusText}. Predicted using comparable property sales and locality feature indices.`}
            </p>
          </div>
        </div>

      </div>

      {/* ── Card Footer Disclaimer ─────────────────────────── */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 px-5 py-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Verixa AI Fair Price Engine evaluates multi-source real estate market datasets. Consult an authorized financial or property advisor prior to final commitments.
        </span>
      </div>
    </div>
  );
}

export default AIFairPriceCard;


