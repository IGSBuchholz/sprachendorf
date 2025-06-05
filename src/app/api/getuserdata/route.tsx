//@ts-nocheck
import {NextRequest, NextResponse} from "next/server";
import {parse} from "cookie";
import {verifyToken} from "@/lib/sessionmanager";
import {prisma} from "@/lib/prisma";
import {courseCache} from "@/app/api/getcoursesdone/route";
import {decryptEmail} from "@/lib/ecrypt";
import {Role, User} from "@prisma/client";
import {getServerSession} from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {UserSession} from "@/lib/usersession";
import {insertUser} from "@/lib/user/usermanager";
import { redis } from "@/lib/redis";

 async function handle(req: NextRequest) {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    if (session && session.user) {
        const user: UserSession = session.user as UserSession;
        const requestingUser = await prisma.user.findFirst({
            where: {email: user.email},
        });
        if (!requestingUser) {
            return new NextResponse("UNAUTHORIZED", {status: 401});
        }
        if (!(requestingUser.role === Role.TEACHER || requestingUser.role === Role.ADMIN)) {
            return new NextResponse("FORBIDDEN", {status: 403});
        }
        let operator = "";
        let targetEmail = ""
        if(req.body){
            const body = await req.json();
            operator = body.operator;
            targetEmail = body.email?.toLowerCase();
        }

        if (operator) {
            const users = await prisma.user.findMany({
                where: {
                    email: {[operator]: targetEmail},
                },
            });
            return NextResponse.json(users, {status: 200});
        } else if (targetEmail) {
            console.log("targetEmail");
            let user = await prisma.user.findFirst({
                where: {email: targetEmail},
            });
            if(!user) {
                user = await insertUser(targetEmail.toLowerCase());
            }
            return NextResponse.json(user, {status: 200});
        } else {
            let rolesAllowed: Role[] = [];
            if (requestingUser.role === Role.ADMIN) {
                rolesAllowed = [Role.ADMIN, Role.TEACHER, Role.HELPER, Role.USER];
            } else if (requestingUser.role === Role.TEACHER) {
                rolesAllowed = [Role.TEACHER, Role.HELPER, Role.USER];
            }
            console.log("rolesAllowed", rolesAllowed.toString());
            let redisString = "usersCached_visibleRoles" + rolesAllowed.length
            console.log(redisString)
            let red = await redis.get(redisString);
            if(red) {
                console.log("from redis", red)
                return NextResponse.json(JSON.parse(red), {status: 200});
            }
            const users = await prisma.user.findMany({
                where: {role: {in: rolesAllowed}},
            });
            await redis.set(redisString, JSON.stringify(users))
            return NextResponse.json(users, {status: 200});
        }

    }
    return new NextResponse("UNAUTHORIZED", {status: 401});
}

export {handle as GET, handle as POST}