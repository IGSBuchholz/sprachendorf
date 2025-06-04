"use client";
import { SessionProvider } from "next-auth/react";

export function ProviderComp({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}