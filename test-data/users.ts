import { env } from '../config/env';
import type { CustomerInfo, UserCredentials } from '../types';

export const users = {
  standard: { username: env.username, password: env.password } satisfies UserCredentials,
  locked: { username: env.lockedUsername, password: env.password } satisfies UserCredentials,
  problem: { username: env.problemUsername, password: env.password } satisfies UserCredentials,
  invalidUsername: { username: 'not_a_real_user', password: env.password } satisfies UserCredentials,
  invalidPassword: { username: env.username, password: 'wrong_password' } satisfies UserCredentials,
  empty: { username: '', password: '' } satisfies UserCredentials,
};

export const validCustomer: CustomerInfo = {
  firstName: 'Jane',
  lastName: 'Doe',
  postalCode: '94107',
};

export const incompleteCustomers: Array<{ description: string; info: Partial<CustomerInfo> }> = [
  { description: 'missing first name', info: { lastName: 'Doe', postalCode: '94107' } },
  { description: 'missing last name', info: { firstName: 'Jane', postalCode: '94107' } },
  { description: 'missing postal code', info: { firstName: 'Jane', lastName: 'Doe' } },
  { description: 'all fields empty', info: { firstName: '', lastName: '', postalCode: '' } },
];
