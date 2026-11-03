# 💻 Calculadora Tributária NAF - Backend API

Esta pasta contém o servidor backend (API REST) da Calculadora Tributária, responsável pelas regras de negócio fiscais, autenticação de usuários e persistência de dados.

## 🛠️ Tecnologias e Dependências
* **Runtime & Framework:** Node.js com Express.
* **ORM & Banco de Dados:** Prisma ORM integrado ao PostgreSQL via Docker.
* **Segurança:** BCrypt (criptografia de senhas) e JSON Web Token (JWT para autenticação de sessões).
* **Desenvolvimento:** Nodemon com suporte a *Legacy Watch* para sincronização instantânea em containers.

## 🔑 Funcionalidades e Regras de Negócio Implementadas
* **Autenticação:** Cadastro de usuários com hash seguro e geração de tokens JWT no login.
* **Motor Fiscal (2026):**
  * **Pessoa Física:** Cálculo progressivo do IRPF 2026 deduzindo despesas operacionais escrituradas via Livro Caixa.
  * **Pessoa Jurídica:** Apuração do Simples Nacional considerando Anexo IV (Advocacia) e Anexo III com Fator R ativo (Psicologia/Arquitetura), somado ao recolhimento obrigatório do INSS sobre pró-labore baseado no salário mínimo vigente de 2026 ($R\$\,1.621,00$).
* **Histórico:** Salvamento automático e consulta de simulações tributárias atreladas de forma relacional ao ID do usuário autenticado.

## Projeção do ponto de equilíbrio

`POST /calculos` mantém a resposta `calculo` e acrescenta `pontoEquilibrio`, com amostras das curvas, raízes estimadas, faixas favoráveis à PJ e parâmetros da simulação. Apenas o cálculo solicitado é persistido; as amostras do gráfico não geram registros no banco.

`src/services/tributacao.js` concentra as regras anteriormente implementadas no controller. A projeção varia a renda entre R$ 0 e R$ 15.000 e mantém os custos dedutíveis fixos. Considera as mudanças de faixa do IRPF e o piso do pró-labore ao encontrar os cruzamentos das funções lineares por intervalo. As amostras incluem os limites das faixas, os cruzamentos e a renda informada.

O modelo mantém as alíquotas e hipóteses atuais do projeto, sem representar uma atualização da legislação. Não inclui custos de abertura/manutenção da PJ ou honorários contábeis. Profissões fora do comparativo e parâmetros fora do domínio retornam `pontoEquilibrio: null`.

Execute `npm test` nesta pasta para verificar valores de regressão, cruzamentos antes/depois da mudança do pró-labore, ausência de vantagem para PJ, igualdade no teto e consistência das faixas.

## 🚀 Execução Local (Desenvolvimento Isolado)

Se o banco for recriado, o navegador pode manter um token de uma conta que não existe mais. As rotas protegidas verificam a existência do usuário e retornam 401 nesse caso; o frontend limpa a sessão e abre o login com uma mensagem. Cadastre a conta novamente se o banco estiver vazio. Uma falha de conexão com o banco retorna 503 e mantém a sessão para uma nova tentativa.

Os testes de autenticação usam um banco simulado, sem gravar dados reais. Execute `npm ci` e `npm test` para verificar também tokens inválidos, contas inexistentes e indisponibilidade do banco.

Se houver a necessidade de rodar o servidor Express isoladamente fora do Docker local:

### Passo a Passo
1. Certifique-se de estar na pasta correta:
```bash
cd backend
```
2. Instale as dependências locais:
  ```bash
  npm install
  ```
3. Configure a variável de ambiente criando um arquivo .env com a sua string de conexão para um banco PostgreSQL local:
  ```bash
  DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_banco?schema=public"
  ```
4. Execute as migrações do banco com o Prisma:
  ```bash
  npx prisma migrate dev
  ```
5. Inicie o servidor em modo de desenvolvimento:
  ```bash
  npm run dev
  ```
