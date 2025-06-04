'use server'
import {NextRequest, NextResponse} from "next/server";
import {redis} from "@/lib/redis";
import {parse} from "cookie";
import {verifyToken} from "@/lib/sessionmanager";
import {getUser} from "@/lib/user/usermanager";

// @ts-ignore
async function GET(req: NextRequest) {
    const cookies = parse(req.cookies.toString() || '');
    if (cookies) {
        const token = cookies.token;

        if (token) {
            const verificationResult = await verifyToken(token);

            if (verificationResult) {
                const email = verificationResult.email;
                const role = verificationResult.role

                let referenceUser = await getUser(email.toLowerCase())
                if(!referenceUser) {
                    return new NextResponse("ERROR", {status: 404});
                }
                console.log("uR", role)
                console.log("rUr", referenceUser.role)
                if (referenceUser.role != role) {

                    // Invalidate user session by clearing the token cookie and redirecting to login
                    const response = NextResponse.redirect(new URL('/login', req.url));
                    response.cookies.set('token', '', { maxAge: 0, path: '/' });
                    return response;
                }
                return new NextResponse("ALL FINE", {status: 200});
            }
        }
    }
    return new NextResponse("ERROR", {status: 403});
}

export {GET as GET}