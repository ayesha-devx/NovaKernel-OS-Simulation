import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const MemoryTrendChart = React.memo(({ data }) => {
  const points = useMemo(() => {
    if (!data || data.length < 2) return "";
    const width = 400;
    const height = 100;
    
    const values = data.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const stepX = width / (data.length - 1);
    
    return data.map((d, i) => {
      const x = i * stepX;
      const y = height - (d.value / maxVal) * height;
      return `${x},${y}`;
    }).join(" ");
  }, [data]);

  const areaPath = useMemo(() => {
    if (!points) return "";
    return `M 0,100 L ${points} L 400,100 Z`;
  }, [points]);

  return (
    <div className="h-48 w-full relative group">
      <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.polyline
          fill="none"
          stroke="#a855f7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        <motion.path
          d={areaPath}
          fill="url(#memGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      </svg>
      <div className="absolute top-0 left-0 p-2 text-[8px] font-mono text-purple-400 uppercase tracking-widest bg-black/40 rounded-lg border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
        RAM_RSS_TREND_100S
      </div>
    </div>
  );
});

export default MemoryTrendChart;
