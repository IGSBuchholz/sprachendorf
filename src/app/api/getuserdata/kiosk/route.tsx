//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { verifyToken } from "@/lib/sessionmanager";
import { prisma } from "@/lib/prisma";
import { courseCache } from "@/app/api/getcoursesdone/route";
import {decryptEmail} from "@/lib/ecrypt";
import { Role, User } from "@prisma/client";
import {redis} from "@/lib/redis";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let unauthorized = false;
    if(!body.key){
        return new NextResponse("UNAUTHORIZED", { status: 401 });
    }

    let key = body.key;
    if(await redis.exists("kiosk_" + key)){
        let value = await redis.get("kiosk_"+key);
        console.log("v", value)
        if(value != "TRUE") {
            return new NextResponse("UNAUTHORIZED", { status: 401 });
        }
    }else {
        let dbreq = await prisma.kiosks.findFirst({ where: { key: key }});
        console.log("dbreq", dbreq)
        await redis.set("kiosk_" + key, (dbreq ? "TRUE" : "FALSE"));
        if(!dbreq) {
            return new NextResponse("UNAUTHORIZED", { status: 401 });
        }
    }
    let email = "";
    let qr = body.qr.split("....")[0];
    qr = qr.replace("https://sprachendorf.igsbuchholz.de/user?id=", "")
    email = await decryptEmail(qr, process.env.UUID_SALT)
    console.log("email", email)
    const res = await prisma.$queryRaw<Array<{ country: string; level: number; niveau: number; imglink: string | null }>>`
            SELECT cc.country, cc.level, cc.niveau, c.imglink
            FROM coursecompletition cc
            LEFT JOIN courses c ON cc.country = c.language
            WHERE cc.email = ${email};
          `;
    console.log(res)
    return new NextResponse(JSON.stringify({coursesDone: res}), { status: 200 });
}