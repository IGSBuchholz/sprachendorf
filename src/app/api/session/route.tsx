import {NextResponse} from "next/server";

export async function GET(req, NextRequest) {
    if (req.user) {
        // The user is logged in
        return new NextResponse( {'status': 'LOGGED_IN', 'user': req.user}, { status: 200 });
    }

    // The user is not logged in
    return new NextResponse('Please log in', { status: 401 });
}