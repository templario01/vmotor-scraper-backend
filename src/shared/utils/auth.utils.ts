import { randAlphaNumeric } from '@ngneat/falso';
import { PrismaClient } from '@prisma/client';

export function getUserAgentFromHeaders(context: any) {
  return context.req.headers['user-agent'];
}

export async function generateEmailCode(prisma: PrismaClient) {
  const usedCodes = await prisma.emailValidationCode
    .findMany({
      where: {
        expirationTime: { gt: new Date() },
      },
      select: { code: true },
    })
    .then((codes) => codes.map(({ code }) => code));

  const code = Array.from({ length: 6 }, () =>
    randAlphaNumeric().toString().toUpperCase(),
  ).join('');

  if (usedCodes.includes(code)) {
    return generateEmailCode(prisma);
  }

  return code;
}
