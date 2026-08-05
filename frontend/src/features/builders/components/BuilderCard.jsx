import React from 'react';
import { Building2, Award, Clock, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';

import { getBuilderBrandInfo } from '../utils/builderLogos';

export function BuilderCard({ builder, onSelect }) {
  if (!builder) return null;

  const brandInfo = getBuilderBrandInfo(builder.name, builder.logoUrl);
  const yearsExperience = builder.yearsOfExperience || builder.yearsExp || 25;
  const completedProjects = builder.completedProjectsCount || builder.completedProjects || 28;
  const ongoingProjects = builder.ongoingProjectsCount || builder.ongoingProjects || 6;
  const deliveryStatus = builder.deliveryRate ? `${builder.deliveryRate}% On-Time` : (builder.avgDelivery || '95% On-Time');

  return (
    <Card className="rounded-2xl border border-sky-100 dark:border-slate-800 bg-card hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Header Avatar Logo & Name */}
        <div className="flex items-center gap-4">
          {brandInfo.logo ? (
            <img
              src={brandInfo.logo}
              alt={builder.name}
              className="w-14 h-14 rounded-2xl object-contain bg-white p-1.5 border border-sky-100 dark:border-slate-800 shadow-md shrink-0"
              onError={(e) => {
                // Fallback to monogram if image fails to load
                e.target.onerror = null;
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl shadow-md shrink-0 ${
              brandInfo.logo ? 'hidden' : 'flex'
            }`}
            style={{ backgroundColor: brandInfo.color || builder.color || '#0284c7' }}
          >
            {brandInfo.abbr || builder.abbr}
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-sky-600 transition-colors">{builder.name}</h3>
            <p className="text-xs text-muted-foreground">{yearsExperience} Years Real Estate Experience</p>
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
            <span className="font-bold text-foreground">{completedProjects} Projects</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Ongoing</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{ongoingProjects} Active</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Delivery Score</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{deliveryStatus}</span>
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
