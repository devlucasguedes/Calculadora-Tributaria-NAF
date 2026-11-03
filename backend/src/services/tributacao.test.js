const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularTributos, gerarPontoEquilibrio } = require('./tributacao');
const perto = (valor, esperado, margem = 1e-7) => assert.ok(Math.abs(valor - esperado) < margem, `${valor} != ${esperado}`);

test('preserva os valores do comparativo anterior para as três profissões', () => {
  for (const profissao of ['psicologo', 'arquiteto']) {
    const resultado = calcularTributos(10000, 1000, profissao);
    perto(resultado.impostoPF, 1566.27);
    perto(resultado.impostoPJ, 908);
    assert.equal(resultado.melhorOpcao, 'Pessoa Jurídica (PJ)');
    perto(resultado.economiaMensal, 658.27);
  }
  const advogado = calcularTributos(10000, 1000, 'advogado');
  perto(advogado.impostoPJ, 758);
  perto(advogado.economiaMensal, 808.27);
});
test('preserva isenção, deduções e piso do pró-labore', () => {
  const isento = calcularTributos(2000, 300, 'psicologo');
  assert.equal(isento.impostoPF, 0);
  perto(isento.impostoPJ, 298.31);
  const deducoes = calcularTributos(5000, 800, 'psicologo');
  perto(deducoes.impostoPF, 269.51);
  perto(deducoes.impostoPJ, 478.31);
  assert.equal(deducoes.melhorOpcao, 'Pessoa Física (PF)');
});
test('localiza o equilíbrio antes do piso variável do pró-labore', () => {
  const grafico = gerarPontoEquilibrio(10000, 0, 'psicologo');
  assert.equal(grafico.pontosEquilibrio.length, 1);
  perto(grafico.pontosEquilibrio[0], 5056);
  perto(grafico.faixasPJ[0].de, 5056);
  assert.equal(grafico.faixasPJ[0].ate, 15000);
  const equilibrio = calcularTributos(5056, 0, 'psicologo');
  perto(equilibrio.impostoPF, equilibrio.impostoPJ);
  assert.equal(calcularTributos(5055.99, 0, 'psicologo').melhorOpcao, 'Pessoa Física (PF)');
  assert.equal(calcularTributos(5056.01, 0, 'psicologo').melhorOpcao, 'Pessoa Jurídica (PJ)');
});
test('advogado tem ponto distinto e custos fixos deslocam o equilíbrio', () => {
  perto(gerarPontoEquilibrio(10000, 0, 'advogado').pontosEquilibrio[0], 4726.260869565217);
  const grafico = gerarPontoEquilibrio(10000, 1000, 'psicologo');
  perto(grafico.pontosEquilibrio[0], 6426.330076004343);
  const tributos = calcularTributos(grafico.pontosEquilibrio[0], 1000, 'psicologo');
  perto(tributos.impostoPF, tributos.impostoPJ);
});
test('não inventa ponto de equilíbrio quando a PJ não ganha no intervalo', () => {
  const grafico = gerarPontoEquilibrio(15000, 12000, 'psicologo');
  assert.deepEqual(grafico.faixasPJ, []);
  assert.deepEqual(grafico.pontosEquilibrio, []);
  assert.equal(grafico.rendaMaxima, 15000);
});
test('igualdade no teto não é classificada como faixa favorável à PJ', () => {
  const grafico = gerarPontoEquilibrio(15000, 6742.8, 'psicologo');
  assert.deepEqual(grafico.faixasPJ, []);
  assert.equal(grafico.pontosEquilibrio.length, 1);
  perto(grafico.pontosEquilibrio[0], 15000);
});
test('amostras e faixas coincidem com o cálculo do servidor em vários cenários', () => {
  for (const profissao of ['psicologo', 'arquiteto', 'advogado']) {
    for (const custos of [0, 800, 3500, 6742.79, 12000, 20000]) {
      const grafico = gerarPontoEquilibrio(4321.98, custos, profissao);
      assert.ok(grafico.pontos.some(p => p.renda === 4321.98));
      assert.equal(grafico.pontos[0].renda, 0);
      assert.equal(grafico.pontos.at(-1).renda, 15000);
      for (const ponto of grafico.pontos) {
        const calculo = calcularTributos(ponto.renda, custos, profissao);
        perto(ponto.impostoPF, calculo.impostoPF);
        perto(ponto.impostoPJ, calculo.impostoPJ);
      }
      for (let renda = 0.37; renda < 15000; renda += 17.13) {
        const calculo = calcularTributos(renda, custos, profissao);
        assert.equal(grafico.faixasPJ.some(f => renda > f.de && renda < f.ate), calculo.impostoPJ < calculo.impostoPF);
      }
    }
  }
});
test('não projeta profissões fora do comparativo nem entradas inválidas', () => {
  assert.equal(gerarPontoEquilibrio(10000, 0, 'medico'), null);
  assert.equal(gerarPontoEquilibrio(10000, 0, 'dentista'), null);
  assert.equal(gerarPontoEquilibrio(15000.01, 0, 'psicologo'), null);
  assert.equal(gerarPontoEquilibrio(NaN, 0, 'psicologo'), null);
  assert.equal(gerarPontoEquilibrio(10000, -1, 'psicologo'), null);
});
