import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import oauth2Client from '@/utils/google-auth';

export async function POST(req: Request) {
  const { fileId } = await req.json();
  const drive = google.drive('v3');

  try {
    // First list all public permissions
    const { data } = await drive.permissions.list({
      fileId,
      auth: oauth2Client,
    });

    // Delete all public permissions
    await Promise.all(
      data.permissions?.map(async (permission) => {
        if (permission.type === 'anyone') {
          await drive.permissions.delete({
            fileId,
            permissionId: permission.id,
            auth: oauth2Client,
          });
        }
      }) || []
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove public access' }, { status: 500 });
  }
}
