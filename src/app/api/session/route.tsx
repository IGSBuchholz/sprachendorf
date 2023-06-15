import { parse } from 'cookie'
import {NextResponse} from "next/server";
import { verifyToken } from "../../../lib/sessionmanager";

export async function GET(req, NextRequest) {
    const cookies = parse(req.cookies.toString() || '')
    const token = cookies.token

    console.log("Token:", token)
    
    if (token) {
        
        const verificationResult = await verifyToken(token);

        console.log("Verify:", verificationResult);

        if(verificationResult){
            // The user is logged in
            return new NextResponse( JSON.stringify({'status': 'LOGGED_IN', 'user': verificationResult}), { status: 200 });
        }
        return new NextResponse('Token not valid', { status: 401 });

    }

    // The user is not logged in
    return new NextResponse('Please log in', { status: 401 });
}