import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider, useFormContext } from './context/FormContext';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import NavigationButtons from './components/NavigationButtons';
import Toast from './components/Toast';
import Home from './pages/Home';
import SavedFiches from './pages/SavedFiches';
import Login from './pages/Login';
import Step5PlanFormation from './pages/Step5PlanFormation';
import Step6Presence from './pages/Step6Presence';
import Step7Evaluation from './pages/Step7Evaluation';

import Step1AudienceContact from './pages/Step1AudienceContact';
import Step2InterventionType from './pages/Step2InterventionType';
import Step3CommonDetails from './pages/Step3CommonDetails';
import Step4Preview from './pages/Step4Preview';

function CreateFiche() {
  const { currentStep } = useFormContext();

  return (
    <>
      <ProgressBar totalSteps={4} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentStep === 1 && <Step1AudienceContact />}
        {currentStep === 2 && <Step2InterventionType />}
        {currentStep === 3 && <Step3CommonDetails />}
        {currentStep === 4 && <Step4Preview />}
        {currentStep === 5 && <Step5PlanFormation />}
        {currentStep === 6 && <Step6Presence />}
        {currentStep === 7 && <Step7Evaluation />}

        <NavigationButtons totalSteps={4} />
      </main>
    </>
  );
}

function AppContent() {
  const { toast, hideToast } = useFormContext();

  return (
    <>
      <Routes>
        {/* Login Route - No Header */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - With Header */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateFiche />} />
                <Route path="/saved" element={<SavedFiches />} />
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
    </>
  );
}

export default function App() {
  return (
    <Router>
      <FormProvider>
        <AppContent />
      </FormProvider>
    </Router>
  );
}