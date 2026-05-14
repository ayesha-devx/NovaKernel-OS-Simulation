import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      />
    </div>
  );
};

export const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i} className="border-b border-white/5">
        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
        <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></td>
        <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
        <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
        <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-24 mx-auto" /></td>
        <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto rounded-xl" /></td>
      </tr>
    ))}
  </>
);

export default Skeleton;
