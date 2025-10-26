
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorList({ errors }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-600 mt-0.5" size={20} />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-900 mb-2">
            Please fix the following errors:
          </h4>
          <ul className="space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
