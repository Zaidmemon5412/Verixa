import React from 'react';
import { Building2, Award, Clock, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';

export function BuilderCard({ builder, onSelect }) {
  if (!builder) return null;

  return (
    <Card className="rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <CardContent className="p-6 space-y-4">
        {/* Header Avatar & Name */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl shadow-md shrink-0"
            style={{ backgroundColor: builder.color || '#2563EB' }}
          >
            {builder.abbr}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{builder.name}</h3>
            <p className="text-xs text-muted-foreground">{builder.yearsExp} Years Real Estate Experience</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {builder.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 text-center text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px]">Completed</span>
            <span className="font-bold text-foreground">{builder.completedProjects} Projects</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Ongoing</span>
            <span className="font-bold text-primary">{builder.ongoingProjects} Active</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Delivery Score</span>
            <span className="font-bold text-emerald-600">{builder.avgDelivery}</span>
          </div>
        </div>
      </CardContent>

      <div className="p-6 pt-0">
        <Button
          onClick={() => onSelect && onSelect(builder.id)}
          variant="outline"
          className="w-full rounded-xl gap-2 text-xs"
        >
          <span>View Developer Portfolio</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
