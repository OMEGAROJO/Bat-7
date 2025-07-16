import React from 'react';

/**
 * Componente de encabezado de página estandarizado para BAT-7
 * Aplica el estilo consistente con fondo azul oscuro #121940
 */
const PageHeader = ({
  title,
  subtitle,
  icon: IconComponent,
  className = "",
  showTransitions = true
}) => {
  return (
    <div className={`animated-gradient text-white relative overflow-hidden page-header-effect ${className}`}>
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-cyan-500/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-indigo-500/20 via-pink-500/20 to-blue-500/30 banner-glow"></div>
      </div>

      {/* Efecto de ondas */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 banner-shimmer"></div>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-4 left-10 w-1 h-1 bg-yellow-300 rounded-full floating-particle animate-ping"></div>
        <div className="absolute top-8 right-20 w-2 h-2 bg-cyan-300 rounded-full floating-particle animate-pulse"></div>
        <div className="absolute bottom-6 left-1/4 w-1 h-1 bg-pink-300 rounded-full floating-particle animate-bounce"></div>
        <div className="absolute bottom-4 right-1/3 w-2 h-2 bg-green-300 rounded-full floating-particle animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="text-center">
          <div className={`flex items-center justify-center mb-3 ${
            showTransitions ? 'transition-all duration-300 ease-in-out hover:scale-105' : ''
          }`}>
            {IconComponent && (
              <div className={`w-12 h-12 bg-[#f59e0b] rounded-full flex items-center justify-center mr-4 shadow-lg yellow-icon-glow ${
                showTransitions ? 'transition-all duration-300 ease-in-out hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/25 hover:scale-110 button-glow' : ''
              }`}>
                <IconComponent className="text-white text-xl" />
              </div>
            )}
            <h1 className={`text-3xl font-bold text-glow ${
              showTransitions ? 'transition-all duration-300 ease-in-out hover:text-yellow-200 hover:scale-105' : ''
            }`}>
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className={`text-blue-100 text-lg ${
              showTransitions ? 'transition-all duration-300 ease-in-out hover:text-white' : ''
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Efecto de brillo inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
    </div>
  );
};

export default PageHeader;
