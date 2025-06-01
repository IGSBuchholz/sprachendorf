//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { verifyToken } from "@/lib/sessionmanager";
import { prisma } from "@/lib/prisma";
import { courseCache } from "@/app/api/getcoursesdone/route";
import {decryptEmail} from "@/lib/ecrypt";
import { Role, User } from "@prisma/client";

export async function POST(req: NextRequest) {
    const cookies = parse(req.cookies.toString() || "");
    if (cookies) {
        const token = cookies.token;

        if (token) {
            const verificationResult = await verifyToken(token);
            console.log("Verify:", verificationResult);

            if (verificationResult) {
                const requestingUser = await prisma.user.findFirst({
                  where: { email: verificationResult.email },
                });
                if (!requestingUser) {
                  return new NextResponse("UNAUTHORIZED", { status: 401 });
                }
                if (!(requestingUser.role === Role.TEACHER || requestingUser.role === Role.ADMIN)) {
                  return new NextResponse("FORBIDDEN", { status: 403 });
                }

                const body = await req.json();
                const targetEmail = body.email?.toLowerCase();
                const operator = body.operator;

                if (operator) {
                  const users = await prisma.user.findMany({
                    where: {
                      email: { [operator]: targetEmail },
                    },
                  });
                  return NextResponse.json(users, { status: 200 });
                } else if (targetEmail) {
                  const user = await prisma.user.findFirst({
                    where: { email: targetEmail },
                  });
                  return NextResponse.json(user, { status: 200 });
                } else {
                  let rolesAllowed: Role[] = [];
                  if (requestingUser.role === Role.ADMIN) {
                    rolesAllowed = [Role.ADMIN, Role.TEACHER, Role.HELPER, Role.USER];
                  } else if (requestingUser.role === Role.TEACHER) {
                    rolesAllowed = [Role.TEACHER, Role.HELPER, Role.USER];
                  }
                  const users = await prisma.user.findMany({
                    where: { role: { in: rolesAllowed } },
                  });
                  return NextResponse.json(users, { status: 200 });
                }
            }
        }
    }

    return new NextResponse("UNAUTHORIZED", { status: 401 });
}