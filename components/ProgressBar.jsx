import React from 'react';
import { useFormContext } from '../context/FormContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, Circle } from 'lucide-react';
import { ABBK_COLORS } from '../utils/theme';

const MAIN_STEPS = ['progress.contact', 'progress.intervention', 'progress.preview'];
const FORMATION_STEPS = ['progress.plan', 'progress.presence', 'progress.evaluation'];

export default function ProgressBar({ totalSteps = 4 }) {
  const { currentStep, formData } = useFormContext();
  const { t } = useLanguage();
  const isFormation = formData.interventionType === 'formation';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg mb-4 transition-colors duration-300">
      {/* Main Steps (1-3) */}
      <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
        {MAIN_STEPS.map((labelKey, idx) => {
          const stepNum = idx + 1;
          const isComplete = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          
          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
                <div 
                  className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 flex-shrink-0 ${
                    isCurrent ? 'shadow-lg scale-110 animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: isComplete 
                      ? '#10b981' 
                      : isCurrent 
                      ? ABBK_COLORS.red
                      : '#d1d5db'
                  }}
                >
                  {isComplete ? (
                    <CheckCircle size={18} className="sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <span className="text-white font-bold text-sm sm:text-lg">{stepNum}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <span 
                    className={`text-xs sm:text-sm font-semibold block ${
                      isCurrent 
                        ? 'dark:text-white' 
                        : isComplete 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    style={isCurrent ? { color: ABBK_COLORS.red } : {}}
                  >
                    {t(labelKey)}
                  </span>
                  {isCurrent && (
                    <div 
                      className="text-xs font-medium"
                      style={{ color: ABBK_COLORS.red }}
                    >
                      {t('progress.current')}
                    </div>
                  )}
                </div>
              </div>
              
              {idx < MAIN_STEPS.length - 1 && (
                <div 
                  className="flex-1 h-0.5 sm:h-1 mx-1 sm:mx-4 rounded-full transition-all duration-500 min-w-[20px]"
                  style={{
                    backgroundColor: currentStep > stepNum ? '#10b981' : '#d1d5db'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Step Labels - Show current step only on mobile */}
      <div className="sm:hidden text-center mb-2">
        <span 
          className="text-sm font-semibold"
          style={{ color: ABBK_COLORS.red }}
        >
          {t(MAIN_STEPS[currentStep - 1] || MAIN_STEPS[0])}
        </span>
      </div>

      {/* Formation Pack Steps (4-6) - Only show if formation type */}
      {isFormation && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 my-3 sm:my-4 transition-colors duration-300"></div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 sm:p-4 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: ABBK_COLORS.red }}
              >
                <span className="text-white text-xs font-bold">+</span>
              </div>
              <span 
                className="text-xs sm:text-sm font-bold"
                style={{ color: ABBK_COLORS.red }}
              >
                {t('progress.formationPack')}
              </span>
            </div>
            
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {FORMATION_STEPS.map((labelKey, idx) => {
                const stepNum = idx + 4;
                const isComplete = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;
                const isLocked = currentStep < 4;
                
                return (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-1 sm:gap-2 min-w-fit">
                      <div 
                        className={`relative flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
                          isCurrent && !isLocked ? 'shadow-md animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: isLocked
                            ? '#e5e7eb'
                            : isComplete 
                            ? '#10b981'
                            : isCurrent 
                            ? ABBK_COLORS.red
                            : '#ddd6fe',
                          opacity: isLocked ? 0.5 : 1
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle size={16} className="sm:w-5 sm:h-5 text-white" />
                        ) : isLocked ? (
                          <Circle size={16} className="sm:w-5 sm:h-5 text-gray-400" />
                        ) : (
                          <span className="text-white font-bold text-xs sm:text-sm">{stepNum}</span>
                        )}
                      </div>
                      <div className="hidden sm:block">
                        <span 
                          className={`text-xs font-medium block ${
                            isLocked 
                              ? 'text-gray-400 dark:text-gray-600'
                              : isCurrent 
                              ? 'dark:text-white' 
                              : isComplete 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-purple-500 dark:text-purple-400'
                          }`}
                          style={isCurrent && !isLocked ? { color: ABBK_COLORS.red } : {}}
                        >
                          {t(labelKey)}
                        </span>
                        {isCurrent && !isLocked && (
                          <div 
                            className="text-xs font-medium"
                            style={{ color: ABBK_COLORS.red }}
                          >
                            {t('progress.inProgress')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {idx < FORMATION_STEPS.length - 1 && (
                      <div 
                        className="flex-1 h-0.5 sm:h-1 mx-1 sm:mx-3 rounded-full transition-all duration-500 min-w-[15px]"
                        style={{
                          backgroundColor: isLocked 
                            ? '#e5e7eb'
                            : currentStep > stepNum 
                            ? '#10b981' 
                            : '#ddd6fe'
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mobile Formation Step Label */}
            {currentStep >= 4 && (
              <div className="sm:hidden text-center mt-2">
                <span 
                  className="text-xs font-medium"
                  style={{ color: ABBK_COLORS.red }}
                >
                  {t(FORMATION_STEPS[currentStep - 4])}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}