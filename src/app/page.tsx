import { Button } from '@/components/ui/button';
import oauth2Client from '@/utils/google-auth';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { LogoutButton } from '@/components';

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('google_access_token');

  const SCOPE = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/script.projects',
    'https://www.googleapis.com/auth/script.processes',
    'https://www.googleapis.com/auth/drive.scripts',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/script.external_request',
    'https://www.googleapis.com/auth/script.scriptapp',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/drive.appdata',
  ];

  const autorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPE,
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-10 text-5xl">Sheetscontrol</h1>
      <div className="flex gap-2">
        {isLoggedIn && (
          <Link href="/dashboard">
            <Button size="sm">Organise</Button>
          </Link>
        )}
        {isLoggedIn ? (
          <LogoutButton />
        ) : (
          <Link href={autorizationUrl}>
            <Button size="sm">Login To Google</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
