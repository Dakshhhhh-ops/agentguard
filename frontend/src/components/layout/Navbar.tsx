import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'Security Control Plane',
  subtitle = 'Runtime Interception & Threat Prevention',
}) => {
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-[#0a0c10] border-b border-[#1b1f27] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Title & context */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-[#f0f4f8] tracking-tight">{title}</h1>
          <p className="text-[11px] text-[#7d8795] font-normal leading-tight">{subtitle}</p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Subtle Gateway Health Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#11141b] border border-[#1f242e] text-[11px] font-mono text-[#8b949e]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[#c9d1d9] font-medium">Gateway Active</span>
          <span className="text-[#484f58]">•</span>
          <span className="text-[#8b949e]">1.2ms latency</span>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => navigate('/simulator')}
          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Live Demo Simulator</span>
        </button>
      </div>
    </header>
  );
};
