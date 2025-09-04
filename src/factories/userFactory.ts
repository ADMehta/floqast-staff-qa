/**
 * userFactory.ts
 * Generates realistic user objects for tests using Faker.
 * Accepts optional overrides so tests can control specific fields.
 */

import { faker } from '@faker-js/faker';

// Function to build a user object
export const buildUser = (overrides: Partial<any> = {}) => ({
  name: faker.person.fullName(), // Random full name
  email: faker.internet.email().toLowerCase(), // Random lowercase email
  accountType: faker.helpers.arrayElement(['basic', 'premium']), // Random account type
  ...overrides, // Allow overriding any field
});
