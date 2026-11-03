import { jsPDF } from 'jspdf';

const CORES = {
  azul: '#132436', vermelho: '#CD371F', texto: '#374151',
  cinza: '#E2E8F0', fundo: '#F1F5F9', verde: '#DCFCE7',
};
const PROFISSOES = { psicologo: 'Psicólogo(a)', arquiteto: 'Arquiteto(a)', advogado: 'Advogado(a)' };
const moeda = valor => valor.toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL',
}).replaceAll('\u00a0', ' ');
const numero = valor => valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const MARGEM = 16;
const DIREITA = 194;
const LARGURA = DIREITA - MARGEM;

// O relatório recebe uma cópia dos dados da simulação concluída. Não refaz
// a tributação nem depende do tamanho da tela ou da posição do controle do gráfico.
export function criarPdfComparativo(resultado, emitidoEm = new Date()) {
  const { simulacao, pf, pj, pontoEquilibrio } = resultado;
  const profissao = PROFISSOES[simulacao?.profissao];
  if (!profissao || ![simulacao.faturamento, simulacao.custos, pf.base,
    pf.parcelaDedutivel, pf.imposto, pj.simples, pj.salarioBase, pj.inss, pj.total]
    .every(Number.isFinite)) {
    throw new Error('Os dados da simulação estão incompletos. Calcule novamente.');
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true, putOnlyUsedFonts: true });
  doc.setProperties({
    title: `Comparativo tributário - ${profissao}`,
    author: 'NAF / Universidade Christus',
    subject: 'Estimativa de tributos de Pessoa Física e Pessoa Jurídica',
    creator: 'Calculadora Tributária NAF',
  });
  doc.setCreationDate(emitidoEm);
  doc.setLanguage('pt-BR');
  const dataHora = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza', dateStyle: 'short', timeStyle: 'medium',
  }).format(emitidoEm);

  const texto = (conteudo, x, y, tamanho = 10, cor = CORES.texto, negrito = false, opcoes = {}) => {
    doc.setFont('helvetica', negrito ? 'bold' : 'normal');
    doc.setFontSize(tamanho);
    doc.setTextColor(cor);
    doc.text(String(conteudo), x, y, opcoes);
  };
  const paragrafo = (conteudo, x, y, largura = LARGURA, tamanho = 9) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(tamanho);
    const linhas = doc.splitTextToSize(conteudo, largura);
    doc.setTextColor(CORES.texto);
    doc.text(linhas, x, y, { lineHeightFactor: 1.35 });
    return y + linhas.length * tamanho * 0.3528 * 1.35;
  };
  const linha = (y) => {
    doc.setDrawColor(CORES.cinza);
    doc.setLineWidth(0.25);
    doc.line(MARGEM, y, DIREITA, y);
  };
  const cabecalho = () => {
    texto('NAF / Universidade Christus', MARGEM, 17, 14, CORES.azul, true);
    texto('Núcleo de Apoio Contábil e Fiscal', MARGEM, 23, 9);
    texto(`Emissão: ${dataHora} | Fortaleza (UTC-3)`, MARGEM, 30, 9);
    linha(35);
  };
  const secao = (titulo, y) => texto(titulo, MARGEM, y, 12, CORES.azul, true);

  cabecalho();
  texto('Comparativo tributário', MARGEM, 46, 21, CORES.azul, true);
  texto('Valores estimados. Esta simulação não substitui orientação contábil.', MARGEM, 54, 9);

  const dados = [
    ['Profissão', profissao],
    ['Receita bruta mensal', moeda(simulacao.faturamento)],
    ['Custos dedutíveis mensais', moeda(simulacao.custos)],
  ];
  dados.forEach(([rotulo, valor], indice) => {
    const x = MARGEM + indice * 61;
    doc.setFillColor(CORES.fundo);
    doc.roundedRect(x, 61, 56, 20, 2, 2, 'F');
    texto(rotulo, x + 3, 67, 8);
    // Reduz apenas números muito longos, sem cortar os dados informados.
    doc.setFontSize(11);
    const tamanho = Math.min(11, 11 * 50 / Math.max(1, doc.getTextWidth(valor)));
    texto(valor, x + 3, 75, tamanho, CORES.azul, true);
  });

  const diferenca = pf.imposto - pj.total;
  const equivalente = Math.abs(diferenca) < 0.005;
  texto(equivalente ? 'Custos equivalentes nesta simulação'
    : `${diferenca > 0 ? 'Pessoa Jurídica (PJ)' : 'Pessoa Física (PF)'} apresenta menor custo estimado`,
  MARGEM, 92, 12, CORES.azul, true);
  texto(equivalente ? 'Não há diferença mensal em centavos.'
    : `Diferença estimada: ${moeda(Math.abs(diferenca))} por mês.`,
  MARGEM, 99, 10);

  secao('01  Gráfico comparativo PF × PJ', 112);
  const teto = Math.max(pf.imposto, pj.total, 1);
  [[pf.imposto, 'PF - IRPF', CORES.azul], [pj.total, 'PJ - Simples Nacional + INSS', CORES.vermelho]]
    .forEach(([valor, rotulo, cor], indice) => {
      const y = 121 + indice * 18;
      texto(rotulo, MARGEM, y, 9, CORES.texto, true);
      texto(moeda(valor), DIREITA, y, 10, cor, true, { align: 'right' });
      doc.setFillColor(CORES.fundo);
      doc.rect(MARGEM, y + 3, LARGURA, 7, 'F');
      doc.setFillColor(cor);
      if (valor > 0) doc.rect(MARGEM, y + 3, LARGURA * valor / teto, 7, 'F');
    });
  texto('Tributos mensais em R$; barras na mesma escala, iniciadas em zero.', MARGEM, 155, 8);

  secao('02  Memória de cálculo', 168);
  const colunas = [16, 57, 99, 126, 159];
  doc.setFillColor(CORES.azul);
  doc.rect(MARGEM, 174, LARGURA, 10, 'F');
  ['Tributo', 'Base de cálculo', 'Alíquota', 'Dedução', 'Valor mensal'].forEach((titulo, indice) => {
    texto(titulo, colunas[indice] + 3, 180.5, 8, '#FFFFFF', true);
  });
  const linhas = [
    ['IRPF (PF)', moeda(Math.max(0, pf.base)), pf.faixa === 'Isento' ? '0% (isento)' : pf.faixa,
      moeda(pf.parcelaDedutivel), moeda(pf.imposto),
      'IRPF = máximo entre zero e (base × alíquota - dedução da faixa).'],
    ['Simples (PJ)', moeda(simulacao.faturamento), pj.aliquota, moeda(0), moeda(pj.simples),
      'Simples Nacional = receita bruta mensal × alíquota aplicada no comparativo.'],
    ['INSS (PJ)', moeda(pj.salarioBase), '11%', moeda(0), moeda(pj.inss),
      'INSS = pró-labore estimado × 11%.'],
  ];
  linhas.forEach((valores, indice) => {
    const y = 184 + indice * 21;
    doc.setFillColor(indice % 2 === 0 ? CORES.fundo : '#FFFFFF');
    doc.rect(MARGEM, y, LARGURA, 21, 'F');
    valores.slice(0, 5).forEach((valor, coluna) => {
      texto(valor, colunas[coluna] + 3, y + 7, 9, CORES.azul, coluna === 0 || coluna === 4);
    });
    texto(valores[5], MARGEM + 3, y + 15, 8);
  });
  texto(`Total PF: ${moeda(pf.imposto)}`, MARGEM, 256, 11, CORES.azul, true);
  texto(`Total PJ: ${moeda(pj.total)}`, DIREITA, 256, 11, CORES.vermelho, true, { align: 'right' });
  paragrafo('Base do IRPF = receita bruta - custos dedutíveis, limitada a zero. '
    + 'Pró-labore estimado = maior valor entre 28% da receita e R$ 1.621,00. '
    + 'Total PJ = Simples + INSS. Valores exibidos arredondados para centavos.',
  MARGEM, 265, LARGURA, 8);

  if (pontoEquilibrio?.pontos?.length > 1) {
    doc.addPage();
    cabecalho();
    texto('Ponto de equilíbrio: PF × PJ', MARGEM, 46, 19, CORES.azul, true);
    paragrafo(`Projeção para ${profissao}, mantendo custos dedutíveis de ${moeda(simulacao.custos)} por mês.`,
      MARGEM, 54);

    const { pontos, rendaMinima, rendaMaxima, faixasPJ, pontosEquilibrio } = pontoEquilibrio;
    const esquerda = 32, direita = DIREITA, topo = 84, fundo = 166;
    const maximo = Math.max(500, Math.ceil(Math.max(...pontos.flatMap(p => [p.impostoPF, p.impostoPJ])) * 1.1 / 500) * 500);
    const x = renda => esquerda + (renda - rendaMinima) / (rendaMaxima - rendaMinima) * (direita - esquerda);
    const y = valor => fundo - valor / maximo * (fundo - topo);

    doc.setDrawColor(CORES.azul); doc.setLineWidth(0.7); doc.line(16, 67, 24, 67);
    texto('PF: IRPF', 27, 68, 8);
    doc.setDrawColor(CORES.vermelho); doc.setLineDashPattern([2, 1], 0); doc.line(61, 67, 69, 67);
    texto('PJ: Simples + INSS', 72, 68, 8); doc.setLineDashPattern([], 0);
    doc.setFillColor(CORES.verde); doc.rect(126, 64, 4, 4, 'F');
    texto('Faixa favorável à PJ', 133, 68, 8);
    texto('Tributos mensais (R$)', esquerda, 79, 9);

    faixasPJ.forEach(faixa => {
      doc.setFillColor(CORES.verde);
      doc.rect(x(faixa.de), topo, x(faixa.ate) - x(faixa.de), fundo - topo, 'F');
    });
    for (let i = 0; i <= 4; i++) {
      const valor = maximo * i / 4;
      doc.setDrawColor(CORES.cinza); doc.setLineWidth(0.25);
      doc.line(esquerda, y(valor), direita, y(valor));
      texto(numero(valor), esquerda - 3, y(valor) + 1, 8, CORES.texto, false, { align: 'right' });
    }
    for (let i = 0; i <= 5; i++) {
      const valor = rendaMinima + (rendaMaxima - rendaMinima) * i / 5;
      texto(numero(valor), x(valor), fundo + 6, 8, CORES.texto, false, {
        align: i === 0 ? 'left' : i === 5 ? 'right' : 'center',
      });
    }
    texto('Renda mensal (R$)', (esquerda + direita) / 2, fundo + 13, 9, CORES.texto, false, { align: 'center' });
    pontosEquilibrio.forEach(valor => {
      doc.setDrawColor('#92400E'); doc.setLineWidth(0.4); doc.setLineDashPattern([1, 1], 0);
      doc.line(x(valor), topo, x(valor), fundo);
    });
    [['impostoPF', CORES.azul, []], ['impostoPJ', CORES.vermelho, [2, 1]]]
      .forEach(([campo, cor, tracejado]) => {
        doc.setDrawColor(cor); doc.setLineWidth(0.7); doc.setLineDashPattern(tracejado, 0);
        doc.lines(pontos.slice(1).map((ponto, indice) => [
          x(ponto.renda) - x(pontos[indice].renda), y(ponto[campo]) - y(pontos[indice][campo]),
        ]), x(pontos[0].renda), y(pontos[0][campo]));
      });
    doc.setLineDashPattern([], 0);

    let proximaLinha = paragrafo(faixasPJ.length
      ? `PJ com menor custo nas rendas aproximadamente entre ${faixasPJ.map(f => `${moeda(f.de)} e ${moeda(f.ate)}`).join('; ')} por mês.`
      : `A PJ não apresenta menor custo entre ${moeda(rendaMinima)} e ${moeda(rendaMaxima)} por mês.`,
    MARGEM, 192);
    if (pontosEquilibrio.length) {
      proximaLinha = paragrafo(`Equilíbrio estimado: ${pontosEquilibrio.map(moeda).join('; ')} de renda mensal. Nesse ponto, os custos se igualam.`,
        MARGEM, proximaLinha + 3);
    }
    paragrafo(`Simulação selecionada: renda de ${moeda(simulacao.faturamento)}; PF de ${moeda(pf.imposto)} e PJ de ${moeda(pj.total)} por mês.`,
      MARGEM, proximaLinha + 4);
    linha(235);
    texto('Hipóteses e limites da estimativa', MARGEM, 244, 11, CORES.azul, true);
    paragrafo('O gráfico varia apenas a renda e usa as mesmas regras do comparativo. '
      + 'Não inclui honorários contábeis nem outros custos de abertura ou manutenção da empresa. '
      + 'Representa tributos estimados, não lucro ou receita líquida. '
      + 'Não contempla o simulador separado de Fator R para médicos e dentistas.',
    MARGEM, 252, LARGURA, 9);
  }

  for (let pagina = 1; pagina <= doc.getNumberOfPages(); pagina++) {
    doc.setPage(pagina);
    linha(282);
    texto('NAF / Universidade Christus | Valores estimados', MARGEM, 288, 8);
    texto(`${pagina} / ${doc.getNumberOfPages()}`, DIREITA, 288, 8, CORES.texto, false, { align: 'right' });
  }
  return doc;
}
