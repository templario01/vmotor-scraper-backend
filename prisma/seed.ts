import { PrismaClient, Website } from '@prisma/client';

const prisma = new PrismaClient();

const websites = [
  { name: 'neoauto', url: String(process.env.NEOAUTO_URL) },
  { name: 'mercadolibre', url: String(process.env.MERCADOLIBRE_URL) },
  { name: 'autocosmos', url: String(process.env.AUTOCOSMOS_URL) },
];

async function main() {
  console.log('sedding data...');
  const websites = await createWebsites();

  console.log({ websites });
}

async function createWebsites(): Promise<Website[]> {
  const newWebs = await Promise.all(websites.map((website) => createWebsite(website)));

  return newWebs;
}

async function createWebsite({
  name,
  url,
}: {
  name: string;
  url: string;
}): Promise<Website> {
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
