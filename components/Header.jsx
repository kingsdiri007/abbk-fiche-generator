import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Archive, LogOut, User } from 'lucide-react';
import { getCurrentUser, signOut } from '../services/supabaseService';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
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

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ABBK PhysicsWorks</h1>
              <p className="text-xs text-gray-500">Fiche Generator</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/')
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>

              <Link
                to="/create"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/create')
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Plus size={18} />
                <span>Create</span>
              </Link>

              <Link
                to="/saved"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/saved')
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Archive size={18} />
                <span>Saved</span>
              </Link>
            </nav>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}