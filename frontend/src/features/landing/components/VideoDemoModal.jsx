import React from 'react';
import { X, Play, Shield, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';

export function VideoDemoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Verixa AI Decision Engine Demo</h3>
              <p className="text-xs text-muted-foreground">Watch how Verixa verifies legal titles, builder track records & price fairness</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1714983007778-b370188238b8?w=1200&h=675&fit=crop&auto=format"
            alt="Verixa Platform Walkthrough"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="relative z-10 text-center space-y-4 max-w-lg p-6">
            <div className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center mx-auto shadow-2xl animate-pulse">
              <Play className="w-8 h-8 fill-primary-foreground ml-1" />
            </div>
            <h4 className="text-xl font-bold text-white">Interactive Platform Walkthrough</h4>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Title Deed OCR
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Builder Delay Radar
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> XGBoost Valuation
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-card border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            100% Data Protection & RERA Compliant Legal Index
          </span>
          <Button onClick={onClose} className="rounded-xl px-6">
            Got it, Let's Explore
          </Button>
        </div>
      </div>
    </div>
  );
}
