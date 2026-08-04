import { Link } from 'react-router-dom';
import { Building2, Shield, Globe, Mail } from 'lucide-react';

/**
 * Footer Component for MainLayout.
 * Features platform navigation, category links, legal info, and copyright.
 */
export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Summary */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                VERIXA<span className="text-brand-400">.</span>
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed">
              Advanced Real Estate Intelligence & Risk Mitigation Platform. Transforming property verification, valuation, and geospatial legal insights.
            </p>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/properties" className="hover:text-slate-200 transition-colors">Properties Search</Link>
              </li>
              <li>
                <Link to="/builders" className="hover:text-slate-200 transition-colors">Verified Builders</Link>
              </li>
              <li>
                <Link to="/comparison" className="hover:text-slate-200 transition-colors">Decision Matrix</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-slate-200 transition-colors">Analytics Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resources</h4>
            <ul className="space-y-1.5">
              <li>
                <span className="text-slate-600 cursor-not-allowed">Geospatial Registry API</span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">Zoning & Flood Risk Guide</span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">Legal OCR Documentation</span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">Developer Portal</span>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Security & Legal</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center space-x-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>JWT End-to-End Encrypted</span>
              </li>
              <li className="flex items-center space-x-1.5 text-slate-400">
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>Geospatial Compliance</span>
              </li>
              <li className="pt-1">
                <span className="text-slate-500">Privacy Policy • Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} Verixa Technologies. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
            <span className="hover:text-slate-400 cursor-pointer">Status</span>
            <span className="hover:text-slate-400 cursor-pointer">Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
