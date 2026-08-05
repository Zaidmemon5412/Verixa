import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';

export function ErrorState({ title = "Unable to Load Locality Details", message = "We encountered a network issue loading intelligence data for this locality.", onRetry }) {
  return (
    <div className="border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-sm">
      <div className="p-4 rounded-full bg-rose-100 dark:bg-rose-900/40 w-fit mx-auto text-rose-600 dark:text-rose-400">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200">{title}</h3>
        <p className="text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2 rounded-xl border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100">
          <RotateCcw className="w-4 h-4" />
          <span>Retry Loading</span>
        </Button>
      )}
    </div>
  );
}
