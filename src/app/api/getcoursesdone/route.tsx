//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { verifyToken } from "@/lib/sessionmanager";
import { prisma } from "@/lib/prisma";

let courseCache = new Map<string, Array<{ country: string; level: number; niveau: number; imglink: string | null }>>();

export async function GET(req: NextRequest) {
  const cookies = parse(req.cookies.toString() || '');
  if (cookies) {
    const token = cookies.token;

    if (token) {
      const verificationResult = await verifyToken(token);

      if (verificationResult) {
        const email = verificationResult.email;

        if (courseCache.has(email)) {
          return new NextResponse(JSON.stringify(courseCache.get(email)), { status: 200 });
        }

        console.log("Verify:", verificationResult);

        try {
          const res = await prisma.$queryRaw<Array<{ country: string; level: number; niveau: number; imglink: string | null }>>`
            SELECT cc.country, cc.level, cc.niveau, c.imglink
            FROM coursecompletition cc
            LEFT JOIN courses c ON cc.country = c.language
            WHERE cc.email = ${email};
          `;

          courseCache.set(email, res);
          return new NextResponse(JSON.stringify(res), { status: 200 });
        } catch (error) {
          console.error('Failed to fetch course completitions:', error);
          return new NextResponse('Database error', { status: 500 });
        }
      }

      return new NextResponse('Token not valid', { status: 401 });
    }
  }

  return new NextResponse('Nothing here?! O_O', { status: 401 });
}
