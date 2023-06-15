
'use server';
import {JsonValue, loadJsonFile, loadJsonFileSync} from 'load-json-file';
import {writeJsonFile} from 'write-json-file';
import fs from 'fs';
import { config } from 'process';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createToken } from '../../../lib/sessionmanager';
import { getDatabaseConfiguration, getDatabaseConnection, saveDatabaseConfiguration } from '../../../lib/databsemanager';
import { getConfiguration } from '../../../lib/config/configmanager';


enum ConfigValue {

    //NOT STARTED is only for the ConfigurationStatus Method
    NOT_STARTED = 'NOT_STARTED',

    ERROR = 'ERROR',

    DATABASE = 'DATABASE',
    ADMINEMAIL = 'ADMINEMAIL',
    SENDGRID_API = 'sg_ApiKey',
    SENDGRID_EMAIL = 'sg_Sender',
    CONFIGURATIONCOMPLETED = 'CONFIGURATIONCOMPLETED',

}



class ConfigManger{

    public async configurationStatus(): Promise<ConfigValue>{

        if(!process.env.MONGODB_URI){
            return ConfigValue.NOT_STARTED;
        }

        if((await this.getConfigurationValue(ConfigValue.CONFIGURATIONCOMPLETED))){
            return ConfigValue.CONFIGURATIONCOMPLETED;
        }

        if(!(await this.getConfigurationValue(ConfigValue.ADMINEMAIL))){
            return ConfigValue.DATABASE;
        }

        if(!(await this.getConfigurationValue(ConfigValue.SENDGRID_API))){
            return ConfigValue.ADMINEMAIL;
        }

        if(!(await this.getConfigurationValue(ConfigValue.SENDGRID_EMAIL))){
            return ConfigValue.SENDGRID_API;
        }

        if(!(await this.getConfigurationValue(ConfigValue.CONFIGURATIONCOMPLETED))){
            return ConfigValue.SENDGRID_EMAIL;
        }
        return ConfigValue.ERROR;

    }

    public async getConfigurationValue(value: ConfigValue): Promise<any>{

        if(value == ConfigValue.DATABASE){
            return await getDatabaseConfiguration();
        }

        if(value == ConfigValue.NOT_STARTED || value == ConfigValue.ERROR){

            console.error("Some Method tried to get an impossible Value from the Configuration");
            return "ERROR";

        }

        return  await getConfiguration(value.toString());

    }

}

const configManager: ConfigManger = new ConfigManger();

export async function POST(req: Request) {

    const configStatus = await configManager.configurationStatus()

    const body = await req.json();

    if(!body) return new NextResponse("NO BODY")

    if(configStatus == ConfigValue.NOT_STARTED){

        const DatabaseOptions = {
            type: body.type,
            host: body.host,
            port: body.port,
            username: body.username,
            password: body.password,
            database: body.database
        }

        try{
            getDatabaseConnection(DatabaseOptions);
        }catch(err){

            const resp = new NextResponse(JSON.stringify({status: "ERROR", error: err}));

            return resp;

        }

        saveDatabaseConfiguration(DatabaseOptions);

        return new NextResponse(JSON.stringify({status: "SUCCESS", step: "DB_SET"}))

    }else{

        if(configStatus == ConfigValue.DATABASE){

            if(body.email){
                
                const authToken = jwt.sign({ email: body.email }, process.env.SESSIONKEY as string);

                //createToken(body.name, true);

                return new NextResponse()

            }

        }

        

    }
     
    //TODO Add logic for changing the config later 

}

export async function GET(req: Request) {

    const configStatus = await configManager.configurationStatus()

    process.env["MONGODB_URI"] = 'mongodb+srv://mongomango:tZiH%264p%5EYC3iiP@printserv.cov7no9.mongodb.net/?retryWrites=true&w=majority'

    console.log(process.env.MONGODB_URI)

    return new NextResponse(JSON.stringify({configstatus: configStatus.toString()}));

}