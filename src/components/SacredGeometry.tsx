const SacredGeometry = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
      {/* Rotating sacred geometry pattern */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] animate-rotate-slow">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          style={{ opacity: 0.15 }}
        >
          {/* Flower of Life Pattern */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <circle
              key={i}
              cx={200 + 50 * Math.cos((angle * Math.PI) / 180)}
              cy={200 + 50 * Math.sin((angle * Math.PI) / 180)}
              r="50"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="0.5"
            />
          ))}
          <circle
            cx="200"
            cy="200"
            r="50"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="0.5"
          />
          <circle
            cx="200"
            cy="200"
            r="100"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="0.5"
          />
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="0.3"
          />
          
          {/* Outer ring circles */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <circle
              key={`outer-${i}`}
              cx={200 + 100 * Math.cos((angle * Math.PI) / 180)}
              cy={200 + 100 * Math.sin((angle * Math.PI) / 180)}
              r="50"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="0.3"
            />
          ))}

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 100%, 70%)" />
              <stop offset="100%" stopColor="hsl(45, 100%, 85%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default SacredGeometry;
