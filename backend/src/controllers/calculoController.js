const prisma = require('../config/prisma');
const { calcularTributos, gerarPontoEquilibrio } = require('../services/tributacao');

const calculoController = {
  create: async (req, res) => {
    try {
      const { tipoProfissao, faturamento, custos } = req.body;
      const userId = req.userId;

      if (!tipoProfissao || faturamento === undefined) {
        return res.status(400).json({ error: "Profissão e Faturamento são obrigatórios." });
      }

      const rendaNum = parseFloat(faturamento);
      const custosNum = custos ? parseFloat(custos) : 0;

      const { impostoPF, impostoPJ, melhorOpcao, economiaMensal } =
        calcularTributos(rendaNum, custosNum, tipoProfissao);
      const pontoEquilibrio = gerarPontoEquilibrio(rendaNum, custosNum, tipoProfissao);

      const novoCalculo = await prisma.calculo.create({
        data: {
          userId,
          tipoProfissao,
          faturamento: rendaNum,
          custos: custosNum,
          impostoPF,
          impostoPJ,
          melhorOpcao,
          economiaMensal
        }
      });

      return res.status(201).json({
        message: "Cálculo simulado e salvo com sucesso!",
        calculo: novoCalculo,
        pontoEquilibrio
      });

    } catch (error) {
      console.error("Erro ao processar cálculo:", error);
      return res.status(500).json({ error: "Erro interno do servidor ao processar o cálculo tributário." });
    }
  },

  history: async (req, res) => {
    try {
      const userId = req.userId;

      const historico = await prisma.calculo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(historico);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return res.status(500).json({ error: "Erro interno ao buscar o histórico de cálculos." });
    }
  }
};

module.exports = calculoController;
