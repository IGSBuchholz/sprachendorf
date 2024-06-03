import {Course, courses} from "@/lib/conutries";
import {getDatabaseConnection} from "@/lib/databsemanager";
let countrieCache: Course[] = [];
let lastFetch: number;


export async function getCountries(): Promise<Course[]>{
    if(!lastFetch){
        console.log("refedinedas")
        lastFetch = Date.now();
    }


    console.log("Lastfetch", lastFetch)
    console.log(Date.now() - lastFetch)

    if(!(countrieCache.length>0 || (Date.now() - lastFetch) > 10*60*10000)){
        const connection = await getDatabaseConnection();

        countrieCache = await connection.select().from(courses);
    }

    console.log("CC" + countrieCache)

    return countrieCache
}