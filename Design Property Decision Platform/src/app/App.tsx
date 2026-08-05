import { useState, useEffect, useCallback } from "react";
import {
  Search, Building2, MapPin, TrendingUp, Shield, CheckCircle,
  ArrowRight, BedDouble, Calendar, Phone, BookOpen, Hospital,
  Train, ShoppingBag, Settings, Menu, X, Filter,
  ArrowLeftRight, Plus, ChevronRight, Moon, Sun, User, Heart,
  Zap, Square, Star, Bell, BarChart3, Download, ExternalLink,
  Twitter, Linkedin, Instagram, Facebook, ChevronLeft,
  Calculator, Car, Trees, Utensils, AlertCircle, Activity,
  FileText, Brain, Target, TrendingDown, Award, Clock,
  Check, Info, Sparkles, Globe, ChevronDown
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadialBarChart, RadialBar, Cell, PieChart, Pie
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────

type Page = "home" | "projects" | "detail" | "builder" | "locality" | "compare" | "market" | "wishlist" | "profile";
type Nav = (page: Page, id?: string) => void;

interface Project {
  id: string; name: string; builder: string; builderId: string;
  price: string; priceNum: number; config: string; possession: string;
  location: string; locality: string; image: string; badges: string[];
  rera: string; investScore: number; growthScore: number;
  rentalYield: string; area: string; status: string;
  trustScore: number; amenities: string[];
}
interface Builder {
  id: string; name: string; abbr: string; completedProjects: number;
  ongoingProjects: number; yearsExp: number; trustScore: number;
  avgDelivery: string; description: string; color: string;
}
interface Locality {
  id: string; name: string; avgPrice: string; psf: string;
  rentalYield: string; growthScore: number; schools: number;
  hospitals: number; metro: string; shopping: number; image: string;
  traffic: "Low" | "Medium" | "High"; crime: "Low" | "Medium" | "High";
}

// ─── Static Data ───────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: "1", name: "Adani Shantigram", builder: "Adani Realty", builderId: "1",
    price: "₹85L – ₹2.4Cr", priceNum: 8500000, config: "2, 3, 4 BHK", possession: "Ready to Move",
    location: "SG Highway, Ahmedabad", locality: "SG Highway",
    image: "https://images.unsplash.com/photo-1714983007778-b370188238b8?w=800&h=500&fit=crop&auto=format",
    badges: ["RERA Verified", "Ready to Move"],
    rera: "PR/GJ/AHM/RAJ/RAA05586", investScore: 87, growthScore: 82,
    rentalYield: "3.8%", area: "1,200–3,500 sq ft", status: "Ready to Move",
    trustScore: 92,
    amenities: ["Clubhouse", "Swimming Pool", "Gymnasium", "Park", "24x7 Security", "EV Charging"],
  },
  {
    id: "2", name: "Godrej Garden City", builder: "Godrej Properties", builderId: "2",
    price: "₹62L – ₹1.8Cr", priceNum: 6200000, config: "1, 2, 3 BHK", possession: "Dec 2025",
    location: "Jagatpur, Ahmedabad", locality: "Gota",
    image: "https://images.unsplash.com/photo-1668840961273-d139aef95616?w=800&h=500&fit=crop&auto=format",
    badges: ["RERA Verified", "New Launch"],
    rera: "PR/GJ/AHM/GCPL/AA01786", investScore: 79, growthScore: 85,
    rentalYield: "3.5%", area: "750–2,200 sq ft", status: "Under Construction",
    trustScore: 95,
    amenities: ["Clubhouse", "Swimming Pool", "Gymnasium", "Tennis Court", "24x7 Security", "Power Backup"],
  },
  {
    id: "3", name: "Sobha City", builder: "Sobha Developers", builderId: "3",
    price: "₹1.2Cr – ₹3.8Cr", priceNum: 12000000, config: "2, 3, 4 BHK", possession: "Mar 2026",
    location: "Shela, Ahmedabad", locality: "Shela",
    image: "https://images.unsplash.com/photo-1775582336512-8d79600fa7d5?w=800&h=500&fit=crop&auto=format",
    badges: ["RERA Verified", "Luxury"],
    rera: "PR/GJ/AHM/SOBHA/AA02987", investScore: 83, growthScore: 78,
    rentalYield: "4.1%", area: "1,800–4,200 sq ft", status: "Under Construction",
    trustScore: 88,
    amenities: ["Clubhouse", "Swimming Pool", "Spa", "Gymnasium", "Concierge", "Smart Home"],
  },
  {
    id: "4", name: "Shivalik Solitaire", builder: "Shivalik Group", builderId: "4",
    price: "₹48L – ₹95L", priceNum: 4800000, config: "2, 3 BHK", possession: "Jun 2025",
    location: "South Bopal, Ahmedabad", locality: "South Bopal",
    image: "https://images.unsplash.com/photo-1670768480638-e8cdfcfb42c2?w=800&h=500&fit=crop&auto=format",
    badges: ["RERA Verified", "Ready to Move"],
    rera: "PR/GJ/AHM/SHIV/AA03478", investScore: 74, growthScore: 72,
    rentalYield: "3.2%", area: "1,050–1,850 sq ft", status: "Ready to Move",
    trustScore: 81,
    amenities: ["Clubhouse", "Park", "Gymnasium", "24x7 Security", "Power Backup"],
  },
  {
    id: "5", name: "GIFT City Residences", builder: "GIFT City Corp", builderId: "1",
    price: "₹95L – ₹2.8Cr", priceNum: 9500000, config: "2, 3 BHK", possession: "Sep 2026",
    location: "GIFT City, Gandhinagar", locality: "Gift City",
    image: "https://images.unsplash.com/photo-1775582336464-7a5311bf6848?w=800&h=500&fit=crop&auto=format",
    badges: ["RERA Verified", "New Launch", "Smart City"],
    rera: "PR/GJ/GND/GIFT/AA04521", investScore: 91, growthScore: 94,
    rentalYield: "4.8%", area: "1,100–2,800 sq ft", status: "New Launch",
    trustScore: 90,
    amenities: ["Smart Home", "Clubhouse", "Swimming Pool", "Gym", "Concierge", "EV Charging", "Solar Panels"],
  },
  {
    id: "6", name: "Arvind Expansia", builder: "Arvind SmartSpaces", builderId: "2",
    price: "₹72L – ₹1.5Cr", priceNum: 7200000, config: "2, 3 BHK", possession: "Mar 2026",
    location: "Shela, Ahmedabad", locality: "Shela",
    image: "https://images.unsplash.com/photo-1750758605895-34f909ca82ce?w=800&h=500&fit=crop&auto=format",
    badges: ["RERA Verified"],
    rera: "PR/GJ/AHM/ARV/AA05123", investScore: 80, growthScore: 77,
    rentalYield: "3.6%", area: "1,150–2,100 sq ft", status: "Under Construction",
    trustScore: 86,
    amenities: ["Clubhouse", "Swimming Pool", "Gymnasium", "Park", "24x7 Security"],
  },
];

const BUILDERS: Builder[] = [
  { id: "1", name: "Adani Realty", abbr: "AR", completedProjects: 48, ongoingProjects: 12, yearsExp: 28, trustScore: 92, avgDelivery: "On Time", color: "#2563EB", description: "Adani Realty delivers landmark residential and commercial developments across India with a commitment to sustainable and smart living communities." },
  { id: "2", name: "Godrej Properties", abbr: "GP", completedProjects: 85, ongoingProjects: 23, yearsExp: 32, trustScore: 95, avgDelivery: "On Time", color: "#14B8A6", description: "Godrej Properties brings the trusted Godrej philosophy of quality and innovation to real estate, creating iconic spaces across India for over three decades." },
  { id: "3", name: "Sobha Developers", abbr: "SD", completedProjects: 62, ongoingProjects: 8, yearsExp: 27, trustScore: 88, avgDelivery: "3 Months Early", color: "#8B5CF6", description: "Sobha Developers is renowned for its premium construction quality and backward integration, ensuring every detail meets the highest standards of luxury living." },
  { id: "4", name: "Shivalik Group", abbr: "SG", completedProjects: 31, ongoingProjects: 7, yearsExp: 22, trustScore: 81, avgDelivery: "6 Months Delay", color: "#F59E0B", description: "Shivalik Group focuses on affordable and mid-segment housing in the Ahmedabad market, offering value-driven solutions for aspiring homeowners." },
];

const LOCALITIES: Locality[] = [
  { id: "1", name: "South Bopal", avgPrice: "₹58L", psf: "₹4,800", rentalYield: "3.2%", growthScore: 76, schools: 12, hospitals: 6, metro: "2.4 km", shopping: 8, image: "https://images.unsplash.com/photo-1677091670903-e562dbdb7181?w=800&h=400&fit=crop&auto=format", traffic: "Medium", crime: "Low" },
  { id: "2", name: "Shela", avgPrice: "₹85L", psf: "₹6,200", rentalYield: "3.8%", growthScore: 82, schools: 18, hospitals: 9, metro: "1.8 km", shopping: 14, image: "https://images.unsplash.com/photo-1733953700275-85556a1d8a12?w=800&h=400&fit=crop&auto=format", traffic: "Low", crime: "Low" },
  { id: "3", name: "Gota", avgPrice: "₹52L", psf: "₹4,200", rentalYield: "3.0%", growthScore: 71, schools: 9, hospitals: 5, metro: "3.2 km", shopping: 11, image: "https://images.unsplash.com/photo-1722965569777-2aa84f7b9f60?w=800&h=400&fit=crop&auto=format", traffic: "High", crime: "Low" },
  { id: "4", name: "SG Highway", avgPrice: "₹1.2Cr", psf: "₹8,500", rentalYield: "4.2%", growthScore: 88, schools: 22, hospitals: 14, metro: "0.8 km", shopping: 19, image: "https://images.unsplash.com/photo-1635000567818-db9806b60fa4?w=800&h=400&fit=crop&auto=format", traffic: "High", crime: "Low" },
  { id: "5", name: "Gift City", avgPrice: "₹1.4Cr", psf: "₹9,200", rentalYield: "5.1%", growthScore: 94, schools: 8, hospitals: 4, metro: "0.5 km", shopping: 7, image: "https://images.unsplash.com/photo-1714983007778-b370188238b8?w=800&h=400&fit=crop&auto=format", traffic: "Low", crime: "Low" },
];

const NEARBY_PLACES = {
  schools: [
    { name: "Delhi Public School", dist: "0.4 km", rating: 4.8, type: "CBSE" },
    { name: "Navrachana International", dist: "0.9 km", rating: 4.6, type: "IB" },
    { name: "Udgam School", dist: "1.2 km", rating: 4.5, type: "CBSE" },
    { name: "St. Xavier's High School", dist: "1.8 km", rating: 4.4, type: "ICSE" },
  ],
  hospitals: [
    { name: "CIMS Hospital", dist: "0.6 km", rating: 4.7, type: "Multi Specialty" },
    { name: "Apollo Hospitals", dist: "1.1 km", rating: 4.6, type: "Super Specialty" },
    { name: "Sterling Hospital", dist: "1.5 km", rating: 4.3, type: "Multi Specialty" },
  ],
  metro: [
    { name: "GNFC Township Metro", dist: "0.8 km", rating: 4.5, type: "Blue Line" },
    { name: "Shela BRTS", dist: "0.3 km", rating: 4.0, type: "BRTS" },
  ],
  shopping: [
    { name: "Ahmedabad One Mall", dist: "0.5 km", rating: 4.4, type: "Premium Mall" },
    { name: "Alpha One Mall", dist: "1.4 km", rating: 4.2, type: "Mall" },
    { name: "Acropolis Mall", dist: "2.1 km", rating: 4.1, type: "Mall" },
  ],
  parks: [
    { name: "Vastrapur Lake", dist: "1.2 km", rating: 4.6, type: "Lake & Park" },
    { name: "Sindhu Bhavan Garden", dist: "0.7 km", rating: 4.2, type: "Garden" },
  ],
  restaurants: [
    { name: "Honest Restaurant", dist: "0.3 km", rating: 4.5, type: "Gujarati" },
    { name: "Agashiye Terrace", dist: "0.8 km", rating: 4.7, type: "Fine Dining" },
    { name: "Rajwadu Village", dist: "1.5 km", rating: 4.4, type: "Theme Restaurant" },
  ],
};

const priceHistoryData = [
  { month: "Jan 24", price: 5800 }, { month: "Mar 24", price: 6100 },
  { month: "May 24", price: 6300 }, { month: "Jul 24", price: 6200 },
  { month: "Sep 24", price: 6600 }, { month: "Nov 24", price: 6900 },
  { month: "Jan 25", price: 7200 }, { month: "Mar 25", price: 7500 },
];

const marketTrendData = [
  { month: "Jan", launches: 12, sales: 18 }, { month: "Feb", launches: 8, sales: 22 },
  { month: "Mar", launches: 15, sales: 28 }, { month: "Apr", launches: 11, sales: 24 },
  { month: "May", launches: 18, sales: 31 }, { month: "Jun", launches: 14, sales: 26 },
];

const localityPriceData = [
  { name: "Gift City", price: 9.2 }, { name: "SG Hwy", price: 8.5 },
  { name: "Shela", price: 6.2 }, { name: "S. Bopal", price: 4.8 }, { name: "Gota", price: 4.2 },
];

// ─── Utility Components ────────────────────────────────────────────────────

function getBadgeStyle(label: string) {
  if (label === "Ready to Move") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (label === "New Launch") return "bg-teal-50 text-teal-700 border-teal-100";
  if (label === "RERA Verified") return "bg-blue-50 text-blue-700 border-blue-100";
  if (label === "Luxury") return "bg-violet-50 text-violet-700 border-violet-100";
  if (label === "Smart City") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-600 border-slate-100";
}

const Chip = ({ label }: { label: string }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeStyle(label)}`}>
    {label === "RERA Verified" && <Shield className="w-2.5 h-2.5" />}
    {label}
  </span>
);

const ScoreRing = ({ score, size = 56, color = "#2563EB", animate = false }: { score: number; size?: number; color?: string; animate?: boolean }) => {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: animate ? "stroke-dashoffset 1s ease" : undefined }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{score}</span>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{score}/100</span>
    </div>
    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
    </div>
  </div>
);

const PropertyCard = ({
  project, onView, onCompare, onWishlist, isWishlisted, isCompared,
}: {
  project: Project; onView: () => void; onCompare: () => void;
  onWishlist: () => void; isWishlisted: boolean; isCompared: boolean;
}) => (
  <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
    <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
      <img src={project.image} alt={project.name} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
        {project.badges.slice(0, 2).map(b => <Chip key={b} label={b} />)}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onWishlist(); }}
        className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-sm transition-all ${isWishlisted ? "bg-red-500 text-white scale-110" : "bg-white/80 text-slate-400 hover:text-red-500 hover:scale-110"}`}>
        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
      </button>
      <div className="absolute bottom-3 right-3">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm">
          <Brain className="w-3 h-3 text-[#2563EB]" />
          <span className="text-[10px] text-slate-500 font-medium">AI Score</span>
          <span className="text-sm font-bold text-[#2563EB]">{project.investScore}</span>
        </div>
      </div>
    </div>
    <div className="p-5 flex flex-col flex-1">
      <div className="mb-1">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">{project.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{project.builder}</p>
      </div>
      <p className="text-xl font-bold text-[#2563EB] mt-2 mb-3">{project.price}</p>
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
        <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{project.config}</span>
        <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0" />{project.locality}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <Calendar className="w-3 h-3" />
        <span>{project.possession}</span>
      </div>
      <div className="flex gap-2 mt-auto">
        <button onClick={onView}
          className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 transition-colors">
          View Details
        </button>
        <button onClick={(e) => { e.stopPropagation(); onCompare(); }}
          className={`px-3.5 py-2.5 rounded-xl border transition-all ${isCompared ? "bg-[#14B8A6] text-white border-[#14B8A6]" : "border-slate-200 dark:border-slate-600 text-slate-500 hover:border-[#14B8A6] hover:text-[#14B8A6] dark:text-slate-400"}`}
          title="Add to compare">
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

// ─── Loan EMI Calculator ───────────────────────────────────────────────────

const LoanCalculator = ({ defaultPrice }: { defaultPrice: number }) => {
  const [loanAmt, setLoanAmt] = useState(Math.round(defaultPrice * 0.8 / 100000));
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const emi = useCallback(() => {
    const p = loanAmt * 100000;
    const r = rate / 12 / 100;
    const n = tenure * 12;
    if (r === 0) return Math.round(p / n);
    return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [loanAmt, rate, tenure]);

  const totalPayable = emi() * tenure * 12;
  const totalInterest = totalPayable - loanAmt * 100000;

  return (
    <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
          <Calculator className="w-3.5 h-3.5 text-[#2563EB]" />
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">EMI Calculator</h4>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-500">Loan Amount</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">₹{loanAmt}L</span>
          </div>
          <input type="range" min={10} max={300} value={loanAmt} onChange={e => setLoanAmt(+e.target.value)}
            className="w-full h-1.5 rounded-full accent-[#2563EB] cursor-pointer" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-500">Interest Rate</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">{rate}%</span>
          </div>
          <input type="range" min={6} max={14} step={0.1} value={rate} onChange={e => setRate(+e.target.value)}
            className="w-full h-1.5 rounded-full accent-[#14B8A6] cursor-pointer" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-500">Tenure</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">{tenure} yrs</span>
          </div>
          <input type="range" min={5} max={30} value={tenure} onChange={e => setTenure(+e.target.value)}
            className="w-full h-1.5 rounded-full accent-[#8B5CF6] cursor-pointer" />
        </div>
      </div>
      <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly EMI</p>
        <p className="text-2xl font-extrabold text-[#2563EB]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ₹{emi().toLocaleString("en-IN")}
        </p>
        <div className="flex gap-4 mt-2">
          <div>
            <p className="text-[10px] text-slate-400">Total Interest</p>
            <p className="text-xs font-semibold text-red-500">₹{(totalInterest / 100000).toFixed(1)}L</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Total Payable</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">₹{(totalPayable / 100000).toFixed(1)}L</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Compare Strip ─────────────────────────────────────────────────────────

const CompareStrip = ({ compareList, navigate, toggleCompare }: {
  compareList: string[]; navigate: Nav; toggleCompare: (id: string) => void;
}) => {
  if (compareList.length === 0) return null;
  const items = compareList.map(id => PROJECTS.find(p => p.id === id)).filter(Boolean) as Project[];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <ArrowLeftRight className="w-4 h-4 text-[#14B8A6]" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Compare</span>
          <span className="text-xs bg-[#14B8A6] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">{compareList.length}</span>
        </div>
        <div className="flex items-center gap-3 flex-1">
          {items.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{p.name}</p>
                <p className="text-[10px] text-slate-400">{p.price}</p>
              </div>
              <button onClick={() => toggleCompare(p.id)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {compareList.length === 1 && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-1.5 border-2 border-dashed border-slate-200 dark:border-slate-700">
              <Plus className="w-4 h-4 text-slate-400" />
              <p className="text-xs text-slate-400">Add one more</p>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate("compare")}
          disabled={compareList.length < 2}
          className="px-5 py-2 bg-[#14B8A6] text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
          Compare Now
        </button>
      </div>
    </div>
  );
};

// ─── Navbar ────────────────────────────────────────────────────────────────

const Navbar = ({ page, navigate, darkMode, toggleDark, wishlistCount, compareCount }: {
  page: Page; navigate: Nav; darkMode: boolean; toggleDark: () => void;
  wishlistCount: number; compareCount: number;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems: { label: string; pg: Page }[] = [
    { label: "Home", pg: "home" }, { label: "Projects", pg: "projects" },
    { label: "Builders", pg: "builder" }, { label: "Localities", pg: "locality" },
    { label: "Compare", pg: "compare" }, { label: "Market", pg: "market" },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate("home")} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#14B8A6] flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-extrabold text-slate-900 dark:text-white text-[15px] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Verixa
              </span>
              <span className="text-[9px] font-medium text-slate-400 tracking-wider uppercase">Property Intelligence</span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map(item => (
              <button key={item.pg} onClick={() => navigate(item.pg)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${page === item.pg ? "bg-blue-50 text-[#2563EB] dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => navigate("wishlist")}
              className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{wishlistCount}</span>
              )}
            </button>
            <button onClick={() => navigate("compare")}
              className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors">
              <ArrowLeftRight className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">{compareCount}</span>
              )}
            </button>
            <button onClick={toggleDark}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-2 ml-1">
              <button onClick={() => navigate("profile")} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Login
              </button>
              <button className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors">
                Register
              </button>
            </div>
            <button className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
            {navItems.map(item => (
              <button key={item.pg} onClick={() => { navigate(item.pg); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${page === item.pg ? "bg-blue-50 text-[#2563EB]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2 px-1">
              <button className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">Login</button>
              <button className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold">Register</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ─── Property Intelligence Section ────────────────────────────────────────

const PropertyIntelligenceSection = ({ navigate }: { navigate: Nav }) => {
  const intelligenceCards = [
    { icon: Brain, title: "AI Investment Score", desc: "ML model analyzes 50+ data points to score every property from 0–100.", score: 91, color: "#2563EB", gradient: "from-blue-500/10 to-blue-600/5" },
    { icon: Target, title: "Fair Price Estimate", desc: "Comparable transaction analysis gives you the true market value before you negotiate.", score: 87, color: "#14B8A6", gradient: "from-teal-500/10 to-teal-600/5" },
    { icon: Shield, title: "Builder Trust Score", desc: "Delivery history, RERA compliance, and legal records combine into one trust rating.", score: 92, color: "#8B5CF6", gradient: "from-violet-500/10 to-violet-600/5" },
    { icon: TrendingUp, title: "Growth Potential", desc: "Infrastructure pipeline, demand signals, and price momentum predict 3-year appreciation.", score: 84, color: "#F59E0B", gradient: "from-amber-500/10 to-amber-600/5" },
    { icon: AlertCircle, title: "Risk Assessment", desc: "Legal encumbrances, construction delays, and title clarity are flagged automatically.", score: 78, color: "#EF4444", gradient: "from-red-500/10 to-red-600/5" },
    { icon: Globe, title: "GIS Locality Analysis", desc: "Real-time OpenStreetMap data reveals schools, hospitals, metro, parks, and more.", score: 95, color: "#16A34A", gradient: "from-emerald-500/10 to-emerald-600/5" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-[#2563EB] text-xs font-semibold mb-4 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Verixa Intelligence Engine
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Data-Driven Property Decisions
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
          Every property on Verixa is analyzed by our machine learning engine across 50+ parameters so you never overpay or miss a red flag.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {intelligenceCards.map(card => (
          <div key={card.title} className={`group bg-gradient-to-br ${card.gradient} dark:from-slate-800 dark:to-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${card.color}18` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <ScoreRing score={card.score} size={48} color={card.color} animate />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 text-sm">{card.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-2xl p-8 text-center">
        <h3 className="text-xl font-extrabold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Get Your Free Property Intelligence Report
        </h3>
        <p className="text-blue-100 text-sm mb-5">Enter any property and receive a full AI-powered analysis in seconds.</p>
        <button onClick={() => navigate("projects")}
          className="px-8 py-3 bg-white text-[#2563EB] rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm">
          Analyze a Property
        </button>
      </div>
    </section>
  );
};

// ─── How It Works ──────────────────────────────────────────────────────────

const HowItWorksSection = ({ navigate }: { navigate: Nav }) => {
  const steps = [
    { n: "01", title: "Search & Discover", desc: "Find properties across Ahmedabad with powerful filters by locality, budget, builder, and configuration.", icon: Search, color: "#2563EB" },
    { n: "02", title: "Analyze & Compare", desc: "Our AI scores every property on investment potential, builder trust, fair price, and growth outlook.", icon: BarChart3, color: "#14B8A6" },
    { n: "03", title: "Verify & Decide", desc: "View RERA documents, check builder track records, and compare side-by-side before making the call.", icon: Shield, color: "#8B5CF6" },
  ];
  return (
    <section className="bg-slate-900 dark:bg-[#060F1E] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#14B8A6] mb-3">How it works</p>
          <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Research Like a Professional
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">From discovery to decision — Verixa guides every step of your property buying journey.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={step.n} className="relative bg-white/5 rounded-2xl p-7 border border-white/10 hover:border-white/20 transition-all">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center z-10">
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </div>
              )}
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl font-extrabold text-white/10 leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.n}</span>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}20` }}>
                  <step.icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
              </div>
              <h3 className="font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Home Page ─────────────────────────────────────────────────────────────

const HomePage = ({ navigate, wishlist, toggleWishlist, compareList, toggleCompare }: {
  navigate: Nav; wishlist: string[]; toggleWishlist: (id: string) => void;
  compareList: string[]; toggleCompare: (id: string) => void;
}) => {
  const [searchTab, setSearchTab] = useState<"Locality" | "Project" | "Builder">("Locality");
  const chips = ["South Bopal", "Shela", "Gota", "SG Highway", "Gift City"];
  const placeholders: Record<string, string> = {
    Locality: "Search by locality, area or pincode...",
    Project: "Search by project name...",
    Builder: "Search by builder name...",
  };

  return (
    <div className="dark:bg-slate-950">
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-slate-900"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1722965569777-2aa84f7b9f60?w=1920&h=1080&fit=crop&auto=format')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/65 via-slate-900/55 to-slate-900/90" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 text-xs font-semibold mb-8 tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5" />
            Ahmedabad Property Intelligence Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-extrabold text-white mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Research Before
            <span className="block" style={{ color: "#14B8A6" }}>You Buy.</span>
          </h1>
          <p className="text-xl text-slate-300 mb-14 max-w-2xl mx-auto leading-relaxed">
            Analyze properties, compare projects, evaluate builders, and make confident property decisions backed by real data.
          </p>
          {/* Search box */}
          <div className="bg-white/97 dark:bg-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-3 max-w-3xl mx-auto">
            <div className="flex gap-1 mb-3 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl">
              {(["Locality", "Project", "Builder"] as const).map(tab => (
                <button key={tab} onClick={() => setSearchTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium capitalize transition-all ${searchTab === tab ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder={placeholders[searchTab]}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm" />
              </div>
              <button onClick={() => navigate("projects")}
                className="px-7 py-3.5 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
                <Search className="w-4 h-4" />Search
              </button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 mt-7">
            {chips.map(chip => (
              <button key={chip} onClick={() => navigate("projects")}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all">
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="bg-[#2563EB]">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["2,400+", "Properties Analyzed"], ["180+", "Verified Builders"], ["45+", "Localities Mapped"], ["12,000+", "Informed Buyers"]].map(([v, l]) => (
            <div key={l}>
              <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v}</p>
              <p className="text-blue-200 text-sm mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Projects ── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-0">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#14B8A6] mb-2">Featured</p>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Top Projects in Ahmedabad</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Curated by our property intelligence engine</p>
          </div>
          <button onClick={() => navigate("projects")} className="hidden md:flex items-center gap-1.5 text-[#2563EB] text-sm font-semibold hover:gap-3 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map(p => (
            <PropertyCard key={p.id} project={p}
              onView={() => navigate("detail", p.id)}
              onCompare={() => toggleCompare(p.id)}
              onWishlist={() => toggleWishlist(p.id)}
              isWishlisted={wishlist.includes(p.id)}
              isCompared={compareList.includes(p.id)} />
          ))}
        </div>
      </section>

      {/* ── Property Intelligence ── */}
      <PropertyIntelligenceSection navigate={navigate} />

      {/* ── Trending Localities ── */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#14B8A6] mb-2">Localities</p>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Trending Areas</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">High-growth localities with strong investment potential</p>
            </div>
            <button onClick={() => navigate("locality")} className="hidden md:flex items-center gap-1.5 text-[#2563EB] text-sm font-semibold hover:gap-3 transition-all">
              Explore all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LOCALITIES.map(loc => (
              <button key={loc.id} onClick={() => navigate("locality", loc.id)}
                className="group relative overflow-hidden rounded-2xl text-left bg-slate-200 dark:bg-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
                <img src={loc.image} alt={loc.name} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{loc.name}</h3>
                      <p className="text-slate-300 text-sm mt-0.5">Avg {loc.avgPrice} &nbsp;&middot;&nbsp; {loc.psf}/sqft</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-teal-300 font-semibold uppercase tracking-wider">Growth</div>
                      <div className="text-3xl font-extrabold text-white leading-tight">{loc.growthScore}</div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Builders ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#14B8A6] mb-2">Builders</p>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Trusted Developers</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Verified builders with transparent track records</p>
          </div>
          <button onClick={() => navigate("builder")} className="hidden md:flex items-center gap-1.5 text-[#2563EB] text-sm font-semibold hover:gap-3 transition-all">
            All builders <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BUILDERS.map(b => (
            <button key={b.id} onClick={() => navigate("builder", b.id)}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-[#2563EB]/20 transition-all text-left">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-5 group-hover:scale-105 transition-transform shadow-sm" style={{ background: b.color }}>
                {b.abbr}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">{b.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{b.completedProjects} completed projects</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Trust Score</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{b.trustScore}<span className="text-sm font-normal text-slate-400">/100</span></p>
                </div>
                <ScoreRing score={b.trustScore} size={46} color={b.color} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <HowItWorksSection navigate={navigate} />

      {/* ── Market Snapshot ── */}
      <section className="bg-[#0A1628] dark:bg-[#060F1E] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#14B8A6] mb-2">Market Data</p>
              <h2 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Market Snapshot</h2>
              <p className="text-slate-400 mt-2 text-sm">Ahmedabad real estate at a glance — Q1 2025</p>
            </div>
            <button onClick={() => navigate("market")} className="flex items-center gap-1.5 text-[#14B8A6] text-sm font-semibold hover:gap-3 transition-all">
              Full insights <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { l: "Avg Price (SG Hwy)", v: "₹8,500/sqft", c: "+12.4%" },
              { l: "New Launches Q1", v: "142 Units", c: "+8.2%" },
              { l: "Absorption Rate", v: "68%", c: "+5.1%" },
              { l: "Avg Rental Yield", v: "3.8%", c: "+0.3%" },
            ].map(m => (
              <div key={m.l} className="bg-white/5 rounded-2xl p-5 border border-white/8">
                <p className="text-slate-400 text-xs mb-2">{m.l}</p>
                <p className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.v}</p>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">{m.c} YoY</span>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/8">
              <h3 className="text-white font-semibold mb-0.5 text-sm">Price Trend (₹/sqft)</h3>
              <p className="text-slate-500 text-xs mb-5">Average across Ahmedabad</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={priceHistoryData}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 10, fill: "#64748B" }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: "#64748B" }} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 10, color: "#F1F5F9", fontSize: 12 }} />
                  <Area type="monotone" dataKey="price" stroke="#2563EB" fill="url(#heroGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/8">
              <h3 className="text-white font-semibold mb-0.5 text-sm">Locality Price Comparison</h3>
              <p className="text-slate-500 text-xs mb-5">₹k per sq ft</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={localityPriceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#475569" tick={{ fontSize: 10, fill: "#64748B" }} />
                  <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fontSize: 10, fill: "#64748B" }} width={62} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 10, color: "#F1F5F9", fontSize: 12 }} />
                  <Bar dataKey="price" fill="#14B8A6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#14B8A6] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verixa</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Property Intelligence</span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mb-5">
              The most trusted platform for intelligent property research and decision-making in Ahmedabad.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-[#2563EB] hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          {[
            { heading: "Platform", links: ["Projects", "Builders", "Localities", "Compare", "Market Insights"] },
            { heading: "Company", links: ["About Verixa", "Blog", "Careers", "Press"] },
            { heading: "Legal", links: ["Privacy Policy", "Terms of Use", "Cookie Policy", "Contact"] },
          ].map(col => (
            <div key={col.heading}>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}><button className="text-slate-500 dark:text-slate-400 text-sm hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">{l}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-5 text-center">
            <p className="text-slate-400 text-xs">© 2025 Verixa Technologies Pvt. Ltd. All rights reserved. For informational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Projects Page ──────────────────────────────────────────────────────────

const ProjectsPage = ({ navigate, wishlist, toggleWishlist, compareList, toggleCompare }: {
  navigate: Nav; wishlist: string[]; toggleWishlist: (id: string) => void;
  compareList: string[]; toggleCompare: (id: string) => void;
}) => {
  const [locality, setLocality] = useState("All");
  const [config, setConfig] = useState("All");
  const [status, setStatus] = useState("All");
  const localities = ["All", "SG Highway", "Shela", "South Bopal", "Gota", "Gift City"];
  const configs = ["All", "1 BHK", "2 BHK", "3 BHK", "4 BHK"];
  const statuses = ["All", "Ready to Move", "Under Construction", "New Launch"];

  const filtered = PROJECTS.filter(p => {
    if (locality !== "All" && p.locality !== locality) return false;
    if (config !== "All" && !p.config.includes(config.replace(" BHK", ""))) return false;
    if (status !== "All" && p.status !== status) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>All Projects</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{filtered.length} projects found in Ahmedabad</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm mb-8 space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
          <Filter className="w-4 h-4" />Filter Projects
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Locality</p>
          <div className="flex flex-wrap gap-2">
            {localities.map(l => (
              <button key={l} onClick={() => setLocality(l)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${locality === l ? "bg-[#2563EB] text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Configuration</p>
            <div className="flex flex-wrap gap-2">
              {configs.map(c => (
                <button key={c} onClick={() => setConfig(c)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${config === c ? "bg-[#14B8A6] text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${status === s ? "bg-violet-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-200 dark:text-slate-700" />
          <p className="font-medium">No projects match your filters</p>
          <button onClick={() => { setLocality("All"); setConfig("All"); setStatus("All"); }} className="mt-3 text-sm text-[#2563EB] hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <PropertyCard key={p.id} project={p}
              onView={() => navigate("detail", p.id)}
              onCompare={() => toggleCompare(p.id)}
              onWishlist={() => toggleWishlist(p.id)}
              isWishlisted={wishlist.includes(p.id)}
              isCompared={compareList.includes(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Project Detail Page ───────────────────────────────────────────────────

const ProjectDetailPage = ({ projectId, navigate, wishlist, toggleWishlist, compareList, toggleCompare }: {
  projectId: string; navigate: Nav; wishlist: string[]; toggleWishlist: (id: string) => void;
  compareList: string[]; toggleCompare: (id: string) => void;
}) => {
  const [tab, setTab] = useState("overview");
  const [activeImg, setActiveImg] = useState(0);
  const [nearbyTab, setNearbyTab] = useState<keyof typeof NEARBY_PLACES>("schools");
  const project = PROJECTS.find(p => p.id === projectId) || PROJECTS[0];
  const builder = BUILDERS.find(b => b.id === project.builderId) || BUILDERS[0];
  const tabs = ["Overview", "Amenities", "Location", "Nearby Places", "Price History", "Investment", "Documents"];

  const galleryImages = [project.image, project.image, project.image, project.image];

  const nearbyCategories: { key: keyof typeof NEARBY_PLACES; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "schools", label: "Schools", Icon: BookOpen },
    { key: "hospitals", label: "Hospitals", Icon: Hospital },
    { key: "metro", label: "Metro/BRTS", Icon: Train },
    { key: "shopping", label: "Shopping", Icon: ShoppingBag },
    { key: "parks", label: "Parks", Icon: Trees },
    { key: "restaurants", label: "Dining", Icon: Utensils },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <button onClick={() => navigate("home")} className="hover:text-[#2563EB]">Home</button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => navigate("projects")} className="hover:text-[#2563EB]">Projects</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-white font-medium truncate">{project.name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm relative">
            <img src={galleryImages[activeImg]} alt={project.name} className="w-full h-[380px] object-cover transition-all duration-500" />
            <button onClick={() => setActiveImg(i => Math.max(0, i - 1))} disabled={activeImg === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-all">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={() => setActiveImg(i => Math.min(galleryImages.length - 1, i + 1))} disabled={activeImg === galleryImages.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-all">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 ring-2 transition-all ${i === activeImg ? "ring-[#2563EB]" : "ring-transparent hover:ring-[#2563EB]/40"}`}>
                <img src={img} alt="" className="w-full h-20 object-cover" />
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 flex gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t.toLowerCase())}
                className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${tab === t.toLowerCase() ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[["Project Type", "Residential"], ["Total Units", "840"], ["Floors", "24–36"], ["Area Range", project.area], ["Launch Year", "2021"], ["Possession", project.possession]].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">About the Project</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  {project.name} by {project.builder} is a premium residential development in {project.locality}, Ahmedabad. Offering {project.config} configurations with world-class amenities, this project redefines modern living with exceptional connectivity, curated green spaces, and smart home features designed for the next generation of homeowners.
                </p>
              </div>
              {/* RERA Verification banner */}
              <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">RERA Verified Property</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 font-mono mt-0.5">{project.rera}</p>
                </div>
                <a href="https://gujrera.gujarat.gov.in" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex-shrink-0">
                  Verify <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {tab === "amenities" && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                {project.amenities.map(a => (
                  <div key={a} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{a}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 text-center">More amenities subject to confirmation at site visit</p>
              </div>
            </div>
          )}

          {tab === "location" && (
            <div className="space-y-4">
              {/* Mock map */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-64 overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                <div className="absolute inset-0" style={{
                  backgroundImage: "radial-gradient(circle at 50% 50%, #2563EB22 0%, transparent 60%), linear-gradient(0deg, #e2e8f022 1px, transparent 1px), linear-gradient(90deg, #e2e8f022 1px, transparent 1px)",
                  backgroundSize: "100% 100%, 32px 32px, 32px 32px"
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center shadow-xl">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -inset-3 rounded-full bg-[#2563EB]/20 animate-ping" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">{project.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { Icon: BookOpen, l: "Schools", v: "8 nearby" },
                  { Icon: Hospital, l: "Hospitals", v: "4 nearby" },
                  { Icon: Train, l: "Metro", v: "0.8 km" },
                  { Icon: ShoppingBag, l: "Malls", v: "3 nearby" },
                ].map(item => (
                  <div key={item.l} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-center">
                    <item.Icon className="w-5 h-5 text-[#2563EB] mx-auto mb-2" />
                    <p className="text-xs text-slate-500 mb-0.5">{item.l}</p>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "nearby places" && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {nearbyCategories.map(cat => (
                  <button key={cat.key} onClick={() => setNearbyTab(cat.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${nearbyTab === cat.key ? "bg-[#2563EB] text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                    <cat.Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {NEARBY_PLACES[nearbyTab].map((place: { name: string; dist: string; rating: number; type: string }) => (
                  <div key={place.name} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const cat = nearbyCategories.find(c => c.key === nearbyTab);
                        return cat ? <cat.Icon className="w-4.5 h-4.5 text-[#2563EB]" /> : <MapPin className="w-4 h-4 text-[#2563EB]" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{place.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{place.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-[#2563EB]">{place.dist}</p>
                      <div className="flex items-center gap-0.5 justify-end mt-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        <span className="text-xs text-slate-500">{place.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "price history" && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                {[["Current Avg", "₹7,500/sqft"], ["1 Year Growth", "+12.4%"], ["2 Year Growth", "+29.3%"]].map(([l, v]) => (
                  <div key={l} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 mb-1">{l}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Price Trend (₹/sqft)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={priceHistoryData}>
                    <defs>
                      <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
                    <Area type="monotone" dataKey="price" stroke="#2563EB" fill="url(#detailGrad)" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === "investment" && (
            <div className="space-y-5">
              {/* AI verdict */}
              <div className={`flex items-center gap-4 p-5 rounded-2xl border ${project.investScore >= 85 ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30" : "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30"}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${project.investScore >= 85 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                  <Award className={`w-6 h-6 ${project.investScore >= 85 ? "text-emerald-600" : "text-amber-600"}`} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${project.investScore >= 85 ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"}`}>
                    Verixa Verdict: {project.investScore >= 85 ? "Strong Buy" : project.investScore >= 75 ? "Good Investment" : "Moderate Investment"}
                  </p>
                  <p className={`text-xs mt-0.5 ${project.investScore >= 85 ? "text-emerald-600" : "text-amber-600"}`}>
                    AI confidence level: {project.investScore >= 85 ? "High (92%)" : "Moderate (78%)"}
                  </p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <ScoreRing score={project.investScore} size={60} color={project.investScore >= 85 ? "#16A34A" : "#F59E0B"} animate />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Investment Score", score: project.investScore, color: "#2563EB" },
                  { label: "Growth Score", score: project.growthScore, color: "#14B8A6" },
                  { label: "Builder Trust", score: project.trustScore, color: "#8B5CF6" },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <ScoreRing score={s.score} size={60} color={s.color} animate />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.score}<span className="text-sm font-normal text-slate-400">/100</span></p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Estimated Fair Price", value: "₹7,200–₹7,800/sqft", sub: "Based on 12 comparable transactions", good: true },
                  { label: "Rental Yield", value: project.rentalYield, sub: "Expected annual rental return", good: true },
                  { label: "3-Year Appreciation", value: "18–24%", sub: "Based on locality growth signals", good: true },
                  { label: "Risk Level", value: "Low–Medium", sub: "Builder has strong delivery track record", good: true },
                ].map(c => (
                  <div key={c.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{c.label}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{c.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="space-y-3">
              {[
                { name: "RERA Certificate", status: "Verified", verified: true },
                { name: "Building Plan Approval", status: "Verified", verified: true },
                { name: "Environmental Clearance", status: "Verified", verified: true },
                { name: "Fire NOC", status: "Verified", verified: true },
                { name: "Commencement Certificate", status: "Pending Verification", verified: false },
              ].map(doc => (
                <div key={doc.name} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.verified ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                      {doc.verified ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white text-sm">{doc.name}</p>
                      <p className={`text-xs ${doc.verified ? "text-emerald-600" : "text-amber-500"}`}>{doc.status}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-[#2563EB] font-medium hover:underline">
                    <Download className="w-3.5 h-3.5" />Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm sticky top-20 max-h-screen overflow-y-auto">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.badges.map(b => <Chip key={b} label={b} />)}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{project.name}</h1>
            <button onClick={() => navigate("builder", project.builderId)} className="text-sm text-[#2563EB] hover:underline mb-4 block">{project.builder}</button>
            <p className="text-3xl font-extrabold text-[#2563EB] mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{project.price}</p>
            <p className="text-xs text-slate-500 mb-5">{project.area}</p>

            <div className="space-y-0 mb-5 divide-y divide-slate-50 dark:divide-slate-700">
              {[
                { l: "Configuration", v: project.config }, { l: "Possession", v: project.possession },
                { l: "RERA No.", v: project.rera }, { l: "Status", v: project.status },
                { l: "Location", v: project.location },
              ].map(item => (
                <div key={item.l} className="flex justify-between items-center py-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.l}</span>
                  <span className="font-medium text-slate-900 dark:text-white text-xs text-right max-w-[55%]">{item.v}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <button className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                <Phone className="w-4 h-4" />Contact Builder
              </button>
              <button className="w-full py-3 bg-[#14B8A6] text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors text-sm">
                Book Site Visit
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => toggleWishlist(project.id)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${wishlist.includes(project.id) ? "bg-red-500 text-white border-red-500" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-300 hover:text-red-500"}`}>
                  <Heart className={`w-4 h-4 ${wishlist.includes(project.id) ? "fill-current" : ""}`} />
                  Save
                </button>
                <button onClick={() => toggleCompare(project.id)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${compareList.includes(project.id) ? "bg-teal-500 text-white border-teal-500" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-300 hover:text-teal-500"}`}>
                  <ArrowLeftRight className="w-4 h-4" />Compare
                </button>
              </div>
            </div>

            {/* Builder mini */}
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => navigate("builder", builder.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: builder.color }}>
                  {builder.abbr}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{builder.name}</p>
                  <p className="text-xs text-slate-500">Trust Score: {builder.trustScore}/100</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>
            </div>

            {/* Loan Calculator */}
            <LoanCalculator defaultPrice={project.priceNum} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Builder Page ───────────────────────────────────────────────────────────

const BuilderPage = ({ builderId, navigate, wishlist, toggleWishlist, compareList, toggleCompare }: {
  builderId: string; navigate: Nav; wishlist: string[]; toggleWishlist: (id: string) => void;
  compareList: string[]; toggleCompare: (id: string) => void;
}) => {
  const [selectedId, setSelectedId] = useState(builderId || "1");
  const builder = BUILDERS.find(b => b.id === selectedId) || BUILDERS[0];
  const projects = PROJECTS.filter(p => p.builderId === builder.id);

  const deliveryColor = builder.avgDelivery === "On Time" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
    : builder.avgDelivery.includes("Early") ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
    : "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {BUILDERS.map(b => (
          <button key={b.id} onClick={() => setSelectedId(b.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap ${selectedId === b.id ? "border-[#2563EB] bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"}`}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ background: b.color }}>{b.abbr}</div>
            <span className="font-medium text-slate-900 dark:text-white text-sm">{b.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-sm" style={{ background: builder.color }}>
            {builder.abbr}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{builder.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">
                    <CheckCircle className="w-3 h-3" />Verified Builder
                  </span>
                  <span className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${deliveryColor}`}>
                    <Clock className="w-3 h-3" />{builder.avgDelivery}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xl">{builder.description}</p>
              </div>
              <div className="hidden md:block flex-shrink-0">
                <ScoreRing score={builder.trustScore} size={80} color={builder.color} animate />
                <p className="text-xs text-slate-500 text-center mt-1.5">Trust Score</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
          {[
            { label: "Completed Projects", value: builder.completedProjects },
            { label: "Ongoing Projects", value: builder.ongoingProjects },
            { label: "Years Experience", value: builder.yearsExp },
            { label: "Trust Score", value: `${builder.trustScore}/100` },
            { label: "Avg Delivery", value: builder.avgDelivery },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Projects by {builder.name}
        {projects.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({projects.length})</span>}
      </h2>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <PropertyCard key={p.id} project={p}
              onView={() => navigate("detail", p.id)}
              onCompare={() => toggleCompare(p.id)}
              onWishlist={() => toggleWishlist(p.id)}
              isWishlisted={wishlist.includes(p.id)}
              isCompared={compareList.includes(p.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">No projects listed yet.</div>
      )}
    </div>
  );
};

// ─── Locality Page ─────────────────────────────────────────────────────────

const LocalityPage = ({ localityId, navigate, wishlist, toggleWishlist, compareList, toggleCompare }: {
  localityId: string; navigate: Nav; wishlist: string[]; toggleWishlist: (id: string) => void;
  compareList: string[]; toggleCompare: (id: string) => void;
}) => {
  const [selectedId, setSelectedId] = useState(localityId || "1");
  const locality = LOCALITIES.find(l => l.id === selectedId) || LOCALITIES[0];
  const nearbyProjects = PROJECTS.filter(p => p.locality === locality.name);

  const trafficConfig = {
    Low: { color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/20", label: "Low Traffic", icon: "🟢" },
    Medium: { color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/20", label: "Medium Traffic", icon: "🟡" },
    High: { color: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/20", label: "Heavy Traffic", icon: "🔴" },
  };
  const crimeConfig = {
    Low: { color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/20", label: "Safe Area" },
    Medium: { color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/20", label: "Moderate Safety" },
    High: { color: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/20", label: "High Crime" },
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {LOCALITIES.map(l => (
          <button key={l.id} onClick={() => setSelectedId(l.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedId === l.id ? "bg-[#2563EB] text-white shadow-sm" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#2563EB]/40"}`}>
            {l.name}
          </button>
        ))}
      </div>

      <div className="relative rounded-3xl overflow-hidden h-72 mb-8 bg-slate-200 dark:bg-slate-800 shadow-sm">
        <img src={locality.image} alt={locality.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 pb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-teal-300 mb-2">Ahmedabad</p>
          <h1 className="text-5xl font-extrabold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{locality.name}</h1>
          <p className="text-slate-300 text-sm">Avg {locality.avgPrice} &nbsp;&middot;&nbsp; {locality.psf}/sqft &nbsp;&middot;&nbsp; Yield {locality.rentalYield}</p>
        </div>
        {/* Traffic badge on image */}
        <div className={`absolute top-5 right-5 px-3 py-1.5 rounded-full border text-xs font-semibold ${trafficConfig[locality.traffic].color}`}>
          {trafficConfig[locality.traffic].icon} {trafficConfig[locality.traffic].label}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Core stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: "Avg Property Price", v: locality.avgPrice, Icon: Building2, c: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
              { l: "Price per Sqft", v: locality.psf, Icon: Square, c: "text-violet-500 bg-violet-50 dark:bg-violet-900/20" },
              { l: "Rental Yield", v: locality.rentalYield, Icon: TrendingUp, c: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
              { l: "Growth Score", v: locality.growthScore, Icon: Zap, c: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
            ].map(c => (
              <div key={c.l} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className={`w-9 h-9 rounded-xl ${c.c} flex items-center justify-center mb-3`}><c.Icon className="w-4 h-4" /></div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{c.l}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{c.v}</p>
              </div>
            ))}
          </div>

          {/* Traffic & Crime */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-5 rounded-xl border ${trafficConfig[locality.traffic].color}`}>
              <div className="flex items-center gap-3 mb-2">
                <Car className="w-5 h-5" />
                <span className="font-semibold text-sm">Traffic Congestion</span>
              </div>
              <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{locality.traffic}</p>
              <p className="text-xs mt-1 opacity-75">Peak hour traffic analysis</p>
            </div>
            <div className={`p-5 rounded-xl border ${crimeConfig[locality.crime].color}`}>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold text-sm">Safety Index</span>
              </div>
              <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{crimeConfig[locality.crime].label}</p>
              <p className="text-xs mt-1 opacity-75">Based on public safety records</p>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-5">Infrastructure &amp; Connectivity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { Icon: BookOpen, l: "Schools", v: locality.schools, unit: "nearby" },
                { Icon: Hospital, l: "Hospitals", v: locality.hospitals, unit: "nearby" },
                { Icon: Train, l: "Metro", v: locality.metro, unit: "" },
                { Icon: ShoppingBag, l: "Shopping", v: locality.shopping, unit: "centers" },
              ].map(item => (
                <div key={item.l} className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <item.Icon className="w-5 h-5 text-[#2563EB] mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{item.v}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.l} {item.unit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price trend mini-chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">Price Trend in {locality.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">₹/sqft over last 15 months</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={priceHistoryData}>
                <defs>
                  <linearGradient id="localityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 11 }} />
                <Area type="monotone" dataKey="price" stroke="#14B8A6" fill="url(#localityGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Nearby projects */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Projects in {locality.name}
              {nearbyProjects.length > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({nearbyProjects.length})</span>}
            </h3>
            {nearbyProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {nearbyProjects.map(p => (
                  <PropertyCard key={p.id} project={p}
                    onView={() => navigate("detail", p.id)}
                    onCompare={() => toggleCompare(p.id)}
                    onWishlist={() => toggleWishlist(p.id)}
                    isWishlisted={wishlist.includes(p.id)}
                    isCompared={compareList.includes(p.id)} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-8 text-center">No projects listed for this locality yet.</p>
            )}
          </div>
        </div>

        {/* Scorecard */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm sticky top-20">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Locality Scorecard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Powered by Verixa GIS &amp; ML Engine</p>
            <ScoreBar label="Overall Growth" score={locality.growthScore} color="#2563EB" />
            <ScoreBar label="Connectivity" score={Math.min(locality.growthScore + 3, 99)} color="#14B8A6" />
            <ScoreBar label="Social Infrastructure" score={Math.min(locality.schools * 3 + 20, 95)} color="#8B5CF6" />
            <ScoreBar label="Price Appreciation" score={locality.growthScore - 8} color="#F59E0B" />
            <ScoreBar label="Rental Demand" score={locality.growthScore - 15} color="#EF4444" />
            <ScoreBar label="Safety Score" score={locality.crime === "Low" ? 88 : locality.crime === "Medium" ? 65 : 40} color="#16A34A" />

            <div className="mt-5 p-4 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 rounded-xl border border-[#2563EB]/10">
              <p className="text-xs font-semibold text-[#2563EB] mb-1">Verixa Verdict</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {locality.growthScore >= 88 ? "Premium Investment Zone" : locality.growthScore >= 78 ? "Strong Investment" : "Good Investment"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Based on comprehensive GIS analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Compare Page ───────────────────────────────────────────────────────────

const ComparePage = ({ compareList, navigate, toggleCompare }: {
  compareList: string[]; navigate: Nav; toggleCompare: (id: string) => void;
}) => {
  const p1 = PROJECTS.find(p => p.id === compareList[0]);
  const p2 = PROJECTS.find(p => p.id === compareList[1]);

  const rows: { label: string; get: (p: Project) => string | number }[] = [
    { label: "Starting Price", get: p => p.price },
    { label: "Builder", get: p => p.builder },
    { label: "Configuration", get: p => p.config },
    { label: "Area Range", get: p => p.area },
    { label: "Possession", get: p => p.possession },
    { label: "Location", get: p => p.location },
    { label: "Status", get: p => p.status },
    { label: "RERA Number", get: p => p.rera },
    { label: "Investment Score", get: p => p.investScore },
    { label: "Growth Score", get: p => p.growthScore },
    { label: "Rental Yield", get: p => p.rentalYield },
    { label: "Builder Trust", get: p => p.trustScore },
  ];

  const getBetter = (label: string): "p1" | "p2" | "tie" => {
    if (!p1 || !p2) return "tie";
    const scoreLabels = ["Investment Score", "Growth Score", "Rental Yield", "Builder Trust"];
    if (scoreLabels.includes(label)) {
      const row = rows.find(r => r.label === label);
      if (!row) return "tie";
      const v1 = parseFloat(String(row.get(p1)));
      const v2 = parseFloat(String(row.get(p2)));
      if (v1 > v2) return "p1";
      if (v2 > v1) return "p2";
    }
    return "tie";
  };

  if (compareList.length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Compare Projects</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Select 2 projects to compare side-by-side.</p>
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 rounded-3xl p-10 text-center border border-blue-100 dark:border-blue-800/30 mb-8">
          <ArrowLeftRight className="w-14 h-14 text-blue-300 dark:text-blue-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">{compareList.length === 0 ? "No projects selected yet" : "Add one more project"}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">You have {compareList.length} of 2 projects selected. Click the compare icon on any property card.</p>
          <button onClick={() => navigate("projects")} className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">Browse Projects</button>
        </div>
        {compareList.length === 1 && p1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
              <img src={p1.image} alt={p1.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{p1.name}</h3>
                <p className="text-xs text-slate-500 mb-1">{p1.builder}</p>
                <p className="font-bold text-[#2563EB] text-sm mb-3">{p1.price}</p>
                <button onClick={() => toggleCompare(p1.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center h-56 cursor-pointer hover:border-[#2563EB] transition-colors" onClick={() => navigate("projects")}>
              <Plus className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400 font-medium">Add project to compare</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Side-by-Side Comparison</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Green highlights indicate the better value</p>
        </div>
        <button onClick={() => navigate("projects")} className="text-sm text-[#2563EB] font-medium hover:underline flex items-center gap-1">
          <Plus className="w-4 h-4" />Change projects
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div />
        {[p1!, p2!].map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="relative">
              <img src={p.image} alt={p.name} className="w-full h-44 object-cover" />
              <button onClick={() => toggleCompare(p.id)} className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg text-slate-500 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">{p.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{p.builder}</p>
              <p className="text-base font-bold text-[#2563EB]">{p.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
        {rows.map((row, idx) => {
          const better = getBetter(row.label);
          return (
            <div key={row.label} className={`grid grid-cols-3 ${idx % 2 === 0 ? "bg-slate-50/60 dark:bg-slate-800/40" : "bg-white dark:bg-slate-800"}`}>
              <div className="px-5 py-4 flex items-center border-r border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{row.label}</span>
              </div>
              {[p1!, p2!].map((p, i) => {
                const isBetter = (i === 0 && better === "p1") || (i === 1 && better === "p2");
                return (
                  <div key={p.id} className={`px-5 py-4 flex items-center gap-2 ${isBetter ? "bg-emerald-50 dark:bg-emerald-900/10" : ""} ${i === 0 ? "border-r border-slate-100 dark:border-slate-700" : ""}`}>
                    <span className={`text-sm ${isBetter ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-slate-800 dark:text-slate-200 font-medium"}`}>
                      {String(row.get(p))}
                    </span>
                    {isBetter && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide flex-shrink-0">Better</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="px-5 py-4 flex items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Amenities</span>
        </div>
        {[p1!, p2!].map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-wrap gap-1.5">
              {p.amenities.map(a => (
                <span key={a} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <CheckCircle className="w-3 h-3 text-[#2563EB]" />{a}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Score comparison visual */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-5 text-sm">Score Comparison</h3>
        {[
          { label: "Investment Score", k: "investScore" as keyof Project, color: "#2563EB" },
          { label: "Growth Score", k: "growthScore" as keyof Project, color: "#14B8A6" },
          { label: "Builder Trust", k: "trustScore" as keyof Project, color: "#8B5CF6" },
        ].map(s => (
          <div key={s.label} className="mb-5">
            <div className="grid grid-cols-3 items-center gap-4 mb-2">
              <div className="text-right">
                <span className="text-sm font-bold" style={{ color: s.color }}>{p1![s.k] as number}</span>
                <span className="text-xs text-slate-400 ml-1">/ 100</span>
              </div>
              <div className="text-center text-xs font-medium text-slate-500">{s.label}</div>
              <div>
                <span className="text-sm font-bold" style={{ color: s.color }}>{p2![s.k] as number}</span>
                <span className="text-xs text-slate-400 ml-1">/ 100</span>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex justify-end">
                <div className="h-full rounded-full" style={{ width: `${p1![s.k] as number}%`, background: s.color }} />
              </div>
              <div className="flex justify-center">
                {(p1![s.k] as number) > (p2![s.k] as number) ? <span className="text-[10px] text-emerald-600 font-semibold">← Better</span>
                  : (p2![s.k] as number) > (p1![s.k] as number) ? <span className="text-[10px] text-emerald-600 font-semibold">Better →</span>
                  : <span className="text-[10px] text-slate-400">Equal</span>}
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${p2![s.k] as number}%`, background: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Market Insights Page ──────────────────────────────────────────────────

const MarketInsightsPage = () => (
  <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="mb-8">
      <p className="text-xs font-semibold tracking-widest uppercase text-[#14B8A6] mb-2">Analytics</p>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Market Insights</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Ahmedabad real estate intelligence — Q1 2025</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
      {[
        { l: "Avg Market Price", v: "₹6,800/sqft", c: "+12.4%", up: true, color: "#2563EB" },
        { l: "New Launches (Q1)", v: "142 Units", c: "+8.2%", up: true, color: "#14B8A6" },
        { l: "Absorption Rate", v: "68%", c: "+5.1%", up: true, color: "#8B5CF6" },
        { l: "Unsold Inventory", v: "4,200 Units", c: "-6.8%", up: false, color: "#F59E0B" },
      ].map(m => (
        <div key={m.l} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${m.color}18` }}>
            <BarChart3 className="w-5 h-5" style={{ color: m.color }} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{m.l}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.v}</p>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${m.up ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
            <TrendingUp className={`w-3 h-3 ${m.up ? "" : "rotate-180"}`} />{m.c} YoY
          </span>
        </div>
      ))}
    </div>

    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-0.5 text-sm">Market Price Trend</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Average ₹/sqft across Ahmedabad</p>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={priceHistoryData}>
            <defs>
              <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Area type="monotone" dataKey="price" stroke="#2563EB" fill="url(#mktGrad)" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-0.5 text-sm">Launches vs Sales</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Monthly new launches vs units absorbed</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={marketTrendData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Bar dataKey="launches" name="Launches" fill="#2563EB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sales" name="Sales" fill="#14B8A6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-0.5 text-sm">Price by Locality</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">₹k per sq ft</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={localityPriceData} layout="vertical" barSize={22}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={68} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Bar dataKey="price" fill="#2563EB" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-5 text-sm">Hot Localities</h3>
        <div className="space-y-3.5">
          {[...LOCALITIES].sort((a, b) => b.growthScore - a.growthScore).map((loc, i) => (
            <div key={loc.id} className="flex items-center gap-3">
              <span className="text-slate-400 text-xs font-mono w-4 flex-shrink-0">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{loc.name}</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{loc.growthScore}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${loc.growthScore}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm mb-8">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-6 text-sm">Builder Activity Tracker</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {BUILDERS.map(b => (
          <div key={b.id} className="text-center p-5 bg-slate-50 dark:bg-slate-700 rounded-2xl">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm mx-auto mb-3 shadow-sm" style={{ background: b.color }}>{b.abbr}</div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">{b.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{b.ongoingProjects} active projects</p>
            <ScoreRing score={b.trustScore} size={40} color={b.color} />
            <p className="text-[10px] text-slate-400 mt-1">Trust Score</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Recent Project Launches</h3>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-700">
        {PROJECTS.filter(p => p.badges.includes("New Launch")).map(p => (
          <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white text-sm">{p.name}</p>
              <p className="text-xs text-slate-500">{p.builder} &middot; {p.location}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-[#2563EB] text-sm">{p.price}</p>
              <p className="text-xs text-slate-500">{p.config}</p>
            </div>
            <Chip label="New Launch" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Wishlist Page ─────────────────────────────────────────────────────────

const WishlistPage = ({ wishlist, navigate, toggleWishlist, compareList, toggleCompare }: {
  wishlist: string[]; navigate: Nav; toggleWishlist: (id: string) => void;
  compareList: string[]; toggleCompare: (id: string) => void;
}) => {
  const saved = PROJECTS.filter(p => wishlist.includes(p.id));
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Saved Properties</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{saved.length} {saved.length === 1 ? "property" : "properties"} saved</p>
        </div>
        {saved.length > 0 && (
          <button onClick={() => navigate("compare")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#14B8A6] text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors">
            <ArrowLeftRight className="w-4 h-4" />Compare Selected
          </button>
        )}
      </div>
      {saved.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
            <Heart className="w-9 h-9 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">No saved properties yet</h3>
          <p className="text-slate-400 text-sm mb-7 max-w-xs mx-auto">Browse properties and tap the heart icon to save ones you like for later.</p>
          <button onClick={() => navigate("projects")} className="px-7 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
            Browse Projects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map(p => (
            <PropertyCard key={p.id} project={p}
              onView={() => navigate("detail", p.id)}
              onCompare={() => toggleCompare(p.id)}
              onWishlist={() => toggleWishlist(p.id)}
              isWishlisted={true}
              isCompared={compareList.includes(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Profile Page ───────────────────────────────────────────────────────────

const ProfilePage = ({ navigate }: { navigate: Nav }) => {
  const [tab, setTab] = useState("saved");
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#14B8A6] flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0 shadow-sm">RK</div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Rahul Kumar</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">rahul.kumar@example.com</p>
            <p className="text-xs text-slate-400 mt-0.5">Member since January 2024</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Settings className="w-4 h-4" />Edit Profile
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          {[["4", "Saved Projects"], ["12", "Properties Viewed"], ["2", "Comparisons Made"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{v}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 max-w-xl">
        {[["saved", "Saved"], ["recent", "Recently Viewed"], ["alerts", "Alerts"], ["settings", "Settings"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${tab === k ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "saved" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECTS.slice(0, 4).map(p => (
            <button key={p.id} onClick={() => navigate("detail", p.id)}
              className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all text-left">
              <img src={p.image} alt={p.name} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{p.name}</h4>
                <p className="text-xs text-slate-500 mb-1 truncate">{p.location}</p>
                <p className="font-bold text-[#2563EB] text-sm">{p.price}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>
      )}

      {tab === "recent" && (
        <div className="space-y-3">
          {PROJECTS.slice(2, 6).map(p => (
            <button key={p.id} onClick={() => navigate("detail", p.id)}
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all text-left">
              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white text-sm">{p.name}</p>
                <p className="text-xs text-slate-500 truncate">{p.location} &middot; {p.price}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-3">
          {[
            { name: "Price Drop Alert", desc: "SG Highway 2 BHK under ₹90L", active: true },
            { name: "New Launch Alert", desc: "Shela locality new launches", active: true },
            { name: "Possession Update", desc: "Sobha City possession news", active: false },
            { name: "Builder Offer", desc: "Godrej Properties special offers", active: true },
          ].map(alert => (
            <div key={alert.name} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${alert.active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{alert.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{alert.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${alert.active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>{alert.active ? "Active" : "Paused"}</span>
                <button className="text-xs text-slate-400 hover:text-red-500 transition-colors">Remove</button>
              </div>
            </div>
          ))}
          <button className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />Create New Alert
          </button>
        </div>
      )}

      {tab === "settings" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 max-w-lg">
          {[["Full Name", "Rahul Kumar"], ["Email", "rahul.kumar@example.com"], ["Phone", "+91 98765 43210"], ["City", "Ahmedabad"], ["Budget", "₹80L – ₹1.5Cr"]].map(([l, v]) => (
            <div key={l}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{l}</label>
              <input readOnly defaultValue={v} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" />
            </div>
          ))}
          <button className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm mt-2">Save Changes</button>
        </div>
      )}
    </div>
  );
};

// ─── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("1");
  const [selectedBuilder, setSelectedBuilder] = useState("1");
  const [selectedLocality, setSelectedLocality] = useState("1");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const navigate: Nav = (p, id) => {
    if (p === "detail") setSelectedProject(id || "1");
    if (p === "builder") setSelectedBuilder(id || "1");
    if (p === "locality") setSelectedLocality(id || "1");
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const commonProps = { navigate, wishlist, toggleWishlist, compareList, toggleCompare };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar
        page={page} navigate={navigate} darkMode={darkMode}
        toggleDark={() => setDarkMode(d => !d)}
        wishlistCount={wishlist.length} compareCount={compareList.length}
      />
      <main className={compareList.length > 0 ? "pb-20" : ""}>
        {page === "home" && <HomePage {...commonProps} />}
        {page === "projects" && <ProjectsPage {...commonProps} />}
        {page === "detail" && <ProjectDetailPage projectId={selectedProject} {...commonProps} />}
        {page === "builder" && <BuilderPage builderId={selectedBuilder} {...commonProps} />}
        {page === "locality" && <LocalityPage localityId={selectedLocality} {...commonProps} />}
        {page === "compare" && <ComparePage compareList={compareList} navigate={navigate} toggleCompare={toggleCompare} />}
        {page === "market" && <MarketInsightsPage />}
        {page === "wishlist" && <WishlistPage wishlist={wishlist} navigate={navigate} toggleWishlist={toggleWishlist} compareList={compareList} toggleCompare={toggleCompare} />}
        {page === "profile" && <ProfilePage navigate={navigate} />}
      </main>
      <CompareStrip compareList={compareList} navigate={navigate} toggleCompare={toggleCompare} />
    </div>
  );
}
