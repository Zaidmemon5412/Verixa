import React, { useState } from 'react';
import { 
  Building2, Search, ArrowLeftRight, TrendingUp, Heart, 
  User, Menu, X, Sun, Moon, MapPin
} from 'lucide-react';
import { Button } from './ui/button';

export function Navbar({ activeTab = 'home', onNavigate, wishlistCount = 0, isDark, toggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Properties' },
    { id: 'builders', label: 'Builders' },
    { id: 'localities', label: 'Localities' },
    { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
    { id: 'market', label: 'Market Trends', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate && onNavigate('home')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform group-hover:scale-105">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              VERIXA
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-primary tracking-wider ml-1.5 px-1.5 py-0.5 bg-primary/10 rounded">
              Decision Engine
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate && onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate && onNavigate('wishlist')}
            className="relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </Button>

          {/* Profile / Account */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate && onNavigate('profile')}
            className="hidden sm:flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-left ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
