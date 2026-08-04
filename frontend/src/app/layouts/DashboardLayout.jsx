import { Outlet } from 'react-router-dom';
import Sidebar from '../../shared/components/Sidebar';
import DashboardHeader from '../../shared/components/DashboardHeader';

/**
 * DashboardLayout Component.
 * Used for protected dashboard and user portal areas: Dashboard, Profile, Reports, Comparison.
 * Structure: Sidebar + Dashboard Header + Main Content (Outlet)
 */
export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Right Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Dashboard Header */}
        <DashboardHeader />

        {/* Dynamic Workspace Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
