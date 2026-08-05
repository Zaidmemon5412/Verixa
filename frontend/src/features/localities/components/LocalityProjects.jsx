import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { propertyService } from '../../properties/services/propertyService';
import { PropertyCard } from '../../properties/components/PropertyCard';
import { EmptyState } from './EmptyState';
import { LocalityProjectsSkeleton } from './Skeletons';

export function LocalityProjects({ locality, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!locality?.name) return;
      setLoading(true);
      try {
        const fetched = await propertyService.getProperties({ locality: locality.name });
        setProjects(fetched || []);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <span>Projects in {locality?.name}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {projects.length}
          </span>
        </h3>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title={`No Projects Found in ${locality?.name}`}
          message={`No active properties are currently listed for ${locality?.name} in the real estate database.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <PropertyCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
