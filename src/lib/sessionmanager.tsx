'use server';
import cryptoRandomString from 'crypto-random-string';
import fs from 'fs';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { User } from '@/lib/user/user';
import { UserSession } from '@/lib/usersession';
import { Session } from 'inspector';


let SECRETKEY: string;

const keyFilePath = path.resolve('./secretKey.json');

export async function getSessionKey(forceReload = false): Promise<string>{

    if(!forceReload && SECRETKEY){

        return SECRETKEY;
 
    }

    console.log(keyFilePath)

    if(fs.existsSync(keyFilePath)){

        const secretKey = fs.readFileSync(keyFilePath, 'utf8');
        SECRETKEY = secretKey;
        return secretKey;
    
    }

    
    const randString = cryptoRandomString({length: 128});

    fs.writeFileSync(keyFilePath, randString);

    return randString;
}

export async function createToken(payload: any): Promise<string> {
    const secret = await getSessionKey();
    console.log("Secret key creating a token:", secret)
    const signed = jwt.sign(payload, secret)
    console.log("FING TOKEN ", signed)
    return signed;
}

export async function verifyToken(token: string): Promise<UserSession | undefined>{
    const secret = await getSessionKey();
    console.log("Secret key verifiying a token:", secret)
    var result;
    try {
        jwt.verify(token, secret, (err: any, decoded: any) => {
            if (err || !decoded) {
                console.log("Error1:", err)
                return undefined;
            }

            console.log("decoded:", decoded)

            let session: UserSession = decoded;

            console.log(session)

            result = session;

        })
    } catch (e: any) {
        console.log("Error2:", e)
        return undefined;
    }

    return result;
}
