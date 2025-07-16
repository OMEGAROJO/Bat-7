// src/routes/AppRoutes.jsx
import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Loading from '../components/common/Loading';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { FaSpinner } from 'react-icons/fa';

// Importar rutas de test
import TestRoutes from '../pages/test/testRoutes';

// Componente simple de carga para Suspense
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="text-center">
      <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4 text-4xl" />
      <p className="text-gray-600 font-medium">Cargando...</p>
    </div>
  </div>
);

// Componente para envolver lazy components con ErrorBoundary
const LazyWithErrorBoundary = (Component) => (props) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);

// Componente para cargar páginas con un loader más atractivo
const LazyPage = (Component) => (props) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  </ErrorBoundary>
);

// Lazy loading de componentes principales
const Dashboard = LazyPage(lazy(() => import('../pages/Dashboard')));
const Profile = LazyPage(lazy(() => import('../pages/Profile')));
const Settings = LazyPage(lazy(() => import('../pages/Settings')));

// Lazy loading de componentes para optimizar rendimiento
const Home = LazyPage(lazy(() => import('../pages/home/Home')));
const Help = LazyPage(lazy(() => import('../pages/help/Help')));
// Importaciones de autenticación eliminadas - autenticación desactivada
const Configuracion = LazyPage(lazy(() => import('../pages/Configuracion/Configuracion')));

// Gestión de Candidatos
const Candidates = LazyWithErrorBoundary(lazy(() => import('../pages/candidate/Candidates')));

// Páginas de landing e información
const VerbalInfo = LazyWithErrorBoundary(lazy(() => import('../pages/landing/VerbalInfo')));

// Rutas de administrador
const AdminUsers = LazyPage(lazy(() => import('../pages/admin/Users')));
const AdminInstitutions = LazyPage(lazy(() => import('../pages/admin/Institutions')));
const AdminReports = LazyPage(lazy(() => import('../pages/admin/Reports')));
const AdminPatients = LazyPage(lazy(() => import('../pages/admin/Patients')));
const AdminAdministration = LazyPage(lazy(() => import('../pages/admin/Administration')));
const AdminTestPage = LazyPage(lazy(() => import('../pages/admin/TestPage')));
const AdminCompleteReport = LazyPage(lazy(() => import('../pages/admin/CompleteReport')));
const AdminSavedReports = LazyPage(lazy(() => import('../pages/admin/SavedReports')));
const AdminViewSavedReport = LazyPage(lazy(() => import('../pages/admin/ViewSavedReport')));

// Rutas de profesional
const ProfessionalStudents = LazyPage(lazy(() => import('../pages/professional/Students')));
const ProfessionalTests = LazyPage(lazy(() => import('../pages/professional/Tests')));
const ProfessionalReports = LazyPage(lazy(() => import('../pages/professional/Reports')));
const ProfessionalPatients = LazyPage(lazy(() => import('../pages/professional/Patients')));

// Rutas de estudiante
const StudentTests = LazyPage(lazy(() => import('../pages/student/Tests')));
const StudentResults = LazyPage(lazy(() => import('../pages/student/Results')));
const StudentPatients = LazyPage(lazy(() => import('../pages/student/Patients')));
const StudentQuestionnaire = LazyPage(lazy(() => import('../pages/student/Questionnaire')));
const InformePaciente = LazyPage(lazy(() => import('../pages/student/InformePaciente')));

// Rutas de test
const TestInstructions = LazyPage(lazy(() => import('../pages/test/Instructions')));
const VerbalTest = LazyPage(lazy(() => import('../pages/test/Verbal')));
const EspacialTest = LazyPage(lazy(() => import('../pages/test/Espacial')));
const AtencionTest = LazyPage(lazy(() => import('../pages/test/Atencion')));
const RazonamientoTest = LazyPage(lazy(() => import('../pages/test/Razonamiento')));
const NumericoTest = LazyPage(lazy(() => import('../pages/test/Numerico')));
const MecanicoTest = LazyPage(lazy(() => import('../pages/test/Mecanico')));
const OrtografiaTest = LazyPage(lazy(() => import('../pages/test/Ortografia')));
const TestResults = LazyPage(lazy(() => import('../pages/test/Results')));

// Página de login básica
const BasicLogin = LazyPage(lazy(() => import('../pages/auth/BasicLogin')));

// Componentes internos para AppRoutes
const AppRoutesInternal = () => {
  const location = useLocation();

  // Efecto para redirigir al usuario - desactivado con autenticación desactivada
  useEffect(() => {
    console.log('[Routes] Autenticación desactivada - no se realizan redirecciones basadas en autenticación');
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Ruta principal - Redirige a la página de administración */}
          <Route path="/" element={<Navigate to="/admin/administration" replace />} />

          {/* Rutas públicas */}
          <Route path="/login" element={<BasicLogin />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/auth/troubleshooting" element={<Navigate to="/login" replace />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          {/* Ruta de callback eliminada - autenticación desactivada */}
          <Route path="/force-admin" element={<Navigate to="/admin/administration" replace />} />
          <Route path="/info/verbal" element={<VerbalInfo />} />

          {/* Rutas de test públicas para acceso directo */}
          <Route path="/test/instructions/:testId" element={<TestInstructions />} />
          <Route path="/test/verbal" element={<VerbalTest />} />
          <Route path="/test/espacial" element={<EspacialTest />} />
          <Route path="/test/atencion" element={<AtencionTest />} />
          <Route path="/test/razonamiento" element={<RazonamientoTest />} />
          <Route path="/test/numerico" element={<NumericoTest />} />
          <Route path="/test/mecanico" element={<MecanicoTest />} />
          <Route path="/test/ortografia" element={<OrtografiaTest />} />
          <Route path="/test/results/:applicationId" element={<TestResults />} />
          <Route path="/test/*" element={<TestRoutes />} />

          {/* Rutas principales dentro del Layout principal */}
          <Route element={<Layout />}>
            {/* Ruta del dashboard principal - Redirige a la página de administración */}
            <Route path="/dashboard" element={<Navigate to="/admin/administration" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/home" element={<Home />} />
            <Route path="/help" element={<Help />} />
            <Route path="/configuracion" element={<Configuracion />} />

            {/* Rutas de administrador */}
            <Route path="/admin">
              <Route index element={<AdminAdministration />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="institutions" element={<AdminInstitutions />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="administration" element={<AdminAdministration />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="tests" element={<AdminTestPage />} />
              <Route path="informe-completo/:patientId" element={<AdminCompleteReport />} />
              <Route path="informes-guardados" element={<AdminSavedReports />} />
              <Route path="informe-guardado/:reportId" element={<AdminViewSavedReport />} />
            </Route>

            {/* Rutas de profesional */}
            <Route path="/professional">
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<ProfessionalStudents />} />
              <Route path="tests" element={<ProfessionalTests />} />
              <Route path="reports" element={<ProfessionalReports />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="patients" element={<ProfessionalPatients />} />
            </Route>

            {/* Rutas de estudiante */}
            <Route path="/student">
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tests" element={<StudentTests />} />
              <Route path="questionnaire" element={<StudentQuestionnaire />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="informe/:pacienteId" element={<InformePaciente />} />
              <Route path="patients" element={<StudentPatients />} />
            </Route>
          </Route>

          {/* Ruta para manejar rutas no encontradas */}
          <Route path="*" element={<Navigate to="/admin/administration" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

// Componente principal que envuelve las rutas con el Router
const AppRoutes = () => {
  console.log('=== AppRoutes REAL COMPONENT RENDERED ===');

  return (
    <Router>
      <AppRoutesInternal />
    </Router>
  );
};

export default AppRoutes;
