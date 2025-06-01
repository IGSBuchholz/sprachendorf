

// route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { encryptEmail, decryptEmail } from '@/lib/ecrypt';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Retrieve the salt from environment (must be set in your environment variables)
  const uuidSalt = process.env.UUID_SALT;
  if (!uuidSalt) {
    return NextResponse.json(
      { error: 'UUID_SALT is not configured in environment variables.' },
      { status: 500 }
    );
  }

  // If "email" param is provided → encrypt
  if (searchParams.has('email')) {
    const email = searchParams.get('email')!;
    try {
      const token = await encryptEmail(email, uuidSalt);
      return NextResponse.json({ token });
    } catch (err) {
      return NextResponse.json(
        { error: `Encryption failed: ${err instanceof Error ? err.message : err}` },
        { status: 400 }
      );
    }
  }

  // If "id" param is provided → decrypt
  if (searchParams.has('id')) {
    const token = searchParams.get('id')!;
    try {
      const email = await decryptEmail(token, uuidSalt);
      return NextResponse.json({ email });
    } catch (err) {
      return NextResponse.json(
        { error: `Decryption failed: ${err instanceof Error ? err.message : err}` },
        { status: 400 }
      );
    }
  }

  // Neither "email" nor "id" provided → bad request
  return NextResponse.json(
    { error: 'Provide either "email" (to encrypt) or "id" (to decrypt) as a query parameter.' },
    { status: 400 }
  );
}