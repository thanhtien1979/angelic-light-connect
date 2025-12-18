const SacredGeometryWatermark = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.04]"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flower of Life pattern - central circle */}
        <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="0.5" className="text-amber-200" />
        
        {/* Six surrounding circles forming flower of life */}
        <circle cx="200" cy="140" r="60" stroke="currentColor" strokeWidth="0.5" className="text-amber-100" />
        <circle cx="252" cy="170" r="60" stroke="currentColor" strokeWidth="0.5" className="text-amber-100" />
        <circle cx="252" cy="230" r="60" stroke="currentColor" strokeWidth="0.5" className="text-amber-100" />
        <circle cx="200" cy="260" r="60" stroke="currentColor" strokeWidth="0.5" className="text-amber-100" />
        <circle cx="148" cy="230" r="60" stroke="currentColor" strokeWidth="0.5" className="text-amber-100" />
        <circle cx="148" cy="170" r="60" stroke="currentColor" strokeWidth="0.5" className="text-amber-100" />
        
        {/* Outer ring of circles */}
        <circle cx="200" cy="80" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="270" cy="110" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="304" cy="170" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="304" cy="230" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="270" cy="290" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="200" cy="320" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="130" cy="290" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="96" cy="230" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="96" cy="170" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        <circle cx="130" cy="110" r="60" stroke="currentColor" strokeWidth="0.3" className="text-amber-50" />
        
        {/* Subtle concentric circles in center */}
        <circle cx="200" cy="200" r="30" stroke="currentColor" strokeWidth="0.3" className="text-white" />
        <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="0.3" className="text-amber-100/50" />
        <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="0.25" className="text-amber-50/50" />
        <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="0.2" className="text-amber-50/30" />
      </svg>
    </div>
  );
};

export default SacredGeometryWatermark;
