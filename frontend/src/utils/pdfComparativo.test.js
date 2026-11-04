import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import { criarPdfComparativo } from './pdfComparativo.js';

const emissao = new Date('2026-11-04T02:59:30Z');
const exemplo = () => ({
  simulacao: { profissao: 'psicologo', faturamento: 7500, custos: 300 },
  pf: { base: 7200, faixa: '27,5%', parcelaDedutivel: 908.73, imposto: 1071.27 },
  pj: { simples: 450, aliquota: '6%', salarioBase: 2100, inss: 231, total: 681 },
  pontoEquilibrio: null,
});

// Lê os streams comprimidos do arquivo exportado, incluindo os comandos de texto.
// A inspeção visual e a extração completa com pypdf complementam estes testes.
function conteudoExportado(documento) {
  const pdf = Buffer.from(documento.output('arraybuffer')).toString('latin1');
  assert.ok(pdf.startsWith('%PDF-'));
  return [...pdf.matchAll(/\bstream\r?\n([\s\S]*?)\r?\nendstream/g)]
    .map(([, stream]) => inflateSync(Buffer.from(stream, 'latin1')).toString('latin1'))
    .join('\n').replaceAll('\\(', '(').replaceAll('\\)', ')');
}

test('exporta identificação, emissão em Fortaleza e memória com os valores da simulação', () => {
  const documento = criarPdfComparativo(exemplo(), emissao);
  const conteudo = conteudoExportado(documento);
  assert.equal(documento.getNumberOfPages(), 1);
  for (const trecho of [
    'NAF / Universidade Christus', '03/11/2026, 23:59:30', 'Fortaleza (UTC-3)',
    'Valores estimados', 'Gráfico comparativo PF × PJ', 'Base de cálculo', 'Alíquota',
    'IRPF (PF)', 'Simples (PJ)', 'INSS (PJ)', '27,5%', '11%', '6%',
    'R$ 7.500,00', 'R$ 300,00', 'R$ 7.200,00', 'R$ 908,73',
    'R$ 1.071,27', 'R$ 450,00', 'R$ 2.100,00', 'R$ 231,00', 'R$ 681,00', 'R$ 390,27',
  ]) assert.ok(conteudo.includes(trecho), trecho);
});

test('a projeção é uma segunda página e informa quando não há vantagem para PJ', () => {
  const resultado = exemplo();
  resultado.pontoEquilibrio = {
    rendaMinima: 0, rendaMaxima: 15000, faixasPJ: [], pontosEquilibrio: [],
    pontos: [{ renda: 0, impostoPF: 0, impostoPJ: 178.31 }, { renda: 15000, impostoPF: 0, impostoPJ: 1362 }],
  };
  const documento = criarPdfComparativo(resultado, emissao);
  const conteudo = conteudoExportado(documento);
  assert.equal(documento.getNumberOfPages(), 2);
  assert.ok(conteudo.includes('Ponto de equilíbrio: PF × PJ'));
  assert.ok(conteudo.includes('A PJ não apresenta menor custo'));
  assert.ok(conteudo.includes('Simulação selecionada: renda de R$ 7.500,00'));
  assert.equal(conteudo.split('Emissão:').length - 1, 2);
});

test('um empate em centavos não anuncia uma economia inexistente', () => {
  const resultado = exemplo();
  resultado.pf.imposto = 681.0000000001;
  const conteudo = conteudoExportado(criarPdfComparativo(resultado, emissao));
  assert.ok(conteudo.includes('Custos equivalentes nesta simulação'));
  assert.ok(!conteudo.includes('Diferença estimada:'));
});

test('valores ausentes ou não finitos impedem a emissão de um relatório inválido', () => {
  const resultado = exemplo();
  resultado.pj.total = NaN;
  assert.throws(() => criarPdfComparativo(resultado, emissao), /Calcule novamente/);
  resultado.pj.total = 681;
  resultado.simulacao.profissao = 'desconhecida';
  assert.throws(() => criarPdfComparativo(resultado, emissao), /Calcule novamente/);
});
