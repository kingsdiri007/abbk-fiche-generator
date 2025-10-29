import React from 'react';
import { useFormContext } from '../context/FormContext';
import { CheckCircle, Circle } from 'lucide-react';

const MAIN_STEPS = ['Contact', 'Intervention', 'Details', 'Preview'];
const FORMATION_STEPS = ['Plan', 'Présence', 'Évaluation'];

export default function ProgressBar({ totalSteps = 4 }) {
  const { currentStep, formData } = useFormContext();
  const isFormation = formData.interventionType === 'formation';
  const inFormationPack = currentStep > 4;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 bg-white shadow-sm rounded-lg mb-4">
      {/* Main Steps (1-4) */}
      <div className="flex items-center justify-between mb-4">
        {MAIN_STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isComplete = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          
          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-3">
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  isComplete 
                    ? 'bg-green-500 shadow-lg scale-110' 
                    : isCurrent 
                    ? 'bg-blue-600 shadow-lg scale-110 animate-pulse' 
                    : 'bg-gray-300'
                }`}>
                  {isComplete ? (
                    <CheckCircle size={24} className="text-white" />
                  ) : (
                    <span className="text-white font-bold text-lg">{stepNum}</span>
                  )}
                </div>
                <div>
                  <span className={`text-sm font-semibold ${
                    isCurrent ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                  {isCurrent && (
                    <div className="text-xs text-blue-500 font-medium">Current</div>
                  )}
                </div>
              </div>
              
              {idx < MAIN_STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                  currentStep > stepNum ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Formation Pack Steps (5-7) - Only show if formation type */}
      {isFormation && (
        <>
          <div className="border-t border-gray-200 my-4"></div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
              <span className="text-sm font-bold text-purple-700">Formation Pack (Optional)</span>
            </div>
            
            <div className="flex items-center justify-between">
              {FORMATION_STEPS.map((label, idx) => {
                const stepNum = idx + 5;
                const isComplete = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;
                const isLocked = currentStep < 5;
                
                return (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-2">
                      <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                        isLocked
                          ? 'bg-gray-200 opacity-50'
                          : isComplete 
                          ? 'bg-green-500 shadow-md' 
                          : isCurrent 
                          ? 'bg-purple-600 shadow-md animate-pulse' 
                          : 'bg-purple-200'
                      }`}>
                        {isComplete ? (
                          <CheckCircle size={20} className="text-white" />
                        ) : isLocked ? (
                          <Circle size={20} className="text-gray-400" />
                        ) : (
                          <span className="text-white font-bold text-sm">{stepNum}</span>
                        )}
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${
                          isLocked 
                            ? 'text-gray-400'
                            : isCurrent 
                            ? 'text-purple-600' 
                            : isComplete 
                            ? 'text-green-600' 
                            : 'text-purple-500'
                        }`}>
                          {label}
                        </span>
                        {isCurrent && (
                          <div className="text-xs text-purple-500 font-medium">In Progress</div>
                        )}
                      </div>
                    </div>
                    
                    {idx < FORMATION_STEPS.length - 1 && (
                      <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${
                        isLocked 
                          ? 'bg-gray-200'
                          : currentStep > stepNum 
                          ? 'bg-green-500' 
                          : 'bg-purple-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}