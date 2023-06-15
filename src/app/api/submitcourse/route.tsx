import { NewCourse } from "@/lib/conutries";
import { NewCourseCompletition, courseCompletitions } from "@/lib/coursecompletition";
import { getDatabaseConnection } from "@/lib/databsemanager";
import { verifyToken } from "@/lib/sessionmanager";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookies = parse(req.cookies.toString() || '')

    if(cookies){
        const token = cookies.token;
    
        if (token) {
            
            const verificationResult = await verifyToken(token);
    
            console.log("Verify:", verificationResult);
    
            if(verificationResult){
                
                const conn = await getDatabaseConnection();

                const body = await req.json();
                console.log("Reqbody", body)

                const newCC: NewCourseCompletition = {email: body.email.toLocaleLowerCase(), country: body.course.country, level: body.level, niveau: body.courseNiveau}

                await conn.insert(courseCompletitions).values(newCC)

                return new NextResponse( "SUCCESS", { status: 200 } );
            }    
        }
    }
    
    return new NextResponse('UNAUTHORIZED', { status: 401 });

}