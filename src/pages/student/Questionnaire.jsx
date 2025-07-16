import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../../api/supabaseClient';
import { toast } from 'react-toastify';
import TestCard from './components/TestCard';
import PageHeader from '../../components/ui/PageHeader';
import { FaClipboardList } from 'react-icons/fa';

const Questionnaire = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('E'); // Nivel por defecto: Escolar

  // Cargar pacientes al montar el componente
  useEffect(() => {
    fetchPatients();
  }, []);

  // Cargar resultados cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientResults(selectedPatient.id);
    }
  }, [selectedPatient]);

  // Función para obtener pacientes de Supabase
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id,
          nombre,
          apellido,
          documento,
          email,
          telefono,
          genero,
          fecha_nacimiento
        `)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error.message);
      toast.error('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener resultados del paciente
  const fetchPatientResults = async (patientId) => {
    try {
      setLoadingResults(true);
      const { data, error } = await supabase
        .from('resultados')
        .select(`
          *,
          aptitudes:aptitud_id (
            codigo,
            nombre,
            descripcion
          )
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error al cargar resultados:', error.message);
      toast.error('Error al cargar los resultados del paciente');
    } finally {
      setLoadingResults(false);
    }
  };

  // Filtrar pacientes según el término de búsqueda
  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.documento && patient.documento.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para seleccionar un paciente
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(`${patient.nombre} ${patient.apellido}`);
  };

  // Función para limpiar la selección
  const handleClearSelection = () => {
    setSelectedPatient(null);
    setSearchTerm('');
    setResults([]);
  };

  // Calcular concentración
  const calculateConcentration = (atencionResult, errores) => {
    if (!atencionResult || atencionResult === 0) return 0;
    return ((atencionResult / (atencionResult + errores)) * 100).toFixed(2);
  };

  // Obtener resultado por código de aptitud
  const getResultByCode = (code) => {
    return results.find(result => result.aptitudes?.codigo === code);
  };

  // Configuración de niveles educativos
  const educationalLevels = {
    E: {
      code: 'E',
      name: 'Nivel E (Escolar)',
      subtitle: 'Estudiantes Básicos',
      description: 'Tests diseñados para estudiantes de educación básica y media',
      icon: 'fas fa-graduation-cap',
      color: 'green',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      textClass: 'text-green-700',
      iconBg: 'bg-green-100',
      available: true
    },
    M: {
      code: 'M',
      name: 'Nivel M (Media)',
      subtitle: 'Media Vocacional',
      description: 'Tests para estudiantes de educación media vocacional y técnica',
      icon: 'fas fa-tools',
      color: 'blue',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-700',
      iconBg: 'bg-blue-100',
      available: false
    },
    S: {
      code: 'S',
      name: 'Nivel S (Superior)',
      subtitle: 'Selección Laboral',
      description: 'Tests para selección de personal y evaluación profesional',
      icon: 'fas fa-briefcase',
      color: 'purple',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-200',
      textClass: 'text-purple-700',
      iconBg: 'bg-purple-100',
      available: false
    }
  };

  // Tests disponibles por nivel
  const testsByLevel = {
    E: [
      {
        id: 'verbal',
        title: 'Aptitud Verbal',
        description: 'Evaluación de analogías verbales y comprensión de relaciones entre conceptos',
        time: 12,
        questions: 32,
        iconClass: 'fas fa-comments',
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-600',
        buttonColor: 'blue',
        abbreviation: 'V'
      },
      {
        id: 'espacial',
        title: 'Aptitud Espacial',
        description: 'Razonamiento espacial con cubos y redes geométricas',
        time: 15,
        questions: 28,
        iconClass: 'fas fa-cube',
        bgClass: 'bg-indigo-100',
        textClass: 'text-indigo-600',
        buttonColor: 'indigo',
        abbreviation: 'E'
      },
      {
        id: 'atencion',
        title: 'Atención',
        description: 'Rapidez y precisión en la localización de símbolos específicos',
        time: 8,
        questions: 80,
        iconClass: 'fas fa-eye',
        bgClass: 'bg-red-100',
        textClass: 'text-red-600',
        buttonColor: 'red',
        abbreviation: 'A'
      },
      {
        id: 'razonamiento',
        title: 'Razonamiento',
        description: 'Continuar series lógicas de figuras y patrones',
        time: 20,
        questions: 32,
        iconClass: 'fas fa-puzzle-piece',
        bgClass: 'bg-amber-100',
        textClass: 'text-amber-600',
        buttonColor: 'amber',
        abbreviation: 'R'
      },
      {
        id: 'numerico',
        title: 'Aptitud Numérica',
        description: 'Resolución de igualdades, series numéricas y análisis de datos',
        time: 20,
        questions: 30,
        iconClass: 'fas fa-calculator',
        bgClass: 'bg-teal-100',
        textClass: 'text-teal-600',
        buttonColor: 'teal',
        abbreviation: 'N'
      },
      {
        id: 'mecanico',
        title: 'Aptitud Mecánica',
        description: 'Comprensión de principios físicos y mecánicos básicos',
        time: 12,
        questions: 28,
        iconClass: 'fas fa-cogs',
        bgClass: 'bg-slate-100',
        textClass: 'text-slate-600',
        buttonColor: 'slate',
        abbreviation: 'M'
      },
      {
        id: 'ortografia',
        title: 'Ortografía',
        description: 'Identificación de palabras con errores ortográficos',
        time: 10,
        questions: 32,
        iconClass: 'fas fa-spell-check',
        bgClass: 'bg-green-100',
        textClass: 'text-green-600',
        buttonColor: 'green',
        abbreviation: 'O'
      }
    ],
    M: [
      // Tests para nivel Media (pendientes de desarrollo)
    ],
    S: [
      // Tests para nivel Superior (pendientes de desarrollo)
    ]
  };

  return (
    <div>
      {/* Header Section with Standardized Style */}
      <PageHeader
        title="Cuestionario de Evaluación"
        subtitle="Selecciona un paciente para ver sus resultados y aplicar nuevos tests"
        icon={FaClipboardList}
      />

      <div className="container mx-auto px-4 py-8">

      {/* Selección de Nivel Educativo */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <i className="fas fa-layer-group mr-2 text-indigo-600"></i>
            Seleccionar Nivel de Evaluación
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">
            Elige el nivel educativo apropiado para la evaluación del paciente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Object.values(educationalLevels).map((level) => (
            <div
              key={level.code}
              onClick={() => level.available && setSelectedLevel(level.code)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                selectedLevel === level.code
                  ? `${level.borderClass} ${level.bgClass} shadow-lg ring-2 ring-${level.color}-300`
                  : level.available
                    ? `border-gray-200 bg-white hover:${level.bgClass} hover:${level.borderClass} shadow-md`
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
            >
              {/* Badge de disponibilidad */}
              <div className="absolute top-3 right-3">
                {level.available ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i className="fas fa-check-circle mr-1"></i>
                    Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <i className="fas fa-clock mr-1"></i>
                    En desarrollo
                  </span>
                )}
              </div>

              {/* Icono del nivel */}
              <div className={`inline-flex items-center justify-center w-16 h-16 ${level.iconBg} rounded-full mb-4`}>
                <i className={`${level.icon} text-2xl ${level.textClass}`}></i>
              </div>

              {/* Información del nivel */}
              <div className="text-center">
                <h3 className={`text-lg font-bold mb-1 ${selectedLevel === level.code ? level.textClass : 'text-gray-900'}`}>
                  📗 {level.name}
                </h3>
                <p className={`text-sm font-medium mb-2 ${selectedLevel === level.code ? level.textClass : 'text-gray-600'}`}>
                  {level.subtitle}
                </p>
                <p className={`text-sm ${selectedLevel === level.code ? level.textClass : 'text-gray-500'}`}>
                  {level.description}
                </p>
              </div>

              {/* Indicador de selección */}
              {selectedLevel === level.code && (
                <div className="absolute inset-0 rounded-xl border-2 border-transparent">
                  <div className={`absolute top-2 left-2 w-6 h-6 ${level.iconBg} rounded-full flex items-center justify-center`}>
                    <i className={`fas fa-check text-sm ${level.textClass}`}></i>
                  </div>
                </div>
              )}

              {/* Información adicional para niveles no disponibles */}
              {!level.available && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    <i className="fas fa-info-circle mr-1"></i>
                    Este nivel estará disponible próximamente
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Información del nivel seleccionado */}
        {selectedLevel && (
          <div className="mt-6 max-w-3xl mx-auto">
            <div className={`p-4 rounded-lg ${educationalLevels[selectedLevel].bgClass} ${educationalLevels[selectedLevel].borderClass} border`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 ${educationalLevels[selectedLevel].iconBg} rounded-full flex items-center justify-center mr-3`}>
                  <i className={`${educationalLevels[selectedLevel].icon} ${educationalLevels[selectedLevel].textClass}`}></i>
                </div>
                <div className="text-center">
                  <p className={`font-medium ${educationalLevels[selectedLevel].textClass}`}>
                    Nivel seleccionado: {educationalLevels[selectedLevel].name}
                  </p>
                  <p className={`text-sm ${educationalLevels[selectedLevel].textClass} opacity-80`}>
                    {testsByLevel[selectedLevel].length} tests disponibles para este nivel
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Búsqueda de Paciente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          <i className="fas fa-search mr-2 text-blue-600"></i>
          Buscar Paciente
        </h2>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          
          {selectedPatient && (
            <button
              onClick={handleClearSelection}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Lista de pacientes filtrados */}
        {searchTerm && !selectedPatient && (
          <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-4 text-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Cargando pacientes...
              </div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.nombre} {patient.apellido}
                      </p>
                      <p className="text-sm text-gray-500">
                        {patient.documento && `Doc: ${patient.documento}`}
                        {patient.email && ` • ${patient.email}`}
                      </p>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No se encontraron pacientes que coincidan con la búsqueda
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información del Paciente Seleccionado */}
      {selectedPatient && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <i className="fas fa-user-check mr-2 text-green-600"></i>
              Paciente Seleccionado
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                {selectedPatient.genero === 'masculino' ? (
                  <i className="fas fa-mars text-white text-xl"></i>
                ) : selectedPatient.genero === 'femenino' ? (
                  <i className="fas fa-venus text-white text-xl"></i>
                ) : (
                  <i className="fas fa-user text-white text-xl"></i>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <label className="block text-sm font-medium text-blue-700 mb-2">Nombre Completo</label>
                <p className="text-lg font-semibold text-gray-900">{selectedPatient.nombre} {selectedPatient.apellido}</p>
              </div>

              {selectedPatient.documento && (
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <label className="block text-sm font-medium text-green-700 mb-2">Documento</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.documento}</p>
                </div>
              )}

              {selectedPatient.email && (
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                  <label className="block text-sm font-medium text-purple-700 mb-2">Email</label>
                  <p className="text-lg font-semibold text-gray-900 truncate">{selectedPatient.email}</p>
                </div>
              )}

              {selectedPatient.genero && (
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                  <label className="block text-sm font-medium text-pink-700 mb-2">Género</label>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{selectedPatient.genero}</p>
                </div>
              )}

              {selectedPatient.fecha_nacimiento && (
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                  <label className="block text-sm font-medium text-orange-700 mb-2">Fecha de Nacimiento</label>
                  <p className="text-lg font-semibold text-gray-900">{new Date(selectedPatient.fecha_nacimiento).toLocaleDateString('es-ES')}</p>
                </div>
              )}

              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
                <label className="block text-sm font-medium text-teal-700 mb-2">Estado</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <i className="fas fa-check-circle mr-1"></i>
                  Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados del Paciente */}
      {selectedPatient && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <i className="fas fa-chart-bar mr-2 text-purple-600"></i>
              Resultados de Tests Aplicados
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-6xl mx-auto overflow-hidden">

            {loadingResults ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <i className="fas fa-spinner fa-spin text-purple-600 text-xl"></i>
                </div>
                <p className="text-gray-600 font-medium">Cargando resultados...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-6">
                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                    <div className="text-sm text-blue-700">Tests Completados</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(results.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0) / results.length)}
                    </div>
                    <div className="text-sm text-green-700">Promedio PD</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Date(Math.max(...results.map(r => new Date(r.created_at)))).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-sm text-purple-700">Último Test</div>
                  </div>
                </div>

                {/* Tabla de resultados mejorada */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <i className="fas fa-clipboard-list mr-1"></i>
                          Test
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <i className="fas fa-bullseye mr-1"></i>
                          Puntaje Directo (PD)
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <i className="fas fa-percentage mr-1"></i>
                          Percentil (PC)
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <i className="fas fa-calendar mr-1"></i>
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result, index) => (
                        <tr key={result.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mr-2 ${
                                result.aptitudes?.codigo === 'V' ? 'bg-blue-100 text-blue-800' :
                                result.aptitudes?.codigo === 'E' ? 'bg-indigo-100 text-indigo-800' :
                                result.aptitudes?.codigo === 'A' ? 'bg-red-100 text-red-800' :
                                result.aptitudes?.codigo === 'R' ? 'bg-amber-100 text-amber-800' :
                                result.aptitudes?.codigo === 'N' ? 'bg-teal-100 text-teal-800' :
                                result.aptitudes?.codigo === 'M' ? 'bg-slate-100 text-slate-800' :
                                result.aptitudes?.codigo === 'O' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {result.aptitudes?.codigo || 'N/A'}
                              </span>
                              <div className="text-sm font-medium text-gray-900">
                                {result.aptitudes?.nombre || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                              {result.puntaje_directo || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                              {result.percentil || 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                            {new Date(result.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <i className="fas fa-clipboard-check text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados registrados</h3>
                <p className="text-gray-500 mb-4">Este paciente no tiene resultados de tests registrados</p>
                <p className="text-sm text-gray-400">Aplica tests usando las opciones de abajo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tests Disponibles */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <i className="fas fa-clipboard-list mr-2 text-blue-600"></i>
            Tests Disponibles - {educationalLevels[selectedLevel].name}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">
            {educationalLevels[selectedLevel].description}
          </p>
        </div>

        {!selectedPatient && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center">
              <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
              <p className="text-yellow-800">
                Selecciona un paciente para poder aplicar los tests y guardar los resultados
              </p>
            </div>
          </div>
        )}

        {!educationalLevels[selectedLevel].available && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <i className="fas fa-tools text-orange-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Nivel en Desarrollo
              </h3>
              <p className="text-orange-700 mb-4">
                Los tests para {educationalLevels[selectedLevel].name} están actualmente en desarrollo.
              </p>
              <p className="text-sm text-orange-600">
                Por favor, selecciona el Nivel E (Escolar) que está completamente disponible.
              </p>
            </div>
          </div>
        )}

        {/* Grid de tarjetas de tests */}
        {educationalLevels[selectedLevel].available && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr max-w-7xl mx-auto">
            {testsByLevel[selectedLevel].map((test) => (
              <TestCard
                key={test.id}
                test={test}
                iconClass={test.iconClass}
                bgClass={test.bgClass}
                textClass={test.textClass}
                buttonColor={test.buttonColor}
                abbreviation={test.abbreviation}
                showButton={!!selectedPatient}
                disabled={!selectedPatient}
                patientId={selectedPatient?.id}
                level={selectedLevel}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Questionnaire;
