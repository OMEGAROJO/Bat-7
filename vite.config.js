import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  // Configuración base condicional: solo para producción en GitHub Pages
  base: command === 'build' ? '/Bat-7/' : '/',
  plugins: [react()],

  // Optimizaciones de build
  build: {
    // Configuración de chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-icons', 'react-toastify'],
          'utils-vendor': ['lodash', 'yup'],

          // Feature chunks
          'auth': [
            './src/context/AuthContext.jsx',
            './src/components/auth/LoginForm.jsx',
            './src/hoc/withRoleProtection.jsx'
          ],
          'questionnaire': [
            './src/pages/questionnaire/QuestionnaireList.jsx',
            './src/pages/questionnaire/QuestionnaireForm.jsx',
            './src/pages/questionnaire/QuestionnaireResults.jsx'
          ],
          'reports': [
            './src/pages/reports/SavedReports.jsx',
            './src/pages/reports/ReportViewer.jsx',
            './src/pages/reports/ReportExporter.jsx'
          ],
          'admin': [
            './src/pages/admin/Administration.jsx',
            './src/pages/admin/Candidates.jsx',
            './src/pages/admin/Institutions.jsx',
            './src/pages/admin/Psychologists.jsx'
          ]
        }
      }
    },

    // Configuración de minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    // Configuración de sourcemaps
    sourcemap: false,

    // Configuración de assets
    assetsInlineLimit: 4096,

    // Configuración de CSS
    cssCodeSplit: true,

    // Target para compatibilidad
    target: 'es2015'
  },

  // Optimizaciones de desarrollo
  server: {
    port: 3010,
    host: true,
    strictPort: false,
    hmr: {
      port: 3010,
      overlay: false,
      clientPort: 3010
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@context': path.resolve(__dirname, './src/context'),
      '@assets': path.resolve(__dirname, './src/assets')
    },
  },

  // Optimizaciones de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-icons/fa',
      'react-toastify',
      'lodash',
      'yup'
    ],
    exclude: ['@testing-library/react']
  },

  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
}));
