# Fator R para médicos e dentistas

A tela de cálculo PJ coleta o faturamento do mês de apuração e a receita bruta
e a despesa mensal elegível com folha/pró-labore de cada um dos **12 meses
anteriores**. O mês de apuração não faz parte desse histórico. Campos vazios
não são tratados como zero: meses sem movimento devem ser preenchidos com `0`.

O cálculo usa `FS12 / RBT12`, somando os valores reais informados. Não multiplica
um mês por 12 nem calcula a média dos percentuais mensais. Fator R de pelo menos
28% seleciona o Anexo III; abaixo disso, o Anexo V. A comparação ocorre em centavos
inteiros, sem arredondar o percentual antes de escolher o anexo. Para FS12 zero
e RBT12 positivo, aplica-se o Fator R regulamentar de 1%.

A receita acumulada também determina a faixa e a alíquota efetiva:

`alíquota efetiva = (RBT12 × alíquota nominal − parcela a deduzir) / RBT12`

O imposto estimado é essa alíquota aplicada ao faturamento do mês de apuração.
O arredondamento monetário acontece somente no resultado final, em centavos.

## Exemplo de regressão

Com receita de R$ 10.000 em cada mês, folha de R$ 3.000 no mês imediatamente
anterior, R$ 1.000 no segundo mês anterior e R$ 2.000 nos outros dez meses,
os totais são R$ 120.000 de receita e R$ 24.000 de folha. O Fator R é **20%**, e
o anexo é **V**. Projetar somente o mês de R$ 3.000 de folha produziria 30% e
selecionaria incorretamente o Anexo III.

Com RBT12 de R$ 240.000, o Anexo III usa alíquota efetiva de 7,3%; o V, de
16,125%. Para faturamento atual de R$ 10.000, os impostos são R$ 730,00 e
R$ 1.612,50, respectivamente.

## Escopo da simulação

- Mantém o limite existente de R$ 15.000 para o faturamento do mês de apuração.
- Aceita RBT12 positivo até R$ 3.600.000, com as cinco primeiras faixas dos
  Anexos III e V. Receitas históricas mensais não são limitadas ao valor do mês atual.
- Não calcula empresas sem receita nos 12 meses anteriores ou em início de atividade.
- Valores acima de R$ 3.600.000 são recusados com explicação: o tratamento do
  sublimite do ISS depende de informações não coletadas nesta tela.
- Não inclui INSS/IRPF do pró-labore, retenções ou receitas segregadas.
- Mantém o cálculo local no navegador, sem persistência ou envio de e-mail.
- O fluxo das profissões anteriores continua usando a integração existente.

## Validação

Na pasta `frontend`, execute `npm test`, `npm run lint` e `npm run build`.
Os testes cobrem históricos variáveis, o limite exato de 28%, folha zero,
faixas e alíquotas efetivas, arredondamento e entradas inválidas.

## Referências

- [LC 123/2006, art. 18 e Anexos III e V](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm).
- [Resolução CGSN 140/2018, art. 26](https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=92278).
- [Explicação do Fator R da Contabilizei](https://www.contabilizei.com.br/contabilidade-online/fator-r-simples-nacional/).
