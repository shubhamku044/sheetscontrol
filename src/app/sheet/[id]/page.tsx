// app/sheet/[id]/page.tsx
import { google } from 'googleapis'
import { cookies } from "next/headers"
import oauth2Client from "@/utils/google-auth"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, Link2, Calendar, User, Sheet } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('google_access_token')?.value
  oauth2Client.setCredentials({ access_token: accessToken })

  let spreadsheet: any
  let sheetsInfo: any

  try {
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    })
    const sheets = google.sheets({
      version: 'v4',
      auth: oauth2Client
    })

    // Get spreadsheet metadata
    const fileRes = await drive.files.get({
      fileId: params.id,
      fields: 'id,name,webViewLink,createdTime,modifiedTime,owners'
    })

    // Get spreadsheet sheets structure
    const sheetRes = await sheets.spreadsheets.get({
      spreadsheetId: params.id,
      includeGridData: false
    })

    spreadsheet = fileRes.data
    sheetsInfo = sheetRes.data.sheets
  } catch (error) {
    console.error('Error fetching sheet details:', error)
    return (
      <div className="w-full min-h-screen p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-destructive">
            Error Loading Sheet Details
          </h1>
          <Button className="mt-6" asChild>
            <Link href="/sheets-dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/sheets-dashboard">
              ← Back to Sheets
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sheet className="h-8 w-8" />
            {spreadsheet.name}
          </h1>
          <Button asChild>
            <Link href={spreadsheet.webViewLink || '#'} target="_blank">
              Open in Google Sheets
              <Link2 className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Created
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(spreadsheet.createdTime).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Modified
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(spreadsheet.modifiedTime).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Owner
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {spreadsheet.owners?.[0]?.displayName || 'Unknown'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sheets Count
              </CardTitle>
              <Table className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sheetsInfo?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4">Sheets Structure</h2>
        <div className="grid grid-cols-1 gap-4">
          {sheetsInfo?.map((sheet: any) => (
            <Card key={sheet.properties.sheetId}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium">
                  {sheet.properties.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {sheet.properties.gridProperties.rowCount} rows
                  </Badge>
                  <Badge variant="outline">
                    {sheet.properties.gridProperties.columnCount} columns
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Sheet ID:</span> {sheet.properties.sheetId}
                  </div>
                  <div>
                    <span className="font-medium">Index:</span> {sheet.properties.index}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add more analysis sections here */}
      </div>
    </div>
  )
}
