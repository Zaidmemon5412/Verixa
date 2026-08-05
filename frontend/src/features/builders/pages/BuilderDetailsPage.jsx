import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Building2, ShieldCheck } from 'lucide-react';
import { builderService } from '../services/builderService';
import BuilderHero from '../components/BuilderHero';
import BuilderStats from '../components/BuilderStats';
import BuilderFilters from '../components/BuilderFilters';
import BuilderProjects from '../components/BuilderProjects';
import BuilderSkeleton from '../components/BuilderSkeleton';
import ErrorState from '../components/ErrorState';

export function BuilderDetailsPage({ builderId: propBuilderId, onSelectProject, onBack }) {
  const { id: urlParamId } = useParams();
  const navigate = useNavigate();
  
  const targetId = propBuilderId || urlParamId;

  // State Management
  const [builder, setBuilder] = useState(null);
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Loading and Error States
  const [loadingBuilder, setLoadingBuilder] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // Active Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('-created_at');

  // Load Builder Profile
  const loadBuilderProfile = useCallback(async () => {
    if (!targetId) {
      setError('No developer ID specified.');
      setLoadingBuilder(false);
      return;
    }

    setLoadingBuilder(true);
    setError(null);

    try {
      const data = await builderService.getBuilderById(targetId);
      if (data) {
        setBuilder(data);
      } else {
        setError(`Developer profile with ID "${targetId}" could not be found.`);
      }
    } catch (err) {
      console.error('Failed to load builder profile:', err);
      setError('An error occurred while loading developer profile details.');
    } finally {
      setLoadingBuilder(false);
    }
  }, [targetId]);

  // Load Builder Projects
  const loadProjects = useCallback(async () => {
    if (!targetId) return;

    setLoadingProjects(true);
    try {
      const response = await builderService.getBuilderProjects(targetId, {
        search: searchQuery,
        status: statusFilter,
        property_type: propertyTypeFilter,
        ordering: sortBy,
        page: currentPage,
      });

      setProjects(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to load builder projects:', err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, [targetId, searchQuery, statusFilter, propertyTypeFilter, sortBy, currentPage]);

  // Initial Profile Load
  useEffect(() => {
    loadBuilderProfile();
  }, [loadBuilderProfile]);

  // Projects Load on Filter or Page Change
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPropertyTypeFilter('All');
    setSortBy('-created_at');
    setCurrentPage(1);
  };

  const handleSelectProject = (projectId) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      navigate(`/properties/${projectId}`);
    }
  };

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/builders');
    }
  };

  if (loadingBuilder) {
    return <BuilderSkeleton />;
  }

  if (error || !builder) {
    return (
      <ErrorState
        message={error || 'Developer profile not found.'}
        onBack={handleBackNavigation}
        onRetry={loadBuilderProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link 
              to="/builders" 
              className="inline-flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-500" />
              <span>Developers</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
              {builder.name}
            </span>
          </nav>

          <button
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Developers</span>
          </button>
        </div>

        {/* Section 1: Hero */}
        <BuilderHero builder={builder} />

        {/* Section 2: Statistics */}
        <BuilderStats builder={builder} projectsCount={totalCount || projects.length} />

        {/* Section 3: Search & Filters */}
        <BuilderFilters
          searchQuery={searchQuery}
          onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
          statusFilter={statusFilter}
          onStatusChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          propertyTypeFilter={propertyTypeFilter}
          onPropertyTypeChange={(val) => { setPropertyTypeFilter(val); setCurrentPage(1); }}
          sortBy={sortBy}
          onSortChange={(val) => { setSortBy(val); setCurrentPage(1); }}
          onReset={handleResetFilters}
          totalResults={totalCount || projects.length}
        />

        {/* Section 4: Projects Grid / Loading State */}
        {loadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
            ))}
          </div>
        ) : (
          <BuilderProjects
            projects={projects}
            onSelectProject={handleSelectProject}
            onResetFilters={handleResetFilters}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(pg) => setCurrentPage(pg)}
            builderName={builder.name}
          />
        )}

      </div>
    </div>
  );
}

export default BuilderDetailsPage;
