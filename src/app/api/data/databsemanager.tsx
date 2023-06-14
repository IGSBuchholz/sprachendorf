'use server';
import fs from 'fs';
import path from 'path';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const configFilePath = path.resolve(__dirname, 'dbConfig.json');

let dbCon: PostgresJsDatabase;

export async function saveDatabaseConfiguration(connectionOptions: any): Promise<void> {
    console.warn("WRITING DATABASE CONFIGURATION FOR SOME REASON")
    fs.writeFileSync(configFilePath, connectionOptions);
}

export async function getDatabaseConfiguration(): Promise<string> {
    //const configFileContent = fs.readFileSync(configFilePath, 'utf8');
    //console.log("AAAAHHH FILE CONTENT", configFileContent)
    //return configFileContent;
    console.log(process.env.DATABASE_URI)
    return process.env.DATABASE_URI as string;
}

export async function getDatabaseConnection(connectionString?: any): Promise<PostgresJsDatabase> {
    
    const connectionStringInitially = (!(!connectionString))

    console.log("test debug message:", connectionStringInitially)

    if(!connectionStringInitially){
        try{
            connectionString = await getDatabaseConfiguration();
        }catch(ex){
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


