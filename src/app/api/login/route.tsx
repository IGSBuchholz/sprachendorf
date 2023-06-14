'use server'
import { NextRequest, NextResponse } from "next/server";
import {createToken, issueSession} from "../data/sessionmanager";
import { evaluateAuthCode, AuthCodeEvaluationResult } from "../data/authcode/authcodemanager";
import { issueAuthCode, AuthCodeIssueingResult } from '../data/authcode/authcodemanager';
import {getConfiguration} from "@/app/api/data/config/configmanager";
import {getUser} from "@/app/api/data/user/usermanager";
import {User} from "@/app/api/data/user/user";
import {getNameFromEmail} from "@/app/api/data/mailhandler";

export async function POST(req: Request) {

    console.log("Unfortionately it works so far so the problem is somewhere else")

    const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@igs-buchholz\.de$')

    console.log(emailRegex)

    const body = await req.json();

    if(!body || !body.email){

        console.log("Returning Error on Router () because no E-Mail provided")
        return new NextResponse("No Email Provided", {status: 204});        
    
    }

    const mail: string = body.email;
    
    if(!mail || !emailRegex.test(mail)){
        return new NextResponse("Wrong E-Mail Regex", {status: 400});
    }

    const code: number = body.code;

    //Check if it is a code request (Code is part of Body)
    if(code) {

        const loginStatus = await evaluateAuthCode(mail, code);

        console.log("*********\n Result of Request to /api/login (w/ AuthCode): \n Email: " + mail + " \n LoginStatus: " + loginStatus + "\n*********");

        if (loginStatus == AuthCodeEvaluationResult.SUCCESS) {

            const userData: User = await getUser(mail.toLocaleLowerCase());

            const token = await createToken(
                {
                    id: userData.email,
                    email: userData.email,
                    isAdmin: userData.isAdmin,
                    name: await getNameFromEmail(userData.email as string)
                });

            // Set the token as a cookie
            return new NextResponse("User Logged In", {
                status: 200,
                headers: {
                    'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax`,
                },
            });
        }

        return new NextResponse(loginStatus)
    }else{
        console.log("fuck")
        console.log(await issueAuthCode(mail))
        console.log("fucked");
        return new NextResponse("CODE SENT", { status: 199 })
    }

}