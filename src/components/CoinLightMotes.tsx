import React from "react";

const CoinLightMotes = () => {
  return (
    <>
      {/* Mote 1 - top right */}
      <span 
        className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-gold/30 animate-light-mote-1 pointer-events-none"
        aria-hidden="true"
      />
      {/* Mote 2 - bottom left */}
      <span 
        className="absolute -bottom-0.5 -left-0.5 w-0.5 h-0.5 rounded-full bg-amber-200/25 animate-light-mote-2 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
};

export default CoinLightMotes;
