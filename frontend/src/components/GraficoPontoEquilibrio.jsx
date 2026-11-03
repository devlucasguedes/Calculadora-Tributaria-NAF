import { useEffect, useId, useRef, useState } from "react";

const moeda = valor => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const compacto = valor => valor === 0 ? "0" : valor >= 1000
  ? `${(valor / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`
  : valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
const profissoes = { psicologo: "Psicólogo(a)", arquiteto: "Arquiteto(a)", advogado: "Advogado(a)" };

export default function GraficoPontoEquilibrio({ dados }) {
  const id = useId();
  const container = useRef(null);
  const [largura, setLargura] = useState(640);
  const [indice, setIndice] = useState(() => Math.max(0, dados.pontos.findIndex(ponto => ponto.renda === dados.rendaSimulada)));
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setLargura(Math.max(180, entry.contentRect.width)));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  const altura = 280, esquerda = 48, direita = largura - 16, topo = 24, fundo = 235;
  const teto = Math.max(500, Math.ceil(Math.max(...dados.pontos.flatMap(p => [p.impostoPF, p.impostoPJ])) * 1.1 / 500) * 500);
  const x = renda => esquerda + (renda / dados.rendaMaxima) * (direita - esquerda);
  const y = imposto => fundo - (imposto / teto) * (fundo - topo);
  const linha = campo => dados.pontos.map((p, i) => `${i ? "L" : "M"}${x(p.renda)},${y(p[campo])}`).join(" ");
  const selecionado = dados.pontos[Math.min(indice, dados.pontos.length - 1)];
  const faixas = dados.faixasPJ;
  const resumo = faixas.length
    ? `PJ com menor custo nas rendas aproximadamente entre ${faixas.map(faixa => `${moeda(faixa.de)} e ${moeda(faixa.ate)}`).join("; ")} por mês.`
    : `A PJ não apresenta menor custo na faixa de ${moeda(dados.rendaMinima)} a ${moeda(dados.rendaMaxima)} por mês.`;
  const diferenca = selecionado.impostoPF - selecionado.impostoPJ;
  const vencedor = Math.abs(diferenca) < 0.005 ? "Custos equivalentes" : diferenca > 0 ? "PJ com menor custo" : "PF com menor custo";
  const apontar = event => {
    const rect = event.currentTarget.getBoundingClientRect();
    const renda = Math.max(0, Math.min(dados.rendaMaxima,
      ((event.clientX - rect.left) / rect.width * largura - esquerda) / (direita - esquerda) * dados.rendaMaxima));
    setIndice(dados.pontos.reduce((melhor, ponto, atual) =>
      Math.abs(ponto.renda - renda) < Math.abs(dados.pontos[melhor].renda - renda) ? atual : melhor, 0));
  };
  const marcasX = largura < 480 ? [0, 7500, 15000] : [0, 3000, 6000, 9000, 12000, 15000];

  return (
    <section aria-labelledby={`${id}-titulo`} className="min-w-0 text-naf-blue">
      <h2 id={`${id}-titulo`} className="text-xl font-bold mb-2">Ponto de equilíbrio: PF × PJ</h2>
      <p className="text-sm text-gray-700">
        {profissoes[dados.profissao]} · Custos dedutíveis fixos de {moeda(dados.custosFixos)} por mês.
      </p>
      <p className="mt-4 rounded-xl bg-gray-100 border border-gray-300 p-3 text-sm font-semibold">{resumo}</p>
      {dados.pontosEquilibrio.length > 0 && (
        <p className="mt-2 text-sm">Equilíbrio estimado: {dados.pontosEquilibrio.map(moeda).join("; ")} de renda mensal. Nesse ponto, os custos se igualam.</p>
      )}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 mb-2 text-sm" aria-label="Legenda do gráfico">
        <span className="flex items-center gap-2"><span className="w-6 border-t-[3px] border-[#132436]" aria-hidden="true" />PF: IRPF</span>
        <span className="flex items-center gap-2"><span className="w-6 border-t-[3px] border-dashed border-[#CD371F]" aria-hidden="true" />PJ: Simples + INSS</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-green-100 border border-green-700" aria-hidden="true" />Faixa favorável à PJ</span>
      </div>
      <figure ref={container} className="w-full min-w-0">
        <svg role="img" aria-labelledby={`${id}-grafico-titulo ${id}-descricao`}
          viewBox={`0 0 ${largura} ${altura}`} className="w-full block" style={{ height: altura }}
          onPointerMove={apontar} onPointerDown={apontar}>
          <title id={`${id}-grafico-titulo`}>Tributos mensais de PF e PJ em função da renda mensal</title>
          <desc id={`${id}-descricao`}>{resumo} A linha contínua representa PF; a tracejada, PJ. Use o controle abaixo para consultar os valores.</desc>
          <g aria-hidden="true">
            <text x={esquerda} y="13" fontSize="11" fill="#374151">Tributos mensais (R$)</text>
            {faixas.map((faixa, i) => <rect key={i} x={x(faixa.de)} y={topo} width={x(faixa.ate) - x(faixa.de)} height={fundo - topo} fill="#dcfce7" />)}
            {[0, 1, 2, 3, 4].map(i => {
              const valor = teto * i / 4;
              return <g key={i}>
                <line x1={esquerda} x2={direita} y1={y(valor)} y2={y(valor)} stroke="#d1d5db" />
                <text x={esquerda - 6} y={y(valor) + 4} fontSize="11" textAnchor="end" fill="#374151">{compacto(valor)}</text>
              </g>;
            })}
            {marcasX.map((valor, i) => <text key={valor} x={x(valor)} y={fundo + 18} fontSize="11"
              textAnchor={i === 0 ? "start" : i === marcasX.length - 1 ? "end" : "middle"} fill="#374151">{compacto(valor)}</text>)}
            <text x={(esquerda + direita) / 2} y={altura - 3} fontSize="11" textAnchor="middle" fill="#374151">Renda mensal (R$)</text>
            {dados.pontosEquilibrio.map(valor => <line key={valor} x1={x(valor)} x2={x(valor)} y1={topo} y2={fundo} stroke="#92400e" strokeDasharray="3 4" strokeWidth="1.5" />)}
            <path d={linha("impostoPF")} fill="none" stroke="#132436" strokeWidth="2.5" />
            <path d={linha("impostoPJ")} fill="none" stroke="#CD371F" strokeWidth="2.5" strokeDasharray="7 4" />
            <line x1={x(selecionado.renda)} x2={x(selecionado.renda)} y1={topo} y2={fundo} stroke="#64748b" strokeDasharray="2 3" />
            <circle cx={x(selecionado.renda)} cy={y(selecionado.impostoPF)} r="4" fill="#132436" stroke="white" />
            <circle cx={x(selecionado.renda)} cy={y(selecionado.impostoPJ)} r="4" fill="#CD371F" stroke="white" />
          </g>
        </svg>
      </figure>
      <label htmlFor={`${id}-renda`} className="block mt-4 text-sm font-semibold">Explore a renda mensal</label>
      <input id={`${id}-renda`} type="range" min="0" max={dados.pontos.length - 1} step="1" value={indice}
        onChange={event => setIndice(Number(event.target.value))} aria-valuetext={moeda(selecionado.renda)}
        className="w-full my-3 accent-[#132436] rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#CD371F]" />
      <output htmlFor={`${id}-renda`} aria-live="polite" className="block rounded-xl border border-gray-300 p-3 text-sm leading-relaxed">
        Renda: <strong>{moeda(selecionado.renda)}</strong><br />
        PF: <strong>{moeda(selecionado.impostoPF)}</strong> · PJ: <strong>{moeda(selecionado.impostoPJ)}</strong><br />
        {vencedor}{Math.abs(diferenca) >= 0.005 && ` — diferença de ${moeda(Math.abs(diferenca))} por mês.`}
      </output>
      <p className="text-xs text-gray-700 mt-4 leading-relaxed">
        Projeção das regras usadas neste comparativo, mantendo os custos dedutíveis fixos e variando apenas a renda.
        A PJ inclui o INSS de 11% sobre o pró-labore estimado em 28% da renda, com piso de R$ 1.621,00.
        Não inclui honorários contábeis nem outros custos de abertura ou manutenção da empresa.
        Os valores são estimativas; o gráfico não representa lucro nem receita líquida.
      </p>
    </section>
  );
}
