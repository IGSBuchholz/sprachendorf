//@ts-nocheck
import {NextRequest, NextResponse} from "next/server";
import {getDatabaseConnection} from "@/lib/databsemanager";
import {courses} from "@/lib/conutries";
import {parse} from "cookie";
import {verifyToken} from "@/lib/sessionmanager";
import {courseCompletitions} from "@/lib/coursecompletition";
import {eq} from "drizzle-orm";

export let courseCache = new Map();

export async function GET(req: NextRequest) {

    const cookies = parse(req.cookies.toString() || '')
    if(cookies){
        const token = cookies.token

        if (token) {

            const verificationResult = await verifyToken(token);

            if(courseCache.has(token)){

                return new NextResponse( JSON.stringify(courseCache.get(verificationResult?.email)), { status: 200 });

            }

            console.log("Verify:", verificationResult);

            if(verificationResult){

                const conn = await getDatabaseConnection()

                const res = await conn.select({
                    country: courseCompletitions.country,
                    level: courseCompletitions.level,
                    niveau: courseCompletitions.niveau,
                    imglink: courses.imglink,
                }).from(courseCompletitions).where(eq(verificationResult.email, courseCompletitions.email)).leftJoin(courses, eq(courseCompletitions.country, courses.country));

                courseCache.set(verificationResult.email, res);

                return new NextResponse( JSON.stringify(res), { status: 200 });
            }
            return new NextResponse('Token not valid', { status: 401 });

        }
    }

    return new NextResponse('Nothing here?! O_O', { status: 401 });

}
