import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { calcularFatorR as calcularSimplesFatorR } from "../utils/fatorR";

const MAX_FATURAMENTO = 15000;
const SALARIO_MINIMO = 1621;
const criarHistoricoFatorR = () =>
  Array.from({ length: 12 }, () => ({ receita: "", folha: "" }));
const PROFISSOES = [
  { value: "psicologo", label: "Psicólogo(a)" },
  { value: "arquiteto", label: "Arquiteto(a)" },
  { value: "advogado", label: "Advogado(a)" },
  { value: "medico", label: "Médico(a)" },
  { value: "dentista", label: "Dentista" },
];

function calcularImpostos(faturamento, profissao, impostoPJ) {
  const aliquota = profissao === "advogado" ? "4,5%" : "6%";
  const fatorAliquota = profissao === "advogado" ? 0.045 : 0.06;
  const salarioBase = Math.max(faturamento * 0.28, SALARIO_MINIMO);

  return {
    simples: faturamento * fatorAliquota,
    aliquota,
    salarioBase,
    inss: salarioBase * 0.11,
    total: impostoPJ,
  };
}

function ResultadoCalculo({
  resultado,
  mostrarEmail,
  setMostrarEmail,
  email,
  setEmail,
  mensagemEnvio,
  onEnviarEmail,
  isVisible,
}) {
  if (!resultado) return null;

  return (
    <div aria-live="polite" className={`bg-gray-50 border border-naf-gray/20 rounded-xl shadow-inner mt-4 p-5 transition-all duration-700 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0"}`}>
      {typeof resultado === "string" ? (
        <p className="text-naf-red font-medium">{resultado}</p>
      ) : (
        <>
          <div className="space-y-2 text-sm text-naf-blue">
            <p><strong>Simples Nacional ({resultado.aliquota}):</strong> R$ {resultado.simples.toFixed(2)}</p>
            <p><strong>Pró-labore base:</strong> R$ {resultado.salarioBase.toFixed(2)}</p>
            <p><strong>INSS (11%):</strong> R$ {resultado.inss.toFixed(2)}</p>
          </div>
          <p className="text-lg font-bold text-naf-red mt-3 pt-3 border-t border-naf-gray/30">
            Total a pagar: R$ {resultado.total.toFixed(2)}
          </p>

          <div className="mt-5 pt-3 border-t border-naf-gray/30">
            <p className="text-sm font-medium text-naf-blue mb-3 text-center">Deseja receber os resultados por e-mail?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setMostrarEmail(true)} className="bg-naf-blue text-white px-5 py-2 rounded-xl hover:bg-[#0c1825] focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition shadow-sm text-sm font-medium cursor-pointer">Sim</button>
              <button onClick={() => setMostrarEmail(false)} className="bg-white border border-naf-gray text-naf-blue px-5 py-2 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition shadow-sm text-sm font-medium cursor-pointer">Não</button>
            </div>

            {mostrarEmail && (
              <div className="mt-4 space-y-3">
                <label htmlFor="emailResult" className="sr-only">Digite seu e-mail</label>
                <input id="emailResult" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none text-sm" />
                <button onClick={onEnviarEmail} className="w-full bg-naf-red text-white py-2 rounded-xl hover:bg-[#a62b18] focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition text-sm font-bold shadow-sm cursor-pointer">Enviar resultados</button>
              </div>
            )}

            <div aria-live="polite">
              {mensagemEnvio && <p className="text-green-600 mt-3 text-sm font-bold text-center">{mensagemEnvio}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CalculoPJ() {
  const [renda, setRenda] = useState("");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [calculando, setCalculando] = useState(false);

  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [mensagemEnvio, setMensagemEnvio] = useState("");
  const [profissao, setProfissao] = useState("psicologo");
  const [showTooltipRenda, setShowTooltipRenda] = useState(false);

  const [historicoFatorR, setHistoricoFatorR] = useState(criarHistoricoFatorR);
  const [resultadoFatorR, setResultadoFatorR] = useState(null);
  const [erroFatorR, setErroFatorR] = useState("");

  const usaFatorR = profissao === "medico" || profissao === "dentista";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setResultado(null);
    setResultadoFatorR(null);
    setErroFatorR("");
    setMostrarEmail(false);
    setMensagemEnvio("");
  }, [profissao, renda, historicoFatorR]);

  const handleRendaChange = (e) => {
    const valor = parseFloat(e.target.value);
    if (valor > MAX_FATURAMENTO) {
      setErro("O valor máximo permitido é R$ 15.000,00");
      setRenda(MAX_FATURAMENTO);
    } else {
      setErro("");
      setRenda(e.target.value);
    }
  };

  const formatarMoedaFatorR = (valor) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatarPercentualFatorR = (valor) =>
    (valor * 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }) + "%";

  const calcularFatorR = () => {
    setResultadoFatorR(null);
    setErroFatorR("");
    try {
      setResultadoFatorR(calcularSimplesFatorR({
        faturamentoMensal: renda,
        historico: historicoFatorR,
      }));
    } catch (error) {
      setErroFatorR(error.message);
    }
  };

  const atualizarHistoricoFatorR = (indice, campo, valor) => {
    setHistoricoFatorR((historico) => historico.map((mes, posicao) =>
      posicao === indice ? { ...mes, [campo]: valor } : mes
    ));
  };

  const resetarEnvioEmail = () => {
    setMostrarEmail(false);
    setMensagemEnvio("");
  };

  const calcularPJ = async () => {
    if (calculando) return;

    if (usaFatorR) {
      calcularFatorR();
      return;
    }

    const rendaTexto = String(renda).trim();
    const rendaNum = Number(rendaTexto);

    if (
      !/^\d+(\.\d{1,2})?$/.test(rendaTexto) ||
      !Number.isFinite(rendaNum) ||
      rendaNum <= 0 ||
      rendaNum > 15000
    ) {
      setResultado(
        "Informe um faturamento maior que zero, de até R$ 15.000,00, com até duas casas decimais."
      );
      return;
    }

    setCalculando(true);
    setResultado(null);
    setMostrarEmail(false);
    setMensagemEnvio("");

    try {
      const response = await api.post("/calculos", {
        tipoProfissao: profissao,
        faturamento: rendaNum,
        custos: 0,
      });

      const { impostoPJ } = response.data.calculo;

      if (typeof impostoPJ !== "number" || !Number.isFinite(impostoPJ)) {
        throw new Error("O servidor retornou um resultado inválido.");
      }

      setResultado(calcularImpostos(rendaNum, profissao, impostoPJ));
      resetarEnvioEmail();
    } catch (error) {
      console.error("Erro ao salvar cálculo PJ:", error);
      const msg = error.response?.data?.error || "Erro ao processar cálculo no servidor.";
      setResultado(typeof msg === "string" ? msg : "Erro ao processar cálculo no servidor.");
    } finally {
      setCalculando(false);
    }
  };

  const enviarEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMensagemEnvio("Por favor, insira um e-mail válido.");
      return;
    }
    setMensagemEnvio(
      "Demonstração: nenhum e-mail foi enviado. O envio real ainda não está implementado."
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6">
        <div
          className={`w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-naf-gray/20 transition-all duration-700 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2
            className={`text-2xl font-bold text-center mb-6 text-naf-blue transition-all duration-700 ease-out delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Cálculo IR Pessoa Jurídica
          </h2>

          <div className="space-y-4">
            <div
              className={`transition-all duration-700 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <label
                htmlFor="profissao"
                className="block mb-1 text-sm font-medium text-naf-blue"
              >
                Profissão
              </label>

              <select
                id="profissao"
                value={profissao}
                disabled={calculando}
                onChange={(e) => {
                  setProfissao(e.target.value);
                  setHistoricoFatorR(criarHistoricoFatorR());
                  setErro("");
                }}
                className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-75 duration-300 ease-in-out disabled:opacity-60"
              >
                {PROFISSOES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div
              className={`transition-all duration-700 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="relative flex items-center gap-1 mb-1">
                <label
                  htmlFor="renda"
                  className="text-sm font-medium text-naf-blue"
                >
                  {usaFatorR ? "Faturamento do mês de apuração (R$)" : "Faturamento Mensal (R$)"}
                </label>

                <button
                  type="button"
                  aria-label="Explicação sobre faturamento mensal"
                  aria-expanded={showTooltipRenda}
                  className="text-naf-gray hover:text-naf-blue focus:outline-none focus:ring-2 focus:ring-naf-red rounded-full"
                  onMouseEnter={() => setShowTooltipRenda(true)}
                  onMouseLeave={() => setShowTooltipRenda(false)}
                  onFocus={() => setShowTooltipRenda(true)}
                  onBlur={() => setShowTooltipRenda(false)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showTooltipRenda && (
                  <div
                    role="tooltip"
                    className="absolute z-20 w-64 max-w-full p-3 text-sm text-white bg-gray-800 rounded-xl shadow-xl bottom-full left-0 mb-2 border border-gray-700"
                  >
                    É o valor total bruto recebido no mês pelas notas fiscais
                    emitidas no seu CNPJ.
                  </div>
                )}
              </div>
              <input
                id="renda"
                type="number"
                min="0"
                max={MAX_FATURAMENTO}
                step="0.01"
                inputMode="decimal"
                value={renda}
                disabled={calculando}
                onChange={handleRendaChange}
                placeholder="Ex: 3000"
                className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-75 duration-300 ease-in-out hover:shadow-sm disabled:opacity-60"
              />

              <div aria-live="polite" className="h-4">
                {erro && (
                  <p className="text-naf-red text-xs mt-1 font-medium">
                    {erro}
                  </p>
                )}
              </div>
            </div>

            {usaFatorR && (
              <div
                className={`transition-all duration-700 ease-out delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              >
                <h3 className="text-sm font-bold text-naf-blue">
                  Histórico dos 12 meses anteriores
                </h3>
                <p id="ajudaHistoricoFatorR" className="text-xs text-naf-blue mt-2">
                  Informe os valores reais de cada mês anterior ao mês de
                  apuração, sem incluir o próprio mês de apuração. O 1º mês
                  anterior é o imediatamente anterior a ele. O Fator R será
                  a soma das folhas dividida pela soma das receitas.
                </p>
                <p id="ajudaFolhaPagamento" className="text-xs text-naf-blue mt-2">
                  Informe o total elegível da folha, incluindo pró-labore e
                  encargos admitidos, sem distribuição de lucros ou aluguéis.
                  Digite 0 nos meses sem receita ou sem folha. Preencha os
                  12 meses; esta simulação não contempla início de atividade.
                </p>
                <p className="text-xs text-naf-blue mt-2 mb-3">
                  Limite desta simulação: receita acumulada maior que zero e
                  de até R$ 3.600.000,00 nos 12 meses anteriores.
                </p>
                <div className="space-y-3">
                  {historicoFatorR.map((mes, indice) => (
                    <fieldset
                      key={indice}
                      className="rounded-xl border border-naf-gray/30 p-3"
                      aria-describedby="ajudaHistoricoFatorR ajudaFolhaPagamento"
                    >
                      <legend className="px-1 text-xs font-semibold text-naf-blue">
                        {indice + 1}º mês anterior
                      </legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor={`receitaHistorico-${indice}`} className="block text-xs text-naf-blue mb-1">
                            Receita bruta (R$)
                          </label>
                          <input
                            id={`receitaHistorico-${indice}`}
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={mes.receita}
                            onChange={(e) => atualizarHistoricoFatorR(indice, "receita", e.target.value)}
                            className="w-full min-w-0 border border-naf-gray px-3 py-2 rounded-lg focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor={`folhaHistorico-${indice}`} className="block text-xs text-naf-blue mb-1">
                            Pró-labore / folha (R$)
                          </label>
                          <input
                            id={`folhaHistorico-${indice}`}
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={mes.folha}
                            onChange={(e) => atualizarHistoricoFatorR(indice, "folha", e.target.value)}
                            className="w-full min-w-0 border border-naf-gray px-3 py-2 rounded-lg focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    </fieldset>
                  ))}
                </div>

                <div aria-live="polite">
                  {erroFatorR && (
                    <p className="text-naf-red text-sm mt-2 font-medium">
                      {erroFatorR}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div
              className={`transition-all duration-700 ease-out delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <button
                type="button"
                onClick={calcularPJ}
                disabled={calculando}
                className="w-full bg-naf-blue text-white font-bold py-3 rounded-xl hover:bg-[#0c1825] focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 hover:scale-105 transition-all duration-300 ease-out shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                {calculando ? "Calculando..." : "Calcular"}
              </button>
            </div>

            {!usaFatorR && (
              <ResultadoCalculo
                resultado={resultado}
                mostrarEmail={mostrarEmail}
                setMostrarEmail={setMostrarEmail}
                email={email}
                setEmail={setEmail}
                mensagemEnvio={mensagemEnvio}
                onEnviarEmail={enviarEmail}
                isVisible={isVisible}
              />
            )}
            
            <div aria-live="polite">
              {usaFatorR && resultadoFatorR && (
                <div
                  className={`bg-gray-50 border border-naf-gray/20 rounded-xl shadow-inner mt-4 p-5 transition-all duration-500 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
                >
                  <div className="space-y-2 text-sm text-naf-blue">
                    <p>
                      <strong>Receita dos 12 meses anteriores: </strong>
                      {formatarMoedaFatorR(resultadoFatorR.receita12Meses)}
                    </p>
                    <p>
                      <strong>Folha dos 12 meses anteriores: </strong>
                      {formatarMoedaFatorR(resultadoFatorR.folha12Meses)}
                    </p>
                    <p>
                      <strong>Fator R obtido: </strong>
                      {formatarPercentualFatorR(resultadoFatorR.fatorR)}
                    </p>
                    <p>
                      <strong>Anexo aplicado: </strong>
                      Anexo {resultadoFatorR.anexo}
                    </p>
                    <p>
                      <strong>Faixa do anexo: </strong>
                      {resultadoFatorR.faixa}ª faixa
                    </p>
                    <p>
                      <strong>Alíquota nominal: </strong>
                      {formatarPercentualFatorR(resultadoFatorR.aliquotaNominal)}
                    </p>
                    <p>
                      <strong>Parcela a deduzir: </strong>
                      {formatarMoedaFatorR(resultadoFatorR.parcelaDeduzir)}
                    </p>
                    <p>
                      <strong>Alíquota efetiva do Simples Nacional: </strong>
                      {formatarPercentualFatorR(resultadoFatorR.aliquotaEfetiva)}
                    </p>
                    <p>
                      {resultadoFatorR.anexo === "III"
                        ? "Fator R igual ou superior a 28%: aplicação do Anexo III."
                        : "Fator R inferior a 28%: aplicação do Anexo V."}
                    </p>

                    {resultadoFatorR.folhaZerada && (
                      <p className="text-xs">
                        Com folha acumulada zero e receita acumulada positiva, aplica-se o Fator R
                        de 1% previsto na regulamentação, embora a divisão
                        direta resulte em zero.
                      </p>
                    )}
                  </div>

                  <p className="text-lg font-bold text-naf-red mt-3 pt-3 border-t border-naf-gray/30">
                    Simples Nacional estimado: {formatarMoedaFatorR(resultadoFatorR.simples)}
                  </p>

                  <p className="text-xs text-naf-blue mt-3">
                    Este valor não inclui INSS nem eventual IRPF do pró-labore.
                    A simulação não contempla início de atividade, retenções
                    ou receitas segregadas.
                  </p>

                  <p className="text-xs text-naf-blue mt-2">
                    Cálculo realizado no navegador, sem salvar no histórico
                    ou enviar por e-mail.
                  </p>
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
