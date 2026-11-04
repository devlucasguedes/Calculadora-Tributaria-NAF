import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerarCsvHistorico, formatarDataHistorico } from './csvHistorico.js';

const exemplo = (alteracoes = {}) => ({
  id: 'id-interno', userId: 'conta-interna', createdAt: '2026-11-04T02:15:09Z',
  tipoProfissao: 'psicologo', faturamento: 7500, custos: 300,
  impostoPF: 1071.2700000000002, impostoPJ: 681,
  melhorOpcao: 'Pessoa Jurídica (PJ)', economiaMensal: 390.2700000000002,
  ...alteracoes,
});

test('exporta CSV com BOM, nove colunas, valores numéricos em pt-BR e horário de Fortaleza', () => {
  const csv = gerarCsvHistorico([exemplo()]);
  assert.ok(csv.startsWith('\uFEFF"Data da simulação";"Hora (Fortaleza UTC-3)";"Profissão";'));
  assert.equal(csv.split('\r\n')[1],
    '"03/11/2026";"23:15:09";"Psicólogo(a)";"7500,00";"300,00";"1071,27";"681,00";"Pessoa Jurídica (PJ)";"390,27"');
  assert.ok(csv.endsWith('\r\n'));
  assert.equal(formatarDataHistorico('2026-11-04T02:15:09Z'), '03/11/2026');
});

test('preserva todos os registros e sua ordem, sem exportar campos internos ou dados de login', () => {
  const csv = gerarCsvHistorico([
    exemplo({ tipoProfissao: 'advogado', email: 'email-privado', password: 'senha-privada' }),
    exemplo({ tipoProfissao: 'arquiteto' }),
  ]);
  assert.equal(csv.split('\r\n').length, 4);
  assert.ok(csv.indexOf('Advogado(a)') < csv.indexOf('Arquiteto(a)'));
  for (const privado of ['id-interno', 'conta-interna', 'email-privado', 'senha-privada']) {
    assert.ok(!csv.includes(privado));
  }
});

test('preserva zero numérico e diferencia custos não informados em registros antigos', () => {
  const csv = gerarCsvHistorico([
    exemplo({ custos: 0, impostoPF: 0 }),
    exemplo({ custos: null }),
    exemplo({ custos: undefined }),
  ]);
  const linhas = csv.split('\r\n');
  assert.ok(linhas[1].includes(';"7500,00";"0,00";"0,00";'));
  assert.ok(linhas[2].includes(';"7500,00";"";"1071,27";'));
  assert.ok(linhas[3].includes(';"7500,00";"";"1071,27";'));
});

test('escapa aspas, separadores e quebras de linha dentro de um único campo', () => {
  const csv = gerarCsvHistorico([exemplo({
    tipoProfissao: 'Profissão; "especial"\r\nsegunda linha',
  })]);
  assert.ok(csv.includes(';"Profissão; ""especial""\r\nsegunda linha";'));
});

test('protege campos de texto iniciados por fórmulas sem transformar números negativos em texto', () => {
  for (const entrada of ['=1+1', '+SUM(1;2)', '-1+1', '@SUM(1;2)', ' =1+1', '\t=1+1', '\r=1', '\n=1', '＝1+1', '＋1', '－1', '＠SUM(1)']) {
    const csv = gerarCsvHistorico([exemplo({ tipoProfissao: entrada, melhorOpcao: entrada, custos: -10 })]);
    assert.equal(csv.split(`"'${entrada}"`).length - 1, 2, entrada);
    assert.ok(csv.includes(';"-10,00";'));
  }
});

test('não transforma valores inválidos ou datas ausentes em zeros ou datas fictícias', () => {
  for (const campo of ['faturamento', 'impostoPF', 'impostoPJ', 'economiaMensal']) {
    for (const valor of [null, undefined, NaN, Infinity, '100']) {
      assert.throws(() => gerarCsvHistorico([exemplo({ [campo]: valor })]), /valor inválido/);
    }
  }
  for (const createdAt of [null, undefined, '', 'não é data']) {
    assert.throws(() => gerarCsvHistorico([exemplo({ createdAt })]), /data inválida/);
  }
});

test('histórico vazio ou inválido não produz um arquivo com apenas cabeçalho', () => {
  for (const historico of [[], null, undefined, {}]) {
    assert.throws(() => gerarCsvHistorico(historico), /Não há simulações/);
  }
});
