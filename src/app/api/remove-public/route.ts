import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import oauth2Client from '@/utils/google-auth';

export async function POST(req: Request) {
  const { fileId } = await req.json();
  const drive = google.drive('v3');

  if (typeof fileId !== 'string') {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
  }

  try {
    const { data } = await drive.permissions.list({
      fileId,
      auth: oauth2Client,
    });

    await Promise.all(
      (data.permissions || []).map(async (permission) => {
        if (permission.type === 'anyone' && typeof permission.id === 'string') {
          await drive.permissions.delete({
            fileId: fileId,
            permissionId: permission.id,
            auth: oauth2Client,
          });
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove public access error:', error);
    return NextResponse.json({ error: 'Failed to remove public access' }, { status: 500 });
  }
}
