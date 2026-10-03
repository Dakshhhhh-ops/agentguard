import React from 'react';
import type { Severity } from '../../types';

interface SeverityBadgeProps {
  severity: Severity | string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
}) => {
  const s = (severity || 'LOW').toUpperCase();

  const config = {
    CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    LOW: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }[s] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';

  const sizeClasses = size === 'sm' ? 'text-[9px] px-1.5 py-0.2' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-semibold border ${config} ${sizeClasses}`}
    >
      {s}
    </span>
  );
};
