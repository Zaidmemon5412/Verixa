/**
 * Inline spinning loader for sections, lists, or card bodies.
 */
export const InlineLoader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} animate-spin rounded-full border-slate-800 border-t-brand-500`}
        role="status"
        id="inline-loader"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

/**
 * Mini-loader for button components, showing active submit/fetch logic.
 */
export const ButtonLoader = ({ className = '', label = 'Processing...' }) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`} id="button-loader">
      <div
        className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"
        role="status"
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

/**
 * Screen-blocking global loader used on startup/initial checks.
 */
export const FullPageLoader = ({ message = 'Initializing authentication check...' }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100" 
      id="full-page-loader"
    >
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop blur effect */}
        <div className="absolute h-24 w-24 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
        
        {/* Outer spinner */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-900 border-t-brand-500 shadow-md" />
        
        {/* Inner brand emblem letter */}
        <div className="absolute text-brand-400 font-extrabold text-sm tracking-tight select-none">V</div>
      </div>
      <p className="mt-6 text-sm font-medium tracking-wide text-slate-400 animate-pulse select-none">
        {message}
      </p>
    </div>
  );
};

export default InlineLoader;
