import React from 'react';
import { Building2, Shield, Heart, Globe, Mail, Phone } from 'lucide-react';

export function Footer({ onNavigate }) {
  return (
    <footer className="border-t bg-muted/40 text-muted-foreground mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">VERIXA</span>
            </div>
            <p className="text-xs leading-relaxed">
              India's premier AI-powered Real Estate Decision Engine. Verifying legal titles, builder delivery records, and investment yields.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md w-fit border border-emerald-200 dark:border-emerald-800">
              <Shield className="w-3.5 h-3.5" />
              100% RERA & Legal Audit Guaranteed
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate && onNavigate('projects')} className="hover:text-foreground transition-colors">
                  Properties Registry
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('builders')} className="hover:text-foreground transition-colors">
                  Builder Trust Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('localities')} className="hover:text-foreground transition-colors">
                  Locality Growth Index
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('compare')} className="hover:text-foreground transition-colors">
                  Side-by-Side Comparison Tool
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('market')} className="hover:text-foreground transition-colors">
                  Market Trend Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Top Localities */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Popular Hubs</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-foreground cursor-pointer">SG Highway, Ahmedabad</li>
              <li className="hover:text-foreground cursor-pointer">GIFT City, Gandhinagar</li>
              <li className="hover:text-foreground cursor-pointer">Shela & South Bopal</li>
              <li className="hover:text-foreground cursor-pointer">Gota & Jagatpur</li>
              <li className="hover:text-foreground cursor-pointer">Sindhu Bhavan Road</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Contact & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                support@verixa.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                +91 79 4000 8800
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-primary" />
                Ahmedabad, Gujarat, India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} Verixa Real Estate Decision Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">RERA Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

