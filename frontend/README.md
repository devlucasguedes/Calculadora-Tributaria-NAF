# 💻 Calculadora Tributária NAF - Frontend Application

Esta pasta contém a interface gráfica de usuário (Single Page Application) da Calculadora Tributária, projetada com foco em experiência do usuário (UX) e responsividade para os atendimentos do NAF.

## 🛠️ Tecnologias e Bibliotecas
* **Core:** ReactJS estruturado e compilado via Vite (Node Alpine no ecossistema Docker).
* **Roteamento:** React Router Dom com gerenciamento de rotas protegidas (bloqueio de acesso sem token).
* **Estilização:** Tailwind CSS com transições fluidas e efeitos modernos de animação.
* **Comunicação:** Axios configurado com *interceptors* para injeção automática do Bearer Token JWT no cabeçalho das requisições.
* **Exportação:** jsPDF para relatórios de estimativa com texto selecionável e gráficos vetoriais.

## 📄 Fluxos e Telas Conectadas à API
* **Acesso e Sessão:** Formulários reais e validados de **Login** e **Cadastro**, armazenando o token no `localStorage`.
* **Painel Interno:** Home integrada protegendo o acesso às calculadoras.
* **Simuladores Conectados:** Telas de Cálculo PF, Cálculo PJ e Análise de Vantagem Comparativa disparando parâmetros ao motor fiscal do servidor e atualizando os estados em tempo real.
* **Histórico de Simulações:** Página com tabela responsiva que busca e renderiza o histórico de simulações salvas no banco de dados do usuário autenticado.

## Gráfico de ponto de equilíbrio

Em **Home → Gerar Comparativo**, preencha os dados e clique em **Analisar Vantagem Tributária**. Abaixo do resultado aparece um gráfico com:

* Curvas de IRPF (PF) e Simples Nacional + INSS (PJ).
* Renda de R$ 0 a R$ 15.000, mantendo os custos dedutíveis informados fixos.
* Ponto de equilíbrio estimado e destaque da faixa em que os tributos de PJ são menores.
* Controle de renda acessível por teclado e exploração com mouse ou toque, sem novas requisições ou registros no histórico.
* Mensagem explícita quando não há vantagem para PJ no intervalo analisado.

O gráfico usa SVG responsivo, sem biblioteca adicional. Os dados vêm do mesmo cálculo do backend que produz o resultado; as regras tributárias existentes foram preservadas. A funcionalidade contempla as profissões já disponíveis no comparativo: psicólogo, arquiteto e advogado. A projeção não inclui honorários contábeis, despesas de abertura/manutenção nem o simulador separado de Fator R de médico e dentista.

Ao alterar profissão, renda ou custos, execute a análise novamente. Frontend e backend devem estar atualizados para receber o campo `pontoEquilibrio` na resposta da API.

## PDF do comparativo

Após calcular, use **Baixar relatório em PDF**. A exportação inclui:

* Cabeçalho do NAF / Universidade Christus, data e hora de emissão no fuso de Fortaleza (UTC-3) e aviso de estimativa.
* Profissão, receita e custos da simulação concluída.
* Gráfico de barras com os tributos mensais de PF e PJ, na mesma escala.
* Memória de cálculo de IRPF, Simples Nacional e INSS, com base, alíquota, dedução, valor e fórmulas usadas no comparativo.
* Segunda página com as curvas de ponto de equilíbrio, faixas favoráveis à PJ e hipóteses da projeção, quando os dados estiverem disponíveis.

O PDF usa os valores do resultado, sem recalcular os tributos. O layout A4 é independente da largura da tela; o controle interativo de renda não altera a simulação exportada. A biblioteca de PDF é carregada somente ao solicitar o download. Uma falha na exportação exibe uma mensagem e permite tentar novamente.

## Exportação do histórico em CSV

Em **Histórico**, clique em **Exportar histórico (CSV)**. O arquivo contém todas as simulações carregadas da conta conectada, na mesma ordem da listagem, com data, hora, profissão, faturamento, custos dedutíveis, impostos PF/PJ, melhor opção e economia mensal. Não inclui identificadores internos, dados de login ou simulações de outras contas.

A exportação usa os registros já consultados, sem recalcular tributos ou gravar novas simulações. O botão fica desabilitado durante o carregamento, em caso de erro e quando o histórico está vazio. Mensagens de sucesso e erro são anunciadas a leitores de tela.

O CSV usa UTF-8 com BOM, separador `;`, vírgula decimal e duas casas decimais, sem separador de milhar. As datas e horas usam Fortaleza (UTC-3), inclusive na tela. Custos ausentes em registros antigos ficam vazios; zero é exportado como `0,00`. Textos com aspas e quebras de linha são escapados; textos com início de fórmula recebem um apóstrofo de proteção.

No Excel configurado para outro separador, importe por **Dados → De Texto/CSV**, escolhendo UTF-8, ponto e vírgula e localidade Português (Brasil). A exportação é CSV, sem gerar um arquivo XLSX.

Execute `npm test` para verificar valores, datas, ordem, campos ausentes e escape do CSV.

## 🚀 Execução Local (Desenvolvimento Isolado)

Se preferir rodar ou testar apenas a interface do React de forma isolada sem o Docker Compose da raiz:

### Passo a Passo
1. Garanta que está na pasta correta:
    ```bash
    cd frontend
    ```
2. Instale as dependências do ecossistema:
    ```bash
    npm install
    ```
3. Inicie o servidor do Vite em ambiente de desenvolvimento local:
    ```bash
    npm run dev
    ```
