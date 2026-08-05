import React, { useState } from 'react';
import { 
  Check, X, Shield, Star, Award, Building2, MapPin, 
  Trash2, RefreshCw, Eye, ArrowUpRight, CheckCircle2, AlertCircle, Plus, Sparkles, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { PropertySearchSelector } from './PropertySearchSelector';

export function ComparisonMatrixTable({
  comparedProperties = [],
  allProperties = [],
  selectedIds = [],
  bestValues = {},
  onRemoveProperty,
  onReplaceProperty,
  onAddProperty,
  onSelectProject
}) {
  const [replacingSlotIndex, setReplacingSlotIndex] = useState(null);

  if (!comparedProperties || comparedProperties.length === 0) {
    return (
      <Card className="rounded-3xl border p-12 text-center bg-card shadow-sm space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-xl font-extrabold text-foreground">No Properties Selected</h3>
          <p className="text-xs text-muted-foreground">
            Search and select 2 to 4 properties from our database to generate a side-by-side comparison matrix.
          </p>
        </div>
      </Card>
    );
  }

  // Extract all unique amenities across compared properties
  const allAmenitiesSet = new Set();
  comparedProperties.forEach((p) => {
    if (Array.isArray(p.amenities)) {
      p.amenities.forEach((a) => allAmenitiesSet.add(a));
    }
  });
  const uniqueAmenities = Array.from(allAmenitiesSet);

  const maxSlots = 4;
  const showAddSlot = comparedProperties.length < maxSlots;

  return (
    <div className="space-y-6">
      {/* Slot Replace Search Selector Modal Overlay */}
      {replacingSlotIndex !== null && (
        <div className="p-4 bg-muted/60 border rounded-2xl animate-in fade-in space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Select Property to Replace Slot #{replacingSlotIndex + 1}:</span>
            <Button size="sm" variant="ghost" onClick={() => setReplacingSlotIndex(null)} className="h-6 text-xs">
              Cancel
            </Button>
          </div>
          <PropertySearchSelector
            allProperties={allProperties}
            selectedIds={selectedIds}
            activeSlotIndex={replacingSlotIndex}
            onReplaceProperty={onReplaceProperty}
            onCloseSlotSelector={() => setReplacingSlotIndex(null)}
          />
        </div>
      )}

      {/* Comparison Table Container */}
      <Card className="rounded-3xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-4 w-[220px] min-w-[200px] font-extrabold text-muted-foreground uppercase text-[11px] tracking-wider align-bottom">
                  Property Attributes
                </th>
                
                {comparedProperties.map((proj, idx) => {
                  const isLowestPrice = proj.id === bestValues.lowestPriceId;
                  const isLowestPsf = proj.id === bestValues.lowestPsfId;
                  const isLargestArea = proj.id === bestValues.largestAreaId;
                  const isHighestScore = proj.id === bestValues.highestTrustId || proj.id === bestValues.highestInvestId;

                  return (
                    <th key={proj.id} className="p-4 w-[280px] min-w-[260px] align-top relative border-l border-border/60">
                      <div className="space-y-3">
                        {/* Best Value Badge Header */}
                        <div className="flex flex-wrap gap-1 min-h-[22px]">
                          {isLowestPrice && (
                            <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5">
                              🏆 Lowest Price
                            </Badge>
                          )}
                          {isLowestPsf && (
                            <Badge className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5">
                              💎 Best Rate/sqft
                            </Badge>
                          )}
                          {isLargestArea && (
                            <Badge className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5">
                              📐 Largest Area
                            </Badge>
                          )}
                          {isHighestScore && (
                            <Badge className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5">
                              ⭐ Highest Rating
                            </Badge>
                          )}
                        </div>

                        {/* Property Image & Actions */}
                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden border bg-muted">
                          <img src={proj.image} alt={proj.name} className="w-full h-full object-cover" />
                          <button
                            onClick={() => onRemoveProperty(proj.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title, Locality & Price */}
                        <div>
                          <h3 className="font-bold text-sm text-foreground truncate" title={proj.name}>
                            {proj.name}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{proj.locality || proj.location}</span>
                          </p>
                          <span className="text-base font-extrabold text-primary block mt-1">
                            {proj.price}
                          </span>
                        </div>

                        {/* Column Controls */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <Button
                            onClick={() => setReplacingSlotIndex(idx)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-[11px] gap-1 rounded-lg"
                          >
                            <RefreshCw className="w-3 h-3 text-amber-500" />
                            <span>Replace</span>
                          </Button>
                          <Button
                            onClick={() => onSelectProject(proj.id)}
                            size="sm"
                            className="h-8 text-[11px] gap-1 rounded-lg"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </Button>
                        </div>
                      </div>
                    </th>
                  );
                })}

                {/* Empty Slot Column if < 4 */}
                {showAddSlot && (
                  <th className="p-4 w-[240px] min-w-[220px] align-middle border-l border-border/60 text-center bg-muted/10">
                    <div className="py-8 space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground">Add Property Slot</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Compare up to 4 properties</p>
                      </div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 text-xs">
              {/* Row 1: Asking Price */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">Asking Price</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className={`p-4 border-l border-border/60 font-extrabold text-sm ${
                    p.id === bestValues.lowestPriceId ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' : 'text-foreground'
                  }`}>
                    {p.price}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 2: Price per Sq.ft */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">Price per Sq.ft</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className={`p-4 border-l border-border/60 font-bold ${
                    p.id === bestValues.lowestPsfId ? 'text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20' : 'text-foreground'
                  }`}>
                    {p.pricePerSqft || 'N/A'}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 3: AI Fair Price Estimate */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Fair Valuation</span>
                </td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 border-l border-border/60 font-semibold text-amber-600 dark:text-amber-400">
                    {p.priceNum ? `₹${(p.priceNum * 0.96 / 100000).toFixed(1)} L (Fair Value)` : 'Verified Market Fair Value'}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 4: BHK Configuration */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">BHK Layout</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 border-l border-border/60 font-bold text-foreground">
                    {p.config}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 5: Carpet Area */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">Carpet Area</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className={`p-4 border-l border-border/60 font-semibold ${
                    p.id === bestValues.largestAreaId ? 'text-purple-600 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20 font-bold' : 'text-foreground'
                  }`}>
                    {p.carpetArea !== 'N/A' ? `${p.carpetArea} sq ft` : (p.area || 'N/A')}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 6: Built-up Area */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">Built-up Area</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 border-l border-border/60 font-medium text-foreground">
                    {p.builtupArea !== 'N/A' ? `${p.builtupArea} sq ft` : 'Included'}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 7: Developer */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">Developer</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 border-l border-border/60 font-semibold text-foreground">
                    {p.builder || 'Verified Builder'}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 8: Locality */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">Locality</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 border-l border-border/60 font-semibold text-foreground">
                    {p.locality || p.location}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 9: Trust Score */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">Trust Rating</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 border-l border-border/60 font-bold text-emerald-600 dark:text-emerald-400">
                    {p.trustScore}% Verified
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 10: RERA Registration */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">RERA Status</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 border-l border-border/60 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{p.rera}</span>
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 11: Possession Status */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-bold text-muted-foreground">Possession</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 border-l border-border/60 font-medium text-foreground">
                    {p.possession}
                  </td>
                ))}
                {showAddSlot && <td className="p-4 border-l border-border/60 bg-muted/10"></td>}
              </tr>

              {/* Row 12: Amenities Comparison Checklist */}
              {uniqueAmenities.map((amenity) => (
                <tr key={amenity} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 pl-4 text-muted-foreground font-medium">{amenity}</td>
                  {comparedProperties.map((p) => {
                    const hasAmenity = Array.isArray(p.amenities) && p.amenities.includes(amenity);
                    return (
                      <td key={p.id} className="p-3 border-l border-border/60 text-center">
                        {hasAmenity ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Included</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground/60">
                            <X className="w-3.5 h-3.5" />
                            <span>N/A</span>
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {showAddSlot && <td className="p-3 border-l border-border/60 bg-muted/10"></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ComparisonMatrixTable;
