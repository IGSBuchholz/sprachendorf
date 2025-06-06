//@ts-nocheck
import {NextRequest, NextResponse} from "next/server";
import {parse} from "cookie";
import {verifyToken} from "@/lib/sessionmanager";
import {prisma} from "@/lib/prisma";
import {courseCache} from "@/app/api/getcoursesdone/route";
import {decryptEmail} from "@/lib/ecrypt";
import {redis} from "@/lib/redis";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/authOptions";
import {UserSession} from "@/lib/usersession";
import {Role} from "@prisma/client";

export async function POST(req: NextRequest) {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    if (session && session.user) {
        const user: UserSession = session.user as UserSession;
        const body = await req.json();
        console.log("Reqbody", body);
        if (user.role == Role.USER) {
            return new NextResponse("UNAUTHORIZED (Role)", {status: 401});
        }
        let touse = body.email.toLowerCase();
        console.log("email", body.email)
        if (body.email.startsWith("https://sprachendorf.igsbuchholz.de")) {
            let email = "";
            let qr = body.email.split("....")[0];
            qr = qr.replace("https://sprachendorf.igsbuchholz.de/user?id=", "")
            // Decode any URL-encoded characters and trim whitespace to ensure valid Base64 input
            qr = decodeURIComponent(qr);
            qr = qr.trim();
            console.log("qr")
            email = await decryptEmail(qr, process.env.UUID_SALT)
            console.log("email", email)
            touse = email
        }
        console.log("touse", touse)

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        try {
            await prisma.courseCompletition.create({
                data: {
                    id: getRandomInt(9999999),
                    email: touse,
                    country: body.course.country,
                    level: body.level,
                    niveau: body.courseNiveau,
                },
            });

        } catch (error) {
            console.error("Failed to insert course completition:", error);
            return new NextResponse("Database error", {status: 500});
        }

        if (redis.exists("cc_" + body.email.toLowerCase())) {
            console.log("deleted red")
            let s = await redis.del("cc_" + body.email.toLowerCase());
            console.log("deleted red number", s)
        }

        return new NextResponse("SUCCESS", {status: 200});
    }

    return new NextResponse("UNAUTHORIZED", {status: 401});
}