
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-600" size={24} />,
    error: <XCircle className="text-red-600" size={24} />,
    warning: <AlertCircle className="text-yellow-600" size={24} />,
    info: <AlertCircle className="text-blue-600" size={24} />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`fixed top-24 right-6 z-50 max-w-md animate-fade-in`}>
      <div className={`${bgColors[type]} border-2 rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        {icons[type]}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}