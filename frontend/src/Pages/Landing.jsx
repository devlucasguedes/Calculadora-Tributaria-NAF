import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ListaFaq from "../components/ListaFaq";
import { resumoFaq } from "../data/faq";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <Navbar />

      <main className="grow">
        <section className="w-full py-20 px-6 text-center bg-linear-to-b from-naf-blue to-[#0c1825] text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Pare de perder dinheiro para o Leão. <br />
              <span className="text-naf-red">Simule seus impostos em segundos.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
              Nossa calculadora inteligente ajuda profissionais autônomos a compararem os encargos entre Pessoa Física e Pessoa Jurídica para tomar a melhor decisão financeira.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate("/login")}
                className="bg-naf-red text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-[#a62b18] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0c1825] transition shadow-lg hover:scale-105 cursor-pointer"
              >
                Acessar Calculadora
              </button>
              <button 
                onClick={() => document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-2 border-gray-300 text-white text-lg font-bold px-8 py-4 rounded-xl hover:border-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0c1825] transition cursor-pointer"
              >
                Como funciona?
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq-section" className="w-full py-20 px-6 bg-naf-light">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-naf-blue mb-2">Dúvidas Frequentes (FAQ)</h2>
            <p className="text-center text-gray-700 mb-10 font-medium">Entenda como a nossa ferramenta pode ajudar na sua rotina</p>

            <ListaFaq perguntas={resumoFaq} />
            <div className="mt-8 text-center">
              <Link to="/faq" className="inline-block rounded-xl bg-naf-blue px-6 py-3 font-bold text-white hover:bg-[#0c1825] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red">
                Ver todas as perguntas
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
