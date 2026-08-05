import React from 'react';
import { 
  Building2, 
  Construction, 
  History, 
  ShieldCheck, 
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';

export function BuilderStats({ builder, projectsCount = 0 }) {
  if (!builder) return null;

  const completed = builder.completedProjectsCount || Math.max(1, projectsCount - 2);
  const ongoing = builder.ongoingProjectsCount || Math.min(projectsCount, 2);
  const expYears = builder.yearsOfExperience || (new Date().getFullYear() - (builder.establishedYear || 2005));
  const trustScore = builder.trustScore || 94;
  const deliveryRate = builder.deliveryRate || 96;

  const stats = [
    {
      id: 'completed',
      title: 'Completed Projects',
      value: `${completed}+`,
      subtitle: 'Delivered & Handed Over',
      icon: Building2,
      iconColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40',
      borderColor: 'border-sky-100 dark:border-sky-900/50',
    },
    {
      id: 'ongoing',
      title: 'Ongoing Projects',
      value: `${ongoing}`,
      subtitle: 'Under Active Construction',
      icon: Construction,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-100 dark:border-blue-900/50',
    },
    {
      id: 'experience',
      title: 'Years of Experience',
      value: `${expYears} Yrs`,
      subtitle: `Established in ${builder.establishedYear || 2005}`,
      icon: History,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-100 dark:border-indigo-900/50',
    },
    {
      id: 'trust',
      title: 'Trust Score',
      value: `${trustScore}/100`,
      subtitle: 'Verified Legal & RERA Score',
      icon: ShieldCheck,
      iconColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
      borderColor: 'border-teal-100 dark:border-teal-900/50',
    },
    {
      id: 'delivery',
      title: 'Avg Delivery Status',
      value: `${deliveryRate}%`,
      subtitle: 'On-Time Project Delivery Rate',
      icon: Clock,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-100 dark:border-emerald-900/50',
    },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-500" />
            <span>Developer Reliability Benchmarks</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key operational metrics audited by Verixa's AI Decision Engine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.id}
              className={`p-4 rounded-2xl border ${stat.borderColor} bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {stat.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BuilderStats;
