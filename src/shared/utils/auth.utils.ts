import { randAlphaNumeric } from '@ngneat/falso';

export function getUserAgentFromHeaders(context: any) {
  return context.req.headers['user-agent'];
}

export function generateEmailCode() {
  return Array.from({ length: 6 }, () =>
    randAlphaNumeric().toString().toUpperCase(),
  ).join('');
}
