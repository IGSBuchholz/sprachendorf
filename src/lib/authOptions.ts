// src/lib/authOptions.ts

import { NextAuthOptions } from "next-auth";
import { OAuthConfig } from "next-auth/providers";
import { Profile } from "next-auth";
import { getUser, insertUser } from "@/lib/user/usermanager";

export const authOptions: NextAuthOptions = {
    // Falls du weitere Provider (z. B. GitHub oder Credentials) nutzen möchtest,
    // kannst du sie hier ergänzen. Im Folgenden ist nur der IServ-OAuth-Provider konfiguriert.
    providers: [
        <OAuthConfig<any>>{
            id: "iserv",
            name: "IServ",
            type: "oauth",
            version: "2.0",
            issuer: "https://igs-buchholz.de",
            // 1. OpenID-Connect-Scope
            scope: "openid email profile",
            jwks_endpoint: process.env.AUTH_JWK!, // z. B. AUTH_JWK="https://igs-buchholz.de/iserv/.well‐known/jwks.json"

            // 2. Authorisierungs-Endpoint (response_type=code, Scope openid email profile)
            authorization: {
                url: "https://igs-buchholz.de/iserv/oauth/v2/auth",
                params: {
                    response_type: "code",
                    scope: "openid email profile",
                },
            },

            // 3. Token-Endpoint (Code → Access-/ID-Token)
            token: {
                url: process.env.AUTH_TOKENURL!, // z. B. "https://igs-buchholz.de/iserv/oauth/v2/token"
            },

            // 4. Userinfo-Endpoint (gibt Profildaten zurück)
            userinfo: {
                url: process.env.AUTH_USERINFOURL!, // z. B. "https://igs-buchholz.de/iserv/public/oauth/userinfo"
            },

            // 5. Deine IServ-Client-Anmeldedaten (in .env hinterlegen)
            clientId: process.env.OAUTH_ID!,      // z. B. "my-iserv-client-id"
            clientSecret: process.env.OAUTH_SECRET!,

            // 6. Profil-Mapping: wandelt das JSON aus /userinfo in session.user um
            async profile(profileJson: any) {
                // Beispiel: profileJson könnte enthalten:
                // {
                //   sub: "12345",
                //   name: "Max Mustermann",
                //   email: "max@igs-buchholz.de",
                //   vorname: "Max",
                //   nachname: "Mustermann",
                //   … weitere Felder …
                // }

                // Prüfe, ob der User bereits in der Datenbank existiert
                let dbUser = await getUser(profileJson.email);
                if (!dbUser) {
                    dbUser = await insertUser(profileJson.email);
                }

                return {
                    id: profileJson.sub,
                    // Falls „name“ null ist, falls es nur vorname/nachname gibt:
                    name:
                        profileJson.name ??
                        `${profileJson.vorname || ""} ${profileJson.nachname || ""}`.trim(),
                    email: profileJson.email,
                    role: dbUser.role,             // aus eigener Tabelle
                    startcountry: dbUser.startcountry,
                };
            },
        },
    ],

    // JWT- und Session-Callbacks, damit role + startcountry in token & session verfügbar sind
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore: user.role wird dynamisch aus profile() hinzugefügt
                token.role = (user as any).role;
                // @ts-ignore:
                token.startcountry = (user as any).startcountry;
            }
            return token;
        },
        async session({ session, token }) {
            // @ts-ignore:
            session.user.role = (token as any).role;
            // @ts-ignore:
            session.user.startcountry = (token as any).startcountry;
            return session;
        },
    },

    // Session-Einstellungen: JWT-Strategie mit 30 Tagen Maximalalter
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 Tage in Sekunden
    },
};