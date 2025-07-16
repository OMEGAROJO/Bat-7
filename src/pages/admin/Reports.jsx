import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import supabase from '../../api/supabaseClient';
import { BaremosService } from '../../services/baremosService';
import PageHeader from '../../components/ui/PageHeader';
import { FaChartBar } from 'react-icons/fa';

const Reports = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAptitude, setSelectedAptitude] = useState('');
  const [aptitudes, setAptitudes] = useState([]);
  const [expandedPatients, setExpandedPatients] = useState(new Set()); // Estado para controlar acordeón

  console.log('Reports component rendered');

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchResults();
    fetchAptitudes();
  }, []);

  // Función para obtener todas las aptitudes
  const fetchAptitudes = async () => {
    try {
      const { data, error } = await supabase
        .from('aptitudes')
        .select('*')
        .order('codigo');

      if (error) throw error;
      setAptitudes(data || []);
    } catch (error) {
      console.error('Error al cargar aptitudes:', error);
      toast.error('Error al cargar las aptitudes');
    }
  };

  // Función para obtener todos los resultados y agruparlos por paciente
  const fetchResults = async () => {
    try {
      setLoading(true);

      // Obtener todos los resultados con información de pacientes y aptitudes
      const { data: resultados, error } = await supabase
        .from('resultados')
        .select(`
          id,
          puntaje_directo,
          percentil,
          errores,
          tiempo_segundos,
          concentracion,
          created_at,
          pacientes:paciente_id (
            id,
            nombre,
            apellido,
            documento,
            genero
          ),
          aptitudes:aptitud_id (
            codigo,
            nombre,
            descripcion
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar resultados:', error);
        toast.error('Error al cargar los resultados');
        return;
      }

      // Agrupar los resultados por paciente
      const groupedByPatient = resultados.reduce((acc, resultado) => {
        const patientId = resultado.pacientes?.id;
        if (!patientId) return acc;

        if (!acc[patientId]) {
          acc[patientId] = {
            paciente: resultado.pacientes,
            resultados: [],
            fechaUltimaEvaluacion: resultado.created_at
          };
        }

        const interpretacion = resultado.percentil
          ? BaremosService.obtenerInterpretacionPC(resultado.percentil)
          : { nivel: 'Pendiente', color: 'text-gray-600', bg: 'bg-gray-100' };

        acc[patientId].resultados.push({
          id: resultado.id,
          test: resultado.aptitudes?.codigo || 'N/A',
          testName: resultado.aptitudes?.nombre || 'Test Desconocido',
          puntajePD: resultado.puntaje_directo || 0,
          puntajePC: resultado.percentil || 'N/A',
          errores: resultado.errores || 0,
          tiempo: resultado.tiempo_segundos ? `${Math.round(resultado.tiempo_segundos / 60)}:${String(resultado.tiempo_segundos % 60).padStart(2, '0')}` : 'N/A',
          concentracion: resultado.concentracion ? `${resultado.concentracion.toFixed(1)}%` : 'N/A',
          fecha: new Date(resultado.created_at).toLocaleDateString('es-ES'),
          interpretacion: interpretacion.nivel,
          interpretacionColor: interpretacion.color,
          interpretacionBg: interpretacion.bg
        });

        // Actualizar fecha más reciente
        if (new Date(resultado.created_at) > new Date(acc[patientId].fechaUltimaEvaluacion)) {
          acc[patientId].fechaUltimaEvaluacion = resultado.created_at;
        }

        return acc;
      }, {});

      // Convertir a array y ordenar por fecha más reciente
      const processedResults = Object.values(groupedByPatient).sort((a, b) =>
        new Date(b.fechaUltimaEvaluacion) - new Date(a.fechaUltimaEvaluacion)
      );

      setResults(processedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      toast.error('Error al cargar los resultados');
      setLoading(false);
    }
  };

  // Filtrar pacientes y sus resultados
  const filteredPatients = results.filter(patientGroup => {
    const paciente = patientGroup.paciente;
    const matchesSearch = !searchTerm ||
      (paciente?.nombre && paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (paciente?.apellido && paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (paciente?.documento && paciente.documento.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Si hay un filtro de aptitud, verificar si el paciente tiene al menos un resultado para esa aptitud
    if (selectedAptitude) {
      return patientGroup.resultados.some(result => result.test === selectedAptitude);
    }
    return true; // Si no hay filtro de aptitud, incluir al paciente si coincide con la búsqueda
  });

  const getTestIcon = (testCode) => {
    const icons = {
      'V': 'fas fa-comments',
      'E': 'fas fa-cube',
      'A': 'fas fa-eye',
      'R': 'fas fa-puzzle-piece',
      'N': 'fas fa-calculator',
      'M': 'fas fa-cogs',
      'O': 'fas fa-spell-check'
    };
    return icons[testCode] || 'fas fa-clipboard-list';
  };

  const getTestColor = (testCode) => {
    const colors = {
      'V': 'text-blue-600',
      'E': 'text-indigo-600',
      'A': 'text-red-600',
      'R': 'text-amber-600',
      'N': 'text-teal-600',
      'M': 'text-slate-600',
      'O': 'text-green-600'
    };
    return colors[testCode] || 'text-gray-600';
  };

  // Función para filtrar las evaluaciones de un paciente específico por aptitud seleccionada
  const getFilteredEvaluationsForPatient = (evaluations) => {
    if (!selectedAptitude) return evaluations;
    return evaluations.filter(result => result.test === selectedAptitude);
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para formatear el tiempo en minutos y segundos
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Funciones para manejar el acordeón
  const togglePatientExpansion = (patientId) => {
    const newExpanded = new Set(expandedPatients);
    if (newExpanded.has(patientId)) {
      newExpanded.delete(patientId);
    } else {
      newExpanded.add(patientId);
    }
    setExpandedPatients(newExpanded);
  };

  const expandAllPatients = () => {
    const allPatientIds = new Set(filteredPatients.map(p => p.paciente.id));
    setExpandedPatients(allPatientIds);
  };

  const collapseAllPatients = () => {
    setExpandedPatients(new Set());
  };

  // Función para obtener el color del badge según el puntaje
  const getScoreBadgeColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div>
      {/* Header Section with Standardized Style */}
      <PageHeader
        title="Resultados de Tests"
        subtitle="Visualiza todos los resultados de tests aplicados a los pacientes"
        icon={FaChartBar}
      />

      <div className="container mx-auto px-4 py-8">

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-filter mr-2 text-blue-600"></i>
            Filtros de Búsqueda
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda por paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Paciente
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre, apellido o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Filtro por aptitud */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Test
              </label>
              <select
                value={selectedAptitude}
                onChange={(e) => setSelectedAptitude(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tests</option>
                {aptitudes.map((aptitude) => (
                  <option key={aptitude.id} value={aptitude.codigo}>
                    {aptitude.codigo} - {aptitude.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.reduce((total, patient) => total + patient.resultados.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Resultados</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {results.length}
            </div>
            <div className="text-sm text-gray-600">Pacientes Evaluados</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {aptitudes.length}
            </div>
            <div className="text-sm text-gray-600">Tests Disponibles</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {results.length > 0 ?
                Math.round(
                  results.reduce((total, patient) =>
                    total + patient.resultados.reduce((sum, r) => sum + (r.puntajePD || 0), 0), 0
                  ) / results.reduce((total, patient) => total + patient.resultados.length, 0)
                ) : 0
              }
            </div>
            <div className="text-sm text-gray-600">Promedio PD</div>
          </CardBody>
        </Card>
      </div>

      {/* Resultados por Paciente */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-800">
            <i className="fas fa-chart-line mr-3 text-blue-600"></i>
            Resultados Detallados
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} con resultados
          </p>
        </div>

        {/* Controles del Acordeón */}
        {filteredPatients.length > 0 && (
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500 mr-2">
              {expandedPatients.size} de {filteredPatients.length} expandidos
            </div>
            <Button
              onClick={expandAllPatients}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <i className="fas fa-expand-arrows-alt mr-2"></i>
              Expandir Todo
            </Button>
            <Button
              onClick={collapseAllPatients}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <i className="fas fa-compress-arrows-alt mr-2"></i>
              Contraer Todo
            </Button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando resultados...</p>
        </div>
      ) : (
        <>
          {filteredPatients.length === 0 ? (
            <Card>
              <CardBody>
                <div className="py-8 text-center">
                  <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No hay resultados de tests disponibles.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Los resultados aparecerán aquí una vez que se completen los tests.
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patientGroup, index) => {
                const isExpanded = expandedPatients.has(patientGroup.paciente.id);
                const isFemale = patientGroup.paciente?.genero === 'femenino';

                // Colores dinámicos según el género
                const headerColors = isFemale
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 border-b border-pink-300'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-300';
                const borderColors = isFemale ? 'border-pink-200' : 'border-blue-200';

                return (
                  <Card key={patientGroup.paciente.id} className={`accordion-card overflow-hidden shadow-lg border ${borderColors}`}>
                    <CardHeader
                      className={`accordion-header ${headerColors} cursor-pointer`}
                      onClick={() => togglePatientExpansion(patientGroup.paciente.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {/* Botón de acordeón */}
                          <button className={`mr-3 text-white transition-colors ${isFemale ? 'hover:text-pink-100' : 'hover:text-blue-100'}`}>
                            <i className={`fas chevron-icon ${isExpanded ? 'fa-chevron-down chevron-expanded' : 'fa-chevron-right'} text-lg`}></i>
                          </button>

                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4 shadow-lg ${
                            patientGroup.paciente?.genero === 'masculino' ? 'bg-white bg-opacity-20 border-2 border-white border-opacity-30' : 'bg-white bg-opacity-20 border-2 border-white border-opacity-30'
                          }`}>
                            <i className={`fas ${patientGroup.paciente?.genero === 'masculino' ? 'fa-mars text-blue-200' : 'fa-venus text-pink-100'}`}></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {patientGroup.paciente?.nombre} {patientGroup.paciente?.apellido}
                              {isExpanded && <i className={`fas fa-eye ml-2 text-sm ${isFemale ? 'text-pink-200' : 'text-blue-200'}`}></i>}
                            </h3>
                            <p className={`text-sm ${isFemale ? 'text-pink-100' : 'text-blue-100'}`}>
                              <i className="fas fa-clipboard-check mr-1"></i>
                              {patientGroup.resultados.length} test{patientGroup.resultados.length !== 1 ? 's' : ''} completado{patientGroup.resultados.length !== 1 ? 's' : ''}
                              {!isExpanded && (
                                <span className={`ml-2 text-xs ${isFemale ? 'text-pink-200' : 'text-blue-200'}`}>
                                  • Haz clic para expandir
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`text-xs ${isFemale ? 'text-pink-100' : 'text-blue-100'}`}>Última evaluación</p>
                            <p className="text-white font-semibold text-sm">
                              {new Date(patientGroup.fechaUltimaEvaluacion).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/admin/informe-completo/${patientGroup.paciente.id}`);
                            }}
                            className="bg-white text-blue-600 hover:bg-blue-50 border border-white shadow-lg px-3 py-1.5 text-xs rounded-md inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                          >
                            <i className="fas fa-file-alt mr-2"></i>
                            Ver Informe Completo
                          </button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Vista previa compacta cuando está colapsado */}
                    {!isExpanded && (
                      <div className="px-6 py-3 bg-blue-25 border-b border-blue-100">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">
                              <i className="fas fa-chart-bar mr-1 text-blue-500"></i>
                              Promedio PC: <span className="font-semibold text-blue-600">
                                {Math.round(
                                  patientGroup.resultados.reduce((sum, r) => sum + (r.puntajePC !== 'N/A' ? r.puntajePC : 0), 0) /
                                  patientGroup.resultados.filter(r => r.puntajePC !== 'N/A').length
                                ) || 0}
                              </span>
                            </span>
                            <span className="text-gray-600">
                              <i className="fas fa-tasks mr-1 text-green-500"></i>
                              Tests: <span className="font-semibold text-green-600">
                                {patientGroup.resultados.map(r => r.test).join(', ')}
                              </span>
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 italic">
                            Haz clic para ver detalles
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contenido colapsable */}
                    <div className={`accordion-content overflow-hidden ${
                      isExpanded ? 'max-h-screen opacity-100 slide-down' : 'max-h-0 opacity-0'
                    }`}>
                      <CardBody className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-blue-50 border-b border-blue-200">
                              <tr>
                                <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                                  Test
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                                  Puntaje PD
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                                  Puntaje PC
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                                  Errores
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                                  Tiempo
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                                  Fecha Test
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {getFilteredEvaluationsForPatient(patientGroup.resultados).map((result, resultIndex) => (
                                <tr key={result.id} className={resultIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center">
                                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 ${getTestColor(result.test)}`}>
                                        <i className={getTestIcon(result.test)}></i>
                                      </div>
                                      <div className="text-left">
                                        <div className="text-sm font-medium text-gray-900">{result.test}</div>
                                        <div className="text-xs text-gray-500">{result.testName}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <span className="text-lg font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                      {result.puntajePD}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    {result.puntajePC !== 'N/A' ? (
                                      <div className="flex flex-col items-center">
                                        <span className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full mb-1">
                                          {result.puntajePC}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${result.interpretacionBg} ${result.interpretacionColor}`}>
                                          {result.interpretacion}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">Pendiente</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <span className="text-sm font-medium text-gray-700">{result.errores}</span>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <span className="text-sm font-medium text-gray-700">{result.tiempo}</span>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <span className="text-sm text-gray-500">{result.fecha}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardBody>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Reports;