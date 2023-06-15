'use server';
import { parse } from 'cookie'
import { verifyToken } from './lib/sessionmanager'
import {NextRequest, NextResponse} from "next/server";
import { cookies } from 'next/headers'
// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
     const cookies = parse(req.cookies.toString() || '')
     const token = cookies.token


     //let user = null;
     //if (token) {
     //    user = await verifyToken(token)
     //    if (user) {
     //        req.user = user
     //    }
     //}
     //console.log(user)

     // console.log(user)
     //
     // // Check if the user is trying to access an admin route
     // if (req.nextUrl.pathname.startsWith('/admin')) {
     //     // If the user is not logged in or not an admin, return a 403 Forbidden response
     //     if (!user || user.role !== 'admin') {
     //         return new NextResponse('Forbidden', { status: 403 });
     //     }
     // }
     //
     // // Pass the user object to the response, this would be null if no user is authenticated
     const res = NextResponse.next()
     // res.locals.user = user;
     return res;
}



// export async function middleware(req, ev) {
//     const cookies = parse(req.headers.cookie || '')
//     const token = cookies.token
//
//     console.log(user)
//
//
//     let user = null;
//
//     if (token) {
//         user = verifyToken(token)
//         if (user) {
//             req.user = user
//         }
//     }
//
//     console.log(user)
//
//     // Check if the user is trying to access an admin route
//     if (req.nextUrl.pathname.startsWith('/admin')) {
//         // If the user is not logged in or not an admin, return a 403 Forbidden response
//         if (!user || user.role !== 'admin') {
//             return new NextResponse('Forbidden', { status: 403 });
//         }
//     }
//
//     // Pass the user object to the response, this would be null if no user is authenticated
//     const res = NextResponse.next()
//     res.locals.user = user;
//     return res;
// }