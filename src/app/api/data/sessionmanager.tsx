'use server';
import cryptoRandomString from 'crypto-random-string';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken'


let SECRETKEY: string;

const keyFilePath = path.resolve(__dirname, 'secretKey.json');

async function getSessionKey(forceReload = false): Promise<string>{

    if(!forceReload && SECRETKEY){

        return SECRETKEY;

    }

    if(fs.existsSync(keyFilePath)){

        const secretKey = fs.readFileSync(keyFilePath, 'utf8');
        SECRETKEY = secretKey;
        return secretKey;
    
    }

    
    const randString = cryptoRandomString({length: 128});

    fs.writeFileSync(keyFilePath, randString);

    return randString;
}

export async function createToken(payload) {
    return jwt.sign(payload, await getSessionKey(), {expiresIn: '1h'})
}

export async function verifyToken(token) {
    try {
        return jwt.verify(token, await getSessionKey())
    } catch (e) {
        console.log(e)
        return null
    }
}
