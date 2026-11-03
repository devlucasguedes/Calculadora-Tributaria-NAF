import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Historico() {
  const [calculos, setCalculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
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
    const buscarHistorico = async () => {
      try {
        const response = await api.get("/calculos/historico");
        setCalculos(response.data);
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setErro("Não foi possível carregar o seu histórico de simulações.");
      } finally {
        setCarregando(false);
      }
    };

    if (token) buscarHistorico();
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen bg-[#EFEFEF]">
      <Navbar />

      <main className="flex-grow flex flex-col items-center py-10 px-4">
        {/* Cabeçalho */}
        <div className={`text-center mb-8 transition-all duration-700 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className="text-3xl font-bold text-[#132436] mb-2">Suas Simulações Salvas</h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Confira abaixo o histórico de todos os cálculos e comparativos tributários guardados em sua conta.
          </p>
        </div>

        {/* Listagem / Tabela */}
        <div className={`w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8 transition-all duration-700 ease-out delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          
          <div aria-live="polite">
            {carregando ? (
              <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
                Carregando histórico do banco de dados...
              </div>
            ) : erro ? (
              <div className="text-center py-10 text-naf-red font-semibold">
                {erro}
              </div>
            ) : calculos.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 font-medium text-lg">Você ainda não realizou nenhuma simulação.</p>
                <button onClick={() => navigate("/comparativo")} className="mt-4 px-6 py-2.5 bg-naf-red text-white font-bold rounded-xl hover:bg-[#a62b18] focus:outline-none focus:ring-2 focus:ring-[#CD371F] focus:ring-offset-2 transition shadow-md cursor-pointer">
                  Fazer Primeiro Cálculo
                </button>
              </div>
            ) : (
              <>
                {/* Visualização Mobile (Cards) */}
                <div className="md:hidden space-y-4">
                  {calculos.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                        <span className="text-sm font-medium text-gray-500">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            item.melhorOpcao.includes("PJ") 
                              ? "bg-green-50 text-green-700 border border-green-200" 
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                          Melhor: {item.melhorOpcao.includes("PJ") ? "PJ" : "PF"}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between"><span className="font-semibold text-naf-blue">Profissão:</span> <span className="capitalize">{item.tipoProfissao}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-naf-blue">Faturamento:</span> <span>R$ {item.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-naf-blue">Livro Caixa:</span> <span>{item.custos ? `R$ ${item.custos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</span></div>
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                          <div>
                            <span className="block text-xs font-semibold text-gray-500">Imposto PF</span>
                            <span className="font-bold text-[#CD371F]">R$ {item.impostoPF.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs font-semibold text-gray-500">Imposto PJ</span>
                            <span className="font-bold text-[#CD371F]">R$ {item.impostoPJ.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 text-center bg-green-50 rounded-lg p-2 border border-green-100">
                          <span className="block text-xs font-semibold text-green-700 uppercase">Economia Mensal</span>
                          <span className="font-bold text-lg text-green-700">R$ {item.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visualização Desktop (Tabela) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-inner">
                  <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-[#132436] text-white text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-4 text-left">Data</th>
                        <th className="py-4 px-4 text-left">Profissão</th>
                        <th className="py-4 px-4 text-left">Faturamento (Bruto)</th>
                        <th className="py-4 px-4 text-left">Livro Caixa (PF)</th>
                        <th className="py-4 px-4 text-left">Imposto PF</th>
                        <th className="py-4 px-4 text-left">Imposto PJ</th>
                        <th className="py-4 px-4 text-center">Melhor Opção</th>
                        <th className="py-4 px-4 text-right">Economia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {calculos.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-4 font-medium text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-4 px-4 capitalize font-semibold text-naf-blue">
                            {item.tipoProfissao}
                          </td>
                          <td className="py-4 px-4 font-medium">
                            R$ {item.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            {item.custos ? `R$ ${item.custos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                          </td>
                          <td className="py-4 px-4 text-[#CD371F] font-medium">
                            R$ {item.impostoPF.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-[#CD371F] font-medium">
                            R$ {item.impostoPJ.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              item.melhorOpcao.includes("PJ") 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {item.melhorOpcao.includes("PJ") ? "PJ" : "PF"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-green-600">
                            R$ {item.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
