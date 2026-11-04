const FUSO = 'America/Fortaleza';
const formatoData = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO });
const formatoHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
const formatoNumero = new Intl.NumberFormat('pt-BR', {
  useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const profissoes = new Map([
  ['psicologo', 'Psicólogo(a)'], ['arquiteto', 'Arquiteto(a)'],
  ['advogado', 'Advogado(a)'], ['medico', 'Médico(a)'], ['dentista', 'Dentista'],
]);
const cabecalhos = [
  'Data da simulação', 'Hora (Fortaleza UTC-3)', 'Profissão', 'Faturamento bruto (R$)',
  'Custos dedutíveis (R$)', 'Imposto PF (R$)', 'Imposto PJ (R$)',
  'Melhor opção', 'Economia mensal (R$)',
];

function dataValida(valor) {
  const data = new Date(valor);
  if (!valor || !Number.isFinite(data.getTime())) {
    throw new Error('Há uma simulação com data inválida no histórico.');
  }
  return data;
}

export function formatarDataHistorico(valor) {
  return formatoData.format(dataValida(valor));
}

const entreAspas = valor => `"${valor.replaceAll('"', '""')}"`;

function celulaTexto(valor) {
  if (typeof valor !== 'string') throw new Error('Há uma simulação com texto inválido no histórico.');
  // Evita interpretar textos como fórmulas ao abrir a exportação em planilhas.
  // Aspas e separadores também são escapados para manter cada valor em sua célula.
  const suspeito = /^[=+\-@＝＋－＠]/u.test(valor.trimStart()) || /^[\t\r\n]/u.test(valor);
  return entreAspas(suspeito ? `'${valor}` : valor);
}

function celulaNumero(valor, opcional = false) {
  // Registros antigos podem não ter custos; ausência continua diferente de zero.
  if (opcional && valor == null) return '""';
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new Error('Há uma simulação com valor inválido no histórico.');
  }
  return entreAspas(formatoNumero.format(valor));
}

export function gerarCsvHistorico(calculos) {
  if (!Array.isArray(calculos) || calculos.length === 0) {
    throw new Error('Não há simulações para exportar.');
  }
  const linhas = calculos.map(item => {
    const data = dataValida(item.createdAt);
    return [
      celulaTexto(formatoData.format(data)),
      celulaTexto(formatoHora.format(data)),
      celulaTexto(profissoes.get(item.tipoProfissao) ?? item.tipoProfissao),
      celulaNumero(item.faturamento),
      celulaNumero(item.custos, true),
      celulaNumero(item.impostoPF),
      celulaNumero(item.impostoPJ),
      celulaTexto(item.melhorOpcao),
      celulaNumero(item.economiaMensal),
    ].join(';');
  });
  // UTF-8 com BOM preserva os acentos no Excel; ";" e vírgula decimal seguem pt-BR.
  return '\uFEFF' + [cabecalhos.map(celulaTexto).join(';'), ...linhas].join('\r\n') + '\r\n';
}

export function baixarHistoricoCsv(calculos, emitidoEm = new Date()) {
  const conteudo = gerarCsvHistorico(calculos);
  const data = formatarDataHistorico(emitidoEm).split('/').reverse().join('-');
  const arquivo = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  try {
    link.href = url;
    link.download = `Historico_Simulacoes_NAF_${data}.csv`;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    // Dá tempo ao navegador para iniciar a leitura antes de liberar o arquivo.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
