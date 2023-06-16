'use server'
import { NextRequest, NextResponse } from "next/server";
import {createToken} from "../../../lib/sessionmanager";
import { evaluateAuthCode, AuthCodeEvaluationResult } from "../../../lib/authcode/authcodemanager";
import { issueAuthCode, AuthCodeIssueingResult } from '../../../lib/authcode/authcodemanager';
import {getConfiguration} from "../../../lib/config/configmanager";
import {getUser} from "../../../lib/user/usermanager";
import {User} from "../../../lib/user/user";
import {getNameFromEmail} from "../../../lib/mailhandler";

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

            const userData: User | undefined = await getUser(mail.toLocaleLowerCase());

            

            if(userData){

                const token = await createToken(
                    {
                        id: 999,
                        email: mail,
                        isAdmin: false,
                        name: await getNameFromEmail(userData.email as string)
                    });
    
                console.log("Mfing token from someone who has no user account", token)
    
                // Set the token as a cookie
                return new NextResponse("User Logged In", {
                    status: 200,
                    headers: {
                        'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax`,
                    },
                });

            }else{

                const token = await createToken(
                    {
                        id: userData.email,
                        email: userData.email,
                        isAdmin: userData.isAdmin,
                        name: await getNameFromEmail(userData.email as string)
                    });
    
                console.log("Mfing token", token)
    
                // Set the token as a cookie
                return new NextResponse("User Logged In", {
                    status: 200,
                    headers: {
                        'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax`,
                    },
                });

            }

        }

        return new NextResponse(loginStatus)
    }else{
        console.log("fuck")
        console.log(await issueAuthCode(mail))
        console.log("fucked");
        return new NextResponse("CODE SENT", { status: 201 })
    }

}