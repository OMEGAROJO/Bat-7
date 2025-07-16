import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';
import { BaremosService } from './baremosService';
import { SupabaseConversionService } from './supabaseConversionService';

/**
 * Servicio para manejar los resultados de los tests
 */
export class TestResultsService {
  
  /**
   * Mapeo de códigos de test a códigos de aptitud
   */
  static TEST_APTITUDE_MAP = {
    'verbal': 'V',
    'espacial': 'E', 
    'atencion': 'A',
    'razonamiento': 'R',
    'numerico': 'N',
    'mecanico': 'M',
    'ortografia': 'O'
  };

  /**
   * Obtener el ID de aptitud por código
   */
  static async getAptitudeId(testType) {
    try {
      const aptitudeCode = this.TEST_APTITUDE_MAP[testType];
      if (!aptitudeCode) {
        throw new Error(`Tipo de test no reconocido: ${testType}`);
      }

      const { data, error } = await supabase
        .from('aptitudes')
        .select('id')
        .eq('codigo', aptitudeCode)
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error al obtener ID de aptitud:', error);
      throw error;
    }
  }

  /**
   * Calcular concentración basada en resultados de atención
   */
  static calculateConcentration(atencionScore, errores = 0) {
    if (!atencionScore || atencionScore === 0) return 0;
    return ((atencionScore / (atencionScore + errores)) * 100);
  }

  /**
   * Guardar resultado de test en Supabase
   */
  static async saveTestResult({
    patientId,
    testType,
    correctCount,
    incorrectCount,
    unansweredCount,
    timeUsed,
    totalQuestions,
    answers = {},
    errores = 0
  }) {
    try {
      // Validar parámetros requeridos
      if (!patientId) {
        throw new Error('ID del paciente es requerido');
      }

      if (!testType) {
        throw new Error('Tipo de test es requerido');
      }

      // Obtener ID de aptitud
      const aptitudeId = await this.getAptitudeId(testType);

      // Calcular puntaje directo
      const puntajeDirecto = correctCount || 0;

      // Calcular concentración si es test de atención
      let concentracion = null;
      if (testType === 'atencion') {
        concentracion = this.calculateConcentration(puntajeDirecto, errores);
      }

      // Preparar datos para insertar
      const resultData = {
        paciente_id: patientId,
        aptitud_id: aptitudeId,
        puntaje_directo: puntajeDirecto,
        tiempo_segundos: timeUsed || 0,
        respuestas: answers,
        errores: errores,
        concentracion: concentracion,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('resultados')
        .insert([resultData])
        .select()
        .single();

      if (error) throw error;

      console.log('Resultado guardado exitosamente:', data);

      // Conversión automática PD a PC usando Supabase
      try {
        // Verificar si el resultado ya tiene percentil (conversión automática por trigger)
        if (data.percentil) {
          console.log(`Conversión automática por trigger: PD ${puntajeDirecto} → PC ${data.percentil}`);
          toast.success(`Resultado guardado y convertido automáticamente (PC: ${data.percentil})`);
          return data;
        }

        // Si no tiene percentil, intentar conversión manual
        const aptitudCodigo = this.TEST_APTITUDE_MAP[testType];
        if (aptitudCodigo && data.id) {
          console.log(`Iniciando conversión manual PD→PC para ${aptitudCodigo}...`);

          const conversionResult = await SupabaseConversionService.forzarConversionResultado(data.id);

          if (conversionResult.success) {
            console.log(`Conversión manual completada: PD ${puntajeDirecto} → PC ${conversionResult.resultado.percentil}`);
            return conversionResult.resultado;
          } else {
            console.warn('No se pudo realizar la conversión manual PD→PC');

            // Fallback a conversión local
            const resultadoConPC = await BaremosService.procesarConversionAutomatica(
              data.id,
              puntajeDirecto,
              aptitudCodigo,
              patientId
            );

            if (resultadoConPC) {
              console.log(`Conversión local completada: PD ${puntajeDirecto} → PC ${resultadoConPC.percentil}`);
              toast.success(`Resultado guardado y convertido (PC: ${resultadoConPC.percentil})`);
              return resultadoConPC;
            }
          }
        }
      } catch (conversionError) {
        console.error('Error en conversión automática:', conversionError);
        toast.warning('Resultado guardado, pero falló la conversión automática a PC');
      }

      toast.success('Resultado guardado correctamente en la base de datos');
      return data;

    } catch (error) {
      console.error('Error al guardar resultado:', error);
      toast.error(`Error al guardar resultado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener resultados de un paciente
   */
  static async getPatientResults(patientId) {
    try {
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
      return data || [];

    } catch (error) {
      console.error('Error al obtener resultados del paciente:', error);
      throw error;
    }
  }

  /**
   * Verificar si un paciente ya tiene resultado para un test específico
   */
  static async hasTestResult(patientId, testType) {
    try {
      const aptitudeId = await this.getAptitudeId(testType);
      
      const { data, error } = await supabase
        .from('resultados')
        .select('id')
        .eq('paciente_id', patientId)
        .eq('aptitud_id', aptitudeId)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;

    } catch (error) {
      console.error('Error al verificar resultado existente:', error);
      return false;
    }
  }

  /**
   * Actualizar resultado existente
   */
  static async updateTestResult(resultId, updateData) {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', resultId)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Resultado actualizado correctamente');
      return data;

    } catch (error) {
      console.error('Error al actualizar resultado:', error);
      toast.error(`Error al actualizar resultado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar resultado
   */
  static async deleteTestResult(resultId) {
    try {
      const { error } = await supabase
        .from('resultados')
        .delete()
        .eq('id', resultId);

      if (error) throw error;
      
      toast.success('Resultado eliminado correctamente');
      return true;

    } catch (error) {
      console.error('Error al eliminar resultado:', error);
      toast.error(`Error al eliminar resultado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales de un paciente
   */
  static async getPatientStats(patientId) {
    try {
      const results = await this.getPatientResults(patientId);
      
      const stats = {
        totalTests: results.length,
        averageScore: 0,
        completedTests: results.map(r => r.aptitudes?.codigo).filter(Boolean),
        lastTestDate: results.length > 0 ? results[0].created_at : null
      };

      if (results.length > 0) {
        const totalScore = results.reduce((sum, result) => sum + (result.puntaje_directo || 0), 0);
        stats.averageScore = Math.round(totalScore / results.length);
      }

      return stats;

    } catch (error) {
      console.error('Error al obtener estadísticas del paciente:', error);
      throw error;
    }
  }
}

export default TestResultsService;
