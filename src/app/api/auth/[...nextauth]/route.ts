import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github"
// auth.ts
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { insertUser } from "@/lib/user/usermanager";
import {OAuthConfig} from "next-auth/providers";
import {Profile} from "next-auth";

const env = process.env;
const handler = NextAuth({
    providers: [
        <OAuthConfig<any>>{
            id: "iserv",
            name: "IServ",
            type: "oauth",
            version: "2.0",

            // 1) We must ask for “openid” first, then “email” and “profile.”
            //    If you omit "openid", IServ’s /userinfo will reject you.
            scope: "openid email profile",

            // 2) IServ wants response_type=code and those scopes.
            authorization: {
                url: "https://igs-buchholz.de/iserv/oauth/v2/auth",
                params: {
                    // NextAuth will really do:
                    //   https://…/auth?response_type=code&scope=openid%20email%20profile
                    response_type: "code",
                    scope: "openid email profile",
                },
            },

            // 3) Endpoint to exchange code → tokens
            //    (matches your ENV: AUTH_TOKENURL="https://…/token")
            token: {
                url: process.env.AUTH_TOKENURL!, // “https://igs-buchholz.de/iserv/oauth/v2/token”
                // IServ understands standard “grant_type=authorization_code” implicitly.
                // NextAuth will POST { code, client_id, client_secret, redirect_uri, grant_type } here.
            },

            // 4) Endpoint to fetch the user’s identity
            userinfo: {
                url: process.env.AUTH_USERINFOURL!, // “https://igs-buchholz.de/iserv/public/oauth/userinfo”
                // By default, NextAuth will pass `Authorization: Bearer <access_token>` here.
            },

            // 5) Your IServ “client_id” + “client_secret” from the admin UI
            clientId: process.env.OAUTH_ID!,
            clientSecret: process.env.OAUTH_SECRET!,

            // 6) Map IServ’s userinfo JSON → NextAuth’s session.user
            profile(profileJson: any) {
                // Oftentimes IServ’s `/userinfo` returns something like:
                // {
                //   "sub": "12345",
                //   "name": "Max Mustermann",
                //   "email": "max.mustermann@igs-buchholz.de",
                //   "vorname": "Max",
                //   "nachname": "Mustermann",
                //   …other fields…
                // }
                return {
                    id: profileJson.sub ?? profileJson.id ?? null,
                    name: profileJson.name ?? `${profileJson.vorname || ""} ${profileJson.nachname || ""}`.trim(),
                    email: profileJson.email,
                    // you can spread any other fields you want into `session.user`:
                    // e.g. `role: profileJson.role`, etc.
                    // As long as they come back in JWT callbacks, they’ll end up in `session`.
                };
            },
        },
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                //@ts-ignore
                token.role = user.role;
                //@ts-ignore
                token.startcountry = user.startcountry
            }
            return token;
        },
        async session({ session, token }) {
            // Now TS knows `session.user.role` is allowed
            //@ts-ignore
            session.user.role = token.role!;
            //@ts-ignore
            session.user.startcountry = token.startcountry;
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
})
// @ts-ignore
export { handler as GET, handler as POST}
