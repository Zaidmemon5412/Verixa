import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, Smartphone, Key, Heart, 
  Building2, ArrowRight, Sparkles 
} from 'lucide-react';
import useAuth from '../../auth/hooks/useAuth';
import useWishlist from '../../properties/hooks/useWishlist';
import usePropertyComparison from '../../comparison/hooks/usePropertyComparison';
import { PropertyCard } from '../../properties/components/PropertyCard';
import { CardSkeleton } from '../../../shared/components/skeletons';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent } from '../../../shared/components/ui/card';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    savedProperties,
    loading: loadingWishlist,
    isWishlisted,
    toggleWishlist
  } = useWishlist();

  const { selectedIds, addProperty, removeProperty } = usePropertyComparison();

  const handleToggleCompare = (propertyId) => {
    const targetId = String(propertyId);
    if (selectedIds.includes(targetId)) {
      removeProperty(targetId);
    } else {
      addProperty(targetId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Account Profile Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2 border border-primary/20">
          <User className="w-3.5 h-3.5" />
          <span>VERIXA USER ACCOUNT & WISHLIST</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Account & Saved Properties</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Manage credentials, session settings, and view your saved real estate portfolio.
        </p>
      </div>

      {/* User Details Grid */}
      <Card className="rounded-3xl border bg-card shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-4 border-b pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-extrabold text-2xl shadow-sm">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-foreground">{user?.full_name || 'Active User'}</h3>
            <p className="text-xs text-muted-foreground font-semibold">@{user?.username || 'user'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center space-x-3">
            <Mail className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Email Address</span>
              <span className="font-bold text-foreground truncate block">{user?.email || 'N/A'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Phone Number</span>
              <span className="font-bold text-foreground truncate block">{user?.phone_number || user?.phone || 'Not configured'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center space-x-3">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Session Security</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Authenticated (JWT)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center space-x-3">
            <Key className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Account Role</span>
              <span className="font-bold text-foreground capitalize">{user?.role || 'Buyer'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Saved Properties (Wishlist) Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Saved Properties ({savedProperties.length})</h2>
              <p className="text-xs text-muted-foreground">Properties saved to your personal real estate portfolio</p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/properties')}
            variant="outline"
            size="sm"
            className="text-xs rounded-xl gap-1.5"
          >
            <span>Browse All Properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Wishlist Grid Content */}
        {loadingWishlist ? (
          <CardSkeleton count={3} />
        ) : savedProperties.length === 0 ? (
          <Card className="rounded-3xl border p-12 text-center bg-card shadow-sm space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-extrabold text-foreground">Your Wishlist is Empty</h3>
              <p className="text-xs text-muted-foreground">
                You haven't saved any properties yet. Click the Heart icon on any property card to save it here for quick access.
              </p>
            </div>
            <Button
              onClick={() => navigate('/properties')}
              size="lg"
              className="rounded-2xl gap-2 font-bold text-xs shadow-lg shadow-primary/25"
            >
              <Building2 className="w-4 h-4" />
              <span>Explore Verixa Properties</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                project={prop}
                onSelect={(pId) => navigate(`/properties/${pId}`)}
                onSelectLegal={(pId) => navigate(`/properties/${pId}/legal`)}
                onToggleWishlist={toggleWishlist}
                isWishlisted={isWishlisted(prop.id)}
                onToggleCompare={handleToggleCompare}
                isCompared={selectedIds.includes(String(prop.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
