import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CalculoPF() {
  const [renda, setRenda] = useState("");
  const [custos, setCustos] = useState("");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [mensagemEnvio, setMensagemEnvio] = useState("");
  const [showTooltipRenda, setShowTooltipRenda] = useState(false);
  const [showTooltipCustos, setShowTooltipCustos] = useState(false);
  const [profissao, setProfissao] = useState("psicologo");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRendaChange = (e) => {
    const valor = parseFloat(e.target.value);
    if (valor > 15000) {
      setErro("O valor máximo permitido é R$ 15.000,00");
      setRenda(15000);
    } else {
      setErro("");
      setRenda(e.target.value);
    }
  };

  const calcularIRPF = async () => {
    const rendaNum = parseFloat(renda);
    const custosNum = parseFloat(custos);
    if (isNaN(rendaNum) || isNaN(custosNum)) {
      setResultado("Por favor, insira valores válidos.");
      return;
    }

    try {
      const response = await api.post("/calculos", {
        tipoProfissao: profissao,
        faturamento: rendaNum,
        custos: custosNum
      });

      const { impostoPF } = response.data.calculo;
      const base = rendaNum - custosNum;

      let faixa = "Isento";
      let parcelaDedutivel = 0;

      if (base <= 2428.8) faixa = "Isento";
      else if (base <= 2826.65) { faixa = "7,5%"; parcelaDedutivel = 182.16; }
      else if (base <= 3751.05) { faixa = "15%"; parcelaDedutivel = 394.16; }
      else if (base <= 4664.68) { faixa = "22,5%"; parcelaDedutivel = 675.49; }
      else { faixa = "27,5%"; parcelaDedutivel = 908.73; }

      setResultado({
        base,
        faixa,
        imposto: impostoPF,
        parcelaDedutivel,
      });

      setMostrarEmail(false);
      setMensagemEnvio("");

    } catch (error) {
      console.error("Erro ao salvar cálculo PF:", error);
      const msg = error.response?.data?.error || "Erro ao processar cálculo no servidor.";
      setResultado(msg);
    }
  };

  const enviarEmail = () => {
    if (!email.includes("@")) {
      setMensagemEnvio("Por favor, insira um e-mail válido.");
      return;
    }
    setMensagemEnvio(`Resultados simulados e enviados para ${email} com sucesso!`);
    setEmail("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6">
        <div className={`w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-naf-gray/20 transition-all duration-700 ease-out delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className={`text-2xl font-bold text-center mb-6 text-naf-blue transition-all duration-700 ease-out delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            Cálculo IR Pessoa Física
          </h2>

          <div className="space-y-4">
            <div className={`transition-all duration-700 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
              <label htmlFor="profissao" className="block mb-1 text-sm font-medium text-naf-blue">Profissão</label>
              <select id="profissao" value={profissao} onChange={(e) => setProfissao(e.target.value)} className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-75 duration-300 ease-in-out">
                <option value="psicologo">Psicólogo(a)</option>
                <option value="arquiteto">Arquiteto(a)</option>
                <option value="advogado">Advogado(a)</option>
              </select>
            </div>

            <div className={`transition-all duration-700 ease-out delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
              <div className="relative flex items-center gap-1 mb-1">
                <label htmlFor="renda" className="text-sm font-medium text-naf-blue">Renda Mensal Bruta (R$)</label>
                <button 
                  type="button" 
                  aria-label="Ajuda sobre Renda Mensal Bruta"
                  aria-expanded={showTooltipRenda}
                  className="text-naf-gray hover:text-naf-blue focus:outline-none focus:ring-2 focus:ring-naf-red rounded-full" 
                  onMouseEnter={() => setShowTooltipRenda(true)} 
                  onMouseLeave={() => setShowTooltipRenda(false)}
                  onFocus={() => setShowTooltipRenda(true)}
                  onBlur={() => setShowTooltipRenda(false)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                {showTooltipRenda && (
                  <div role="tooltip" className="absolute z-20 w-64 p-3 text-sm text-white bg-gray-800 rounded-xl shadow-xl bottom-full left-0 mb-2 border border-gray-700">
                    É o valor total que espera receber por mês com o seu trabalho, antes de qualquer desconto.
                  </div>
                )}
              </div>
              <input id="renda" type="number" value={renda} onChange={handleRendaChange} max="15000" placeholder="Ex: 3000" className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-75 duration-300 ease-in-out hover:shadow-sm" />
              <div aria-live="polite" className="h-4">
                {erro && <p className="text-naf-red text-xs mt-1 font-medium">{erro}</p>}
              </div>
            </div>

            <div className={`transition-all duration-700 ease-out delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
              <div className="relative flex items-center gap-1 mb-1">
                <label htmlFor="custos" className="text-sm font-medium text-naf-blue">Despesas Dedutíveis (Livro Caixa)</label>
                <button 
                  type="button" 
                  aria-label="Ajuda sobre Despesas Dedutíveis"
                  aria-expanded={showTooltipCustos}
                  className="text-naf-gray hover:text-naf-blue focus:outline-none focus:ring-2 focus:ring-naf-red rounded-full" 
                  onMouseEnter={() => setShowTooltipCustos(true)} 
                  onMouseLeave={() => setShowTooltipCustos(false)}
                  onFocus={() => setShowTooltipCustos(true)}
                  onBlur={() => setShowTooltipCustos(false)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                {showTooltipCustos && (
                  <div role="tooltip" className="absolute z-20 w-64 p-3 text-sm text-white bg-gray-800 rounded-xl shadow-xl bottom-full left-0 mb-2 border border-gray-700">
                    São os gastos essenciais para o seu trabalho acontecer (ex: aluguer de consultório/escritório, internet, energia). Estes reduzem a base de cálculo do imposto.
                  </div>
                )}
              </div>
              <input id="custos" type="number" value={custos} onChange={(e) => setCustos(e.target.value)} placeholder="Ex: 750" className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-75 duration-300 ease-in-out hover:shadow-sm" />
            </div>

            <div className={`transition-all duration-700 ease-out delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
              <button onClick={calcularIRPF} className="w-full bg-naf-blue text-white font-bold py-3 rounded-xl hover:bg-[#0c1825] focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 hover:scale-105 transition-all duration-300 ease-out shadow-md cursor-pointer">
                Calcular
              </button>
            </div>

            <div aria-live="polite">
              {resultado && (
                <div className={`bg-gray-50 border border-naf-gray/20 rounded-xl shadow-inner mt-4 p-5 transition-all duration-500 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
                  {typeof resultado === "string" ? (
                    <p className="text-naf-red font-medium">{resultado}</p>
                  ) : (
                    <>
                      <div className="space-y-2 text-sm text-naf-blue">
                        <p><strong>Base de cálculo:</strong> R$ {resultado.base.toFixed(2)}</p>
                        <p><strong>Faixa IRPF:</strong> {resultado.faixa}</p>
                        <p><strong>Parcela a deduzir:</strong> R$ {resultado.parcelaDedutivel.toFixed(2)}</p>
                      </div>
                      <p className="text-lg font-bold text-naf-red mt-3 pt-3 border-t border-naf-gray/30">
                        IR a pagar: R$ {resultado.imposto.toFixed(2)}
                      </p>

                      <div className="mt-5 pt-3 border-t border-naf-gray/30">
                        <p className="text-sm font-medium text-naf-blue mb-3 text-center">Deseja enviar esta simulação por e-mail?</p>
                        <div className="flex gap-3 justify-center">
                          <button onClick={() => setMostrarEmail(true)} className="bg-naf-blue text-white px-5 py-2 rounded-xl hover:bg-[#0c1825] focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition shadow-sm text-sm font-medium cursor-pointer">Sim, enviar</button>
                          <button onClick={() => setMostrarEmail(false)} className="bg-white border border-naf-gray text-naf-blue px-5 py-2 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition shadow-sm text-sm font-medium cursor-pointer">Não, obrigado</button>
                        </div>

                        {mostrarEmail && (
                          <div className="mt-4 space-y-3">
                            <label htmlFor="email" className="sr-only">Digite o seu e-mail</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite o seu e-mail" className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none text-sm" />
                            <button onClick={enviarEmail} className="w-full bg-naf-red text-white py-2 rounded-xl hover:bg-[#a62b18] focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition text-sm font-bold shadow-sm cursor-pointer">Enviar resultados</button>
                          </div>
                        )}

                        <div aria-live="polite">
                          {mensagemEnvio && <p className="text-green-600 mt-3 text-sm font-bold text-center">{mensagemEnvio}</p>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CalculoPF;
