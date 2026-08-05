import React from 'react';
import { Filter, RotateCcw, ArrowUpDown, Building, Layers } from 'lucide-react';
import BuilderSearch from './BuilderSearch';

export function BuilderFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  propertyTypeFilter,
  onPropertyTypeChange,
  sortBy,
  onSortChange,
  onReset,
  totalResults = 0,
}) {
  const statusOptions = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Under Construction', value: 'Under Construction' },
    { label: 'Ready to Move', value: 'Ready to Move' },
    { label: 'Newly Launched', value: 'Newly Launched' },
  ];

  const typeOptions = [
    { label: 'All Property Types', value: 'All' },
    { label: 'Apartments', value: 'Apartment' },
    { label: 'Villas', value: 'Villa' },
    { label: 'Penthouses', value: 'Penthouse' },
    { label: 'Commercial', value: 'Commercial' },
  ];

  const sortOptions = [
    { label: 'Newest First', value: '-created_at' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Name: A to Z', value: 'project_name' },
  ];

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || propertyTypeFilter !== 'All' || sortBy !== '-created_at';

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-sky-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm shadow-sky-500/5 mb-8">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <BuilderSearch
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
        />

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Project Status Filter */}
          <div className="relative min-w-[150px] flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
            </div>
          </div>

          {/* Property Type Filter */}
          <div className="relative min-w-[150px] flex-1 sm:flex-none">
            <select
              value={propertyTypeFilter}
              onChange={(e) => onPropertyTypeChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building className="w-3.5 h-3.5 text-sky-500" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[150px] flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-sky-500" />
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* Result Count Status Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong className="text-slate-900 dark:text-white font-bold">{totalResults}</strong> project{totalResults !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">
            Filtered View Active
          </span>
        )}
      </div>
    </div>
  );
}

export default BuilderFilters;
