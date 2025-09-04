import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { ApiClient } from '../../src/utils/apiClient';
import { buildUser } from '../../src/factories/userFactory';
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
    await api.dispose();
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

  test('update user details', async () => {
    allure.story('Update user');
    const createRes = await api.post('/api/users', buildUser());
    const user = await expectJson(createRes, 201);

    const updateRes = await api.put(`/api/users/${user.id}`, { name: 'Updated Name' });
    const updated = await expectJson(updateRes, 200);
    expect(updated.name).toBe('Updated Name');
  });

  test('delete user and verify 404 on fetch', async () => {
    allure.story('Delete user');
    const createRes = await api.post('/api/users', buildUser());
    const user = await expectJson(createRes, 201);

    const delRes = await api.delete(`/api/users/${user.id}`);
    expect(delRes.status()).toBe(204);

    const fetchRes = await api.get(`/api/users/${user.id}`);
    expect(fetchRes.status()).toBe(404);
  });
}); // ✅ close the main "Users API" describe

// Separate describe for validation error cases
test.describe('Users API – Validation Errors', () => {
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
    await api.dispose();
  });

  test('duplicate email returns 409', async () => {
    allure.label('feature', 'Users API');
    allure.label('epic', 'Validation Errors');
    allure.story('Duplicate email should return 409 Conflict');

    const userData = buildUser();
    await expectJson(await api.post('/api/users', userData), 201);
    const res = await api.post('/api/users', userData);
    expect(res.status()).toBe(409);
  });

  test('invalid accountType returns 400', async () => {
    allure.label('feature', 'Users API');
    allure.label('epic', 'Validation Errors');
    allure.story('Invalid accountType should return 400 Bad Request');

    const res = await api.post('/api/users', buildUser({ accountType: 'gold' }));
    expect(res.status()).toBe(400);
  });

  test('missing required fields returns 400', async () => {
    allure.label('feature', 'Users API');
    allure.label('epic', 'Validation Errors');
    allure.story('Missing required fields should return 400 Bad Request');

    const res = await api.post('/api/users', { name: 'John' });
    expect(res.status()).toBe(400);
  });

  test('get non-existent user returns 404', async () => {
    allure.label('feature', 'Users API');
    allure.label('epic', 'Validation Errors');
    allure.story('Fetching non-existent user should return 404 Not Found');

    const res = await api.get('/api/users/u-does-not-exist');
    expect(res.status()).toBe(404);
  });

}); //  close the validation errors describe
