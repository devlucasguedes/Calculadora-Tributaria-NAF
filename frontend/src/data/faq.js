// Conteúdo compartilhado pela página pública /faq e pelo resumo na página inicial.
export const gruposFaq = [
  {
    id: "como-usar",
    titulo: "Como usar a calculadora",
    perguntas: [
      {
        id: "profissoes",
        pergunta: "Quais profissões posso simular?",
        resposta: "O comparativo entre Pessoa Física (PF) e Pessoa Jurídica (PJ) está disponível para psicólogos, arquitetos e advogados. Médicos e dentistas podem usar Cálculo PF e o simulador de Fator R em Cálculo PJ. O Fator R ainda não faz parte do comparativo entre PF e PJ.",
      },
      {
        id: "acesso",
        pergunta: "Preciso de uma conta para usar a calculadora?",
        resposta: "Sim. Use Criar Conta e depois Entrar para acessar as calculadoras e o histórico da sua conta. Esta página de perguntas frequentes pode ser consultada sem login.",
      },
      {
        id: "dados",
        pergunta: "Quais valores devo informar?",
        resposta: "Informe a renda ou o faturamento bruto mensal, antes dos descontos, dentro do limite de R$ 15.000,00 da ferramenta. Em Cálculo PF e Comparativo, informe também as despesas dedutíveis do Livro Caixa; use 0 se não houver. Em Cálculo PJ para médico ou dentista, a folha/pró-labore é informada separadamente para calcular o Fator R.",
      },
      {
        id: "tributos",
        pergunta: "Quais tributos aparecem no comparativo?",
        resposta: "O comparativo estima o IRPF a partir da renda e dos custos dedutíveis informados. Para PJ, estima o Simples Nacional e o INSS sobre o pró-labore, conforme as hipóteses do simulador para a profissão escolhida. O resultado de Fator R, na tela separada de Cálculo PJ, mostra somente o Simples Nacional e não inclui INSS nem eventual IRPF do pró-labore.",
      },
      {
        id: "ponto-equilibrio",
        pergunta: "Como interpretar o gráfico de ponto de equilíbrio?",
        resposta: "Após calcular em Comparativo, o gráfico mostra como os tributos estimados de PF e PJ variam entre R$ 0 e R$ 15.000 de renda mensal, mantendo os custos dedutíveis fixos. Os cruzamentos das curvas indicam pontos de equilíbrio; a faixa destacada indica onde PJ tem tributos menores. Honorários contábeis e despesas de abertura ou manutenção não entram nessa comparação, por isso o gráfico não garante que abrir uma empresa será mais vantajoso.",
      },
    ],
  },
  {
    id: "fator-r",
    titulo: "Fator R de médicos e dentistas",
    perguntas: [
      {
        id: "regra-fator-r",
        pergunta: "O que é o Fator R e como ele define o anexo?",
        resposta: "Para as atividades sujeitas ao Fator R, ele relaciona a folha elegível, incluindo pró-labore e encargos admitidos, com a receita bruta dos 12 meses anteriores à apuração. Com Fator R igual ou superior a 28%, aplica-se o Anexo III; abaixo de 28%, o Anexo V. A receita acumulada também determina a faixa e a alíquota efetiva do Simples. Com folha acumulada zero e receita positiva, o simulador aplica o Fator R regulamentar de 1%.",
        fonte: {
          texto: "Consultar a Resolução CGSN 140/2018, arts. 25 e 26",
          url: "https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=92278",
        },
      },
      {
        id: "previsao-mensal",
        pergunta: "Posso fazer uma previsão com apenas um mês?",
        resposta: "Sim. Em Cálculo PJ, selecione Médico(a) ou Dentista e use Previsão mensal. Informe o faturamento e a folha/pró-labore mensal. A ferramenta repete os dois valores por 12 meses e mostra o Fator R, o anexo previsto, o Simples mensal estimado e a folha necessária para atingir 28% nesse cenário. Somente a renda não determina o Fator R. Essa previsão supõe valores constantes e não substitui o histórico real.",
      },
      {
        id: "historico-fator-r",
        pergunta: "Quando devo usar o histórico real de 12 meses?",
        resposta: "Use esse modo quando tiver a receita e a folha de cada um dos 12 meses anteriores ao mês de apuração. Informe também o faturamento do mês que deseja calcular, sem incluí-lo nos 12 meses anteriores. Todos os campos do histórico precisam ser preenchidos: use 0 nos meses sem receita ou folha. A ferramenta soma os valores antes de calcular a razão; não faz a média dos percentuais mensais.",
      },
      {
        id: "limites-fator-r",
        pergunta: "Quais são os limites da simulação de Fator R?",
        resposta: "O faturamento mensal deve ser maior que zero e de até R$ 15.000,00. No modo histórico, a receita acumulada deve ser positiva e de até R$ 3.600.000,00. A ferramenta não contempla início de atividade, retenções nem receitas segregadas. O valor exibido é uma estimativa do Simples Nacional; INSS e eventual IRPF do pró-labore não estão incluídos.",
      },
    ],
  },
  {
    id: "resultados-historico",
    titulo: "Resultados, histórico e arquivos",
    perguntas: [
      {
        id: "pdf",
        pergunta: "Como baixar o PDF do comparativo?",
        resposta: "Na página Comparativo, conclua uma simulação e clique em Baixar relatório em PDF. O documento inclui a identificação do NAF / Universidade Christus, data e hora, o gráfico de PF e PJ e a memória de cálculo com bases e alíquotas. Quando disponíveis, os dados do ponto de equilíbrio aparecem em uma segunda página. O arquivo representa a simulação concluída e identifica os valores como estimativas.",
      },
      {
        id: "dados-salvos",
        pergunta: "Minhas simulações ficam salvas?",
        resposta: "Sim. As simulações concluídas pelo servidor em Cálculo PF, Comparativo e Cálculo PJ para psicólogo, arquiteto e advogado ficam vinculadas à sua conta e aparecem em Histórico, inclusive após uma nova visita. A exceção é o Fator R de médico e dentista: tanto a previsão mensal quanto o histórico de 12 meses são calculados no navegador e não são salvos na lista de simulações.",
      },
      {
        id: "csv",
        pergunta: "Como exportar o histórico para CSV ou abrir no Excel?",
        resposta: "Entre em Histórico e clique em Exportar histórico (CSV). O arquivo reúne as simulações carregadas da sua conta, com data, profissão, valores, impostos e economia mensal. O botão fica indisponível se a lista estiver vazia, carregando ou com erro. O CSV pode ser aberto no Excel; se as colunas não forem separadas corretamente, importe por Dados → De Texto/CSV, usando UTF-8, separador ponto e vírgula e Português (Brasil). A ferramenta não gera um arquivo XLSX.",
      },
      {
        id: "email",
        pergunta: "Os resultados são enviados por e-mail?",
        resposta: "O envio de resultados por e-mail ainda é demonstrativo nas calculadoras. Use o PDF do Comparativo ou o CSV do Histórico para guardar os resultados disponíveis. Os cálculos de Fator R não são enviados por e-mail.",
      },
      {
        id: "estimativas",
        pergunta: "O resultado substitui a orientação de um contador?",
        resposta: "Não. Os valores são estimativas conforme os dados informados e as regras implementadas na ferramenta, e não constituem uma apuração fiscal oficial. A decisão de atuar como PF ou PJ depende também de despesas, obrigações e particularidades que a simulação pode não contemplar. Confirme o enquadramento e os valores com um profissional contábil.",
      },
    ],
  },
];

const idsResumo = ["profissoes", "previsao-mensal", "dados-salvos", "estimativas"];
export const resumoFaq = gruposFaq.flatMap(grupo => grupo.perguntas)
  .filter(item => idsResumo.includes(item.id));
