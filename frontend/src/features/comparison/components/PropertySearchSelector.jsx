import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, X, Building2, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';

export function PropertySearchSelector({ 
  allProperties = [], 
  selectedIds = [], 
  onAddProperty,
  onReplaceProperty,
  activeSlotIndex = null,
  onCloseSlotSelector
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter properties based on search query matching Name, Builder, or Locality
  const filteredProperties = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return allProperties.filter((p) => {
      // Exclude already selected properties unless replacing
      const isAlreadySelected = selectedIds.includes(String(p.id));
      if (isAlreadySelected && activeSlotIndex === null) return false;

      if (!query) return true;

      const nameMatch = (p.name || '').toLowerCase().includes(query);
      const builderMatch = (p.builder || '').toLowerCase().includes(query);
      const localityMatch = (p.locality || p.location || '').toLowerCase().includes(query);

      return nameMatch || builderMatch || localityMatch;
    }).slice(0, 8); // Limit dropdown results to 8 items
  }, [allProperties, selectedIds, searchTerm, activeSlotIndex]);

  const handleSelect = (propertyId) => {
    if (activeSlotIndex !== null && onReplaceProperty) {
      onReplaceProperty(activeSlotIndex, propertyId);
      if (onCloseSlotSelector) onCloseSlotSelector();
    } else if (onAddProperty) {
      onAddProperty(propertyId);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-4 h-4 text-primary" />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search properties by Name, Builder, or Locality (e.g., Sola, Thaltej, Satellite)..."
          className="w-full pl-10 pr-10 py-3 text-xs font-medium rounded-2xl bg-card border border-border text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto animate-in fade-in duration-150">
          <div className="p-3 bg-muted/40 border-b flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1 text-primary font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Available Database Properties ({filteredProperties.length})</span>
            </span>
            {activeSlotIndex !== null && (
              <span className="text-amber-600 dark:text-amber-400 font-bold">Replacing Slot #{activeSlotIndex + 1}</span>
            )}
          </div>

          {filteredProperties.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">No matching properties found.</p>
              <p>Try searching for Sola, Thaltej, Satellite, Gota, or Chandkheda.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => handleSelect(prop.id)}
                  className="p-3 hover:bg-muted/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prop.image}
                      alt={prop.name}
                      className="w-12 h-12 rounded-xl object-cover border shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                        {prop.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{prop.locality || prop.location}</span>
                        {prop.builder && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground truncate">{prop.builder}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <span className="text-xs font-extrabold text-primary block">{prop.price}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">{prop.config}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-[11px] gap-1 rounded-lg shrink-0">
                      <Plus className="w-3 h-3 text-emerald-500" />
                      <span>{activeSlotIndex !== null ? 'Replace' : 'Compare'}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertySearchSelector;
