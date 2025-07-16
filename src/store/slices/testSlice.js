import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTest: null,
  testResults: null,
  answeredQuestions: {},
  timeRemaining: 0,
  testStarted: false,
  testCompleted: false,
  loading: false,
  error: null,
};

export const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    // Establecer el test actual
    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
      state.answeredQuestions = {};
      state.testStarted = false;
      state.testCompleted = false;
      state.timeRemaining = action.payload?.duration ? action.payload.duration * 60 : 0;
    },
    
    // Iniciar el test
    startTest: (state) => {
      state.testStarted = true;
    },
    
    // Actualizar el tiempo restante
    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    
    // Registrar respuesta a una pregunta
    answerQuestion: (state, action) => {
      const { questionId, answerId } = action.payload;
      state.answeredQuestions[questionId] = answerId;
    },
    
    // Completar el test
    completeTest: (state) => {
      state.testCompleted = true;
    },
    
    // Establecer resultados del test
    setTestResults: (state, action) => {
      state.testResults = action.payload;
    },
    
    // Establecer estado de carga
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Establecer error
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Resetear el estado
    resetTestState: (state) => {
      return initialState;
    },
  },
});

// Exportar acciones
export const {
  setCurrentTest,
  startTest,
  updateTimeRemaining,
  answerQuestion,
  completeTest,
  setTestResults,
  setLoading,
  setError,
  resetTestState,
} = testSlice.actions;

// Exportar selectores
export const selectCurrentTest = (state) => state.test.currentTest;
export const selectTestStarted = (state) => state.test.testStarted;
export const selectTimeRemaining = (state) => state.test.timeRemaining;
export const selectAnsweredQuestions = (state) => state.test.answeredQuestions;
export const selectTestCompleted = (state) => state.test.testCompleted;
export const selectTestResults = (state) => state.test.testResults;
export const selectLoading = (state) => state.test.loading;
export const selectError = (state) => state.test.error;

// Exportar el reductor
export default testSlice.reducer;
