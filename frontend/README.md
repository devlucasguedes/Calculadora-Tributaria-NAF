# 💻 Calculadora Tributária NAF - Frontend Application

Esta pasta contém a interface gráfica de usuário (Single Page Application) da Calculadora Tributária, projetada com foco em experiência do usuário (UX) e responsividade para os atendimentos do NAF.

## 🛠️ Tecnologias e Bibliotecas
* **Core:** ReactJS estruturado e compilado via Vite (Node Alpine no ecossistema Docker).
* **Roteamento:** React Router Dom com gerenciamento de rotas protegidas (bloqueio de acesso sem token).
* **Estilização:** Tailwind CSS com transições fluidas e efeitos modernos de animação.
* **Comunicação:** Axios configurado com *interceptors* para injeção automática do Bearer Token JWT no cabeçalho das requisições.
* **Exportação:** html2pdf.js para captura do DOM e conversão em relatórios fiscais oficiais.

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

Ao alterar profissão, renda ou custos, execute a análise novamente. O gráfico aparece na tela; a exportação de PDF existente mantém seu conteúdo anterior. Frontend e backend devem estar atualizados para receber o campo `pontoEquilibrio` na resposta da API.

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
