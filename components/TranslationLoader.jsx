import React from 'react';
import { Languages } from 'lucide-react';

export default function TranslationLoader({ message = 'Translating...' }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <Languages 
              size={28} 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600"
            />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {message}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Please wait while we translate the content using AI...
          </p>
          
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}