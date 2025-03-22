import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get original file name
    const originalFile = await drive.files.get({ fileId });
    const newName = `Copy of ${originalFile.data.name}`;

    // Create copy
    const response = await drive.files.copy({
      fileId,
      requestBody: {
        name: newName,
      },
    });

    return NextResponse.json({
      success: true,
      newFileId: response.data.id,
      newFileName: newName,
    });
  } catch (error) {
    console.error('Copy error:', error);
    return NextResponse.json({ error: 'Failed to copy file' }, { status: 500 });
  }
}
