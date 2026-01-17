import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Plus, Archive, LogOut, BookOpen, User, Moon, Sun, Languages, Menu, X, 
  Shield, ChevronDown, BarChart3, UserPlus, CheckCircle,
  Building2, UserCheck, Key, GraduationCap // ADD THESE
} from 'lucide-react';
import { getCurrentUser, signOut } from '../services/supabaseService';
import { useLanguage } from '../context/LanguageContext';
import { useFormContext } from '../context/FormContext';
import { useRole } from '../hooks/useRole';
import { ABBK_COLORS } from '../utils/theme';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const { resetForm, translateForm, isTranslatingForm } = useFormContext(); // ADD translateForm and isTranslatingForm
  const { isAdmin, loading: roleLoading } = useRole();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false); // ADD THIS

  useEffect(() => {
    checkUser();
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownOpen && !event.target.closest('.admin-dropdown')) {
        setAdminDropdownOpen(false);
      }
      if (languageDropdownOpen && !event.target.closest('.language-dropdown')) { // ADD THIS
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [adminDropdownOpen, languageDropdownOpen]); // UPDATE THIS

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/login');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCreateClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/create') {
      resetForm();
    }
    navigate('/create');
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleAdminNavigation = (path) => {
    navigate(path);
    setAdminDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // ADD THIS NEW FUNCTION
  const handleLanguageChange = async (newLang) => {
    if (language === newLang || isTranslatingForm) return;
    
    toggleLanguage(); // This will switch the language in context
    
    // If on create page, translate form data
    if (location.pathname === '/create') {
      await translateForm(newLang);
    }
    
    setLanguageDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const isAdminRoute = location.pathname === '/dashboard' || location.pathname === '/register';

  return (
    <header 
      className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-300"
      style={{ borderBottom: `2px solid ${ABBK_COLORS.red}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group" onClick={handleNavClick}>
            <img 
              src="/logo-abbk.png" 
              alt="ABBK PhysicsWorks" 
              className="h-10 sm:h-12 w-auto group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none' }} className="flex items-center gap-2">
              <div 
                className="text-xl sm:text-2xl font-bold"
                style={{ color: ABBK_COLORS.red }}
              >
                ABBK
              </div>
              <div 
                className="text-xs sm:text-sm font-semibold hidden sm:block"
                style={{ color: ABBK_COLORS.black }}
              >
                PhysicsWorks
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                onClick={handleNavClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  isActive('/')
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={isActive('/') ? { backgroundColor: ABBK_COLORS.red } : {}}
              >
                <Home size={18} />
                <span>{t('header.home')}</span>
              </Link>

              <button
                onClick={handleCreateClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  isActive('/create')
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={isActive('/create') ? { backgroundColor: ABBK_COLORS.red } : {}}
              >
                <Plus size={18} />
                <span>{t('header.create')}</span>
              </button>

              <Link
                to="/saved"
                onClick={handleNavClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  isActive('/saved')
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={isActive('/saved') ? { backgroundColor: ABBK_COLORS.red } : {}}
              >
                <Archive size={18} />
                <span>{t('header.saved')}</span>
              </Link>

              {/* Admin Dropdown - Only visible to admins */}
              {!roleLoading && isAdmin && (
                <div className="relative admin-dropdown">
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                      isAdminRoute
                        ? 'text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={isAdminRoute ? { backgroundColor: ABBK_COLORS.red } : {}}
                  >
                    <Shield size={18} />
                    <span>Admin</span>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {adminDropdownOpen && (
  <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
    <button
      onClick={() => handleAdminNavigation('/dashboard')}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <BarChart3 size={18} className="text-gray-600 dark:text-gray-400" />
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Dashboard
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          View packs overview
        </div>
      </div>
    </button>

    <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>

    <button
      onClick={() => handleAdminNavigation('/formations')}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <BookOpen size={18} className="text-gray-600 dark:text-gray-400" />
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Formations
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Manage formation templates
        </div>
      </div>
    </button>

    <button
      onClick={() => handleAdminNavigation('/clients')}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <Building2 size={18} className="text-gray-600 dark:text-gray-400" />
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Clients
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Manage client information
        </div>
      </div>
    </button>

    <button
      onClick={() => handleAdminNavigation('/intervenants')}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <UserCheck size={18} className="text-gray-600 dark:text-gray-400" />
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Intervenants
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Manage trainers & instructors
        </div>
      </div>
    </button>

    <button
      onClick={() => handleAdminNavigation('/licenses')}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <Key size={18} className="text-gray-600 dark:text-gray-400" />
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Licenses
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Manage license types
        </div>
      </div>
    </button>

    <button
      onClick={() => handleAdminNavigation('/students')}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <GraduationCap size={18} className="text-gray-600 dark:text-gray-400" />
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Students
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Manage student records
        </div>
      </div>
    </button>

    <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>

    <button
      onClick={() => handleAdminNavigation('/register')}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <UserPlus size={18} className="text-gray-600 dark:text-gray-400" />
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Register User
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Create new accounts
        </div>
      </div>
    </button>
  </div>
)}
                </div>
              )}
            </nav>

            {/* REPLACE THIS ENTIRE SECTION - Language Toggle with Dropdown */}
            <div className="relative language-dropdown">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                disabled={isTranslatingForm}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  isTranslatingForm ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={language === 'en' ? 'Switch to French' : 'Passer à l\'anglais'}
              >
                <Languages size={20} className="text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {language}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-600 dark:text-gray-300 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Language Dropdown */}
              {languageDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Select Language
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleLanguageChange('en')}
                    disabled={isTranslatingForm || language === 'en'}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
                      language === 'en' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${isTranslatingForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🇬🇧</span>
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        language === 'en' 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        English
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Switch to English
                      </div>
                    </div>
                    {language === 'en' && (
                      <CheckCircle size={18} className="text-blue-600 dark:text-blue-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleLanguageChange('fr')}
                    disabled={isTranslatingForm || language === 'fr'}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
                      language === 'fr' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${isTranslatingForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🇫🇷</span>
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        language === 'fr' 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        Français
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Passer au français
                      </div>
                    </div>
                    {language === 'fr' && (
                      <CheckCircle size={18} className="text-blue-600 dark:text-blue-400" />
                    )}
                  </button>

                  {isTranslatingForm && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        <span>Translating form content...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div 
                className="flex items-center gap-3 pl-4"
                style={{ borderLeft: `2px solid ${ABBK_COLORS.red}` }}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <User size={16} />
                  <span className="max-w-[150px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition hover:bg-red-50 dark:hover:bg-red-900"
                  style={{ color: ABBK_COLORS.red }}
                >
                  <LogOut size={16} />
                  {t('header.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-white rounded-lg transition shadow-md hover:shadow-lg"
                style={{ backgroundColor: ABBK_COLORS.red }}
                onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
                onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
              >
                {t('header.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Dark Mode & Language Toggles */}
            
{/* Language Toggle with Dropdown */}
<div className="relative">
  <button
    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
  >
    <Languages size={20} className="text-gray-600 dark:text-gray-300" />
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
      {language}
    </span>
    <ChevronDown 
      size={16} 
      className={`transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`}
    />
  </button>

  {/* Language Dropdown */}
  {languageDropdownOpen && (
    <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          Select Language
        </p>
      </div>
      
      <button
        onClick={async () => {
          if (language !== 'en') {
            toggleLanguage();
            // Translate form data if on create page
            if (location.pathname === '/create') {
              await translateForm('en');
            }
          }
          setLanguageDropdownOpen(false);
        }}
        disabled={isTranslatingForm}
        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
          language === 'en' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        } ${isTranslatingForm ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🇬🇧</span>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-medium ${
            language === 'en' 
              ? 'text-blue-700 dark:text-blue-300' 
              : 'text-gray-900 dark:text-white'
          }`}>
            English
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Switch to English
          </div>
        </div>
        {language === 'en' && (
          <CheckCircle size={18} className="text-blue-600 dark:text-blue-400" />
        )}
      </button>

      <button
        onClick={async () => {
          if (language !== 'fr') {
            toggleLanguage();
            // Translate form data if on create page
            if (location.pathname === '/create') {
              await translateForm('fr');
            }
          }
          setLanguageDropdownOpen(false);
        }}
        disabled={isTranslatingForm}
        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
          language === 'fr' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        } ${isTranslatingForm ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🇫🇷</span>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-medium ${
            language === 'fr' 
              ? 'text-blue-700 dark:text-blue-300' 
              : 'text-gray-900 dark:text-white'
          }`}>
            Français
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Passer au français
          </div>
        </div>
        {language === 'fr' && (
          <CheckCircle size={18} className="text-blue-600 dark:text-blue-400" />
        )}
      </button>

      {isTranslatingForm && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span>Translating form content...</span>
          </div>
        </div>
      )}
    </div>
  )}
</div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun size={18} className="text-yellow-500" />
              ) : (
                <Moon size={18} className="text-gray-600" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu size={24} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive('/')
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={isActive('/') ? { backgroundColor: ABBK_COLORS.red } : {}}
              >
                <Home size={20} />
                <span>{t('header.home')}</span>
              </Link>

              <button
                onClick={handleCreateClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-left ${
                  isActive('/create')
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={isActive('/create') ? { backgroundColor: ABBK_COLORS.red } : {}}
              >
                <Plus size={20} />
                <span>{t('header.create')}</span>
              </button>

              <Link
                to="/saved"
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive('/saved')
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={isActive('/saved') ? { backgroundColor: ABBK_COLORS.red } : {}}
              >
                <Archive size={20} />
                <span>{t('header.saved')}</span>
              </Link>

            
{/* Mobile Admin Section */}
{!roleLoading && isAdmin && (
  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
      <Shield size={14} />
      ADMIN PANEL
    </div>
    
    <Link
      to="/dashboard"
      onClick={handleNavClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        isActive('/dashboard')
          ? 'text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={isActive('/dashboard') ? { backgroundColor: ABBK_COLORS.red } : {}}
    >
      <BarChart3 size={20} />
      <span>Dashboard</span>
    </Link>

    <Link
      to="/formations"
      onClick={handleNavClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        isActive('/formations')
          ? 'text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={isActive('/formations') ? { backgroundColor: ABBK_COLORS.red } : {}}
    >
      <BookOpen size={20} />
      <span>Formations</span>
    </Link>

    <Link
      to="/clients"
      onClick={handleNavClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        isActive('/clients')
          ? 'text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={isActive('/clients') ? { backgroundColor: ABBK_COLORS.red } : {}}
    >
      <Building2 size={20} />
      <span>Clients</span>
    </Link>

    <Link
      to="/intervenants"
      onClick={handleNavClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        isActive('/intervenants')
          ? 'text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={isActive('/intervenants') ? { backgroundColor: ABBK_COLORS.red } : {}}
    >
      <UserCheck size={20} />
      <span>Intervenants</span>
    </Link>

    <Link
      to="/licenses"
      onClick={handleNavClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        isActive('/licenses')
          ? 'text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={isActive('/licenses') ? { backgroundColor: ABBK_COLORS.red } : {}}
    >
      <Key size={20} />
      <span>Licenses</span>
    </Link>

    <Link
      to="/students"
      onClick={handleNavClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        isActive('/students')
          ? 'text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={isActive('/students') ? { backgroundColor: ABBK_COLORS.red } : {}}
    >
      <GraduationCap size={20} />
      <span>Students</span>
    </Link>

    <Link
      to="/register"
      onClick={handleNavClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
        isActive('/register')
          ? 'text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={isActive('/register') ? { backgroundColor: ABBK_COLORS.red } : {}}
    >
      <UserPlus size={20} />
      <span>Register User</span>
    </Link>
  </div>
)}
            </nav>

            {/* Mobile User Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-4 text-sm text-gray-600 dark:text-gray-300">
                    <User size={18} />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition"
                    style={{ 
                      backgroundColor: `${ABBK_COLORS.red}20`,
                      color: ABBK_COLORS.red
                    }}
                  >
                    <LogOut size={18} />
                    {t('header.logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="block w-full text-center px-4 py-3 text-white rounded-lg transition shadow-md"
                  style={{ backgroundColor: ABBK_COLORS.red }}
                >
                  {t('header.login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}