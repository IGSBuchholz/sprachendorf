//@ts-nocheck
import { NextResponse } from "next/server";
import {getCountries} from "@/lib/countriesmanager";




export async function GET(req: Request){



    return new NextResponse(JSON.stringify({"countries": await getCountries()}))

}

