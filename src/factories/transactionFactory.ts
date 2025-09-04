/**
 * transactionFactory.ts
 * Generates realistic transaction objects for tests using Faker.
 * Accepts overrides for fields like userId or transaction type.
 */

import { faker } from '@faker-js/faker';

// Function to build a transaction object
export const buildTransaction = (overrides: Partial<any> = {}) => ({
  userId: overrides.userId || faker.string.uuid(), // Use provided userId or random UUID
  amount: Number(faker.finance.amount({ min: 1, max: 1000, dec: 2 })), // Random amount
  type: faker.helpers.arrayElement(['transfer', 'payment', 'refund']), // Random transaction type
  recipientId: faker.string.uuid(), // Random recipient ID
  ...overrides, // Allow overriding any field
});
