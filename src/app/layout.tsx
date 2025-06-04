import './globals.css'
import { Inter } from 'next/font/google'
import {SessionProvider} from "next-auth/react";
import {ProviderComp} from "@/lib/providers";

const inter = Inter({ subsets: ['latin'] })



export const metadata = {
  title: 'Sprachendorf - IGS Buchholz',
  description: '',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
      <html lang="en">
      <ProviderComp>
          <body className={inter.className}>{children}</body>
      </ProviderComp>
      </html>


  )
}
