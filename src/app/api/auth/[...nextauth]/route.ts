import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
// auth.ts
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { insertUser } from "@/lib/user/usermanager";

const env = process.env;
export const handler = NextAuth({
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
            clientId: env.OAUTH_ID,
            clientSecret: env.OAUTH_SECRET
        },
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
            },
            async authorize(credentials) {
                console.log(credentials);

                // We already asserted credentials as { username: string } elsewhere
                const { username: rawUsername } = credentials as { username: string };
                let username: string = rawUsername;
                if (!username.endsWith("@igs-buchholz.de")) {
                    username += "@igs-buchholz.de";
                }

                let user = await prisma.user.findUnique({ where: { email: username } });
                if (!user) {
                    console.log("User not found");
                    user = await insertUser(username);
                }

                console.log("User", user);
                // Return an object that *matches* our augmented User type:
                return { email: user.email, role: user.role, startcountry: user.startcountry };
            },
        }),
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
