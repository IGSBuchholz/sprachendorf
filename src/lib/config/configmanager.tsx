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

export let configCache = new Map();

export async function getConfiguration(key: string): Promise<any | undefined> {
    if(!configCache.has(key)){
        const connection = await getDatabaseConnection();
        const result = await connection.select().from(Configurations).where(eq(Configurations.key, key));
        if(result.length>0){
            configCache.set(key, result[0].value)
            return result[0].value;
        }else{
            return undefined;
        }
    }
    return configCache.get(key);
}

export async function updateConfiguration(key: string, value: string): Promise<void> {
    const connection = await getDatabaseConnection();
    configCache.delete(key);
    connection.update(Configurations).set({value: value}).where(eq(Configurations.key, key))
    await connection.insert(Configurations)
        .values({ key: key, value: value})
        .onConflictDoUpdate(
            {
                target: Configurations.key, set: {value: value}
            }
        );
}
