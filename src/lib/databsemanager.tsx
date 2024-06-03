import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'


export let dbCon: PostgresJsDatabase;


export async function getDatabaseConfiguration(): Promise<string> {
    //const configFileContent = fs.readFileSync(configFilePath, 'utf8');
    //console.log("AAAAHHH FILE CONTENT", configFileContent)
    //return configFileContent;
    console.log("DATABASE CONNECTION")
    return process.env.DATABASE_URI as string;
}

export async function getDatabaseConnection(connectionString?: any): Promise<PostgresJsDatabase> {
    
    const connectionStringInitially = (!(!connectionString))

    console.log("test debug message:", connectionStringInitially)

    if(!connectionStringInitially){
        // Try to get the existing connection
        if(dbCon != null){
            console.log("Not Null")
            return dbCon;
        }
        try{
            connectionString = await getDatabaseConfiguration();
        }catch(ex){
            throw new Error('No database configuration file found.');
        }
    }


    // If connection does not exist, create a new one
    const client = postgres(connectionString)
    const db = drizzle(client);
    if(!connectionStringInitially){
        dbCon = db;
    }
    return db;
    
}


