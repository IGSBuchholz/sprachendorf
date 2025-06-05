'use server'
import {NextRequest, NextResponse} from "next/server";
import {redis} from "@/lib/redis";
import {parse} from "cookie";
import {verifyToken} from "@/lib/sessionmanager";
import {getUser} from "@/lib/user/usermanager";
import {getServerSession} from "next-auth/next";
import { authOptions } from "@/lib/authOptions";import {UserSession} from "@/lib/usersession";
import {User} from "@prisma/client";

async function GET(req: NextRequest) {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    if(session && session.user) {
        const user: UserSession  = session.user as UserSession;
                const email = user.email!;

        const role = user.role

                let referenceUser = await getUser(email.toLowerCase())
                if(!referenceUser) {
                    return new NextResponse("ERROR", {status: 404});
                }
                console.log("uR", role)
                console.log("rUr", referenceUser.role)
                if (referenceUser.role != role) {

                    return new NextResponse("LOG OUT", {status: 401});
                }
                return new NextResponse("ALL FINE", {status: 200});

    }
    return new NextResponse("ERROR", {status: 403});
}

export {GET as GET}