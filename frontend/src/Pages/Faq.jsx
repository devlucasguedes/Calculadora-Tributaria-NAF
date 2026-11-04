import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ListaFaq from "../components/ListaFaq";
import { gruposFaq } from "../data/faq";

export default function Faq() {
  const conectado = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Perguntas frequentes | Calculadora Tributária NAF";
    const assunto = document.getElementById(window.location.hash.slice(1));
    if (assunto) assunto.scrollIntoView();
    else window.scrollTo(0, 0);
    return () => { document.title = tituloAnterior; };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-naf-light">
      <Navbar />
      <main id="conteudo-faq" className="mx-auto w-full max-w-4xl grow px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#a62b18]">Ajuda com a calculadora</p>
          <h1 className="text-3xl font-extrabold text-naf-blue sm:text-4xl">Perguntas frequentes</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-gray-700">
            Tire suas dúvidas sobre os cálculos, o Fator R e como consultar ou exportar suas simulações.
            Selecione uma pergunta para ler a resposta.
          </p>
        </header>

        <nav aria-label="Assuntos do FAQ" className="mb-10 flex flex-wrap gap-2">
          {gruposFaq.map(grupo => (
            <a key={grupo.id} href={`#${grupo.id}`} className="rounded-xl border border-naf-gray/50 bg-white px-4 py-3 text-sm font-semibold text-naf-blue hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red">
              {grupo.titulo}
            </a>
          ))}
        </nav>

        <div className="space-y-10">
          {gruposFaq.map(grupo => (
            <section key={grupo.id} id={grupo.id} aria-labelledby={`titulo-${grupo.id}`} className="scroll-mt-6">
              <h2 id={`titulo-${grupo.id}`} className="mb-4 text-xl font-bold text-naf-blue sm:text-2xl">{grupo.titulo}</h2>
              <ListaFaq perguntas={grupo.perguntas} />
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-naf-gray/30 bg-white p-6">
          <h2 className="text-lg font-bold text-naf-blue">Pronto para simular?</h2>
          <p className="mt-2 mb-4 text-gray-700">Acesse as calculadoras para explorar os resultados com os seus valores.</p>
          <Link to={conectado ? "/Home" : "/login"} className="inline-block rounded-xl bg-naf-blue px-5 py-3 font-bold text-white hover:bg-[#0c1825] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red">
            {conectado ? "Acessar calculadoras" : "Entrar para calcular"}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
