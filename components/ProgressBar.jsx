import React from 'react';
import { useFormContext } from '../context/FormContext';
import { CheckCircle, Circle } from 'lucide-react';
import { ABBK_COLORS } from '../utils/theme';

const MAIN_STEPS = ['Contact', 'Intervention', 'Details', 'Preview'];
const FORMATION_STEPS = ['Plan', 'Présence', 'Évaluation'];

export default function ProgressBar({ totalSteps = 4 }) {
  const { currentStep, formData } = useFormContext();
  const isFormation = formData.interventionType === 'formation';

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg mb-4 transition-colors duration-300">
      {/* Main Steps (1-4) */}
      <div className="flex items-center justify-between mb-4">
        {MAIN_STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isComplete = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          
          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-3">
                <div 
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    isComplete 
                      ? 'shadow-lg scale-110' 
                      : isCurrent 
                      ? 'shadow-lg scale-110 animate-pulse' 
                      : ''
                  }`}
                  style={{
                    backgroundColor: isComplete 
                      ? '#10b981' // Green for completed
                      : isCurrent 
                      ? ABBK_COLORS.red // ABBK Red for current
                      : '#d1d5db' // Gray for inactive
                  }}
                >
                  {isComplete ? (
                    <CheckCircle size={24} className="text-white" />
                  ) : (
                    <span className="text-white font-bold text-lg">{stepNum}</span>
                  )}
                </div>
                <div>
                  <span 
                    className={`text-sm font-semibold ${
                      isCurrent 
                        ? 'dark:text-white' 
                        : isComplete 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    style={isCurrent ? { color: ABBK_COLORS.red } : {}}
                  >
                    {label}
                  </span>
                  {isCurrent && (
                    <div className="text-xs font-medium dark:text-gray-300" style={{ color: ABBK_COLORS.red }}>
                      Current
                    </div>
                  )}
                </div>
              </div>
              
              {idx < MAIN_STEPS.length - 1 && (
                <div 
                  className="flex-1 h-1 mx-4 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: currentStep > stepNum ? '#10b981' : '#d1d5db'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Formation Pack Steps (5-7) - Only show if formation type */}
      {isFormation && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-600 my-4 transition-colors duration-300"></div>
          <div className="bg-red-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: ABBK_COLORS.red }}
              >
                <span className="text-white text-xs font-bold">+</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white" style={{ color: ABBK_COLORS.red }}>
                Formation Pack (Optional)
              </span>
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
                      <div 
                        className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                          isLocked
                            ? 'opacity-50'
                            : isComplete 
                            ? 'shadow-md' 
                            : isCurrent 
                            ? 'shadow-md animate-pulse' 
                            : ''
                        }`}
                        style={{
                          backgroundColor: isLocked
                            ? '#e5e7eb'
                            : isComplete 
                            ? '#10b981' // Green for completed
                            : isCurrent 
                            ? ABBK_COLORS.darkred // Dark red for current
                            : '#fecaca' // Light red for inactive
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle size={20} className="text-white" />
                        ) : isLocked ? (
                          <Circle size={20} className="text-gray-400" />
                        ) : (
                          <span className="text-white font-bold text-sm">{stepNum}</span>
                        )}
                      </div>
                      <div>
                        <span 
                          className={`text-xs font-medium ${
                            isLocked 
                              ? 'text-gray-400 dark:text-gray-500'
                              : isCurrent 
                              ? 'dark:text-white' 
                              : isComplete 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'dark:text-gray-300'
                          }`}
                          style={!isLocked && isCurrent ? { color: ABBK_COLORS.darkred } : {}}
                        >
                          {label}
                        </span>
                        {isCurrent && (
                          <div 
                            className="text-xs font-medium dark:text-gray-300"
                            style={{ color: ABBK_COLORS.darkred }}
                          >
                            In Progress
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {idx < FORMATION_STEPS.length - 1 && (
                      <div 
                        className="flex-1 h-1 mx-3 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: isLocked 
                            ? '#e5e7eb'
                            : currentStep > stepNum 
                            ? '#10b981' 
                            : '#fecaca'
                        }}
                      />
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