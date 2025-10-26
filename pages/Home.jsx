
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Archive, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">A</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ABBK PhysicsWorks
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Fiche Generator Platform
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CheckCircle size={16} className="text-green-500" />
            <span>Professional Document Generation System</span>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Create New Fiche Card */}
          <Link to="/create">
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Plus size={32} className="text-white" />
                </div>
                <ArrowRight size={24} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Create New Fiche
              </h2>
              <p className="text-gray-600 mb-4">
                Generate professional formation and installation documents with our guided wizard.
              </p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Formation programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>License installations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>PDF export ready</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className="text-blue-600 font-semibold group-hover:gap-2 flex items-center">
                  Get Started
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* View Saved Fiches Card */}
          <Link to="/saved">
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500 cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Archive size={32} className="text-white" />
                </div>
                <ArrowRight size={24} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Saved Fiches
              </h2>
              <p className="text-gray-600 mb-4">
                Access, download, and manage all your previously generated documents.
              </p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Search and filter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Download PDFs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Edit and regenerate</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className="text-purple-600 font-semibold group-hover:gap-2 flex items-center">
                  View Archive
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose ABBK Fiche Generator?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Professional Templates</h4>
              <p className="text-sm text-gray-600">
                Industry-standard document formats for formations and installations
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Easy to Use</h4>
              <p className="text-sm text-gray-600">
                Step-by-step wizard guides you through the entire process
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Archive size={28} className="text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Cloud Storage</h4>
              <p className="text-sm text-gray-600">
                Access your documents anywhere, anytime with secure cloud storage
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">4</div>
            <div className="text-sm text-gray-700">Simple Steps</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">2</div>
            <div className="text-sm text-gray-700">Document Types</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">PDF</div>
            <div className="text-sm text-gray-700">Export Format</div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold mb-2">Need Help?</h4>
              <p className="text-gray-300 text-sm">
                Contact our support team for assistance with document generation
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">ABBK PhysicsWorks</div>
              <div className="text-xs text-gray-500">Cyberparc Régional, Tataouine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
