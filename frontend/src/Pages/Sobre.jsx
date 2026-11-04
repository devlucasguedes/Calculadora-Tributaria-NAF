import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const EMAIL_NAF = "naf01.dl@unichristus.edu.br";
const CONTATO_NAF = `mailto:${EMAIL_NAF}?subject=${encodeURIComponent("Contato sobre a Calculadora Tributária NAF")}`;
const LINK_INSTITUCIONAL = "https://www.unichristus.edu.br/infraestrutura/";
const FONTE_CONTATO = "https://www.unichristus.edu.br/unichristus-disponibiliza-auxilio-gratuito-para-declaracao-do-imposto-de-renda/";
const linkClass = "rounded font-medium text-naf-blue underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red";

export default function Sobre() {
  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Sobre | Calculadora Tributária NAF";
    window.scrollTo(0, 0);
    return () => { document.title = tituloAnterior; };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-naf-light">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl grow px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#a62b18]">Conheça o projeto</p>
          <h1 className="text-3xl font-extrabold text-naf-blue sm:text-4xl">Sobre a Calculadora Tributária</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-gray-700">
            Uma ferramenta de simulação para ajudar profissionais a compreender os tributos
            estimados na atuação como Pessoa Física e Pessoa Jurídica.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section aria-labelledby="sobre-naf" className="min-w-0 rounded-2xl border border-naf-gray/30 bg-white p-6 shadow-sm">
            <h2 id="sobre-naf" className="mb-4 text-xl font-bold text-naf-blue">NAF / Universidade Christus</h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              O Núcleo de Apoio Contábil e Fiscal (NAF) da Unichristus aproxima a formação
              acadêmica das necessidades da comunidade. Em parceria com a Receita Federal,
              oferece orientação contábil e fiscal gratuita a pessoas físicas e jurídicas
              de menor poder aquisitivo.
            </p>
            <p className="mb-4 leading-relaxed text-gray-700">
              Os atendimentos envolvem estudantes de Ciências Contábeis, com orientação
              e supervisão de professores, unindo prática profissional e cidadania fiscal.
            </p>
            <a href={LINK_INSTITUCIONAL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Conheça o NAF no site da Unichristus <span className="text-sm">(abre em outra aba)</span>
            </a>
          </section>

          <section aria-labelledby="sobre-calculadora" className="min-w-0 rounded-2xl border border-naf-gray/30 bg-white p-6 shadow-sm">
            <h2 id="sobre-calculadora" className="mb-4 text-xl font-bold text-naf-blue">A calculadora</h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              O comparativo PF e PJ atende psicólogos, arquitetos e advogados.
              Médicos e dentistas contam com um simulador de Fator R na página Cálculo PJ,
              com previsão mensal ou histórico real de 12 meses.
            </p>
            <Link to="/faq" className={linkClass}>Entenda como usar a calculadora</Link>
          </section>
        </div>

        <section aria-labelledby="contato-naf" className="mt-6 rounded-2xl border border-naf-gray/30 bg-white p-6 shadow-sm sm:p-8">
          <h2 id="contato-naf" className="text-xl font-bold text-naf-blue sm:text-2xl">Fale com o NAF</h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            Para informações sobre orientação contábil e fiscal, disponibilidade ou
            agendamento de atendimento, entre em contato com o núcleo.
          </p>
          <p className="mt-4 text-sm font-semibold text-gray-700">E-mail de contato</p>
          <p className="mt-1 text-lg font-bold text-naf-blue">
            {EMAIL_NAF.split("@")[0]}@<wbr />{EMAIL_NAF.split("@")[1]}
          </p>
          <a href={CONTATO_NAF} aria-describedby="ajuda-email-naf" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-naf-blue px-5 py-3 font-bold text-white hover:bg-[#0c1825] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red">
            <svg className="h-5 w-5 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
            Escrever para o NAF
          </a>
          <p id="ajuda-email-naf" className="mt-3 text-sm leading-relaxed text-gray-700">
            O botão abre seu aplicativo de e-mail com o destinatário e o assunto preenchidos.
            Se preferir, copie o endereço acima para o serviço de e-mail que você utiliza.
          </p>
          <p className="mt-4 text-sm">
            <a href={FONTE_CONTATO} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Consulte o contato publicado pela Unichristus (abre em outra aba)
            </a>
          </p>
        </section>

        <aside aria-labelledby="aviso-estimativas" className="mt-6 rounded-2xl border border-naf-gray/40 p-6">
          <h2 id="aviso-estimativas" className="font-bold text-naf-blue">Os valores são estimativas</h2>
          <p className="mt-2 leading-relaxed text-gray-700">
            Os resultados dependem dos dados informados e das regras implementadas no
            simulador. Eles não substituem a apuração fiscal nem a orientação de um
            profissional contábil.
          </p>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
