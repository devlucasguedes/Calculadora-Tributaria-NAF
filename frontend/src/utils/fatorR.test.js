import test from "node:test";
import assert from "node:assert/strict";
import { calcularFatorR, preverFatorR } from "./fatorR.js";

function historicoConstante(receita = "10000", folha = "2800") {
  return Array.from({ length: 12 }, () => ({ receita, folha }));
}

function calcular(historico, faturamentoMensal = "10000") {
  return calcularFatorR({ faturamentoMensal, historico });
}

test("soma o histórico variável, sem projetar o último mês ou o faturamento atual", () => {
  const historico = historicoConstante("10000", "2000");
  historico[0].folha = "3000";
  historico[1].folha = "1000";
  const resultado = calcular(historico);
  assert.equal(resultado.receita12Meses, 120000);
  assert.equal(resultado.folha12Meses, 24000);
  assert.equal(resultado.fatorR, 0.2);
  assert.equal(resultado.anexo, "V");
  assert.equal(resultado.simples, 1550);

  const outroFaturamentoAtual = calcular(historico, "5000");
  assert.equal(outroFaturamentoAtual.fatorR, resultado.fatorR);
  assert.equal(outroFaturamentoAtual.receita12Meses, resultado.receita12Meses);
  assert.equal(outroFaturamentoAtual.simples, 775);
});

for (const [folhaPrimeiroMes, anexo] of [["2799.99", "V"], ["2800", "III"], ["2800.01", "III"]]) {
  test(`limite de 28%: folha de ${folhaPrimeiroMes} no primeiro mês aplica ${anexo}`, () => {
    const historico = historicoConstante();
    historico[0].folha = folhaPrimeiroMes;
    const resultado = calcular(historico);
    assert.equal(resultado.anexo, anexo);
    if (folhaPrimeiroMes === "2800") assert.equal(resultado.fatorR, 0.28);
    if (folhaPrimeiroMes === "2799.99") assert(resultado.fatorR < 0.28);
  });
}

test("receitas e folhas variáveis são somadas antes da divisão", () => {
  const historico = historicoConstante("0", "0");
  historico[0] = { receita: "90000", folha: "18000" };
  historico[1] = { receita: "10000", folha: "10000" };
  const resultado = calcular(historico);
  assert.equal(resultado.fatorR, 0.28);
  assert.equal(resultado.anexo, "III");
});

test("folha acumulada zero usa Fator R regulamentar de 1%", () => {
  const resultado = calcular(historicoConstante("10000", "0"));
  assert.equal(resultado.fatorR, 0.01);
  assert.equal(resultado.anexo, "V");
  assert.equal(resultado.folhaZerada, true);
});

test("folha zero em apenas um mês não substitui a razão acumulada por 1%", () => {
  const historico = historicoConstante("10000", "3000");
  historico[0].folha = "0";
  const resultado = calcular(historico);
  assert.equal(resultado.fatorR, 0.275);
  assert.equal(resultado.folhaZerada, false);
});

for (const [folha, anexo, imposto, efetiva] of [["5600", "III", 730, 0.073], ["3000", "V", 1612.5, 0.16125]]) {
  test(`usa RBT12 de R$ 240 mil para a alíquota efetiva do Anexo ${anexo}`, () => {
    const resultado = calcular(historicoConstante("20000", folha));
    assert.equal(resultado.anexo, anexo);
    assert.equal(resultado.faixa, 2);
    assert.equal(resultado.aliquotaEfetiva, efetiva);
    assert.equal(resultado.simples, imposto);
  });
}

// Valores nos tetos de cada faixa, calculados pelas tabelas dos anexos.
for (const [receitaMensal, faixa, impostoIII, impostoV] of [
  ["15000", 1, 600, 1550],
  ["30000", 2, 860, 1675],
  ["60000", 3, 1105, 1812.5],
  ["150000", 4, 1402, 1955],
  ["300000", 5, 1751, 2127.5],
]) {
  test(`tetos da ${faixa}ª faixa dos Anexos III e V`, () => {
    const resultadoIII = calcular(historicoConstante(receitaMensal, receitaMensal));
    const resultadoV = calcular(historicoConstante(receitaMensal, "0"));
    assert.equal(resultadoIII.faixa, faixa);
    assert.equal(resultadoV.faixa, faixa);
    assert.equal(resultadoIII.simples, impostoIII);
    assert.equal(resultadoV.simples, impostoV);
    if (faixa < 5) {
      const historico = historicoConstante(receitaMensal, "0");
      historico[0].receita = `${receitaMensal}.01`;
      assert.equal(calcular(historico).faixa, faixa + 1);
    }
  });
}

test("arredonda somente o imposto final em centavos", () => {
  assert.equal(calcular(historicoConstante(), "0.25").simples, 0.02);
  assert.equal(calcular(historicoConstante("20000", "0"), "0.04").simples, 0.01);
});

test("exige 12 meses preenchidos, sem assumir zero para campos vazios", () => {
  assert.throws(() => calcular([]), /12 meses/);
  assert.throws(() => calcular(historicoConstante().slice(0, 11)), /12 meses/);
  assert.throws(() => calcular([...historicoConstante(), { receita: "0", folha: "0" }]), /12 meses/);
  assert.throws(() => calcular(null), /12 meses/);
  const historico = historicoConstante();
  historico[5].folha = "";
  assert.throws(() => calcular(historico), /Folha do 6º mês anterior/);
  historico[5] = null;
  assert.throws(() => calcular(historico), /Receita do 6º mês anterior/);
});

test("rejeita valores inválidos de receita ou folha", () => {
  for (const valor of ["", "-1", "1.001", "1e4", "Infinity", "1,50", null, undefined]) {
    for (const campo of ["receita", "folha"]) {
      const historico = historicoConstante();
      historico[0][campo] = valor;
      assert.throws(() => calcular(historico), /informe um valor não negativo/);
    }
  }
});

test("mantém o limite do faturamento mensal e recusa históricos fora do escopo", () => {
  for (const renda of ["0", "15000.01", "-1", "", "1.001"]) {
    assert.throws(() => calcular(historicoConstante(), renda));
  }
  assert.throws(() => calcular(historicoConstante("0", "0")), /receita acumulada maior que zero/);
  assert.throws(() => calcular(historicoConstante("300000.01", "0")), /sublimite do ISS/);
  const historico = historicoConstante();
  historico[0].folha = "99999999999999";
  assert.throws(() => calcular(historico), /limite suportado/);
  assert.throws(() => calcular(historicoConstante("10000", "100000000000")), /totais dos 12 meses/);
});

test("previsão de R$ 8 mil com folha de R$ 2.240 projeta 28% e R$ 480 no Anexo III", () => {
  const resultado = preverFatorR({ faturamentoMensal: "8000", folhaMensal: "2240" });
  assert.equal(resultado.modo, "previsao");
  assert.equal(resultado.receita12Meses, 96000);
  assert.equal(resultado.folha12Meses, 26880);
  assert.equal(resultado.fatorR, 0.28);
  assert.equal(resultado.anexo, "III");
  assert.equal(resultado.simples, 480);
  assert.equal(resultado.folhaMensalReferencia28, 2240);
});

for (const [folhaMensal, anexo, fatorR, simples] of [
  ["2000", "V", 0.25, 1240],
  ["2239.99", "V", 2239.99 / 8000, 1240],
  ["2240.01", "III", 2240.01 / 8000, 480],
  ["0", "V", 0.01, 1240],
]) {
  test(`previsão com receita de R$ 8 mil e folha de ${folhaMensal} usa Anexo ${anexo}`, () => {
    const resultado = preverFatorR({ faturamentoMensal: "8000", folhaMensal });
    assert.equal(resultado.anexo, anexo);
    assert.ok(Math.abs(resultado.fatorR - fatorR) < 1e-12);
    assert.equal(resultado.simples, simples);
    assert.equal(resultado.folhaZerada, folhaMensal === "0");
  });
}

test("previsão não aceita somente renda nem trata folha vazia como zero", () => {
  for (const folhaMensal of [undefined, null, "", "-1", "1.001", "1e3", "1,50", Infinity]) {
    assert.throws(() => preverFatorR({ faturamentoMensal: "8000", folhaMensal }), /Folha \/ pró-labore/);
  }
  for (const faturamentoMensal of [undefined, null, "", "0", "15000.01", "-1", "1.001"]) {
    assert.throws(() => preverFatorR({ faturamentoMensal, folhaMensal: "2240" }), /faturamento/i);
  }
});

test("referência de folha é arredondada para cima para realmente atingir 28%", () => {
  const abaixo = preverFatorR({ faturamentoMensal: "8000.01", folhaMensal: "2240" });
  assert.equal(abaixo.folhaMensalReferencia28, 2240.01);
  assert.equal(abaixo.anexo, "V");
  const limite = preverFatorR({ faturamentoMensal: "8000.01", folhaMensal: "2240.01" });
  assert.equal(limite.anexo, "III");
  assert.equal(preverFatorR({ faturamentoMensal: "0.01", folhaMensal: "0" }).folhaMensalReferencia28, 0.01);
});

test("previsão mantém os limites, o arredondamento e a regra histórica independente", () => {
  assert.equal(preverFatorR({ faturamentoMensal: "15000", folhaMensal: "4200" }).simples, 900);
  assert.equal(preverFatorR({ faturamentoMensal: "0.25", folhaMensal: "0.07" }).simples, 0.02);
  assert.throws(() => preverFatorR({ faturamentoMensal: "8000", folhaMensal: "100000000000" }), /totais dos 12 meses/);
  const historico = historicoConstante("10000", "2000");
  historico[0].folha = "3000";
  historico[1].folha = "1000";
  const real = calcularFatorR({ faturamentoMensal: "8000", historico });
  assert.equal(real.fatorR, 0.2);
  assert.equal(real.anexo, "V");
  assert.equal(real.modo, undefined);
  assert.throws(() => calcularFatorR({ faturamentoMensal: "8000", historico: [] }), /12 meses/);
});
