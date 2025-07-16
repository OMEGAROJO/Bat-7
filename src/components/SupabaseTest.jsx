import React, { useState, useEffect } from 'react';
import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';

/**
 * Componente para probar la conexión a Supabase
 * @param {Function} onConnectionChange - Función para notificar cambios en el estado de la conexión
 */
const SupabaseTest = ({ onConnectionChange }) => {
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('No probado');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);

  // Probar la conexión a Supabase
  const testConnection = async () => {
    setLoading(true);
    try {
      // Intentar obtener la lista de tablas directamente
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.columns')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');

      if (tablesError) throw tablesError;

      // Procesar los datos para obtener una lista única de tablas
      const uniqueTables = [...new Set(tablesData.map(item => item.table_name))];
      const formattedTables = uniqueTables.map(name => ({ name, schema: 'public' }));

      setConnectionStatus('Conectado');
      setTables(formattedTables || []);
      if (onConnectionChange) onConnectionChange(true);
      toast.success('Conexión a Supabase establecida correctamente');

      console.log('Tablas encontradas:', formattedTables);
    } catch (error) {
      console.error('Error al conectar con Supabase:', error);

      // Intentar una consulta más simple como fallback
      try {
        const { data: authData } = await supabase.auth.getSession();
        setConnectionStatus('Conectado (sin acceso a tablas)');
        if (onConnectionChange) onConnectionChange(true);
        toast.warning('Conexión establecida pero sin acceso a la información de tablas');
      } catch (authError) {
        setConnectionStatus(`Error: ${error.message || 'Desconocido'}`);
        if (onConnectionChange) onConnectionChange(false);
        toast.error(`Error al conectar con Supabase: ${error.message || 'Desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos de una tabla
  const loadTableData = async (tableName) => {
    if (!tableName) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10);

      if (error) throw error;

      setTableData(data || []);
      toast.success(`Datos de la tabla ${tableName} cargados correctamente`);
    } catch (error) {
      console.error(`Error al cargar datos de la tabla ${tableName}:`, error);
      toast.error(`Error al cargar datos: ${error.message || 'Desconocido'}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando se selecciona una tabla
  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Prueba de Conexión a Supabase</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Estado de la conexión:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            connectionStatus === 'Conectado'
              ? 'bg-green-100 text-green-800'
              : connectionStatus === 'No probado'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus}
          </span>
        </div>

        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Probando...' : 'Probar Conexión'}
        </button>
      </div>

      {tables.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar tabla:
          </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3"
            disabled={loading}
          >
            <option value="">Seleccione una tabla</option>
            {tables.map((table) => (
              <option key={table.name} value={table.name}>
                {table.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {tableData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Datos de {selectedTable}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(tableData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, valueIndex) => (
                      <td
                        key={valueIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
