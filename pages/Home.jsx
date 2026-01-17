import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Archive, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';

export default function Home() {
  const { t } = useLanguage();
  const { resetForm } = useFormContext();
  const navigate = useNavigate();

  const handleCreateNew = () => {
    resetForm();
    navigate('/create');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-16">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg"
              
            ><img src='/logo-abbk.png' alt="ABBK Logo" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
            {t('home.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2 px-4">
            {t('home.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-4">
            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
            <span className="text-center">{t('home.description')}</span>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-16">
          {/* Create New Fiche Card */}
          <div 
            onClick={handleCreateNew}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-red-500 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${ABBK_COLORS.red} 0%, ${ABBK_COLORS.darkred} 100%)` 
                }}
              >
                <Plus size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <ArrowRight 
                size={20} 
                className="text-gray-400 dark:text-gray-500 group-hover:translate-x-2 transition-all flex-shrink-0 mt-2" 
                style={{ color: ABBK_COLORS.red }}
              />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              {t('home.createTitle')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              {t('home.createDesc')}
            </p>
            
            <div className="space-y-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ABBK_COLORS.red }}
                ></div>
                <span>{t('home.createFeature1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ABBK_COLORS.red }}
                ></div>
                <span>{t('home.createFeature2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ABBK_COLORS.red }}
                ></div>
                <span>{t('home.createFeature3')}</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-700">
              <span 
                className="text-sm sm:text-base font-semibold group-hover:gap-2 flex items-center"
                style={{ color: ABBK_COLORS.red }}
              >
                {t('home.getStarted')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* View Saved Fiches Card */}
          <Link to="/saved">
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-gray-800 cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0"
                  style={{ backgroundColor: ABBK_COLORS.black }}
                >
                  <Archive size={24} className="sm:w-8 sm:h-8 text-white" />
                </div>
                <ArrowRight 
                  size={20} 
                  className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-2 transition-all flex-shrink-0 mt-2" 
                />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                {t('home.savedTitle')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                {t('home.savedDesc')}
              </p>
              
              <div className="space-y-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0"></div>
                  <span>{t('home.savedFeature1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0"></div>
                  <span>{t('home.savedFeature2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0"></div>
                  <span>{t('home.savedFeature3')}</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold group-hover:gap-2 flex items-center">
                  {t('home.viewArchive')}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Why Choose Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-12 transition-colors duration-300">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
            {t('home.whyChoose')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
                style={{ backgroundColor: `${ABBK_COLORS.red}20` }}
              >
                <FileText size={24} className="sm:w-7 sm:h-7" style={{ color: ABBK_COLORS.red }} />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{t('home.professionalTitle')}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {t('home.professionalDesc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle size={24} className="sm:w-7 sm:h-7 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{t('home.easyTitle')}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {t('home.easyDesc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield size={24} className="sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{t('home.cloudTitle')}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {t('home.cloudDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div 
            className="rounded-xl p-4 sm:p-6 text-center transition-colors duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${ABBK_COLORS.red}20 0%, ${ABBK_COLORS.red}10 100%)` 
            }}
          >
            <div 
              className="text-2xl sm:text-3xl font-bold mb-1"
              style={{ color: ABBK_COLORS.red }}
            >
              7
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('home.totalSteps')}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 sm:p-6 text-center transition-colors duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">2</div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('home.documentTypes')}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-4 sm:p-6 text-center transition-colors duration-300">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">PDF</div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('home.exportFormat')}</div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
        <div 
          className="rounded-2xl p-6 sm:p-8 text-white transition-colors duration-300"
          style={{ 
            background: `linear-gradient(135deg, ${ABBK_COLORS.black} 0%, ${ABBK_COLORS.gray} 100%)` 
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-2">{t('home.needHelp')}</h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                {t('home.helpDesc')}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm text-gray-300">ABBK PhysicsWorks</div>
              <div className="text-xs text-gray-400">Cyberparc Régional, Tataouine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}