import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navigateAndClose = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const btnClass = "px-2.5 py-2 rounded-lg text-base font-medium text-naf-light hover:bg-naf-red hover:text-white focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition-all duration-300 whitespace-nowrap block w-full text-left md:text-center md:inline-block md:w-auto";

  return (
    <nav className="w-full bg-naf-blue shadow-lg border-b border-naf-gray/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo transformada em button para navegação via teclado (Tab) */}
          <button 
            onClick={() => navigate('/Home')}
            className="flex-shrink-0 text-xl font-bold text-white tracking-wide hover:text-naf-gray focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 focus:ring-offset-naf-blue rounded transition-colors duration-300"
            title="Voltar para a Página Inicial"
          >
            Calculadora Tributária
          </button>

          {/* Botão do Menu Mobile (Hambúrguer) - Visível apenas em telas menores que md (768px) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Abrir menu principal"
            className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-naf-red rounded p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Menu Desktop - Oculto no celular, visível a partir de md */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-1">
              <button onClick={() => navigate('/Home')} className={btnClass}>Página Inicial</button>
              <div className="h-5 w-px bg-naf-gray/50 opacity-40 mx-0.5" aria-hidden="true" />
              <button onClick={() => navigate('/calculo-pf')} className={btnClass}>Cálculo PF</button>
              <div className="h-5 w-px bg-naf-gray/50 opacity-40 mx-0.5" aria-hidden="true" />
              <button onClick={() => navigate('/calculo-pj')} className={btnClass}>Cálculo PJ</button>
              <div className="h-5 w-px bg-naf-gray/50 opacity-40 mx-0.5" aria-hidden="true" />
              <button onClick={() => navigate('/comparativo')} className={btnClass}>Comparativo</button>
              <div className="h-5 w-px bg-naf-gray/50 opacity-40 mx-0.5" aria-hidden="true" />
              <button onClick={() => navigate('/historico')} className={btnClass}>Histórico</button>
            </div>

            <button
              onClick={handleLogout}
              className="ml-5 px-4 py-2 bg-transparent border-2 border-naf-red text-naf-light rounded-lg text-sm font-bold hover:bg-naf-red hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition-all duration-300 whitespace-nowrap"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown - Visível apenas se isOpen for true e em telas menores que md */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-naf-blue border-t border-naf-gray/20">
          <button onClick={() => navigateAndClose('/Home')} className={btnClass}>Página Inicial</button>
          <button onClick={() => navigateAndClose('/calculo-pf')} className={btnClass}>Cálculo PF</button>
          <button onClick={() => navigateAndClose('/calculo-pj')} className={btnClass}>Cálculo PJ</button>
          <button onClick={() => navigateAndClose('/comparativo')} className={btnClass}>Comparativo</button>
          <button onClick={() => navigateAndClose('/historico')} className={btnClass}>Histórico</button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-transparent border-2 border-naf-red text-naf-light rounded-lg text-base font-bold hover:bg-naf-red hover:text-white focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition-all duration-300"
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}
