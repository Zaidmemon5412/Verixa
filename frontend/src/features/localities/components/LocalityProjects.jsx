import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { propertyService } from '../../properties/services/propertyService';
import { PropertyCard } from '../../properties/components/PropertyCard';
import { LocalityProjectsSkeleton } from './Skeletons';

export function LocalityProjects({ locality, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!locality?.name) return;
      setLoading(true);
      try {
        const locName = locality.name;
        const locKeyword = locName.split(' ')[0]; // e.g. "Satellite", "Thaltej", "Gota", "Chandkheda", "Sola"

        // 1. Fetch properties from service
        let fetched = await propertyService.getProperties({ search: locKeyword });
        if (!Array.isArray(fetched) || fetched.length === 0) {
          fetched = await propertyService.getProperties();
        }

        // 2. Filter properties belonging or related to this locality
        let matches = fetched.filter((p) => {
          const locStr = `${p.locality || ''} ${p.address || ''} ${p.location || ''}`.toLowerCase();
          return locStr.includes(locKeyword.toLowerCase()) || locStr.includes(locName.toLowerCase());
        });

        // 3. Fallback to general properties if no specific matches found
        if (matches.length === 0) {
          matches = fetched;
        }

        setProjects(matches);
      } catch (err) {
        console.error('Failed to load locality projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [locality?.name]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-foreground">
          Projects in {locality?.name || 'Locality'}
        </h3>
        <LocalityProjectsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Residential Projects</span>
          </div>
          <h3 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <span>Projects in {locality?.name}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/50">
              {projects.length} Available
            </span>
          </h3>
        </div>
      </div>

      {/* Exactly 3 Properties Per Row (Responsive 3-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <PropertyCard
            key={project.id}
            project={project}
            onSelect={onSelectProject}
          />
        ))}
      </div>
    </div>
  );
}
