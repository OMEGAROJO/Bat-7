import React from 'react';

/**
 * Componente de título animado para BAT-7
 * Incluye efectos visuales y animaciones
 */
const AnimatedTitle = ({ className = "" }) => {
  return (
    <div className={`animated-title-container ${className}`}>
      <div className="relative inline-flex items-center">
        {/* Título principal con efectos */}
        <h1 className="animated-title text-2xl font-bold">
          <span className="title-complete">BAT-7 Batería de Aptitudes</span>
        </h1>
        
        {/* Efectos de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-600/20 rounded-lg blur-sm animate-pulse"></div>
        
        {/* Partículas decorativas */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-300"></div>
      </div>
      
      <style jsx>{`
        .animated-title-container {
          position: relative;
          display: inline-block;
        }
        
        .animated-title {
          position: relative;
          z-index: 10;
          background: linear-gradient(
            45deg,
            #1d387a 0%,
            #FFFFFF 25%,
            #1d387a 50%,
            #afcbc4 75%,
            #1d387a 100%
          );
          background-size: 300% 300%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 3s ease-in-out infinite, titleEntrance 1.5s ease-out;
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          font-weight: 800;
          letter-spacing: 1px;
        }

        .title-complete {
          display: inline-block;
          animation: titleSlideIn 1.5s ease-out;
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes titleEntrance {
          0% {
            transform: translateY(-30px) scale(0.8);
            opacity: 0;
            filter: blur(10px);
          }
          50% {
            transform: translateY(-10px) scale(0.9);
            opacity: 0.7;
            filter: blur(5px);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes titleSlideIn {
          0% {
            transform: translateX(-100px);
            opacity: 0;
          }
          60% {
            transform: translateX(10px);
            opacity: 0.8;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Efectos hover */
        .animated-title-container:hover .animated-title {
          animation-duration: 1.5s;
          transform: scale(1.05);
          transition: transform 0.4s ease;
          text-shadow: 0 0 40px rgba(100, 138, 199, 0.6);
        }

        .animated-title-container:hover .title-complete {
          animation: titlePulse 0.6s ease-in-out;
        }

        @keyframes titlePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .animated-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .animated-title {
            font-size: 1.25rem;
          }

          .title-complete {
            text-align: center;
            line-height: 1.2;
          }
        }

        @media (max-width: 360px) {
          .animated-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedTitle;
