import {NextRequest, NextResponse} from "next/server";
import {getDatabaseConnection} from "@/lib/databsemanager";
import {courses} from "@/lib/conutries";
import {parse} from "cookie";
import {verifyToken} from "@/lib/sessionmanager";
import {courseCompletitions} from "@/lib/coursecompletition";
import {eq} from "drizzle-orm";

export async function GET(req: NextRequest) {

    const cookies = parse(req.cookies.toString() || '')
    if(cookies){
        const token = cookies.token

        if (token) {

            const verificationResult = await verifyToken(token);

            console.log("Verify:", verificationResult);

            if(verificationResult){

                const conn = await getDatabaseConnection()

                const res = await conn.select({
                    country: courseCompletitions.country,
                    level: courseCompletitions.level,
                    niveau: courseCompletitions.niveau,
                    imglink: courses.imglink
                }).from(courseCompletitions).where(eq(verificationResult.email, courseCompletitions.email)).leftJoin(courses, eq(courseCompletitions.country, courses.country));

                console.log(res)

                return new NextResponse( JSON.stringify(res), { status: 200 });
            }
            return new NextResponse('Token not valid', { status: 401 });

        }
    }

}
