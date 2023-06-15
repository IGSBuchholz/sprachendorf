import { Configuration, Configurations } from './config';
import { getDatabaseConnection } from '../databsemanager';
import {eq} from "drizzle-orm";

// export async function createConfiguration(option: string, value: string): Promise<Configuration> {
//     const connection = await getDatabaseConnection();
//
//     const configurationRepository = connection.getRepository(Configuration);
//     const configuration = configurationRepository.create({ option, value });
//     return configurationRepository.save(configuration);
// }

export async function getConfiguration(key: string): Promise<any | undefined> {
    const connection = await getDatabaseConnection();
    const result = await connection.select().from(Configurations).where(eq(Configurations.key, key));
    return result.length>0 ? result[0].value : undefined;
}

export async function updateConfiguration(key: string, value: string): Promise<void> {
    const connection = await getDatabaseConnection();
    connection.update(Configurations).set({value: value}).where(eq(Configurations.key, key))
    await connection.insert(Configurations)
        .values({ key: key, value: value})
        .onConflictDoUpdate(
            {
                target: Configurations.key, set: {value: value}
            }
        );
}
