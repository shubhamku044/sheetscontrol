import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import oauth2Client from "@/utils/google-auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({
      error: 'Google OAuth2 error' + error,
      status: 400,
    });
  }

  if (!code) {
    return NextResponse.json({
      error: 'No code provided',
      status: 400,
    });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    console.log('token -> ', tokens)
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'google_access_token',
      value: tokens.access_token ?? '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch (error) {
    return NextResponse.json({
      error: 'Google OAuth2 error' + error,
      status: 400,
    });
  }
}
