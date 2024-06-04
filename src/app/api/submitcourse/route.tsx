import { NewCourse } from "@/lib/conutries";
import { NewCourseCompletition, courseCompletitions } from "@/lib/coursecompletition";
import { getDatabaseConnection } from "@/lib/databsemanager";
import { verifyToken } from "@/lib/sessionmanager";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import {courseCache} from "@/app/api/getcoursesdone/route";

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

                const newCC: NewCourseCompletition = {id: Math.floor(Math.random()*1000000), email: body.email.toLocaleLowerCase(), country: body.course.country, level: body.level, niveau: body.courseNiveau}

                await conn.insert(courseCompletitions).values(newCC)

                if(courseCache.has(verificationResult.email)){

                    courseCache.delete(verificationResult.email);

                }

                return new NextResponse( "SUCCESS", { status: 200 } );
            }    
        }
    }
    
    return new NextResponse('UNAUTHORIZED', { status: 401 });

}