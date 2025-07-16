import { useState, useEffect, useCallback, useRef } from 'react';
import { validateField, validateForm, sanitizeInput } from '../utils/validationSchemas';
import { debounce } from 'lodash';

/**
 * Hook personalizado para validación de formularios en tiempo real
 * Proporciona validación, sanitización y manejo de estado de formularios
 */
export const useFormValidation = (
  initialValues = {},
  validationSchema,
  options = {}
) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    sanitizeOnChange = true,
    debounceMs = 300,
    context = {},
    onSubmit,
    onValidationChange
  } = options;

  // Estados del formulario
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Referencias para debounce
  const debouncedValidateRef = useRef();
  const initialValuesRef = useRef(initialValues);

  // Crear función de validación con debounce
  useEffect(() => {
    debouncedValidateRef.current = debounce(async (fieldName, value) => {
      if (!validationSchema) return;

      try {
        const error = await validateField(validationSchema, fieldName, value, context);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error
        }));
      } catch (err) {
        console.error('Error en validación:', err);
      }
    }, debounceMs);

    return () => {
      if (debouncedValidateRef.current) {
        debouncedValidateRef.current.cancel();
      }
    };
  }, [validationSchema, context, debounceMs]);

  // Validar todo el formulario
  const validateAllFields = useCallback(async () => {
    if (!validationSchema) return {};

    try {
      const formErrors = await validateForm(validationSchema, values, context);
      setErrors(formErrors);
      return formErrors;
    } catch (err) {
      console.error('Error validando formulario:', err);
      return {};
    }
  }, [validationSchema, values, context]);

  // Verificar si el formulario es válido
  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error);
    const hasRequiredFields = validationSchema ? 
      Object.keys(validationSchema.fields).length > 0 : false;
    
    setIsValid(!hasErrors && hasRequiredFields);
    
    if (onValidationChange) {
      onValidationChange(!hasErrors, errors);
    }
  }, [errors, validationSchema, onValidationChange]);

  // Verificar si el formulario está sucio
  useEffect(() => {
    const isDirtyForm = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
    setIsDirty(isDirtyForm);
  }, [values]);

  // Manejar cambio de valor
  const handleChange = useCallback((name, value, sanitizeType = 'text') => {
    // Sanitizar valor si está habilitado
    const sanitizedValue = sanitizeOnChange ? sanitizeInput(value, sanitizeType) : value;
    
    // Actualizar valores
    setValues(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Validar en tiempo real si está habilitado
    if (validateOnChange && debouncedValidateRef.current) {
      debouncedValidateRef.current(name, sanitizedValue);
    }
  }, [validateOnChange, sanitizeOnChange]);

  // Manejar evento de cambio de input
  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Determinar tipo de sanitización basado en el nombre del campo
    let sanitizeType = 'text';
    if (name.includes('email')) sanitizeType = 'email';
    else if (name.includes('phone') || name.includes('telefono')) sanitizeType = 'phone';
    else if (name.includes('document') || name.includes('documento')) sanitizeType = 'document';
    else if (name.includes('url') || name.includes('sitio')) sanitizeType = 'url';
    else if (name.includes('name') || name.includes('nombre') || name.includes('apellido')) sanitizeType = 'name';
    
    handleChange(name, inputValue, sanitizeType);
  }, [handleChange]);

  // Manejar blur (pérdida de foco)
  const handleBlur = useCallback(async (event) => {
    const { name, value } = event.target;
    
    // Marcar campo como tocado
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar en blur si está habilitado
    if (validateOnBlur && validationSchema) {
      try {
        const error = await validateField(validationSchema, name, value, context);
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      } catch (err) {
        console.error('Error en validación onBlur:', err);
      }
    }
  }, [validateOnBlur, validationSchema, context]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    setIsSubmitting(true);

    try {
      // Validar todo el formulario
      const formErrors = await validateAllFields();
      
      // Marcar todos los campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Si hay errores, no enviar
      if (Object.values(formErrors).some(error => error)) {
        setIsSubmitting(false);
        return { success: false, errors: formErrors };
      }

      // Enviar formulario
      if (onSubmit) {
        const result = await onSubmit(values);
        setIsSubmitting(false);
        return { success: true, data: result };
      }

      setIsSubmitting(false);
      return { success: true, data: values };
    } catch (error) {
      console.error('Error enviando formulario:', error);
      setIsSubmitting(false);
      return { success: false, error: error.message };
    }
  }, [values, validateAllFields, onSubmit]);

  // Resetear formulario
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
    initialValuesRef.current = newValues;
  }, [initialValues]);

  // Establecer valores del formulario
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Establecer errores manualmente
  const setFormErrors = useCallback((newErrors) => {
    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));
  }, []);

  // Limpiar errores
  const clearErrors = useCallback((fieldNames = null) => {
    if (fieldNames) {
      const fieldsArray = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
      setErrors(prev => {
        const newErrors = { ...prev };
        fieldsArray.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  // Validar campo específico manualmente
  const validateSingleField = useCallback(async (fieldName) => {
    if (!validationSchema) return null;

    try {
      const error = await validateField(validationSchema, fieldName, values[fieldName], context);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
      return error;
    } catch (err) {
      console.error('Error validando campo:', err);
      return null;
    }
  }, [validationSchema, values, context]);

  // Obtener props para un campo específico
  const getFieldProps = useCallback((name, sanitizeType = 'text') => ({
    name,
    value: values[name] || '',
    onChange: handleInputChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : undefined,
    'data-sanitize-type': sanitizeType
  }), [values, errors, touched, handleInputChange, handleBlur]);

  // Obtener estado del campo
  const getFieldState = useCallback((name) => ({
    value: values[name],
    error: errors[name],
    touched: touched[name],
    hasError: Boolean(touched[name] && errors[name]),
    isValid: touched[name] && !errors[name]
  }), [values, errors, touched]);

  return {
    // Valores y estado
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,

    // Handlers
    handleChange,
    handleInputChange,
    handleBlur,
    handleSubmit,

    // Utilidades
    resetForm,
    setFormValues,
    setFormErrors,
    clearErrors,
    validateAllFields,
    validateSingleField,
    getFieldProps,
    getFieldState
  };
};

// Hook simplificado para validación básica
export const useSimpleValidation = (validationSchema, context = {}) => {
  const [errors, setErrors] = useState({});

  const validate = useCallback(async (values) => {
    if (!validationSchema) return {};

    try {
      const formErrors = await validateForm(validationSchema, values, context);
      setErrors(formErrors);
      return formErrors;
    } catch (err) {
      console.error('Error en validación:', err);
      return {};
    }
  }, [validationSchema, context]);

  const validateField = useCallback(async (fieldName, value) => {
    if (!validationSchema) return null;

    try {
      const error = await validateField(validationSchema, fieldName, value, context);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
      return error;
    } catch (err) {
      console.error('Error validando campo:', err);
      return null;
    }
  }, [validationSchema, context]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    hasErrors: Object.values(errors).some(error => error)
  };
};

export default useFormValidation;
