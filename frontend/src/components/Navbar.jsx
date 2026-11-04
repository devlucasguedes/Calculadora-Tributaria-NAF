import { useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const botaoMenu = useRef(null);
  const conectado = Boolean(localStorage.getItem("token"));
  const inicio = conectado ? "/Home" : "/";
  const links = conectado ? [
    { to: "/Home", label: "Página Inicial" },
    { to: "/calculo-pf", label: "Cálculo PF" },
    { to: "/calculo-pj", label: "Cálculo PJ" },
    { to: "/comparativo", label: "Comparativo" },
    { to: "/historico", label: "Histórico" },
    { to: "/faq", label: "FAQ" },
    { to: "/sobre", label: "Sobre" },
  ] : [
    { to: "/", label: "Página Inicial" },
    { to: "/faq", label: "FAQ" },
    { to: "/sobre", label: "Sobre" },
    { to: "/login", label: "Entrar" },
    { to: "/cadastro", label: "Criar Conta" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/");
  };

  const fecharComEscape = event => {
    if (event.key === "Escape" && isOpen) {
      setIsOpen(false);
      botaoMenu.current?.focus();
    }
  };

  const renderLinks = () => links.map(({ to, label }) => (
    <NavLink key={to} to={to} end onClick={() => setIsOpen(false)} className={({ isActive }) =>
      `block rounded-lg px-2.5 py-2 text-base font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors ${isActive ? "bg-white/10 text-white underline underline-offset-4" : "text-naf-light hover:bg-naf-red hover:text-white"}`
    }>{label}</NavLink>
  ));
  const renderLogout = () => conectado && (
    <button type="button" onClick={handleLogout} className="rounded-lg border-2 border-naf-red px-4 py-2 text-sm font-bold text-naf-light hover:bg-naf-red hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
      Sair
    </button>
  );

  return (
    <nav aria-label="Menu principal" onKeyDown={fecharComEscape} className="w-full bg-naf-blue shadow-lg border-b border-naf-gray/20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-2">
          <Link to={inicio} onClick={() => setIsOpen(false)} className="rounded text-lg font-bold text-white tracking-wide hover:text-naf-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-xl" aria-label="Calculadora Tributária — Página Inicial">
            Calculadora Tributária
          </Link>
          <button ref={botaoMenu} type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls="menu-mobile" aria-label={isOpen ? "Fechar menu principal" : "Abrir menu principal"} className="shrink-0 rounded p-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:hidden">
            <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <div className="hidden items-center gap-3 xl:flex">
            <div className="flex items-center gap-1">{renderLinks()}</div>
            {renderLogout()}
          </div>
        </div>
        <div id="menu-mobile" hidden={!isOpen} className="space-y-2 border-t border-naf-gray/20 pt-2 pb-4 xl:hidden">
          {renderLinks()}
          {renderLogout()}
        </div>
      </div>
    </nav>
  );
}
