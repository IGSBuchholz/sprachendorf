import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github"
// auth.ts
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { insertUser } from "@/lib/user/usermanager";
import {OAuthConfig} from "next-auth/providers";

const env = process.env;
const handler = NextAuth({
    providers: [
        // @ts-ignore
        {
            id: "iserv",
            name: "IServ",
            type: "oauth",
            authorization: {
                url: "https://igs-buchholz.de/iserv/oauth/v2/auth",
                params: { scope: "email profile" }
            },
            token: {
                url: env.AUTH_TOKENURL,
            },
            userinfo: {
                url: env.AUTH_USERINFOURL,
            },
            clientId: env.OAUTH_ID!,
            clientSecret: env.OAUTH_SECRET!,
        } as OAuthConfig<any>
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
