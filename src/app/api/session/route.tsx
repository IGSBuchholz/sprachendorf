

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // adjust the import path to match your project

export async function GET(request: Request) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session);
  // @ts-ignore
  return NextResponse.json({ loggedIn: isLoggedIn, "role": session.user.role, "email": session.user.email });
}