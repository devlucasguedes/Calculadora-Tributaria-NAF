// Regras extraídas do controller existente. O resultado e o gráfico usam o
// mesmo modelo; este módulo não altera as hipóteses tributárias da aplicação.
const LIMITE_RENDA = 15000;
const SALARIO_MINIMO = 1621;
const LIMITES_IRPF = [2428.8, 2826.65, 3751.05, 4664.68];
const PROFISSOES_COMPARATIVO = ['psicologo', 'arquiteto', 'advogado'];

function calcularTributos(renda, custos, profissao) {
  const base = renda - custos;
  let impostoPF = 0;
  if (base > 4664.68) impostoPF = base * 0.275 - 908.73;
  else if (base > 3751.05) impostoPF = base * 0.225 - 675.49;
  else if (base > 2826.65) impostoPF = base * 0.15 - 394.16;
  else if (base > 2428.8) impostoPF = base * 0.075 - 182.16;
  impostoPF = Math.max(0, impostoPF);
  const simples = renda * (profissao.toLowerCase() === 'advogado' ? 0.045 : 0.06);
  const inss = Math.max(renda * 0.28, SALARIO_MINIMO) * 0.11;
  const impostoPJ = simples + inss;
  return {
    impostoPF,
    impostoPJ,
    economiaMensal: Math.abs(impostoPJ - impostoPF),
    melhorOpcao: impostoPJ < impostoPF ? 'Pessoa Jurídica (PJ)' : 'Pessoa Física (PF)',
  };
}

function gerarPontoEquilibrio(renda, custos, profissao) {
  if (!PROFISSOES_COMPARATIVO.includes(profissao.toLowerCase()) ||
      !Number.isFinite(renda) || renda < 0 || renda > LIMITE_RENDA ||
      !Number.isFinite(custos) || custos < 0) return null;

  const diferenca = valor => {
    const { impostoPF, impostoPJ } = calcularTributos(valor, custos, profissao);
    return impostoPF - impostoPJ;
  };
  const ordenar = valores => [...new Set(valores)].sort((a, b) => a - b);
  // Em cada intervalo as duas curvas são lineares. Incluímos todas as
  // mudanças de faixa, inclusive o piso do pró-labore, antes de buscar raízes.
  const quebras = ordenar([0, LIMITE_RENDA, SALARIO_MINIMO / 0.28,
    ...LIMITES_IRPF.map(limite => limite + custos)]
    .filter(valor => valor >= 0 && valor <= LIMITE_RENDA));
  const equilibrio = quebras.filter(valor => Math.abs(diferenca(valor)) < 1e-7);
  for (let i = 0; i < quebras.length - 1; i++) {
    const inicio = quebras[i], fim = quebras[i + 1];
    // Pontos internos evitam misturar as deduções de faixas vizinhas.
    const a = inicio + (fim - inicio) / 3, b = inicio + 2 * (fim - inicio) / 3;
    const inclinacao = (diferenca(b) - diferenca(a)) / (b - a);
    if (Math.abs(inclinacao) < 1e-10) continue;
    const raiz = a - diferenca(a) / inclinacao;
    if (raiz > inicio + 1e-7 && raiz < fim - 1e-7) equilibrio.push(raiz);
  }
  const pontosEquilibrio = ordenar(equilibrio);
  const intervalos = ordenar([...quebras, ...pontosEquilibrio]);
  const faixasPJ = [];
  for (let i = 0; i < intervalos.length - 1; i++) {
    const de = intervalos[i], ate = intervalos[i + 1];
    if (diferenca((de + ate) / 2) <= 0) continue;
    const anterior = faixasPJ.at(-1);
    if (anterior && anterior.ate === de) anterior.ate = ate;
    else faixasPJ.push({ de, ate });
  }
  const amostras = ordenar([
    ...Array.from({ length: 61 }, (_, indice) => indice * 250),
    ...quebras, ...pontosEquilibrio, renda,
  ]);
  return {
    rendaSimulada: renda, custosFixos: custos, profissao: profissao.toLowerCase(),
    rendaMinima: 0, rendaMaxima: LIMITE_RENDA, pontosEquilibrio, faixasPJ,
    pontos: amostras.map(valor => {
      const { impostoPF, impostoPJ } = calcularTributos(valor, custos, profissao);
      return { renda: valor, impostoPF, impostoPJ };
    }),
  };
}

module.exports = { calcularTributos, gerarPontoEquilibrio };
