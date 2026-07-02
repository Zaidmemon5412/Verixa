import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Placeholder screen routes for the Verixa startup platform
const Dashboard = () => (
  <div className="p-8">
    <h2 className="text-3xl font-extrabold text-white mb-4">Verixa Intelligence Dashboard</h2>
    <p className="text-slate-400">Welcome to the core portal. Select an analytics app from the navigation to begin.</p>
  </div>
);

const PropertyComparison = () => (
  <div className="p-8">
    <h2 className="text-3xl font-extrabold text-white mb-4">Property Decision Matrix</h2>
    <p className="text-slate-400">Select properties to compare structural integrity, valuation forecasts, and regulatory risks side-by-side.</p>
  </div>
);

const DocumentVerification = () => (
  <div className="p-8">
    <h2 className="text-3xl font-extrabold text-white mb-4">OCR Legal Document Verification</h2>
    <p className="text-slate-400">Upload deeds, registration certifications, and zoning permits to verify boundaries and ownership chains.</p>
  </div>
);

const GeospatialMap = () => (
  <div className="p-8">
    <h2 className="text-3xl font-extrabold text-white mb-4">Geospatial Registry Map</h2>
    <p className="text-slate-400">Visualizing property lines, easement zones, and flood plain intersections utilizing Leaflet and OpenStreetMap.</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <span className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/25">V</span>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Verixa</span>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
            <a href="/" className="hover:text-brand-400 transition-colors">Dashboard</a>
            <a href="/map" className="hover:text-brand-400 transition-colors">Geospatial Map</a>
            <a href="/compare" className="hover:text-brand-400 transition-colors">Compare Matrix</a>
            <a href="/verify" className="hover:text-brand-400 transition-colors">Deed Verification</a>
          </nav>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<GeospatialMap />} />
            <Route path="/compare" element={<PropertyComparison />} />
            <Route path="/verify" element={<DocumentVerification />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Verixa Technologies. All rights reserved. Startup Property verification system.
        </footer>
      </div>
    </Router>
  );
}
