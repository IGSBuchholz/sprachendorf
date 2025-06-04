// auth.ts
import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { insertUser } from "@/lib/user/usermanager";

const env = process.env
export const { handlers, signIn, signOut, auth } = NextAuth({

    providers: [
        {
            id: "iserv",
            name: "IServ",
            type: "oauth",
            authorization: {
                url: "https://igs-buchholz.de/iserv/oauth/v2/auth",
                params: { scope: "email profile groups" }
            },
            token: {
                url: env.AUTH_TOKENURL,
            },
            userinfo: {
                url: env.AUTH_USERINFOURL,
            },
            clientId: env.OAUTH_ID,
            clientSecret: env.OAUTH_SECRET
        }
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
});