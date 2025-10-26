
import React from 'react';
import { useFormContext } from '../context/FormContext';

const STEPS = ['Contact', 'Intervention', 'Details', 'Preview'];

export default function ProgressBar({ totalSteps = 4 }) {
  const { currentStep } = useFormContext();

  return (
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        {STEPS.map((label, idx) => (
          <div key={idx} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep > idx + 1
                  ? 'bg-green-500 text-white'
                  : currentStep === idx + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {currentStep > idx + 1 ? '✓' : idx + 1}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
            {idx < STEPS.length - 1 && <div className="w-16 h-1 bg-gray-300 mx-4" />}
          </div>
        ))}
      </div>
    </div>
  );
}