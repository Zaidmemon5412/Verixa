import React from 'react';
import { Map, Layers, Globe, LocateFixed, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

export function MapControls({
  mapType,
  onToggleMapType,
  onRecenter,
  onToggleFullscreen,
  isFullscreen = false,
  googleMapsUrl,
}) {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-wrap items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 max-w-[calc(100%-1.5rem)]">
      <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-1">
        <button
          type="button"
          onClick={() => onToggleMapType('streets')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            mapType === 'streets'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Street Map View"
        >
          <Map className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleMapType('hybrid')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            mapType === 'hybrid'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Google Hybrid View (Satellite + Labels)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Hybrid</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleMapType('satellite')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            mapType === 'satellite'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Satellite View (Esri World)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Satellite</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onRecenter}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title="Recenter Map on Property"
      >
        <LocateFixed className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </button>

      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition"
          title="Open exact location in Google Maps"
        >
          <span className="hidden sm:inline">Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isFullscreen ? 'Exit Expanded View' : 'Expand Map View'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

export default MapControls;
