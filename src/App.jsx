
import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/tailwind.css'; // Estilos de Tailwind
import './styles/global.css'; // Estilos globales adicionales

// Importar rutas principales
import AppRoutes from './routes/AppRoutes';

/**
 * Componente principal de la aplicación
 * Configura el enrutamiento, notificaciones y tema
 */
function App() {
  // Configuración del tema
  useEffect(() => {
    // Aplicar tema guardado al cargar
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
    }

    // Escuchar cambios en preferencias del sistema
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e) => {
      const theme = localStorage.getItem('userTheme');
      if (theme === 'system') {
        if (e.matches) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    };

    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);

    // Limpiar listener al desmontar
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  return (
    <div className="app">
      {/* Contenedor principal de notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Rutas de la aplicación */}
      <AppRoutes />
    </div>
  );
}

export default App;

