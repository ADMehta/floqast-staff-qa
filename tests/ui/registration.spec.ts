import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import env from '../../src/config/env';

test.describe('User Registration UI', () => {
  test('successful registration flow', async ({ page }) => {
    allure.epic('User Management');
    allure.feature('Registration UI');
    allure.story('Successful registration');
    allure.severity('critical');

    await page.route('**/api/users', (route) => {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        body: JSON.stringify({ id: 'u-1', ...body }),
      });
    });

    await page.goto(`${env.uiURL}/index.html`);
    await page.getByPlaceholder('Name').fill('John Doe');
    await page.getByPlaceholder('Email').fill('john@example.com');
    await page.locator('#accountType').selectOption('premium');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('#msg')).toHaveText('Registered!');
  });

  test('error message for invalid email', async ({ page }) => {
    allure.epic('User Management');
    allure.feature('Registration UI');
    allure.story('Invalid email error');
    allure.severity('normal');

    await page.route('**/api/users', (route) =>
      route.fulfill({
        status: 400,
        body: JSON.stringify({ message: 'email invalid' }),
      })
    );

    await page.goto(`${env.uiURL}/index.html`);
    await page.getByPlaceholder('Name').fill('Jane Doe');
    await page.getByPlaceholder('Email').fill('bademail');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('#msg')).toContainText('Error: 400');
  });
});