//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { verifyToken } from "@/lib/sessionmanager";
import { prisma } from "@/lib/prisma";
import { courseCache } from "@/app/api/getcoursesdone/route";
import {decryptEmail} from "@/lib/ecrypt";

export async function POST(req: NextRequest) {
  const cookies = parse(req.cookies.toString() || "");
  if (cookies) {
    const token = cookies.token;

    if (token) {
      const verificationResult = await verifyToken(token);
      console.log("Verify:", verificationResult);

      if (verificationResult) {
        const body = await req.json();
        console.log("Reqbody", body);


        try {
          await prisma.courseCompletition.create({
            data: {
              email: body.email.toLowerCase(),
              country: body.course.country,
              level: body.level,
              niveau: body.courseNiveau,
            },
          });
        } catch (error) {
          console.error("Failed to insert course completition:", error);
          return new NextResponse("Database error", { status: 500 });
        }

        if (courseCache.has(verificationResult.email)) {
          courseCache.delete(verificationResult.email);
        }

        return new NextResponse("SUCCESS", { status: 200 });
      }
    }
  }

  return new NextResponse("UNAUTHORIZED", { status: 401 });
}