import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para mostrar la UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Podríamos enviar el error a un servicio de reporte de errores
    console.error('Error capturado por boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Intentar volver a la página principal
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Renderizar UI de fallback
      return (
        <div className="container mx-auto py-12 px-4">
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <div className="bg-red-600 text-white px-4 py-2">
              <h2 className="text-xl font-medium">Algo salió mal</h2>
            </div>
            <div className="p-4">
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <p className="text-red-700 mb-2">
                  Se ha producido un error al cargar este componente.
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-red-500 font-medium mb-2">
                    Detalles técnicos
                  </summary>
                  <div className="p-3 bg-gray-800 text-gray-200 rounded overflow-auto">
                    <p className="whitespace-pre-wrap">
                      {this.state.error?.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <p className="whitespace-pre-wrap mt-2">
                        {this.state.errorInfo.componentStack}
                      </p>
                    )}
                  </div>
                </details>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={this.handleReset} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;