import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { fileId } = await req.json();

  try {
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
      requestBody: { trashed: true },
    });

    return NextResponse.json({
      success: true,
      message: 'File moved to trash successfully',
    });
  } catch (error: any) {
    console.error('Trash error:', error);
    return NextResponse.json(
      {
        error: 'Failed to trash file',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
