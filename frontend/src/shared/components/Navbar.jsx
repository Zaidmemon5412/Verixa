import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, ArrowLeftRight, TrendingUp, Heart, 
  User, Menu, X, Sun, Moon, LogOut, LogIn, UserPlus,
  Home, MapPin, Award
} from 'lucide-react';
import { Button } from './ui/button';
import useAuth from '../../features/auth/hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export function Navbar({ wishlistCount = 0 }) {
  const { isDark, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/properties', label: 'Properties', icon: Building2 },
    { path: '/builders', label: 'Builders', icon: Award },
    { path: '/localities', label: 'Localities', icon: MapPin },
    { path: '/comparison', label: 'Compare', icon: ArrowLeftRight },
    { path: '/market', label: 'Market Trends', icon: TrendingUp },
  ];

  const bottomNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/properties', label: 'Properties', icon: Building2 },
    { path: '/localities', label: 'Localities', icon: MapPin },
    { path: '/comparison', label: 'Compare', icon: ArrowLeftRight },
    { path: '/market', label: 'Trends', icon: TrendingUp },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 pt-safe">
        <div className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-3.5 sm:px-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                VERIXA
              </span>
              <span className="hidden lg:inline-block text-[10px] uppercase font-bold text-primary tracking-wider ml-1.5 px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                Decision Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-xs'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist Button */}
            <Link to="/profile" title="Saved Properties / Wishlist">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-rose-500 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9 rounded-xl"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              )}
            </Button>

            {/* Mobile Quick Auth / Profile Icon (visible on phones) */}
            {isAuthenticated ? (
              <Link to="/profile" className="sm:hidden">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-primary/30 bg-primary/5">
                  <User className="w-4 h-4 text-primary" />
                </Button>
              </Link>
            ) : (
              <Link to="/login" className="sm:hidden">
                <Button size="sm" className="h-8 px-2.5 text-xs font-bold rounded-xl shadow-sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Desktop Authentication Actions */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl h-9">
                    <User className="w-4 h-4 text-primary" />
                    <span className="max-w-[100px] truncate">{user?.full_name?.split(' ')[0] || user?.username || 'Profile'}</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive gap-1.5 rounded-xl h-9"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl font-semibold h-9">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gap-1.5 rounded-xl font-bold shadow-md h-9">
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border/80 bg-background/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold border transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                        : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
              {isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-2 rounded-xl h-10 text-xs font-bold">
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{user?.username || 'My Profile'}</span>
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full justify-center gap-2 rounded-xl h-10 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Log Out</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-2 rounded-xl h-10 text-xs font-bold">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center gap-2 rounded-xl h-10 text-xs font-bold shadow-md">
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Native-Style Mobile Bottom Tab Bar (Android & iOS Phones) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-t border-border/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pb-safe"
      >
        <div className="grid grid-cols-5 h-15 px-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-primary font-extrabold'
                    : 'text-muted-foreground hover:text-foreground font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-primary/15' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-none tracking-tight truncate max-w-[64px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
