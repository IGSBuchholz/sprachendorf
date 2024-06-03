//@ts-nocheck
import { courses, Course } from "@/lib/conutries";
import { getDatabaseConnection } from "@/lib/databsemanager";
import { NextResponse } from "next/server";

let countrieCache: Course[] = [];
let lastFetch: number;

export async function getCountries(){
    if(!lastFetch){
        console.log("refedinedas")
        lastFetch = Date.now();
    }


    console.log("Lastfetch", lastFetch)
    console.log(Date.now() - lastFetch)

    if(!(countrieCache.length>0 || (Date.now() - lastFetch) > 10*60*10000)){
        const connection = await getDatabaseConnection();

        const res = await connection.select().from(courses);

        countrieCache = res;
    }

    console.log("CC" + countrieCache)

    return countrieCache
}

export async function GET(req: Request){



    return new NextResponse(JSON.stringify({"countries": await getCountries()}))

}

