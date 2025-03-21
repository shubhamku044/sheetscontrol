import oauth2Client from "@/utils/google-auth";
import { cookies } from "next/headers";
import { google } from 'googleapis'
import { Folder } from 'lucide-react'

export default async function Page() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('google_access_token')?.value;
  oauth2Client.setCredentials({ access_token: accessToken });

  let files;

  const drive = google.drive('v3')

  try {
    const res = await drive.files.list({
      auth: oauth2Client,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    });
    files = res.data.files
  } catch (error) {
    console.error('Error -> ', error)
    return (
      <div>
        <h1>Something went wrong</h1>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-12">
      <h1 className="text-center text-5xl font-bold">
        Google drive content
      </h1>
      <div className="max-w-5xl mt-20 mx-auto">
        <ul className="grid grid-cols-2 gap-2">
          {files?.map((file) => (
            <li className="flex gap-2" key={file.id}>
              <Folder />
              <span>
                {file.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
