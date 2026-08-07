export const MARKET_TREND_DATA = [
  { month: "Jan", launches: 12, sales: 18 },
  { month: "Feb", launches: 8, sales: 22 },
  { month: "Mar", launches: 15, sales: 28 },
  { month: "Apr", launches: 11, sales: 24 },
  { month: "May", launches: 18, sales: 31 },
  { month: "Jun", launches: 14, sales: 26 },
];

export const LOCALITY_PRICE_DATA = [
  { name: "Sindhu Bhavan Road", price: 11.5, avgTotalPrice: "₹1.85 Cr" },
  { name: "Science City", price: 8.9, avgTotalPrice: "₹1.42 Cr" },
  { name: "Science Park", price: 8.6, avgTotalPrice: "₹1.35 Cr" },
  { name: "Thaltej", price: 7.6, avgTotalPrice: "₹1.15 Cr" },
  { name: "Bhaikakanagar", price: 7.2, avgTotalPrice: "₹98.0 Lakhs" },
  { name: "Satellite", price: 6.8, avgTotalPrice: "₹92.5 Lakhs" },
  { name: "Jagatpur", price: 6.2, avgTotalPrice: "₹78.0 Lakhs" },
  { name: "Sola", price: 5.9, avgTotalPrice: "₹72.0 Lakhs" },
  { name: "Godrej Garden City", price: 5.8, avgTotalPrice: "₹68.5 Lakhs" },
  { name: "Nigam Nagar", price: 5.5, avgTotalPrice: "₹62.0 Lakhs" },
  { name: "D Cabin", price: 4.8, avgTotalPrice: "₹52.0 Lakhs" },
  { name: "Gota", price: 4.2, avgTotalPrice: "₹45.0 Lakhs" },
  { name: "Maninagar", price: 4.1, avgTotalPrice: "₹42.5 Lakhs" },
  { name: "Chandkheda", price: 3.95, avgTotalPrice: "₹38.5 Lakhs" }
];

export const HISTORICAL_PRICE_TRENDS = {
  "1M": [
    { period: "Week 1", avgPrice: 75.8, pricePerSqft: 5580, medianPrice: 72.0, launches: 3, sales: 5 },
    { period: "Week 2", avgPrice: 76.2, pricePerSqft: 5610, medianPrice: 72.5, launches: 2, sales: 7 },
    { period: "Week 3", avgPrice: 76.6, pricePerSqft: 5650, medianPrice: 73.0, launches: 4, sales: 8 },
    { period: "Week 4", avgPrice: 77.0, pricePerSqft: 5690, medianPrice: 73.5, launches: 3, sales: 6 },
  ],
  "3M": [
    { period: "Month 1", avgPrice: 74.5, pricePerSqft: 5490, medianPrice: 71.0, launches: 11, sales: 24 },
    { period: "Month 2", avgPrice: 75.8, pricePerSqft: 5590, medianPrice: 72.2, launches: 18, sales: 31 },
    { period: "Month 3", avgPrice: 77.0, pricePerSqft: 5690, medianPrice: 73.5, launches: 14, sales: 26 },
  ],
  "6M": [
    { period: "Jan", avgPrice: 70.0, pricePerSqft: 5180, medianPrice: 66.5, launches: 12, sales: 18 },
    { period: "Feb", avgPrice: 71.4, pricePerSqft: 5280, medianPrice: 67.8, launches: 8, sales: 22 },
    { period: "Mar", avgPrice: 72.8, pricePerSqft: 5380, medianPrice: 69.2, launches: 15, sales: 28 },
    { period: "Apr", avgPrice: 74.2, pricePerSqft: 5480, medianPrice: 70.6, launches: 11, sales: 24 },
    { period: "May", avgPrice: 75.6, pricePerSqft: 5590, medianPrice: 72.0, launches: 18, sales: 31 },
    { period: "Jun", avgPrice: 77.0, pricePerSqft: 5690, medianPrice: 73.5, launches: 14, sales: 26 },
  ],
  "1Y": [
    { period: "Q3 2025", avgPrice: 66.5, pricePerSqft: 4920, medianPrice: 63.0, launches: 32, sales: 48 },
    { period: "Q4 2025", avgPrice: 69.8, pricePerSqft: 5160, medianPrice: 66.2, launches: 38, sales: 56 },
    { period: "Q1 2026", avgPrice: 73.2, pricePerSqft: 5410, medianPrice: 69.5, launches: 35, sales: 68 },
    { period: "Q2 2026", avgPrice: 77.0, pricePerSqft: 5690, medianPrice: 73.5, launches: 43, sales: 81 },
  ],
  "3Y": [
    { period: "2024", avgPrice: 58.4, pricePerSqft: 4320, medianPrice: 55.0, launches: 110, sales: 165 },
    { period: "2025", avgPrice: 68.2, pricePerSqft: 5040, medianPrice: 64.8, launches: 145, sales: 210 },
    { period: "2026 (YTD)", avgPrice: 77.0, pricePerSqft: 5690, medianPrice: 73.5, launches: 78, sales: 149 },
  ],
  "5Y": [
    { period: "2022", avgPrice: 46.8, pricePerSqft: 3460, medianPrice: 44.0, launches: 85, sales: 120 },
    { period: "2023", avgPrice: 52.5, pricePerSqft: 3880, medianPrice: 49.5, launches: 98, sales: 142 },
    { period: "2024", avgPrice: 58.4, pricePerSqft: 4320, medianPrice: 55.0, launches: 110, sales: 165 },
    { period: "2025", avgPrice: 68.2, pricePerSqft: 5040, medianPrice: 64.8, launches: 145, sales: 210 },
    { period: "2026", avgPrice: 77.0, pricePerSqft: 5690, medianPrice: 73.5, launches: 78, sales: 149 },
  ]
};

// Database-Driven Locality Heatmap (Populated from all active micro-markets in DB & codebase)
export const ENRICHED_LOCALITY_HEATMAP = [
  { name: "Sindhu Bhavan Road", avgPrice: "₹11.5k/sqft", avgTotalPrice: "₹1.85 Cr", priceVal: 11.5, growthPct: "+14.5%", growthVal: 14.5, demandScore: 95, rating: "Hot Market", totalListings: 18 },
  { name: "Science City", avgPrice: "₹8.9k/sqft", avgTotalPrice: "₹1.42 Cr", priceVal: 8.9, growthPct: "+10.2%", growthVal: 10.2, demandScore: 88, rating: "Hot Market", totalListings: 37 },
  { name: "Science Park", avgPrice: "₹8.6k/sqft", avgTotalPrice: "₹1.35 Cr", priceVal: 8.6, growthPct: "+9.8%", growthVal: 9.8, demandScore: 85, rating: "Hot Market", totalListings: 22 },
  { name: "Thaltej", avgPrice: "₹7.6k/sqft", avgTotalPrice: "₹1.15 Cr", priceVal: 7.6, growthPct: "+12.4%", growthVal: 12.4, demandScore: 87, rating: "Hot Market", totalListings: 108 },
  { name: "Bhaikakanagar", avgPrice: "₹7.2k/sqft", avgTotalPrice: "₹98.0 Lakhs", priceVal: 7.2, growthPct: "+10.5%", growthVal: 10.5, demandScore: 83, rating: "Growing Market", totalListings: 15 },
  { name: "Satellite", avgPrice: "₹6.8k/sqft", avgTotalPrice: "₹92.5 Lakhs", priceVal: 6.8, growthPct: "+11.1%", growthVal: 11.1, demandScore: 84, rating: "Hot Market", totalListings: 96 },
  { name: "Jagatpur", avgPrice: "₹6.2k/sqft", avgTotalPrice: "₹78.0 Lakhs", priceVal: 6.2, growthPct: "+8.1%", growthVal: 8.1, demandScore: 79, rating: "Stable Market", totalListings: 34 },
  { name: "Sola", avgPrice: "₹5.9k/sqft", avgTotalPrice: "₹72.0 Lakhs", priceVal: 5.9, growthPct: "+8.5%", growthVal: 8.5, demandScore: 81, rating: "Growing Market", totalListings: 44 },
  { name: "Godrej Garden City", avgPrice: "₹5.8k/sqft", avgTotalPrice: "₹68.5 Lakhs", priceVal: 5.8, growthPct: "+8.8%", growthVal: 8.8, demandScore: 80, rating: "Growing Market", totalListings: 28 },
  { name: "Nigam Nagar", avgPrice: "₹5.5k/sqft", avgTotalPrice: "₹62.0 Lakhs", priceVal: 5.5, growthPct: "+6.4%", growthVal: 6.4, demandScore: 74, rating: "Stable Market", totalListings: 11 },
  { name: "D Cabin", avgPrice: "₹4.8k/sqft", avgTotalPrice: "₹52.0 Lakhs", priceVal: 4.8, growthPct: "+5.9%", growthVal: 5.9, demandScore: 71, rating: "Stable Market", totalListings: 4 },
  { name: "Gota", avgPrice: "₹4.2k/sqft", avgTotalPrice: "₹45.0 Lakhs", priceVal: 4.2, growthPct: "+7.8%", growthVal: 7.8, demandScore: 75, rating: "Growing Market", totalListings: 42 },
  { name: "Maninagar", avgPrice: "₹4.1k/sqft", avgTotalPrice: "₹42.5 Lakhs", priceVal: 4.1, growthPct: "+9.2%", growthVal: 9.2, demandScore: 82, rating: "Growing Market", totalListings: 96 },
  { name: "Chandkheda", avgPrice: "₹3.95k/sqft", avgTotalPrice: "₹38.5 Lakhs", priceVal: 3.95, growthPct: "+9.2%", growthVal: 9.2, demandScore: 76, rating: "Growing Market", totalListings: 111 }
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
