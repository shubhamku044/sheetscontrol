// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { google } from 'googleapis'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Table } from "lucide-react";
import Link from "next/link";
import oauth2Client from "@/utils/google-auth";

export default async function Page() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('google_access_token')?.value;
  oauth2Client.setCredentials({ access_token: accessToken });

  let sheets;
  const drive = google.drive('v3')

  try {
    const res = await drive.files.list({
      auth: oauth2Client,
      pageSize: 50,
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'nextPageToken, files(id, name, webViewLink)',
      orderBy: 'modifiedTime desc',
    });
    sheets = res.data.files
  } catch (error) {
    console.error('Error fetching sheets:', error)
    return (
      <div className="w-full min-h-screen p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-destructive">
            Error Loading Sheets
          </h1>
          <p className="mt-4 text-muted-foreground">
            Please check your internet connection and try refreshing the page.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard">Retry</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            My Google Sheets
          </h1>
          <Button asChild>
            <Link href="https://docs.google.com/spreadsheets" target="_blank">
              Create New Sheet
            </Link>
          </Button>
        </div>

        {sheets?.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">No Google Sheets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sheets?.map((sheet) => (
              <Card key={sheet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <Table className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg font-medium">
                      {sheet.name}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link
                          href={sheet.webViewLink || '#'}
                          target="_blank"
                          className="cursor-pointer"
                        >
                          Open in Google Sheets
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/sheet/${sheet.id}`}
                          className="cursor-pointer"
                        >
                          Analyze Sheet
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Last modified</span>
                    <Button variant="link" className="h-auto p-0">
                      <Link href={`/sheet/${sheet.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
