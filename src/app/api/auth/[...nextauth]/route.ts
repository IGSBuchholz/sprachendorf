import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github"
// auth.ts
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import {getUser, insertUser} from "@/lib/user/usermanager";
import {OAuthConfig} from "next-auth/providers";
import {Profile} from "next-auth";
import { authOptions } from "@/lib/authOptions";

// @ts-ignore
const handler = NextAuth(authOptions)

// @ts-ignore
export { handler as GET, handler as POST}
