import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// Expanded mock data with more zones to stress test the collision algorithm
const MOCK_ZONES = [
  { id: 'Z1', x: 400, y: 150, name: 'North Concourse', densityBucket: 'low' },
  { id: 'Z2', x: 650, y: 300, name: 'East Gate (Main)', densityBucket: 'moderate' },
  { id: 'Z3', x: 600, y: 400, name: 'East Plaza', densityBucket: 'high' },
  { id: 'Z4', x: 400, y: 450, name: 'South VIP Lounge', densityBucket: 'low' },
  { id: 'Z5', x: 450, y: 450, name: 'South Escalators', densityBucket: 'critical' },
  { id: 'Z6', x: 150, y: 300, name: 'West Seating Tier 1', densityBucket: 'critical' },
  { id: 'Z7', x: 180, y: 250, name: 'West Concourse A', densityBucket: 'high' },
  { id: 'Z8', x: 220, y: 220, name: 'NW Corner Access', densityBucket: 'moderate' },
  { id: 'Z9', x: 580, y: 220, name: 'NE Corner Access', densityBucket: 'low' },
];

const DENSITY_CONFIG = {
  low: { color: 'fill-emerald-500/80', stroke: 'stroke-emerald-400', radius: 10, label: 'Low' },
  moderate: { color: 'fill-yellow-500/80', stroke: 'stroke-yellow-400', radius: 16, label: 'Moderate' },
  high: { color: 'fill-orange-500/80', stroke: 'stroke-orange-400', radius: 24, label: 'High' },
  critical: { color: 'fill-red-500/90', stroke: 'stroke-red-400', radius: 34, label: 'Critical' },
};

function checkCollision(box1: any, box2: any, padding = 10) {
  return (
    box1.x - padding < box2.x + box2.width + padding &&
    box1.x + box1.width + padding > box2.x - padding &&
    box1.y - padding < box2.y + box2.height + padding &&
    box1.y + box1.height + padding > box2.y - padding
  );
}

export const StadiumMap: React.FC = () => {
  const [labels, setLabels] = useState<any[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    // Simulate real-time updates ticker
    const timer = setInterval(() => {
      setLastUpdated((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Spiral Search Collision Avoidance Algorithm
    const newLabels: any[] = [];
    
    // Sort zones so we place critical (largest) markers' labels first, ensuring they get priority placements
    const sortedZones = [...MOCK_ZONES].sort((a, b) => {
      const order = { critical: 4, high: 3, moderate: 2, low: 1 };
      return (order[b.densityBucket as keyof typeof order] || 0) - (order[a.densityBucket as keyof typeof order] || 0);
    });
    
    sortedZones.forEach((zone) => {
      const labelWidth = 140;
      const labelHeight = 44;
      
      let bestPos = null;
      let found = false;
      
      // Spiral search parameters
      const maxRadius = 250;
      const radiusStep = 15;
      const angleStep = Math.PI / 8; // 22.5 degrees
      
      for (let r = 50; r <= maxRadius && !found; r += radiusStep) {
        // Start angle offset based on quadrant to push labels outward naturally
        const startAngle = Math.atan2(zone.y - 300, zone.x - 400); 
        
        for (let a = 0; a < Math.PI * 2; a += angleStep) {
          const angle = startAngle + a;
          const candidateX = zone.x + Math.cos(angle) * r - (labelWidth / 2);
          const candidateY = zone.y + Math.sin(angle) * r - (labelHeight / 2);
          
          // Keep inside SVG bounds (800x600)
          if (candidateX < 10 || candidateX + labelWidth > 790 || candidateY < 10 || candidateY + labelHeight > 590) {
            continue;
          }
          
          const box = { x: candidateX, y: candidateY, width: labelWidth, height: labelHeight };
          let hasCollision = false;
          
          for (const existing of newLabels) {
            const exBox = { x: existing.x, y: existing.y, width: labelWidth, height: labelHeight };
            if (checkCollision(box, exBox)) {
              hasCollision = true;
              break;
            }
          }
          
          if (!hasCollision) {
            bestPos = { x: candidateX, y: candidateY };
            found = true;
            break;
          }
        }
      }
      
      // Fallback if stadium is completely congested (shouldn't happen with 800x600 and 15 labels, but safe fallback)
      if (!bestPos) {
        bestPos = { x: zone.x + 40, y: zone.y - 40 }; 
      }
      
      newLabels.push({
        ...zone,
        x: bestPos.x,
        y: bestPos.y,
        anchorX: zone.x,
        anchorY: zone.y
      });
    });
    
    setLabels(newLabels);
  }, []);

  return (
    <div className="w-full h-full min-h-[600px] bg-slate-950 rounded-xl overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col">
      {/* Map Header & Live Indicator */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-slate-950/80 to-transparent">
        <h2 className="text-xl font-bold text-white drop-shadow-md">Live Crowd Map</h2>
        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
          <motion.div 
            className="w-2.5 h-2.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs font-medium text-slate-200">
            Updated {lastUpdated}s ago
          </span>
        </div>
      </div>

      <svg 
        ref={svgRef}
        viewBox="0 0 800 600" 
        className="w-full h-full flex-1"
        style={{ backgroundColor: '#0f172a' }} // slate-900 background
      >
        {/* Base Stadium Graphic (SVG) */}
        <g className="stadium-base">
          {/* Outer perimeter / stadium footprint */}
          <rect x="50" y="50" width="700" height="500" rx="200" className="fill-slate-800/40 stroke-slate-700 stroke-2" />
          
          {/* Outer seating tier */}
          <rect x="100" y="90" width="600" height="420" rx="160" className="fill-slate-800/80 stroke-slate-600 stroke-[1.5]" />
          <path d="M 100 300 L 700 300" className="stroke-slate-700 stroke-1" strokeDasharray="10 10" />
          <path d="M 400 90 L 400 510" className="stroke-slate-700 stroke-1" strokeDasharray="10 10" />
          
          {/* Inner seating tier */}
          <rect x="180" y="150" width="440" height="300" rx="100" className="fill-slate-700/60 stroke-slate-500 stroke-1" />
          
          {/* Pitch / Field */}
          <rect x="250" y="200" width="300" height="200" rx="20" className="fill-emerald-900/30 stroke-emerald-700/50 stroke-2" />
          
          {/* Pitch lines */}
          <circle cx="400" cy="300" r="40" className="fill-transparent stroke-emerald-700/40 stroke-2" />
          <path d="M 400 200 L 400 400" className="stroke-emerald-700/40 stroke-2" />
          <rect x="250" y="240" width="40" height="120" className="fill-transparent stroke-emerald-700/40 stroke-2" />
          <rect x="510" y="240" width="40" height="120" className="fill-transparent stroke-emerald-700/40 stroke-2" />
        </g>

        {/* Draw Zones / Heatmap Markers */}
        {MOCK_ZONES.map((zone) => {
          const config = DENSITY_CONFIG[zone.densityBucket as keyof typeof DENSITY_CONFIG];
          return (
            <circle
              key={zone.id}
              cx={zone.x}
              cy={zone.y}
              r={config.radius}
              className={`${config.color} ${config.stroke} stroke-[3px] transition-transform duration-300 hover:scale-110 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900`}
              tabIndex={0}
              role="button"
              aria-label={`${zone.name}, density is ${config.label}`}
            />
          );
        })}

        {/* Draw Leader Lines & Labels */}
        {labels.map((label) => {
          const config = DENSITY_CONFIG[label.densityBucket as keyof typeof DENSITY_CONFIG];
          const centerX = label.x + 70; // 140 / 2
          const centerY = label.y + 22; // 44 / 2
          return (
            <g key={`label-${label.id}`} className="transition-opacity duration-300 pointer-events-none">
              {/* Leader Line */}
              <line
                x1={label.anchorX}
                y1={label.anchorY}
                x2={centerX}
                y2={centerY}
                className="stroke-slate-400"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              {/* Label Box Background */}
              <rect
                x={label.x}
                y={label.y}
                width="140"
                height="44"
                rx="8"
                className="fill-slate-800 stroke-slate-600 stroke-1"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
              />
              {/* Color Accent bar on the left of label */}
              <path 
                d={`M ${label.x + 8} ${label.y} L ${label.x + 4} ${label.y} Q ${label.x} ${label.y} ${label.x} ${label.y + 4} L ${label.x} ${label.y + 40} Q ${label.x} ${label.y + 44} ${label.x + 4} ${label.y + 44} L ${label.x + 8} ${label.y + 44} Z`}
                className={config.color.replace('/80', '').replace('/90', '')} 
              />
              <text
                x={label.x + 16}
                y={label.y + 18}
                fill="#f8fafc"
                fontSize="12"
                fontWeight="600"
                className="font-sans"
              >
                {label.name.length > 18 ? label.name.substring(0, 16) + '...' : label.name}
              </text>
              <text
                x={label.x + 16}
                y={label.y + 34}
                fill="#94a3b8"
                fontSize="11"
                className="font-sans font-medium uppercase tracking-wide"
              >
                {config.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Persistent Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-xl z-10 pointer-events-none">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Crowd Density</h4>
        <div className="flex flex-col gap-2">
          {Object.entries(DENSITY_CONFIG).reverse().map(([key, config]) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.color.replace('/80', '').replace('/90', '')} ${config.stroke} stroke-2`}></div>
              <span className="text-xs font-medium text-slate-200">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
