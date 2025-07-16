import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaUserMd, FaBuilding, FaSpinner } from 'react-icons/fa';
import enhancedSupabaseService from '../services/enhancedSupabaseService';

/**
 * Página principal del Dashboard
 * Muestra estadísticas generales y accesos rápidos
 */
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPsychologists: 0,
    totalInstitutions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Cargar estadísticas básicas
        const [patientsResult, psychologistsResult, institutionsResult] = await Promise.all([
          enhancedSupabaseService.getPatients(),
          enhancedSupabaseService.getPsychologists(),
          enhancedSupabaseService.getInstitutions()
        ]);

        setStats({
          totalPatients: Array.isArray(patientsResult.data) ? patientsResult.data.length : 0,
          totalPsychologists: Array.isArray(psychologistsResult.data) ? psychologistsResult.data.length : 0,
          totalInstitutions: Array.isArray(institutionsResult.data) ? institutionsResult.data.length : 0,
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bienvenido al sistema de gestión psicológica
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <FaSpinner className="animate-spin text-blue-600 text-3xl" />
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Pacientes</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalPatients}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/patients" className="font-medium text-blue-600 hover:text-blue-500">
                    Ver todos los pacientes
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaUserMd className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Psicólogos</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalPsychologists}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/psychologists" className="font-medium text-blue-600 hover:text-blue-500">
                    Ver todos los psicólogos
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <FaBuilding className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Instituciones</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalInstitutions}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/institutions" className="font-medium text-blue-600 hover:text-blue-500">
                    Ver todas las instituciones
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Acciones rápidas</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="/patients/new"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center justify-center transition duration-150 ease-in-out"
              >
                <FaUsers className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">Nuevo Paciente</span>
              </a>
              
              <a
                href="/psychologists/new"
                className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex flex-col items-center justify-center transition duration-150 ease-in-out"
              >
                <FaUserMd className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">Nuevo Psicólogo</span>
              </a>
              
              <a
                href="/institutions/new"
                className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex flex-col items-center justify-center transition duration-150 ease-in-out"
              >
                <FaBuilding className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-700">Nueva Institución</span>
              </a>
              
              <a
                href="/reports"
                className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg flex flex-col items-center justify-center transition duration-150 ease-in-out"
              >
                <FaChartBar className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-yellow-700">Reportes</span>
              </a>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
