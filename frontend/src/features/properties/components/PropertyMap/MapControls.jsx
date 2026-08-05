import React from 'react';
import { Map, Layers, LocateFixed, Maximize2 } from 'lucide-react';

export function MapControls({ mapType, onToggleMapType, onRecenter, onToggleFullscreen }) {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-1">
        <button
          onClick={() => onToggleMapType('streets')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            mapType === 'streets'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Map View (CartoDB Voyager)"
        >
          <Map className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => onToggleMapType('satellite')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            mapType === 'satellite'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Satellite View (Esri World)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>
      </div>

      <button
        onClick={onRecenter}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title="Recenter Map on Property"
      >
        <LocateFixed className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </button>

      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default MapControls;
