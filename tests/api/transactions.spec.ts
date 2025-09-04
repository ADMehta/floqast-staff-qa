import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { ApiClient } from '../../src/utils/apiClient';
import { buildUser } from '../../src/factories/userFactory';
import { buildTransaction } from '../../src/factories/transactionFactory';
import { expectJson } from '../../src/utils/assertions';
import env from '../../src/config/env';

test.describe('Users API', () => {
  let api: ApiClient;

  test.beforeAll(async ({ request }) => {
    // Wait for API server to be up before reset
    let connected = false;
    for (let i = 0; i < 10 && !connected; i++) {
      try {
        const res = await request.post(`${process.env.BASE_URL}/__reset`);
        if (res.ok()) connected = true;
      } catch {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    if (!connected) throw new Error('API server not reachable on /__reset');

    api = new ApiClient();
    await api.init();
  });

  test.afterAll(async () => {
    if (api) {
      await api.dispose();
    }
  });

  test('create and fetch user (happy path)', async () => {
    allure.epic('User Management');
    allure.feature('User Creation');
    allure.story('Create and retrieve user');
    allure.severity('critical');
    allure.description('Creates a user and verifies it can be fetched by ID');

    const createRes = await api.post('/api/users', buildUser());
    const createdUser = await expectJson(createRes, 201);

    const fetchRes = await api.get(`/api/users/${createdUser.id}`);
    const fetchedUser = await expectJson(fetchRes, 200);

    expect(fetchedUser).toMatchObject(createdUser);
  });

  test('validation error on bad email', async () => {
    allure.epic('User Management');
    allure.feature('User Validation');
    allure.story('Invalid email format');
    allure.severity('normal');

    const payload = buildUser({ email: 'not-an-email' });
    const res = await api.post('/api/users', payload);
    expect(res.status()).toBe(400);
  });

  test('unauthorized without token when required', async ({ request }) => {
    allure.epic('User Management');
    allure.feature('Authorization');
    allure.story('Missing token');
    allure.severity('critical');

    const res = await request.post(`${env.baseURL}/api/users`, { data: buildUser() });
    expect(res.status()).toBe(401);
  });

  test('reject negative amount', async () => {
    allure.story('Validation: negative amount');
    const user = await expectJson(await api.post('/api/users', buildUser()), 201);
    const res = await api.post('/api/transactions', buildTransaction({ userId: user.id, amount: -10 }));
    expect(res.status()).toBe(400);
  });

  test('reject self-transfer', async () => {
    allure.story('Validation: self-transfer');
    const user = await expectJson(await api.post('/api/users', buildUser()), 201);
    const res = await api.post('/api/transactions', buildTransaction({ userId: user.id, recipientId: user.id, type: 'transfer' }));
    expect(res.status()).toBe(400);
  });
}); // close Users API describe

// Separate describe for transaction validation errors
test.describe('Transactions API – Validation Errors', () => {
  let api: ApiClient;

  test.beforeAll(async ({ request }) => {
    let connected = false;
    for (let i = 0; i < 10 && !connected; i++) {
      try {
        const res = await request.post(`${process.env.BASE_URL}/__reset`);
        if (res.ok()) connected = true;
      } catch {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    if (!connected) throw new Error('API server not reachable on /__reset');

    api = new ApiClient();
    await api.init();
  });

  test.afterAll(async () => {
    if (api) {
      await api.dispose();
    }
  });

  test('invalid transaction type returns 400', async () => {
    allure.label('feature', 'Transactions API');
    allure.label('epic', 'Validation Errors');
    allure.story('Invalid transaction type should return 400 Bad Request');

    const user = await expectJson(await api.post('/api/users', buildUser()), 201);
    const res = await api.post(
      '/api/transactions',
      buildTransaction({ userId: user.id, type: 'invalid-type' })
    );
    expect(res.status()).toBe(400);
  });

  test('missing required fields returns 400', async () => {
    allure.label('feature', 'Transactions API');
    allure.label('epic', 'Validation Errors');
    allure.story('Missing required fields should return 400 Bad Request');

    const res = await api.post('/api/transactions', { amount: 100 });
    expect(res.status()).toBe(400);
  });

  test('transaction for non-existent user returns 404', async () => {
    allure.label('feature', 'Transactions API');
    allure.label('epic', 'Validation Errors');
    allure.story('Transaction for non-existent user should return 404 Not Found');

    const res = await api.post(
      '/api/transactions',
      buildTransaction({
        userId: 'u-does-not-exist',
        amount: 100,
        type: 'deposit'
      })
    );
    expect(res.status()).toBe(404);
  });


}); // close Transactions API describe
