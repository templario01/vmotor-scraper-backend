import { PrismaClient, Website } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('sedding data...');
  const urls = getWebsites();
  const websites = await createWebsites(urls);

  console.log({ websites });
}

function getWebsites(): string[] {
  const neoauto = process.env.NEOAUTO_URL || '';

  return [neoauto].filter((website) => website !== '');
}

async function createWebsites(websites: string[]): Promise<Website[]> {
  return Promise.all(websites.map((website) => createWebsite(website)));
}

async function createWebsite(url: string): Promise<Website> {
  const hostname = new URL(url).hostname;
  const [name] = hostname.split('.');
  return prisma.website.upsert({
    where: { url },
    create: { url, name },
    update: { url, name },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
