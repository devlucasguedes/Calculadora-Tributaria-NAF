import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-naf-blue text-white py-6 mt-auto shadow-inner">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        
        {/* Créditos do Projeto */}
        <div className="text-center md:text-left">
          <h3 className="font-bold text-lg mb-1 tracking-wide">Calculadora Tributária NAF</h3>
          <p className="text-sm text-gray-300">
            Desenvolvido por <span className="font-medium text-white">Equipe ROCKET</span>
          </p>
        </div>

        {/* Links Úteis */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-medium">
          <a 
            href="https://unichristus.edu.br/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-naf-red focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-naf-blue rounded px-2 py-1 transition-colors duration-300"
          >
            Portal Unichristus
          </a>
          <a 
            href="https://www.instagram.com/naf.unichristus/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-naf-red focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-naf-blue rounded px-2 py-1 transition-colors duration-300"
          >
            Instagram do NAF
          </a>
          <a 
            href="https://www.gov.br/receitafederal/pt-br" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-naf-red focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-naf-blue rounded px-2 py-1 transition-colors duration-300"
          >
            Receita Federal
          </a>
        </div>
      </div>
    </footer>
  );
}
