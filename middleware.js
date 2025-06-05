import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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
        console.log(req.nextauth);
        if (
            req.nextUrl.pathname === "/admin-dashboard" &&
            req.nextauth.token?.role !== "admin"
        ) {
            return new NextResponse("You are not authorized!");
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