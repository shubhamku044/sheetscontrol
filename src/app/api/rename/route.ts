// app/api/rename/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { fileId, newName } = await request.json();
    if (!fileId || !newName) {
      return NextResponse.json({ error: 'Missing file ID or new name' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    await drive.files.update({
      fileId,
      requestBody: {
        name: newName,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'File renamed successfully',
    });
  } catch (error) {
    console.error('Rename error:', error);
    return NextResponse.json({ error: 'Failed to rename file' }, { status: 500 });
  }
}
