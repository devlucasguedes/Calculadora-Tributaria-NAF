// LC 123/2006, Anexos III e V. Acima de R$ 3,6 milhões, o tratamento
// do sublimite do ISS exige informações que esta simulação não coleta.
const FAIXAS = [
  { limite: 180000, III: [600, 0], V: [1550, 0] },
  { limite: 360000, III: [1120, 9360], V: [1800, 4500] },
  { limite: 720000, III: [1350, 17640], V: [1950, 9900] },
  { limite: 1800000, III: [1600, 35640], V: [2050, 17100] },
  { limite: 3600000, III: [2100, 125640], V: [2300, 62100] },
];

function lerCentavos(valor, campo) {
  const texto = String(valor ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
    throw new Error(`${campo}: informe um valor não negativo com até duas casas decimais. Use 0 se não houver movimento.`);
  }

  const [inteiros, decimais = ""] = texto.split(".");
  const centavos = Number(inteiros) * 100 + Number(decimais.padEnd(2, "0"));
  if (!Number.isSafeInteger(centavos * 100)) {
    throw new Error(`${campo}: o valor ultrapassa o limite suportado.`);
  }
  return centavos;
}

/**
 * Receita do mês de apuração e movimento real dos 12 meses anteriores.
 * O mês de apuração não integra o histórico usado no Fator R/RBT12.
 * Não contempla início de atividade, receitas segregadas ou retenções.
 */
export function calcularFatorR({ faturamentoMensal, historico }) {
  const rendaCentavos = lerCentavos(faturamentoMensal, "Faturamento do mês de apuração");
  if (rendaCentavos <= 0 || rendaCentavos > 1500000) {
    throw new Error("O faturamento do mês de apuração deve ser maior que zero e de até R$ 15.000,00.");
  }
  if (!Array.isArray(historico) || historico.length !== 12) {
    throw new Error("Informe a receita e a folha de cada um dos 12 meses anteriores ao mês de apuração.");
  }

  let receita12Centavos = 0;
  let folha12Centavos = 0;
  for (const [indice, mes] of historico.entries()) {
    receita12Centavos += lerCentavos(mes?.receita, `Receita do ${indice + 1}º mês anterior`);
    folha12Centavos += lerCentavos(mes?.folha, `Folha do ${indice + 1}º mês anterior`);
    if (!Number.isSafeInteger(receita12Centavos * 100) || !Number.isSafeInteger(folha12Centavos * 100)) {
      throw new Error("Os totais dos 12 meses ultrapassam o limite suportado.");
    }
  }

  if (receita12Centavos === 0) {
    throw new Error("Esta simulação exige receita acumulada maior que zero nos 12 meses anteriores. Empresas sem receita nesse período não estão contempladas.");
  }
  const indiceFaixa = FAIXAS.findIndex(({ limite }) => receita12Centavos <= limite * 100);
  if (indiceFaixa === -1) {
    throw new Error("Receita acumulada acima de R$ 3.600.000,00 exige avaliar o sublimite do ISS, não contemplado nesta simulação.");
  }

  // Resolução CGSN 140/2018, art. 26, § 7º, IV: FS12 = 0 e RBT12 > 0.
  const folhaZerada = folha12Centavos === 0;
  const fatorR = folhaZerada ? 0.01 : folha12Centavos / receita12Centavos;
  // A decisão usa centavos inteiros, antes de qualquer arredondamento visual.
  const anexo = folha12Centavos * 100 >= receita12Centavos * 28 ? "III" : "V";
  const [aliquotaPontosBase, parcelaDeduzir] = FAIXAS[indiceFaixa][anexo];

  // Alíquota efetiva = (RBT12 × alíquota nominal − dedução) / RBT12.
  // Mantém a fração exata até arredondar o imposto mensal para centavos.
  const numerador = BigInt(receita12Centavos) * BigInt(aliquotaPontosBase)
    - BigInt(parcelaDeduzir * 100) * 10000n;
  const denominador = BigInt(receita12Centavos) * 10000n;
  const impostoCentavos = (BigInt(rendaCentavos) * numerador + denominador / 2n) / denominador;

  return {
    receita12Meses: receita12Centavos / 100,
    folha12Meses: folha12Centavos / 100,
    fatorR,
    anexo,
    faixa: indiceFaixa + 1,
    aliquotaNominal: aliquotaPontosBase / 10000,
    aliquotaEfetiva: Number(numerador) / Number(denominador),
    parcelaDeduzir,
    simples: Number(impostoCentavos) / 100,
    folhaZerada,
  };
}

/**
 * Cenário hipotético: repete receita e folha mensais por 12 meses.
 * Não substitui o histórico real nem as regras de início de atividade.
 */
export function preverFatorR({ faturamentoMensal, folhaMensal }) {
  const rendaCentavos = lerCentavos(faturamentoMensal, "Faturamento mensal previsto");
  if (rendaCentavos <= 0 || rendaCentavos > 1500000) {
    throw new Error("O faturamento mensal previsto deve ser maior que zero e de até R$ 15.000,00.");
  }
  const folhaCentavos = lerCentavos(folhaMensal, "Folha / pró-labore mensal previsto");
  const resultado = calcularFatorR({
    faturamentoMensal,
    historico: Array.from({ length: 12 }, () => ({
      receita: faturamentoMensal, folha: folhaMensal,
    })),
  });
  return {
    ...resultado,
    modo: "previsao",
    faturamentoMensal: rendaCentavos / 100,
    folhaMensal: folhaCentavos / 100,
    // Arredonda para cima: um centavo abaixo pode manter o Fator R inferior a 28%.
    folhaMensalReferencia28: Math.ceil(rendaCentavos * 28 / 100) / 100,
  };
}
