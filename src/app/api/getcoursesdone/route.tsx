//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { verifyToken } from "@/lib/sessionmanager";
import { prisma } from "@/lib/prisma";
import {getServerSession} from "next-auth";
import { authOptions } from "@/lib/authOptions";import {NextApiRequest, NextApiResponse} from "next";
import {redis} from "@/lib/redis";

export async function GET(req: NextRequest) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (session) {

      let user = session.user;
      const email = user.email;
  console.log("d")
        if (await redis.exists("cc_" + email)) {
            console.log("le", JSON.stringify(await redis.get("cc_" + email)))
            return new NextResponse(await redis.get("cc_" + email), { status: 200 });
        }

        console.log("Verify:", user);

        try {
          const res = await prisma.$queryRaw<Array<{ country: string; level: number; niveau: number; imglink: string | null }>>`
            SELECT cc.country, cc.level, cc.niveau, c.imglink
            FROM coursecompletition cc
            LEFT JOIN courses c ON cc.country = c.language
            WHERE cc.email = ${email};
          `;

          redis.set("cc_" + email, JSON.stringify(res));
          return new NextResponse(JSON.stringify(res), { status: 200 });
        } catch (error) {
          console.error('Failed to fetch course completitions:', error);
          return new NextResponse('Database error', { status: 500 });
        }
  }

  return new NextResponse('Nothing here?! O_O', { status: 401 });
}
