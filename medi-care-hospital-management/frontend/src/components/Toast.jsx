import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    error: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-500',
    },
    info: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl border shadow-lg max-w-md animate-bounce-in bg-white border-slate-200">
      <div className={`p-2 rounded-lg mr-3 ${config.bg}`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 text-sm font-medium text-slate-800 pr-2">
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
