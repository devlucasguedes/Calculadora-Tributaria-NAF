import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MAX_FATURAMENTO = 15000;
const SALARIO_MINIMO = 1621;
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
    <div className={`bg-gray-50 border border-naf-gray/20 rounded-xl shadow-inner mt-4 p-5 transition-all duration-[700ms] ease-out delay-[200ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0"}`}>
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
              <button onClick={() => setMostrarEmail(true)} className="bg-naf-blue text-white px-5 py-2 rounded-xl hover:bg-[#0c1825] transition shadow-sm text-sm font-medium">Sim</button>
              <button onClick={() => setMostrarEmail(false)} className="bg-white border border-naf-gray text-naf-blue px-5 py-2 rounded-xl hover:bg-gray-100 transition shadow-sm text-sm font-medium">Não</button>
            </div>

            {mostrarEmail && (
              <div className="mt-4 space-y-3">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none text-sm" />
                <button onClick={onEnviarEmail} className="w-full bg-naf-red text-white py-2 rounded-xl hover:bg-[#a62b18] transition text-sm font-bold shadow-sm">Enviar resultados</button>
              </div>
            )}

            {mensagemEnvio && <p className="text-green-600 mt-3 text-sm font-bold text-center">{mensagemEnvio}</p>}
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

  const [folhaPagamento, setFolhaPagamento] = useState("");
  const [resultadoFatorR, setResultadoFatorR] = useState(null);
  const [erroFatorR, setErroFatorR] = useState("");

  // O novo fluxo é usado somente por médico e dentista.
  // As profissões anteriores mantêm o cálculo existente.
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

  // Não deixa resultados de uma simulação aparecerem em outra.
  useEffect(() => {
    setResultado(null);
    setResultadoFatorR(null);
    setErroFatorR("");
    setMostrarEmail(false);
    setMensagemEnvio("");
  }, [profissao, renda, folhaPagamento]);

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

    const rendaTexto = String(renda).trim();
    const folhaTexto = String(folhaPagamento).trim();

    if (rendaTexto === "" || folhaTexto === "") {
      setErroFatorR(
        "Preencha a renda e a folha de pagamento. Informe 0 se não houver folha."
      );
      return;
    }

    const formatoValido = /^\d+(\.\d{1,2})?$/;

    if (!formatoValido.test(rendaTexto) || !formatoValido.test(folhaTexto)) {
      setErroFatorR(
        "Use valores não negativos, com até duas casas decimais."
      );
      return;
    }

    const rendaNum = Number(rendaTexto);
    const folhaNum = Number(folhaTexto);

    if (!Number.isFinite(rendaNum) || rendaNum <= 0 || rendaNum > 15000) {
      setErroFatorR(
        "A renda deve ser maior que zero e de até R$ 15.000,00."
      );
      return;
    }

    const rendaCentavos = Math.round(rendaNum * 100);
    const folhaCentavos = Math.round(folhaNum * 100);

    if (
      !Number.isFinite(folhaNum) ||
      !Number.isSafeInteger(folhaCentavos * 1200)
    ) {
      setErroFatorR("O valor da folha ultrapassa o limite suportado.");
      return;
    }

    // Hipótese da simulação: valores mensais constantes por 12 meses.
    const receita12Centavos = rendaCentavos * 12;
    const folha12Centavos = folhaCentavos * 12;
    const razaoFolhaReceita = folha12Centavos / receita12Centavos;

    // Folha zero e receita positiva: Fator R regulamentar de 1%.
    const fatorR = folhaCentavos === 0 ? 0.01 : razaoFolhaReceita;

    // Compara valores inteiros, sem arredondar o Fator R.
    const aplicaAnexoIII =
      folha12Centavos * 100 >= receita12Centavos * 28;

    const anexo = aplicaAnexoIII ? "III" : "V";

    // Primeira faixa: receita mensal de até R$ 15.000,00
    // projetada para 12 meses, totalizando até R$ 180.000,00.
    const aliquota = aplicaAnexoIII ? 6 : 15.5;
    const simples = Math.round((rendaCentavos * aliquota) / 100) / 100;

    setResultadoFatorR({
      receita12Meses: receita12Centavos / 100,
      folha12Meses: folha12Centavos / 100,
      fatorR,
      anexo,
      aliquota,
      simples,
      folhaZerada: folhaCentavos === 0,
    });
  };

  const resetarEnvioEmail = () => {
    setMostrarEmail(false);
    setMensagemEnvio("");
  };

  const calcularPJ = async () => {
    if (calculando) return;

    // Esta verificação vem ANTES da validação do cálculo antigo.
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
      // Mantém a integração existente para as profissões anteriores.
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

      const msg =
        error.response?.data?.error ||
        "Erro ao processar cálculo no servidor.";

      setResultado(
        typeof msg === "string" ? msg : "Erro ao processar cálculo no servidor."
      );
    } finally {
      setCalculando(false);
    }
  };

  const enviarEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMensagemEnvio("Por favor, insira um e-mail válido.");
      return;
    }

    // O exemplo original não tem integração para enviar e-mails.
    setMensagemEnvio(
      "Demonstração: nenhum e-mail foi enviado. O envio real ainda não está implementado."
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div
          className={`w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-naf-gray/20 transition-all duration-[700ms] ease-out delay-[200ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2
            className={`text-2xl font-bold text-center mb-6 text-naf-blue transition-all duration-[700ms] ease-out delay-[400ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Cálculo IR Pessoa Jurídica
          </h2>

          <div className="space-y-4">
            <div
              className={`transition-all duration-[700ms] ease-out delay-[500ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
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
                  setFolhaPagamento("");
                  setErro("");
                }}
                className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition delay-[80ms] duration-[400ms] ease-in-out disabled:opacity-60"
              >
                {PROFISSOES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div
              className={`transition-all duration-[700ms] ease-out delay-[600ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="relative flex items-center gap-1 mb-1">
                <label
                  htmlFor="renda"
                  className="text-sm font-medium text-naf-blue"
                >
                  Faturamento Mensal (R$)
                </label>

                <button
                  type="button"
                  aria-label="Explicação sobre faturamento mensal"
                  className="text-naf-gray hover:text-naf-blue focus:outline-none"
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
                    className="absolute z-10 w-64 max-w-full p-3 text-sm text-white bg-naf-blue rounded-xl shadow-lg top-full left-0 mt-2 border border-naf-gray/30"
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
                className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:shadow-sm disabled:opacity-60"
              />

              {erro && (
                <p role="alert" className="text-naf-red text-sm mt-1 font-medium">
                  {erro}
                </p>
              )}
            </div>

            {usaFatorR && (
              <div
                className={`transition-all duration-[700ms] ease-out delay-[700ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              >
                <label
                  htmlFor="folhaPagamento"
                  className="block mb-1 text-sm font-medium text-naf-blue"
                >
                  Despesa mensal com pró-labore / folha de pagamento (R$)
                </label>

                <input
                  id="folhaPagamento"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={folhaPagamento}
                  onChange={(e) => setFolhaPagamento(e.target.value)}
                  placeholder="Ex: 2800"
                  aria-describedby="ajudaFolhaPagamento"
                  aria-invalid={Boolean(erroFatorR)}
                  className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:shadow-sm"
                />

                <p id="ajudaFolhaPagamento" className="text-xs text-naf-blue mt-2">
                  Informe o total elegível da folha, incluindo pró-labore e
                  encargos admitidos, sem distribuição de lucros ou aluguéis.
                  Digite 0 se não houver folha.
                </p>

                <p className="text-xs text-naf-blue mt-2">
                  Simulação com valores mensais constantes: a renda e a folha
                  serão multiplicadas por 12. Não substitui o histórico real
                  dos 12 meses anteriores.
                </p>

                {erroFatorR && (
                  <p role="alert" className="text-naf-red text-sm mt-2 font-medium">
                    {erroFatorR}
                  </p>
                )}
              </div>
            )}

            <div
              className={`transition-all duration-[700ms] ease-out delay-[800ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <button
                type="button"
                onClick={calcularPJ}
                disabled={calculando}
                className="w-full bg-naf-blue text-white font-bold py-3 rounded-xl hover:bg-[#0c1825] hover:scale-105 transition-all duration-[400ms] ease-out shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
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
            {usaFatorR && resultadoFatorR && (
              <div
                role="status"
                className={`bg-gray-50 border border-naf-gray/20 rounded-xl shadow-inner mt-4 p-5 transition-all duration-[400ms] ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
              >
                <div className="space-y-2 text-sm text-naf-blue">
                  <p>
                    <strong>Receita em 12 meses (estimada): </strong>
                    {formatarMoedaFatorR(resultadoFatorR.receita12Meses)}
                  </p>
                  <p>
                    <strong>Folha em 12 meses (estimada): </strong>
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
                    <strong>Alíquota do Simples Nacional: </strong>
                    {resultadoFatorR.aliquota.toLocaleString("pt-BR")}%
                  </p>
                  <p>
                    {resultadoFatorR.anexo === "III"
                      ? "Fator R igual ou superior a 28%: aplicação do Anexo III."
                      : "Fator R inferior a 28%: aplicação do Anexo V."}
                  </p>

                  {resultadoFatorR.folhaZerada && (
                    <p className="text-xs">
                      Com folha zero e receita positiva, aplica-se o Fator R
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
      </main>

      <Footer />
    </div>
  );
}
