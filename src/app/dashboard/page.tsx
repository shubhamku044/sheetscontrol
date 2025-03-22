import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Search } from 'lucide-react';
import Link from 'next/link';
import oauth2Client from '@/utils/google-auth';
import { Input } from '@/components/ui/input';
import { SheetActions, LogoutButton } from '@/components';

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('google_access_token')?.value;
  oauth2Client.setCredentials({ access_token: accessToken });

  let sheets;
  const drive = google.drive('v3');

  try {
    const res = await drive.files.list({
      auth: oauth2Client,
      pageSize: 50,
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields:
        'nextPageToken, files(id, name, webViewLink, thumbnailLink, shared, owners, permissions)',
      orderBy: 'modifiedTime desc',
    });
    console.log('Sheets:', res);
    sheets = res.data.files;
  } catch (error) {
    console.error('Error fetching sheets:', error);
    return (
      <div className="min-h-screen w-full p-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-destructive text-4xl font-bold">Error Loading Sheets</h1>
          <p className="text-muted-foreground mt-4">
            Please check your internet connection and try refreshing the page.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard">Retry</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
  };

  const stats = [
    { title: 'Owned', value: 13 },
    { title: 'Shared', value: 11 },
    { title: 'Public', value: 20 },
    { title: 'Shared with me', value: 5 },
    { title: 'Shared to Public', value: 5 },
    { title: 'Public Editor', value: 3 },
  ];

  return (
    <div className="min-h-screen w-full p-4 md:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Google Sheets Management</h1>
          <div className="flex items-center gap-4">
            <LogoutButton />
            <Button asChild>
              <Link href="https://docs.google.com/spreadsheets" target="_blank">
                Create New Sheet
              </Link>
            </Button>
          </div>
        </div>
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input placeholder="Search spreadsheets..." className="pl-8" />
          </div>
          <div className="flex gap-4">
            <Button variant="outline">All Sheets</Button>
            <Button variant="outline">Private</Button>
            <Button variant="outline">Shared</Button>
            <Button variant="outline">Public</Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Badge className="h-6 px-2">{stat.value}</Badge>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">SpreadSheet Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">No of Sheets</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Sharing Status/Owner</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Last Modified</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Viewers</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Blank Sheets</th>
                <th className="px-6 py-3 text-left text-sm font-medium">App Script</th>
              </tr>
            </thead>
            <tbody>
              {sheets?.map((sheet) => (
                <tr key={sheet.id} className="hover:bg-muted/50 border-t">
                  <td className="px-6 py-4 font-medium">{sheet.name}</td>
                  <td className="px-6 py-4">{Math.floor(Math.random() * 5) + 1} ○</td>
                  <td className="px-6 py-4">
                    {sheet.shared ? (
                      sheet.permissions?.some((p) => p.type === 'anyone') ? (
                        <Badge>Public</Badge>
                      ) : (
                        <span>{sheet.owners?.[0].displayName || 'Shared'}</span>
                      )
                    ) : (
                      <Badge>Private</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">{formatDate(sheet.modifiedTime)}</td>
                  <td className="px-6 py-4">{sheet.permissions?.length || 'None'}</td>
                  <td className="px-6 py-4">
                    {sheet.id && (
                      <SheetActions
                        key={sheet.id}
                        sheet={{
                          id: sheet.id,
                          name: sheet.name || 'Untitled',
                          // webViewLink: sheet.webViewLink,
                        }}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">—</td>
                  <td className="px-6 py-4">{Math.random() > 0.5 ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
