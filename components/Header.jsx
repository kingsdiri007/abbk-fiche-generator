import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Archive, LogOut, User, Moon, Sun, Languages } from 'lucide-react';
import { getCurrentUser, signOut } from '../services/supabaseService';
import { useLanguage } from '../context/LanguageContext';
import { ABBK_COLORS } from '../utils/theme';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    checkUser();
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-300"
      style={{ borderBottom: `2px solid ${ABBK_COLORS.red}` }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo-abbk.png" 
              alt="ABBK PhysicsWorks" 
              className="h-12 w-auto group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none' }} className="flex items-center gap-2">
              <div 
                className="text-2xl font-bold"
                style={{ color: ABBK_COLORS.red }}
              >
                ABBK
              </div>
              <div 
                className="text-sm font-semibold"
                style={{ color: ABBK_COLORS.black }}
              >
                PhysicsWorks
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
              <Link
                to="/"
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

              <Link
                to="/create"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  isActive('/create')
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={isActive('/create') ? { backgroundColor: ABBK_COLORS.red } : {}}
              >
                <Plus size={18} />
                <span>{t('header.create')}</span>
              </Link>

              <Link
                to="/saved"
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
            </nav>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={language === 'en' ? 'Switch to French' : 'Passer à l\'anglais'}
            >
              <Languages size={20} className="text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                {language}
              </span>
            </button>

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
                  <span>{user.email}</span>
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
        </div>
      </div>
    </header>
  );
}