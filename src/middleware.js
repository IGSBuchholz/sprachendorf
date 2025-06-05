import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import {Role} from "@prisma/client";

export default withAuth(
    // `withAuth` augments your `Request` with the user's token.
    function middleware(req) {
        console.log("MIDDLEWARE")
        if (
            req.nextUrl.pathname.startsWith("/loggedin") &&
            !req.nextauth.token
        ) {
            return NextResponse.redirect(new URL("/api/auth/signin", req.url));
        }
        let isOrga = req.nextauth.token?.role == "TEACHER" || req.nextauth.token?.role == "ADMIN"
        console.log("isOrga", isOrga)
        console.log(req.nextUrl.pathname.toLowerCase().startsWith("/"))

        if(req.nextUrl.pathname.toLowerCase().startsWith("/loggedin/orga/scanner")){

            if(!(isOrga || req.nextauth.token?.role=="HELPER")){
                return NextResponse.redirect(new URL("/loggedin/dashboard", req.url));
            }

        } else if (req.nextUrl.pathname.toLowerCase().startsWith("/loggedin/orga") && (!isOrga)) {
            return NextResponse.redirect(new URL("/loggedin/dashboard", req.url));
        }
    },
    {
        callbacks: {
            authorized: (params) => {
                let { token } = params;
                return !!token;
            },
        },
    }
);

export const config = { matcher: ["/loggedin/:path*"] };