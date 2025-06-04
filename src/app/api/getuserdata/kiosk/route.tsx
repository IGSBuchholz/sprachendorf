//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { verifyToken } from "@/lib/sessionmanager";
import { prisma } from "@/lib/prisma";
import { courseCache } from "@/app/api/getcoursesdone/route";
import {decryptEmail} from "@/lib/ecrypt";
import { Role, User } from "@prisma/client";

export async function POST(req: NextRequest) {
    const body = await req.json();
    //TODO: Add redis caching
    let unauthorized = false;
    if(!body.key){
        return new NextResponse("UNAUTHORIZED", { status: 401 });
    }

    let key = body.key;
    let dbreq = await prisma.kiosks.findFirst({ where: { key: key }});
    console.log("dbreq", dbreq)
    if(!dbreq) {
        return new NextResponse("UNAUTHORIZED", { status: 401 });
    }

    const res = await prisma.$queryRaw<Array<{ country: string; level: number; niveau: number; imglink: string | null }>>`
            SELECT cc.country, cc.level, cc.niveau, c.imglink
            FROM coursecompletition cc
            LEFT JOIN courses c ON cc.country = c.language
            WHERE cc.email = ${email};
          `;

    return new NextResponse(JSON.stringify(res), { status: 200 });
}