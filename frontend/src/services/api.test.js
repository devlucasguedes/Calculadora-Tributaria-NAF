import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import api from './api.js';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
let redirects;
let storage;

beforeEach(() => {
  redirects = [];
  storage = new Map([['token', 'current-token'], ['user', '{"id":"current-user"}']]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { replace: (url) => redirects.push(url) } },
  });
});

afterEach(() => {
  for (const [key, descriptor] of [['localStorage', originalStorage], ['window', originalWindow]]) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});

function rejectWith(status, beforeReject = () => {}) {
  return async (config) => {
    beforeReject(config);
    throw new AxiosError('Falha na requisição', undefined, config, undefined, {
      status, data: { error: 'Falha na requisição' }, config, headers: {},
    });
  };
}

test('401 em uma requisição autenticada limpa a sessão e abre o login com aviso', async () => {
  await assert.rejects(api.post('/calculos', {}, { adapter: rejectWith(401) }));
  assert.equal(storage.get('token'), undefined);
  assert.equal(storage.get('user'), undefined);
  assert.deepEqual(redirects, ['/login?session=expired']);
});

test('401 atrasado não remove um login feito depois do envio da requisição', async () => {
  await assert.rejects(api.get('/calculos/historico', {
    adapter: rejectWith(401, () => {
      storage.set('token', 'new-token');
      storage.set('user', '{"id":"new-user"}');
    }),
  }));
  assert.equal(storage.get('token'), 'new-token');
  assert.equal(storage.get('user'), '{"id":"new-user"}');
  assert.deepEqual(redirects, []);
});

test('credenciais inválidas no login não enviam token nem provocam redirecionamento', async () => {
  await assert.rejects(api.post('/auth/login', {}, {
    adapter: rejectWith(401, (config) => {
      assert.equal(config.headers.Authorization, undefined);
    }),
  }));
  assert.equal(storage.get('token'), 'current-token');
  assert.deepEqual(redirects, []);
});

test('cadastro não envia o token antigo', async () => {
  const result = await api.post('/auth/register', {}, {
    adapter: async (config) => {
      assert.equal(config.headers.Authorization, undefined);
      return { status: 201, data: {}, config, headers: {} };
    },
  });
  assert.equal(result.status, 201);
  assert.deepEqual(redirects, []);
});

test('indisponibilidade do banco ou da rede preserva a sessão', async () => {
  await assert.rejects(api.get('/calculos/historico', { adapter: rejectWith(503) }));
  await assert.rejects(api.get('/calculos/historico', {
    adapter: async (config) => { throw new AxiosError('Network Error', 'ERR_NETWORK', config); },
  }));
  assert.equal(storage.get('token'), 'current-token');
  assert.equal(storage.get('user'), '{"id":"current-user"}');
  assert.deepEqual(redirects, []);
});

test('401 sem sessão não provoca um ciclo de redirecionamentos', async () => {
  storage.clear();
  await assert.rejects(api.get('/calculos/historico', { adapter: rejectWith(401) }));
  assert.deepEqual(redirects, []);
});

test('requisição autenticada bem-sucedida mantém o token e os dados da resposta', async () => {
  const data = { pontoEquilibrio: { pontosEquilibrio: [5056] } };
  const result = await api.post('/calculos', {}, {
    adapter: async (config) => {
      assert.equal(config.headers.Authorization, 'Bearer current-token');
      return { status: 201, data, config, headers: {} };
    },
  });
  assert.deepEqual(result.data, data);
  assert.equal(storage.get('token'), 'current-token');
  assert.deepEqual(redirects, []);
});
