import { prisma } from "@/lib/prisma";

export let configCache = new Map<string, string | undefined>();

export async function getConfiguration(key: string): Promise<string | undefined> {
  if (!configCache.has(key)) {
    const configEntry = await prisma.config.findUnique({
      where: { key },
    });
    const value = configEntry ? configEntry.value ?? undefined : undefined;
    configCache.set(key, value);
    return value;
  }
  return configCache.get(key);
}

export async function updateConfiguration(key: string, value: string): Promise<void> {
  configCache.delete(key);
  await prisma.config.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
