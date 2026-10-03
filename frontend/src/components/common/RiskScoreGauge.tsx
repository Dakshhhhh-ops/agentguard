import React from 'react';

interface RiskScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  // Determine color theme based on score thresholds
  let color = 'text-emerald-400';
  let barColor = 'bg-emerald-500';
  let glowColor = 'shadow-emerald-500/20';
  let borderColor = 'border-emerald-500/30';
  let label = 'LOW RISK';

  if (clampedScore >= 80) {
    color = 'text-red-400';
    barColor = 'bg-red-500';
    glowColor = 'shadow-red-500/30';
    borderColor = 'border-red-500/40';
    label = 'CRITICAL RISK';
  } else if (clampedScore >= 60) {
    color = 'text-orange-400';
    barColor = 'bg-orange-500';
    glowColor = 'shadow-orange-500/25';
    borderColor = 'border-orange-500/35';
    label = 'HIGH RISK';
  } else if (clampedScore >= 30) {
    color = 'text-amber-400';
    barColor = 'bg-amber-500';
    glowColor = 'shadow-amber-500/20';
    borderColor = 'border-amber-500/30';
    label = 'MEDIUM RISK';
  }

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <span className={`font-bold ${color}`}>{clampedScore}</span>
        <span className="text-gray-500">/100</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-xl bg-[#121622] border ${borderColor} shadow-lg ${glowColor}`}>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Risk Assessment</span>
          <span className={`text-xs font-mono font-bold ${color}`}>{label}</span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-4xl font-extrabold font-mono tracking-tight ${color}`}>
            {clampedScore}
          </span>
          <span className="text-sm font-mono text-gray-500">/ 100</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full bg-[#1b2233] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      </div>
    );
  }

  // Medium (default)
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-16 h-2 bg-[#1b2233] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      <span className={`font-mono font-bold text-xs ${color}`}>
        {clampedScore}
        <span className="text-gray-500 font-normal">/100</span>
      </span>
      {showLabel && (
        <span className="text-[10px] font-mono text-gray-400">
          ({label})
        </span>
      )}
    </div>
  );
};
