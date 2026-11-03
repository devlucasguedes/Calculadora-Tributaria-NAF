const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

// A autenticação usa JWTs reais, mas nunca acessa o banco durante estes testes.
const prisma = { user: { findUnique: async () => null } };
require.cache[require.resolve('../config/prisma')] = { exports: prisma };
const authMiddleware = require('./authMiddleware');
const secret = process.env.JWT_SECRET || 'fallback_secret';
const userId = 'e4c9ec80-9307-43d0-8b2a-55d823117195';
let queries;

beforeEach(() => {
  queries = [];
  prisma.user.findUnique = async (query) => {
    queries.push(query);
    return { id: userId };
  };
});

async function authenticate(authorization) {
  const req = { headers: { authorization } };
  const res = {
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  let nextCalls = 0;
  await authMiddleware(req, res, () => { nextCalls += 1; });
  return { req, res, nextCalls };
}

test('token válido de usuário existente libera a rota com o ID consultado', async () => {
  const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
  const result = await authenticate(`Bearer ${token}`);
  assert.equal(result.nextCalls, 1);
  assert.equal(result.req.userId, userId);
  assert.deepEqual(queries, [{ where: { id: userId }, select: { id: true } }]);
});

test('token válido de conta inexistente retorna 401 antes de executar a rota', async () => {
  prisma.user.findUnique = async () => null;
  const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
  const result = await authenticate(`Bearer ${token}`);
  assert.equal(result.res.statusCode, 401);
  assert.match(result.res.body.error, /Entre novamente/);
  assert.equal(result.nextCalls, 0);
  assert.equal(result.req.userId, undefined);
});

test('cabeçalho ausente ou malformado é recusado sem consultar o banco', async () => {
  for (const header of [undefined, '', 'Bearer', 'Bearer ', 'Basic abc', 'Bearer abc extra']) {
    const result = await authenticate(header);
    assert.equal(result.res.statusCode, 401);
    assert.equal(result.nextCalls, 0);
  }
  assert.deepEqual(queries, []);
});

test('JWT expirado, inválido ou assinado por outra chave não consulta o banco', async () => {
  const tokens = [
    'invalid-token',
    jwt.sign({ id: userId }, secret, { expiresIn: -1 }),
    jwt.sign({ id: userId }, `${secret}-different`, { expiresIn: '1h' })
  ];
  for (const token of tokens) {
    const result = await authenticate(`Bearer ${token}`);
    assert.equal(result.res.statusCode, 401);
    assert.equal(result.nextCalls, 0);
  }
  assert.deepEqual(queries, []);
});

test('JWT sem ID válido não libera uma consulta sem filtro de usuário', async () => {
  for (const payload of [{}, { id: null }, { id: 123 }, { id: '' }, { id: '  ' }]) {
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const result = await authenticate(`Bearer ${token}`);
    assert.equal(result.res.statusCode, 401);
    assert.equal(result.nextCalls, 0);
  }
  assert.deepEqual(queries, []);
});

test('falha no banco retorna 503, sem invalidar a sessão com um 401', async (t) => {
  t.mock.method(console, 'error', () => {});
  prisma.user.findUnique = async () => { throw new Error('Banco indisponível'); };
  const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
  const result = await authenticate(`Bearer ${token}`);
  assert.equal(result.res.statusCode, 503);
  assert.equal(result.nextCalls, 0);
  assert.equal(result.req.userId, undefined);
});
