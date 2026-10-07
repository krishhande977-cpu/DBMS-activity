import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, onClick }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-300',
      gradient: 'from-blue-600 to-indigo-600',
      dot: 'bg-blue-500',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
      gradient: 'from-emerald-600 to-teal-600',
      dot: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300',
      gradient: 'from-amber-600 to-orange-600',
      dot: 'bg-amber-500',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-300',
      gradient: 'from-rose-600 to-pink-600',
      dot: 'bg-rose-500',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-300',
      gradient: 'from-purple-600 to-indigo-600',
      dot: 'bg-purple-500',
    },
    cyan: {
      bg: 'bg-cyan-50 text-cyan-600',
      border: 'hover:border-cyan-300',
      gradient: 'from-cyan-600 to-blue-600',
      dot: 'bg-cyan-500',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div 
      onClick={onClick}
      className={`relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</h4>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-center">
              <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot} mr-1.5`}></span>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl ${scheme.bg}`}>
          {Icon && <Icon className="w-6 h-6 stroke-[2]" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
