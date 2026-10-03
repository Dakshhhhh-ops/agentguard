import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Radio,
  Bot,
  FileCheck2,
  ScrollText,
  FlaskConical,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      to: '/',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      to: '/simulator',
      icon: Radio,
      label: 'Attack Simulator',
      badge: 'Live',
    },
    {
      to: '/audit',
      icon: ScrollText,
      label: 'Audit Trail',
    },
    {
      to: '/agents',
      icon: Bot,
      label: 'Protected Agents',
    },
    {
      to: '/policies',
      icon: FileCheck2,
      label: 'Security Policies',
    },
    {
      to: '/sandbox',
      icon: FlaskConical,
      label: 'Tool Sandbox',
    },
  ];

  return (
    <aside className="w-56 bg-[#0a0c10] border-r border-[#1b1f27] flex flex-col justify-between flex-shrink-0 select-none">
      <div>
        {/* Brand */}
        <div className="h-14 px-5 border-b border-[#1b1f27] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight text-white flex items-center gap-1.5">
              <span>AgentGuard</span>
              <span className="text-[10px] text-gray-500 font-mono">v1.0</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Security Gateway</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-0.5">
          <div className="px-2.5 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#161b24] text-white border border-[#232b3b]'
                      : 'text-gray-300 hover:text-white hover:bg-[#12151d]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1b1f27] bg-[#08090d]">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-gray-300 font-medium">Inline Gateway</span>
          </div>
          <span className="font-mono text-[10px] text-gray-400">1.2ms</span>
        </div>
      </div>
    </aside>
  );
};
