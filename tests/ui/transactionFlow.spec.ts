import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import env from '../../src/config/env';

test.describe('Transaction Creation UI', () => {
  test('successful transaction creation', async ({ page }) => {
    allure.epic('Transaction Management');
    allure.feature('Transaction UI');
    allure.story('Successful transaction');
    allure.severity('critical');

    await page.route('**/api/transactions', (route) => {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        body: JSON.stringify({ id: 't-1', ...body }),
      });
    });

    await page.goto(`${env.uiURL}/transaction.html`);
    await page.getByPlaceholder('User ID').fill('u-123');
    await page.getByPlaceholder('Amount').fill('100.50');
    await page.getByPlaceholder('Recipient ID').fill('u-456');
    await page.locator('#type').selectOption('transfer');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('#msg')).toHaveText('Transaction successful!');
  });

  test('error message for invalid transaction', async ({ page }) => {
    allure.epic('Transaction Management');
    allure.feature('Transaction UI');
    allure.story('Invalid transaction error');
    allure.severity('normal');

    await page.route('**/api/transactions', (route) =>
      route.fulfill({
        status: 400,
        body: JSON.stringify({ message: 'invalid transaction' }),
      })
    );

    await page.goto(`${env.uiURL}/transaction.html`);
    await page.getByPlaceholder('User ID').fill('u-999');
    await page.getByPlaceholder('Amount').fill('-50');
    await page.getByPlaceholder('Recipient ID').fill('u-456');
    await page.locator('#type').selectOption('transfer');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('#msg')).toContainText('Error: 400');
  });
});
