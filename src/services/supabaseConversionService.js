import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';

/**
 * Servicio para manejar la conversión automática PD a PC usando funciones de Supabase
 */
export class SupabaseConversionService {

  /**
   * Ejecutar la función de recálculo de percentiles en Supabase
   */
  static async recalcularTodosLosPercentiles() {
    try {
      const { data, error } = await supabase.rpc('recalcular_todos_los_percentiles');
      
      if (error) {
        console.error('Error al recalcular percentiles:', error);
        toast.error('Error al recalcular percentiles en Supabase');
        return { success: false, error };
      }

      const resultadosActualizados = data || 0;
      console.log(`Recálculo completado: ${resultadosActualizados} resultados actualizados`);
      
      if (resultadosActualizados > 0) {
        toast.success(`Se actualizaron ${resultadosActualizados} resultados con sus percentiles`);
      } else {
        toast.info('No hay resultados pendientes de conversión');
      }

      return { success: true, count: resultadosActualizados };

    } catch (error) {
      console.error('Error en recálculo de percentiles:', error);
      toast.error('Error al ejecutar el recálculo de percentiles');
      return { success: false, error };
    }
  }

  /**
   * Probar la función de conversión PD a PC con valores específicos
   */
  static async probarConversion(puntajeDirecto, aptitudCodigo, edad) {
    try {
      const { data, error } = await supabase.rpc('convertir_pd_a_pc', {
        p_puntaje_directo: puntajeDirecto,
        p_aptitud_codigo: aptitudCodigo,
        p_edad: edad
      });

      if (error) {
        console.error('Error al probar conversión:', error);
        return { success: false, error };
      }

      console.log(`Conversión: PD ${puntajeDirecto} (${aptitudCodigo}, ${edad} años) → PC ${data}`);
      return { success: true, percentil: data };

    } catch (error) {
      console.error('Error en prueba de conversión:', error);
      return { success: false, error };
    }
  }

  /**
   * Verificar si las funciones de conversión están disponibles en Supabase
   */
  static async verificarFuncionesDisponibles() {
    try {
      // Probar con una conversión simple
      const resultado = await this.probarConversion(25, 'V', 13);
      
      if (resultado.success) {
        console.log('✅ Funciones de conversión disponibles en Supabase');
        return true;
      } else {
        console.warn('⚠️ Funciones de conversión no disponibles en Supabase');
        return false;
      }

    } catch (error) {
      console.error('❌ Error al verificar funciones de conversión:', error);
      return false;
    }
  }

  /**
   * Configurar la conversión automática para nuevos resultados
   */
  static async configurarConversionAutomatica() {
    try {
      // Verificar que las funciones estén disponibles
      const funcionesDisponibles = await this.verificarFuncionesDisponibles();
      
      if (!funcionesDisponibles) {
        toast.warning('Las funciones de conversión automática no están configuradas en Supabase');
        return false;
      }

      // Recalcular percentiles existentes
      const recalculo = await this.recalcularTodosLosPercentiles();
      
      if (recalculo.success) {
        toast.success('Conversión automática configurada correctamente');
        return true;
      } else {
        toast.error('Error al configurar la conversión automática');
        return false;
      }

    } catch (error) {
      console.error('Error al configurar conversión automática:', error);
      toast.error('Error al configurar la conversión automática');
      return false;
    }
  }

  /**
   * Obtener estadísticas de conversión
   */
  static async obtenerEstadisticasConversion() {
    try {
      // Contar resultados con y sin percentil
      const { data: conPercentil, error: error1 } = await supabase
        .from('resultados')
        .select('id', { count: 'exact' })
        .not('percentil', 'is', null);

      const { data: sinPercentil, error: error2 } = await supabase
        .from('resultados')
        .select('id', { count: 'exact' })
        .is('percentil', null);

      if (error1 || error2) {
        console.error('Error al obtener estadísticas:', error1 || error2);
        return null;
      }

      const estadisticas = {
        totalResultados: (conPercentil?.length || 0) + (sinPercentil?.length || 0),
        conPercentil: conPercentil?.length || 0,
        sinPercentil: sinPercentil?.length || 0,
        porcentajeConvertido: ((conPercentil?.length || 0) / ((conPercentil?.length || 0) + (sinPercentil?.length || 0)) * 100).toFixed(1)
      };

      return estadisticas;

    } catch (error) {
      console.error('Error al obtener estadísticas de conversión:', error);
      return null;
    }
  }

  /**
   * Forzar conversión de un resultado específico
   */
  static async forzarConversionResultado(resultadoId) {
    try {
      // Obtener el resultado específico
      const { data: resultado, error: errorGet } = await supabase
        .from('resultados')
        .select(`
          id,
          puntaje_directo,
          aptitudes:aptitud_id (codigo),
          pacientes:paciente_id (fecha_nacimiento)
        `)
        .eq('id', resultadoId)
        .single();

      if (errorGet || !resultado) {
        console.error('Error al obtener resultado:', errorGet);
        return { success: false, error: errorGet };
      }

      // Calcular edad
      const fechaNacimiento = new Date(resultado.pacientes.fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }

      // Convertir usando la función de Supabase
      const conversion = await this.probarConversion(
        resultado.puntaje_directo,
        resultado.aptitudes.codigo,
        edad
      );

      if (!conversion.success) {
        return { success: false, error: 'Error en conversión' };
      }

      // Actualizar el resultado con el percentil calculado
      const { data: actualizado, error: errorUpdate } = await supabase
        .from('resultados')
        .update({
          percentil: conversion.percentil,
          updated_at: new Date().toISOString()
        })
        .eq('id', resultadoId)
        .select()
        .single();

      if (errorUpdate) {
        console.error('Error al actualizar resultado:', errorUpdate);
        return { success: false, error: errorUpdate };
      }

      console.log(`Resultado ${resultadoId} actualizado: PD ${resultado.puntaje_directo} → PC ${conversion.percentil}`);
      toast.success(`Conversión completada: PC ${conversion.percentil}`);
      
      return { success: true, resultado: actualizado };

    } catch (error) {
      console.error('Error al forzar conversión:', error);
      return { success: false, error };
    }
  }

  /**
   * Verificar integridad de los baremos en Supabase
   */
  static async verificarBaremos() {
    try {
      const { data: baremos, error } = await supabase
        .from('baremos')
        .select('factor, baremo_grupo, count(*)')
        .group('factor, baremo_grupo');

      if (error) {
        console.error('Error al verificar baremos:', error);
        return { success: false, error };
      }

      console.log('Baremos disponibles:', baremos);
      return { success: true, baremos };

    } catch (error) {
      console.error('Error al verificar baremos:', error);
      return { success: false, error };
    }
  }
}

export default SupabaseConversionService;
