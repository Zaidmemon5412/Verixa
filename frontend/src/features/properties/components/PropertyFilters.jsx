import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp, SlidersHorizontal, Check, MapPin, Home, Maximize2 } from 'lucide-react';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';

export function PropertyFilters({
  searchQuery,
  setSearchQuery,
  selectedLocality,
  setSelectedLocality,
  selectedStatus,
  setSelectedStatus,
  selectedType,
  setSelectedType,
  selectedBhk = [],
  setSelectedBhk,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minArea,
  setMinArea,
  maxArea,
  setMaxArea,
  selectedBuilder,
  setSelectedBuilder,
  selectedOrdering,
  setSelectedOrdering,
  localities = [],
  builders = [],
  onReset
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 1. BHK Options (1, 2, 3, 4 BHK - 5+ BHK removed per request)
  const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK'];

  // 2. Area/Locality Options (Gota, Chandkheda, Shela, Bopal, Satellite, Thaltej, SG Highway)
  const defaultPopularAreas = ['Gota', 'Chandkheda', 'Shela', 'Bopal', 'Satellite', 'Thaltej', 'SG Highway'];
  const dbAreaNames = Array.isArray(localities) && localities.length > 0
    ? localities.map(l => typeof l === 'string' ? l : l.name).filter(Boolean)
    : defaultPopularAreas;

  // Unique area names list starting with popular ones
  const areaOptions = Array.from(new Set([...defaultPopularAreas, ...dbAreaNames])).slice(0, 10);

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Plot', 'Penthouse', 'Studio'];
  const statusOptions = ['All', 'Ready to Move', 'Under Construction', 'New Launch'];
  const orderingOptions = [
    { label: 'Newest Listings', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Area: Small to Large', value: 'carpet_area_asc' },
    { label: 'Area: Large to Small', value: 'carpet_area_desc' },
    { label: 'Most Popular', value: 'popular' }
  ];

  const handleBhkToggle = (option) => {
    if (!setSelectedBhk) return;
    if (selectedBhk.includes(option)) {
      setSelectedBhk(selectedBhk.filter((b) => b !== option));
    } else {
      setSelectedBhk([...selectedBhk, option]);
    }
  };

  const handleBhkSelectAll = () => {
    if (setSelectedBhk) setSelectedBhk([]);
  };

  const handleAreaSelect = (areaName) => {
    if (setSelectedLocality) {
      setSelectedLocality(areaName);
    }
  };

  const activeFiltersCount = [
    searchQuery ? 1 : 0,
    selectedLocality !== 'All' ? 1 : 0,
    selectedStatus !== 'All' ? 1 : 0,
    selectedType !== 'All' ? 1 : 0,
    selectedBhk.length > 0 ? 1 : 0,
    minPrice || maxPrice ? 1 : 0,
    minArea || maxArea ? 1 : 0,
    selectedBuilder !== 'All' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="bg-card border rounded-2xl p-4 md:p-5 shadow-sm space-y-5">
      {/* 1. Primary Row: Search Bar, Property Type, Sorting & Drawer Toggle */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Intelligent Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by project name, builder, or city (e.g. Adani, Shela, Gota, Ahmedabad)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-background"
          />
        </div>

        {/* Property Type Filter */}
        <div className="w-full sm:w-44">
          <select
            value={selectedType || 'All'}
            onChange={(e) => setSelectedType && setSelectedType(e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
          >
            <option value="All">All Property Types</option>
            {propertyTypes.filter(t => t !== 'All').map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={selectedOrdering || 'newest'}
            onChange={(e) => setSelectedOrdering && setSelectedOrdering(e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium text-foreground"
          >
            {orderingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <Button
            variant={showAdvanced ? 'default' : 'outline'}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-11 rounded-xl gap-2 font-semibold flex-1 sm:flex-none"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>More Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary hover:bg-primary/20">
                {activeFiltersCount}
              </Badge>
            )}
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {onReset && activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="h-11 px-3 text-muted-foreground hover:text-foreground"
              title="Reset All Filters"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 2. Prominent BHK-Wise Filter Bar (1 BHK, 2 BHK, 3 BHK, 4 BHK) */}
      <div className="pt-2 border-t space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-primary" />
            BHK Wise Filter
          </span>
          {selectedBhk.length > 0 && (
            <button
              onClick={handleBhkSelectAll}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Clear BHK Selection
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleBhkSelectAll}
            className={`h-9 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              selectedBhk.length === 0
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background hover:bg-muted text-foreground border-input'
            }`}
          >
            {selectedBhk.length === 0 && <Check className="w-3.5 h-3.5" />}
            <span>All BHK</span>
          </button>
          {bhkOptions.map((option) => {
            const isSelected = selectedBhk.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleBhkToggle(option)}
                className={`h-9 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-muted text-foreground border-input'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Prominent Area-Wise / Locality Filter Bar (Gota, Chandkheda, Shela, Bopal, etc.) */}
      <div className="pt-2 border-t space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            Area Wise Filter (Gota, Chandkheda, Shela...)
          </span>
          {selectedLocality !== 'All' && (
            <button
              onClick={() => handleAreaSelect('All')}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Clear Area Filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleAreaSelect('All')}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              selectedLocality === 'All'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background hover:bg-muted text-foreground border-input'
            }`}
          >
            {selectedLocality === 'All' && <Check className="w-3.5 h-3.5" />}
            <span>All Areas</span>
          </button>
          {areaOptions.map((areaName) => {
            const active = selectedLocality.toLowerCase() === areaName.toLowerCase();
            return (
              <button
                key={areaName}
                type="button"
                onClick={() => handleAreaSelect(areaName)}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-muted text-foreground border-input'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5" />}
                <span>{areaName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Advanced Expandable Filter Panel (Price, Sq Ft Size, Builder, Status) */}
      {showAdvanced && (
        <div className="pt-4 border-t space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Grid Filters: Builder, Locality & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Builder Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Builder / Developer
              </label>
              <select
                value={selectedBuilder || 'All'}
                onChange={(e) => setSelectedBuilder && setSelectedBuilder(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="All">All Builders</option>
                {builders.map((b) => (
                  <option key={b.builder_id || b.builder_name} value={b.builder_name}>
                    {b.builder_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Locality Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Locality Dropdown
              </label>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="All">All Localities</option>
                {localities.map((loc) => (
                  <option key={loc.id || loc.locality_id || loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Possession Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Possession Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range & Carpet Area Size Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min Price (e.g. 5000000)"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice && setMinPrice(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-background"
                />
                <span className="text-muted-foreground text-xs font-semibold">to</span>
                <Input
                  type="number"
                  placeholder="Max Price (e.g. 20000000)"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice && setMaxPrice(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-background"
                />
              </div>
            </div>

            {/* Carpet/Built-up Area Size (Sq Ft) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Carpet / Built-up Size (Sq Ft)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min Sq Ft (e.g. 800)"
                  value={minArea || ''}
                  onChange={(e) => setMinArea && setMinArea(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-background"
                />
                <span className="text-muted-foreground text-xs font-semibold">to</span>
                <Input
                  type="number"
                  placeholder="Max Sq Ft (e.g. 3500)"
                  value={maxArea || ''}
                  onChange={(e) => setMaxArea && setMaxArea(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
