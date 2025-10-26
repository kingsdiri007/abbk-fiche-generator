import React from 'react';
import { FileText, Save, ArrowRight, X } from 'lucide-react';

export default function FormationPackModal({ onContinue, onSaveAndFinish, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Fiche Programme Generated! ✅
          </h2>
          <p className="text-gray-600">
            Your formation fiche has been created and saved.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Formation Pack Progress:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-gray-700">Fiche Programme</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">2</span>
              </div>
              <span className="text-sm text-gray-400">Fiche Plan de Formation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </div>
              <span className="text-sm text-gray-400">Fiche de Présence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">4</span>
              </div>
              <span className="text-sm text-gray-400">Fiche d'Évaluation</span>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-700 mb-6 font-medium">
          What would you like to do next?
        </p>

        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowRight size={20} />
            Continue to Fiche Plan de Formation
          </button>

          <button
            onClick={onSaveAndFinish}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
          >
            <Save size={20} />
            Save & Finish Later
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can continue this formation pack anytime from the Saved page
        </p>
      </div>
    </div>
  );
}