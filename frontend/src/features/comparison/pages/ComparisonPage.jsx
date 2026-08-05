import React from 'react';
import { ArrowLeftRight, Check, X, Shield, Star, Plus } from 'lucide-react';
import { PROJECTS } from '../../properties/constants/propertyData';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';

export function ComparisonPage({ selectedIds = ["1", "2"], onSelectProject }) {
  const comparedProjects = PROJECTS.filter((p) => selectedIds.includes(p.id)) || [PROJECTS[0], PROJECTS[1]];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Side-by-Side Multi-Property Matrix</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Property Comparison</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare specifications, trust ratings, RERA numbers, and rental yields across selected projects
        </p>
      </div>

      <Card className="rounded-2xl overflow-x-auto border">
        <CardContent className="p-6">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 min-w-[180px] font-bold text-muted-foreground uppercase text-xs">Feature Specs</th>
                {comparedProjects.map((proj) => (
                  <th key={proj.id} className="p-4 min-w-[260px] align-top">
                    <div className="space-y-2">
                      <img src={proj.image} alt={proj.name} className="w-full h-32 object-cover rounded-xl border" />
                      <h3 className="font-bold text-base text-foreground">{proj.name}</h3>
                      <p className="text-xs text-muted-foreground">{proj.location}</p>
                      <span className="text-sm font-extrabold text-primary block">{proj.price}</span>
                      <Button onClick={() => onSelectProject(proj.id)} size="sm" className="w-full text-xs rounded-lg">
                        View Details
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              <tr>
                <td className="p-4 font-semibold text-muted-foreground">Developer</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} className="p-4 font-medium text-foreground">{p.builder}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-muted-foreground">RERA Number</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} className="p-4 text-emerald-600 font-semibold">{p.rera}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-muted-foreground">Trust Score</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-emerald-600">{p.trustScore}% Verified</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-muted-foreground">Investment Score</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-primary">{p.investScore}/100</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-muted-foreground">Possession</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} className="p-4 text-foreground">{p.possession}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-muted-foreground">Rental Yield</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} className="p-4 text-amber-600 font-bold">{p.rentalYield}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-muted-foreground">Amenities</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} className="p-4 space-y-1">
                    {p.amenities?.map((a, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[11px]">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComparisonPage;

