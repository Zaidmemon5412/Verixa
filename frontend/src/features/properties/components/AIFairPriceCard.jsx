import React from 'react';
import {
  Bot, TrendingUp, TrendingDown, Minus, Sparkles,
  BadgeCheck, AlertCircle, ChevronRight, Loader2, Info
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

/* ─── Verdict config helper ─────────────────────────── */
function getVerdictConfig(verdict, color) {
  switch (color) {
    case 'green':
      return {
        bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        badge: '#10b981',
        badgeText: '#ecfdf5',
        icon: <TrendingDown className="w-4 h-4" />,
        glow: 'rgba(16, 185, 129, 0.25)',
        diffColor: '#6ee7b7',
        arrowBg: 'rgba(16, 185, 129, 0.15)',
        statusText: 'Good Deal (Listed < Fair Price)',
      };
    case 'red':
      return {
        bg: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
        badge: '#ef4444',
        badgeText: '#fef2f2',
        icon: <TrendingUp className="w-4 h-4" />,
        glow: 'rgba(239, 68, 68, 0.25)',
        diffColor: '#fca5a5',
        arrowBg: 'rgba(239, 68, 68, 0.15)',
        statusText: 'Overpriced (Listed > Fair Price)',
      };
    case 'yellow':
    default:
      return {
        bg: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
        badge: '#f59e0b',
        badgeText: '#fffbeb',
        icon: <Minus className="w-4 h-4" />,
        glow: 'rgba(245, 158, 11, 0.25)',
        diffColor: '#fcd34d',
        arrowBg: 'rgba(245, 158, 11, 0.15)',
        statusText: 'Fairly Priced (At Market Value)',
      };
  }
}

/* ─── Animated ring confidence arc ──────────────────── */
function ConfidenceArc({ value }) {
  const r = 38;
  const cx = 48;
  const cy = 48;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0), 100) / 100;
  const strokeDash = pct * circ;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="8"
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${strokeDash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: 'stroke-dasharray 1.2s ease-in-out' }}
      />
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <text
        x={cx} y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="15"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        {value}%
      </text>
      <text
        x={cx} y={cy + 17}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.55)"
        fontSize="7.5"
        fontFamily="Inter, sans-serif"
      >
        CONFIDENCE
      </text>
    </svg>
  );
}

/* ─── Price column ───────────────────────────────────── */
function PriceCol({ label, value, sub, accent, big = false }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: '16px 20px',
      flex: 1,
      minWidth: 0,
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{
        fontSize: big ? 22 : 18,
        fontWeight: 800,
        color: accent || 'white',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{sub}</p>
      )}
    </div>
  );
}

/* ─── Skeleton loader ────────────────────────────────── */
function AIFairPriceSkeleton() {
  return (
    <div style={{
      borderRadius: 24,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      padding: 28,
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: 6, marginBottom: 6 }} />
          <div style={{ height: 10, width: '40%', background: 'rgba(255,255,255,0.07)', borderRadius: 4 }} />
        </div>
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: 16 }} />
        ))}
      </div>
      <div style={{ height: 56, background: 'rgba(255,255,255,0.05)', borderRadius: 14, marginTop: 16 }} />
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 16 }}>
        Evaluating Fair Market Value via ML Model Engine · Please wait...
      </p>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function AIFairPriceCard({ propertyId, property }) {
  const { data, isLoading, isError, error } = useAIFairPrice(propertyId, property);

  if (isLoading) return <AIFairPriceSkeleton />;

  if (isError) {
    return (
      <div style={{
        borderRadius: 24,
        background: 'linear-gradient(135deg, #1c0a0a 0%, #450a0a 100%)',
        border: '1px solid rgba(239,68,68,0.25)',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: 'rgba(239,68,68,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#fca5a5', fontSize: 14 }}>AI Prediction Unavailable</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 }}>
            {error?.message || 'Could not load prediction data. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Normalized API and model fields
  const fairPriceNum = data.predicted_fair_price ?? data.ai_predicted_price ?? 0;
  const listedPriceNum = data.listed_price ?? property?.priceNum ?? 0;
  const confidenceScore = data.confidence_score ?? 95;

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
      style={{
        borderRadius: 24,
        background: cfg.bg,
        boxShadow: `0 8px 48px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Glassmorphic shimmer background lines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 120% 80% at 80% 10%, rgba(255,255,255,0.05) 0%, transparent 60%)',
      }} />

      <div style={{ padding: '28px 28px 24px', position: 'relative' }}>

        {/* ── Header ─────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.45)',
              flexShrink: 0,
            }}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}>
                  AI Fair Price Prediction
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  AI Verified
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: 500 }}>
                Powered by {data.model_type || 'XGBoost Fair Value Engine'} · Real-time inference
              </p>
            </div>
          </div>

          {/* Verdict Status Indicator Badge (Green / Yellow / Red) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: cfg.arrowBg,
            border: `1px solid ${cfg.badge}77`,
            borderRadius: 50,
            padding: '7px 16px',
            flexShrink: 0,
            boxShadow: `0 2px 12px ${cfg.glow}`,
          }}>
            <span style={{ color: cfg.badge }}>{cfg.icon}</span>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              color: cfg.badge,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}>
              {verdict}
            </span>
          </div>
        </div>

        {/* ── Price Comparison Grid ─────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <PriceCol
            label="Listed Price"
            value={listedPriceFormatted}
            sub="Asking seller price"
            big
          />
          <PriceCol
            label="AI Fair Price"
            value={aiPredictedPriceFormatted}
            sub="Predicted market value"
            accent={cfg.diffColor}
            big
          />
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 140,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '10px 14px',
              flex: 1,
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Difference Amount
              </p>
              <p style={{ fontSize: 15, fontWeight: 800, color: cfg.diffColor, letterSpacing: '-0.01em' }}>
                {sign}{priceDiffFormatted}
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '10px 14px',
              flex: 1,
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Market Variance
              </p>
              <p style={{ fontSize: 15, fontWeight: 800, color: cfg.diffColor, letterSpacing: '-0.01em' }}>
                {sign}{Math.abs(diffPct).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* ── Confidence & AI Insight ───────────── */}
        <div style={{
          display: 'flex', gap: 16, alignItems: 'stretch', marginBottom: 20, flexWrap: 'wrap',
        }}>
          {/* Confidence Score Arc Meter */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4,
            flexShrink: 0,
          }}>
            <ConfidenceArc value={confidenceScore} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>CONFIDENCE SCORE</span>
            </div>
          </div>

          {/* AI Insight Box */}
          <div style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16,
            padding: '18px 20px',
            flex: 1,
            minWidth: 200,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                AI Valuation Insight
              </span>
            </div>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.65,
              fontWeight: 400,
              margin: 0,
            }}>
              {data.insight || `${cfg.statusText}. Predicted using comparable property sales and locality feature indices.`}
            </p>
          </div>
        </div>

        {/* ── Footer disclaimer ──────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 10,
          padding: '9px 14px',
        }}>
          <Info className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Verixa AI Fair Price Engine evaluates multi-source real estate market datasets. Consult an authorized advisor prior to final commitments.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIFairPriceCard;
