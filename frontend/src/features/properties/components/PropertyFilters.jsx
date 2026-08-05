import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';

export function PropertyFilters({
  searchQuery,
  setSearchQuery,
  selectedLocality,
  setSelectedLocality,
  selectedStatus,
  setSelectedStatus,
  localities = [],
  onReset
}) {
  return (
    <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by project name, builder, or location (e.g. Adani, Shela)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-background"
          />
        </div>

        {/* Locality Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All Localities</option>
            {localities.map((loc) => (
              <option key={loc.id || loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All Statuses</option>
            <option value="Ready to Move">Ready to Move</option>
            <option value="Under Construction">Under Construction</option>
            <option value="New Launch">New Launch</option>
          </select>
        </div>

        {/* Reset Button */}
        {onReset && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-11 px-3 text-muted-foreground hover:text-foreground"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
