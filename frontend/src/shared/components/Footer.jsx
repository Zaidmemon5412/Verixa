import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Shield, Globe, Mail, Phone, 
  MapPin, ChevronRight, CheckCircle2
} from 'lucide-react';

export function Footer({ onNavigate }) {
  const handleLinkClick = (path, legacyKey) => (e) => {
    if (onNavigate && legacyKey) {
      e.preventDefault();
      onNavigate(legacyKey);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40 text-muted-foreground mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">VERIXA</span>
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              India's premier AI-powered Real Estate Decision Engine. Verifying legal titles, builder delivery records, price trends, and investment yields.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg w-fit border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>100% RERA & Title Verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/properties" onClick={handleLinkClick('/properties', 'projects')} className="hover:text-primary transition-colors flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Properties Registry</span>
                </Link>
              </li>
              <li>
                <Link to="/builders" onClick={handleLinkClick('/builders', 'builders')} className="hover:text-primary transition-colors flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Builder Trust Directory</span>
                </Link>
              </li>
              <li>
                <Link to="/localities" onClick={handleLinkClick('/localities', 'localities')} className="hover:text-primary transition-colors flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Locality Growth Index</span>
                </Link>
              </li>
              <li>
                <Link to="/market" onClick={handleLinkClick('/market', 'market')} className="hover:text-primary transition-colors flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Market Trend Analytics</span>
                </Link>
              </li>
              <li>
                <Link to="/comparison" onClick={handleLinkClick('/comparison', 'compare')} className="hover:text-primary transition-colors flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Side-by-Side Comparison</span>
                </Link>
              </li>
              <li>
                <Link to="/reports" onClick={handleLinkClick('/reports', 'reports')} className="hover:text-primary transition-colors flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>AI Audit Reports</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Localities */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Popular Micro-Markets</h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'Satellite', slug: 'satellite' },
                { name: 'Thaltej', slug: 'thaltej' },
                { name: 'Gota', slug: 'gota' },
                { name: 'Chandkheda', slug: 'chandkheda' },
                { name: 'Sola', slug: 'sola' },
                { name: 'Maninagar', slug: 'maninagar' },
              ].map((loc) => (
                <li key={loc.slug}>
                  <Link 
                    to={`/locality/${loc.slug}`}
                    className="hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <MapPin className="w-3 h-3 text-primary/70 group-hover:text-primary shrink-0" />
                    <span>{loc.name}, Ahmedabad</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Contact & Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href="mailto:support@verixa.in" className="hover:text-foreground transition-colors">
                  support@verixa.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href="tel:+917940008800" className="hover:text-foreground transition-colors">
                  +91 79 4000 8800
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Ahmedabad, Gujarat, India</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Real-Time Intelligence Connected</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {currentYear} VERIXA Real Estate Decision Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/properties" className="hover:text-foreground hover:underline transition-colors">
              Properties
            </Link>
            <Link to="/localities" className="hover:text-foreground hover:underline transition-colors">
              Localities
            </Link>
            <Link to="/builders" className="hover:text-foreground hover:underline transition-colors">
              Builders
            </Link>
            <span className="text-muted-foreground/60">|</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

