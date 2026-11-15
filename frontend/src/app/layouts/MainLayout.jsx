import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/Navbar';
import Footer from '../../shared/components/Footer';

/**
 * MainLayout Component.
 * Used for public platform exploration pages: Landing, Search, Properties, Builders.
 * Structure: Navbar + Main Content (Outlet) + Footer
 */
export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200 overflow-x-hidden pb-16 md:pb-0">
      {/* Top Application Navbar */}
      <Navbar />

      {/* Main Page Workspace */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* Application Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
