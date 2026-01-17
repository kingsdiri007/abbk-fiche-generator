import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FormProvider, useFormContext } from './context/FormContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import NavigationButtons from './components/NavigationButtons';
import Toast from './components/Toast';
import TranslationLoader from './components/TranslationLoader'; // ADD THIS
import Home from './pages/Home';
import SavedFiches from './pages/SavedFiches';
import Login from './pages/Login';
import Step5PlanFormation from './pages/Step5PlanFormation';
import Step6Presence from './pages/Step6Presence';
import Step7Evaluation from './pages/Step7Evaluation';
import Dashboard from './pages/Dashboard';
import Step1AudienceContact from './pages/Step1AudienceContact';
import Step2InterventionType from './pages/Step2InterventionType';
import Step4Preview from './pages/Step4Preview';
import Register from './pages/Register';
import AdminFormations from './pages/AdminFormations';
import AdminClients from './pages/AdminClients';
import AdminIntervenants from './pages/AdminIntervenants';
import AdminStudents from './pages/AdminStudents';
import AdminLicenses from './pages/AdminLicenses';

function CreateFiche() {
  const { currentStep } = useFormContext();

  return (
    <>
      <ProgressBar totalSteps={3} />
      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        {currentStep === 1 && <Step1AudienceContact />}
        {currentStep === 2 && <Step2InterventionType />}
        {currentStep === 3 && <Step4Preview />}
        {currentStep === 4 && <Step5PlanFormation />}
        {currentStep === 5 && <Step6Presence />}
        {currentStep === 6 && <Step7Evaluation />}
      </main>
      
      {/* Fixed Navigation at Bottom */}
      <NavigationButtons totalSteps={3} />
    </>
  );
}

function AppContent() {
  const { toast, hideToast, isTranslatingForm } = useFormContext(); // ADD isTranslatingForm HERE

  return (
    <>
      <Routes>
        {/* Login Route - No Header */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - With Header */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateFiche />} />
                <Route path="/saved" element={<SavedFiches />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/register" element={<Register />} />
                <Route path="/formations" element={<AdminFormations />} />
                <Route path="/clients" element={<AdminClients />} />
                <Route path="/intervenants" element={<AdminIntervenants />} />
                <Route path="/students" element={<AdminStudents />} />
                <Route path="/licenses" element={<AdminLicenses />} />
              </Routes>
            </div>
          }
        />
      </Routes>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Translation Loader - ADD THIS */}
      {isTranslatingForm && (
        <TranslationLoader message="Translating form content..." />
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <FormProvider>
          <AppContent />
        </FormProvider>
      </LanguageProvider>
    </Router>
  );
}