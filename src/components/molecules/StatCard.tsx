// Molecule: StatCard
import React from 'react';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  color?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function StatCard({ icon, label, value, sub, color = '#C9A227', children, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border ${className}`} style={{ borderColor: '#e8d5c9' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: '#7a4430' }}>{label}</p>
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: color + '20', color }}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: '#2C1810' }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: '#9a7060' }}>{sub}</p>}
      {children}
    </div>
  );
}
