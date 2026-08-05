export const MARKET_TREND_DATA = [
  { month: "Jan", launches: 12, sales: 18 },
  { month: "Feb", launches: 8, sales: 22 },
  { month: "Mar", launches: 15, sales: 28 },
  { month: "Apr", launches: 11, sales: 24 },
  { month: "May", launches: 18, sales: 31 },
  { month: "Jun", launches: 14, sales: 26 },
];

export const LOCALITY_PRICE_DATA = [
  { name: "Chandkheda", price: 6.8 },
  { name: "Thaltej", price: 9.5 },
  { name: "Satellite", price: 10.2 },
  { name: "Sola", price: 7.4 },
  { name: "Gota", price: 5.8 },
  { name: "Science City", price: 8.9 },
  { name: "Jagatpur", price: 6.2 },
  { name: "Sindhu Bhavan Road", price: 11.5 }
];

export const HISTORICAL_PRICE_TRENDS = {
  "1M": [
    { period: "Week 1", avgPrice: 84.2, pricePerSqft: 6850, medianPrice: 79.0, launches: 3, sales: 5 },
    { period: "Week 2", avgPrice: 84.8, pricePerSqft: 6900, medianPrice: 79.5, launches: 2, sales: 7 },
    { period: "Week 3", avgPrice: 85.1, pricePerSqft: 6940, medianPrice: 80.0, launches: 4, sales: 8 },
    { period: "Week 4", avgPrice: 85.6, pricePerSqft: 6980, medianPrice: 80.5, launches: 3, sales: 6 },
  ],
  "3M": [
    { period: "Month 1", avgPrice: 82.5, pricePerSqft: 6700, medianPrice: 77.0, launches: 11, sales: 24 },
    { period: "Month 2", avgPrice: 84.0, pricePerSqft: 6850, medianPrice: 78.5, launches: 18, sales: 31 },
    { period: "Month 3", avgPrice: 85.6, pricePerSqft: 6980, medianPrice: 80.5, launches: 14, sales: 26 },
  ],
  "6M": [
    { period: "Jan", avgPrice: 78.0, pricePerSqft: 6400, medianPrice: 73.0, launches: 12, sales: 18 },
    { period: "Feb", avgPrice: 79.5, pricePerSqft: 6520, medianPrice: 74.5, launches: 8, sales: 22 },
    { period: "Mar", avgPrice: 81.0, pricePerSqft: 6650, medianPrice: 76.0, launches: 15, sales: 28 },
    { period: "Apr", avgPrice: 82.8, pricePerSqft: 6780, medianPrice: 77.5, launches: 11, sales: 24 },
    { period: "May", avgPrice: 84.2, pricePerSqft: 6890, medianPrice: 79.0, launches: 18, sales: 31 },
    { period: "Jun", avgPrice: 85.6, pricePerSqft: 6980, medianPrice: 80.5, launches: 14, sales: 26 },
  ],
  "1Y": [
    { period: "Q3 2025", avgPrice: 74.0, pricePerSqft: 6100, medianPrice: 69.5, launches: 32, sales: 48 },
    { period: "Q4 2025", avgPrice: 77.5, pricePerSqft: 6380, medianPrice: 72.8, launches: 38, sales: 56 },
    { period: "Q1 2026", avgPrice: 81.2, pricePerSqft: 6670, medianPrice: 76.2, launches: 35, sales: 68 },
    { period: "Q2 2026", avgPrice: 85.6, pricePerSqft: 6980, medianPrice: 80.5, launches: 43, sales: 81 },
  ],
  "3Y": [
    { period: "2024", avgPrice: 65.0, pricePerSqft: 5400, medianPrice: 60.0, launches: 110, sales: 165 },
    { period: "2025", avgPrice: 76.0, pricePerSqft: 6250, medianPrice: 71.0, launches: 145, sales: 210 },
    { period: "2026 (YTD)", avgPrice: 85.6, pricePerSqft: 6980, medianPrice: 80.5, launches: 78, sales: 149 },
  ],
  "5Y": [
    { period: "2022", avgPrice: 52.0, pricePerSqft: 4300, medianPrice: 48.0, launches: 85, sales: 120 },
    { period: "2023", avgPrice: 58.5, pricePerSqft: 4850, medianPrice: 54.0, launches: 98, sales: 142 },
    { period: "2024", avgPrice: 65.0, pricePerSqft: 5400, medianPrice: 60.0, launches: 110, sales: 165 },
    { period: "2025", avgPrice: 76.0, pricePerSqft: 6250, medianPrice: 71.0, launches: 145, sales: 210 },
    { period: "2026", avgPrice: 85.6, pricePerSqft: 6980, medianPrice: 80.5, launches: 78, sales: 149 },
  ]
};

// Database-Driven Locality Heatmap (Strictly populated from actual DB areas: Chandkheda, Thaltej, Satellite, Sola, Gota, Science City, Jagatpur, Sindhu Bhavan Road, Nigam Nagar, D Cabin)
export const ENRICHED_LOCALITY_HEATMAP = [
  { name: "Chandkheda", avgPrice: "₹6.8k/sqft", priceVal: 6.8, growthPct: "+9.2%", growthVal: 9.2, demandScore: 94, rating: "Hot Market", totalListings: 111 },
  { name: "Thaltej", avgPrice: "₹9.5k/sqft", priceVal: 9.5, growthPct: "+12.4%", growthVal: 12.4, demandScore: 92, rating: "Hot Market", totalListings: 108 },
  { name: "Satellite", avgPrice: "₹10.2k/sqft", priceVal: 10.2, growthPct: "+11.1%", growthVal: 11.1, demandScore: 90, rating: "Hot Market", totalListings: 96 },
  { name: "Sola", avgPrice: "₹7.4k/sqft", priceVal: 7.4, growthPct: "+8.5%", growthVal: 8.5, demandScore: 84, rating: "Growing Market", totalListings: 44 },
  { name: "Gota", avgPrice: "₹5.8k/sqft", priceVal: 5.8, growthPct: "+7.8%", growthVal: 7.8, demandScore: 82, rating: "Growing Market", totalListings: 42 },
  { name: "Science City", avgPrice: "₹8.9k/sqft", priceVal: 8.9, growthPct: "+10.2%", growthVal: 10.2, demandScore: 86, rating: "Hot Market", totalListings: 37 },
  { name: "Jagatpur", avgPrice: "₹6.2k/sqft", priceVal: 6.2, growthPct: "+8.1%", growthVal: 8.1, demandScore: 79, rating: "Stable Market", totalListings: 34 },
  { name: "Sindhu Bhavan Road", avgPrice: "₹11.5k/sqft", priceVal: 11.5, growthPct: "+14.5%", growthVal: 14.5, demandScore: 95, rating: "Hot Market", totalListings: 18 },
  { name: "Nigam Nagar", avgPrice: "₹5.5k/sqft", priceVal: 5.5, growthPct: "+6.4%", growthVal: 6.4, demandScore: 74, rating: "Stable Market", totalListings: 11 },
  { name: "D Cabin", avgPrice: "₹4.8k/sqft", priceVal: 4.8, growthPct: "+5.9%", growthVal: 5.9, demandScore: 71, rating: "Stable Market", totalListings: 4 }
];

export const BUILDER_INTELLIGENCE_DATA = [
  { name: "Adani Realty", activeProjects: 14, avgPrice: "₹8.8k/sqft", salesVelocity: "34 units/mo", marketShare: "18.5%", rating: 4.9 },
  { name: "Godrej Properties", activeProjects: 11, avgPrice: "₹9.4k/sqft", salesVelocity: "29 units/mo", marketShare: "15.2%", rating: 4.8 },
  { name: "Goyal & Co", activeProjects: 9, avgPrice: "₹7.2k/sqft", salesVelocity: "24 units/mo", marketShare: "12.8%", rating: 4.7 },
  { name: "Shivalik Group", activeProjects: 8, avgPrice: "₹6.5k/sqft", salesVelocity: "21 units/mo", marketShare: "10.4%", rating: 4.6 },
  { name: "Bakeri Group", activeProjects: 6, avgPrice: "₹5.8k/sqft", salesVelocity: "18 units/mo", marketShare: "8.1%", rating: 4.5 }
];

export const PROPERTY_TYPE_DATA = [
  { type: "Apartment", avgPrice: "₹6.8k/sqft", demandScore: 92, growthPct: "+9.2%", listingsCount: 450, iconName: "Building2" },
  { type: "Villa", avgPrice: "₹11.5k/sqft", demandScore: 84, growthPct: "+12.4%", listingsCount: 95, iconName: "Home" },
  { type: "Plot", avgPrice: "₹4.5k/sqft", demandScore: 78, growthPct: "+14.8%", listingsCount: 120, iconName: "Layers" },
  { type: "Penthouse", avgPrice: "₹14.2k/sqft", demandScore: 71, growthPct: "+8.1%", listingsCount: 35, iconName: "Sparkles" },
  { type: "Commercial", avgPrice: "₹12.0k/sqft", demandScore: 88, growthPct: "+10.5%", listingsCount: 80, iconName: "Store" }
];

export const RENTAL_MARKET_DATA = {
  avgRent: "₹28,500/mo",
  rentalYield: "3.85%",
  occupancyTrend: "94.2%",
  rentGrowthPct: "+6.8% YoY",
  recommendation: "Buying Recommended",
  reasoning: "Price growth (+8.4%) is exceeding rental yield growth, making long-term property acquisition more advantageous than long-term leasing."
};

export const SEARCH_TRENDS_DATA = {
  mostSearchedCities: ["Ahmedabad", "Gandhinagar", "Surat", "Vadodara"],
  mostSearchedLocalities: ["Chandkheda", "Thaltej", "Satellite", "Sola", "Gota"],
  mostSearchedBuilders: ["Adani Realty", "Godrej Properties", "Shivalik Group"],
  mostSearchedTypes: ["3 BHK Apartment", "4 BHK Villa", "Commercial Shop"],
  mostViewedProjects: ["Godrej Garden City", "Shivalik Parkview", "Adani Shantigram"],
  trendingSearches: [
    { query: "Chandkheda 3 BHK Apartments", growth: "+42%" },
    { query: "Thaltej Ready to Move", growth: "+38%" },
    { query: "Satellite Premium Flats", growth: "+31%" },
    { query: "RERA Approved Projects", growth: "+24%" }
  ]
};

export const INVESTMENT_SCORE_DATA = {
  score: 91,
  rating: "Excellent Opportunity",
  factors: [
    { name: "Price Appreciation Potential", score: 94, detail: "Strong quarterly trajectory (+8.4% YoY)" },
    { name: "Rental Yield Resilience", score: 88, detail: "Above-average yield (3.85%)" },
    { name: "Demand Velocity", score: 92, detail: "High absorption in Thaltej, Chandkheda & Satellite" },
    { name: "Infra Development", score: 95, detail: "Metro rail connectivity & SG Hwy corridor growth" },
    { name: "Builder Execution Track Record", score: 87, detail: "High RERA verification compliance" }
  ]
};

export const MARKET_HEALTH_DATA = {
  score: 82,
  status: "Strong Growth Market",
  city: "Ahmedabad",
  breakdown: [
    { label: "Price Growth", val: 85 },
    { label: "Demand Score", val: 88 },
    { label: "Inventory Health", val: 74 },
    { label: "New Listings Volume", val: 80 },
    { label: "Sales Activity Velocity", val: 83 }
  ]
};
