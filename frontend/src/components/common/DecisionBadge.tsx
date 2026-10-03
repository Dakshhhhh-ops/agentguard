import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { Decision } from '../../types';

interface DecisionBadgeProps {
  decision: Decision | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({
  decision,
  size = 'md',
  showIcon = true,
}) => {
  const isBlock = decision === 'BLOCK';
  const isAllow = decision === 'ALLOW';
  const isReview = decision === 'REVIEW';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wider',
  }[size];

  if (isBlock) {
    return (
      <span
        className={`inline-flex items-center rounded-md font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20 ${sizeClasses}`}
      >
        {showIcon && <ShieldAlert className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
        <span>BLOCKED</span>
      </span>
    );
  }

  if (isAllow) {
    return (
      <span
        className={`inline-flex items-center rounded-md font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
      >
        {showIcon && <ShieldCheck className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
        <span>ALLOWED</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
    >
      {showIcon && <AlertTriangle className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{decision || 'REVIEW'}</span>
    </span>
  );
};
