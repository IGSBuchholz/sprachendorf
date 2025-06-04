'use server'
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import { verifyToken } from "@/lib/sessionmanager";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import {setRole} from "@/lib/user/usermanager";

export async function POST(req: NextRequest) {
    const cookies = parse(req.cookies.toString() || "");
    if (cookies) {
        const token = cookies.token;

        if (token) {
            const verificationResult = await verifyToken(token);
            console.log("Verify:", verificationResult);

            if (verificationResult) {
                // Find the requesting user
                const requestingUser = await prisma.user.findFirst({
                    where: { email: verificationResult.email },
                });
                if (!requestingUser) {
                    return new NextResponse("UNAUTHORIZED", { status: 401 });
                }
                // Only TEACHER and ADMIN can change roles
                if (!(requestingUser.role === Role.TEACHER || requestingUser.role === Role.ADMIN)) {
                    return new NextResponse("FORBIDDEN", { status: 403 });
                }

                // Parse request body
                const body = await req.json();
                const targetEmail = body.email?.toLowerCase();
                const newRole: Role = body.newRole;

                if (!targetEmail || !newRole) {
                    return new NextResponse("Bad Request: missing email or newRole", { status: 400 });
                }

                // Verify the target user exists
                const targetUser = await prisma.user.findFirst({
                    where: { email: targetEmail },
                });
                if (!targetUser) {
                    return new NextResponse("User not found", { status: 404 });
                }

                // Define role hierarchy
                const roleRank: Record<Role, number> = {
                    [Role.USER]: 0,
                    [Role.HELPER]: 1,
                    [Role.TEACHER]: 2,
                    [Role.ADMIN]: 3,
                };

                // Prevent assigning a role higher than requester's role
                if (roleRank[newRole] > roleRank[requestingUser.role]) {
                    return new NextResponse("Cannot assign a role higher than your own", { status: 403 });
                }

                // Perform the update
                try {
                    await setRole(targetEmail, newRole)
                    return NextResponse.json({ message: "Role updated" }, { status: 200 });
                } catch (error) {
                    console.error("Failed to update role:", error);
                    return new NextResponse("Database error", { status: 500 });
                }
            }
        }
    }

    return new NextResponse("UNAUTHORIZED", { status: 401 });
}