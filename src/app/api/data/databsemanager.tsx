'use server';
import fs from 'fs';
import path from 'path';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const configFilePath = path.resolve(__dirname, 'dbConfig.json');

let dbCon: PostgresJsDatabase;

export async function saveDatabaseConfiguration(connectionOptions: any): Promise<void> {
    fs.writeFileSync(configFilePath, JSON.stringify(connectionOptions, null, 2));
}

export async function getDatabaseConfiguration(): Promise<any> {
    const configFileContent = fs.readFileSync(configFilePath, 'utf8');
    return JSON.parse(configFileContent);
}

export async function getDatabaseConnection(connectionString?: any): Promise<PostgresJsDatabase> {
    
    const connectionStringInitially = (!(!connectionString))

    console.log("test debug message:", connectionStringInitially)

    if(!connectionStringInitially){
        if (fs.existsSync(configFilePath)) {
            connectionString = await getDatabaseConfiguration();
        } else {
            throw new Error('No database configuration file found.');
        }
    }

    // Try to get the existing connection
    if(dbCon != null){
        return dbCon;
    }

    // If connection does not exist, create a new one
    const client = postgres(connectionString)
    const db = drizzle(client);
    if(connectionStringInitially){
        dbCon = db;
    }
    return db;
    
}


