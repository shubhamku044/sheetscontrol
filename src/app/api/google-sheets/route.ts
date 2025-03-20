// File: app/api/google-sheets/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Define the required scopes
const SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.processes',
];

// Function to authenticate with Google APIs
async function authenticateAndBuildServices() {
  try {
    // Load service account credentials from environment variables or a secure storage
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || '{}');

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    const authClient = await auth.getClient();

    // Build the Drive, Sheets, and Script services
    const drive = google.drive({ version: 'v3', auth: authClient });
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const script = google.script({ version: 'v1', auth: authClient });

    return { drive, sheets, script };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Failed to authenticate with Google APIs' };
  }
}

// Function to get parent folder ID
async function getParentFolderId(drive: any, fileId: string) {
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'parents',
    });

    const parents = response.data.parents || [];
    return parents.length > 0 ? parents[0] : null;
  } catch (error) {
    console.error('Error getting parent folder:', error);
    return null;
  }
}

// Function to check if a sheet is blank
async function isSheetBlank(sheets: any, spreadsheetId: string, sheetName: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const values = response.data.values || [];
    return values.length === 0;
  } catch (error) {
    console.error('Error checking if sheet is blank:', error);
    return false;
  }
}

// Function to get spreadsheet permissions
async function getSpreadsheetPermissions(drive: any, spreadsheetId: string) {
  try {
    const response = await drive.permissions.list({
      fileId: spreadsheetId,
      fields: 'permissions(id, type, role, emailAddress, allowFileDiscovery)',
    });

    return response.data.permissions || [];
  } catch (error) {
    console.error('Error getting permissions:', error);
    return [];
  }
}

// Function to list all spreadsheets and their details
async function listSpreadsheets(drive: any, sheets: any, script: any) {
  try {
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "nextPageToken, files(id, name, owners, shared)",
    });

    const items = response.data.files || [];
    if (items.length === 0) {
      return { message: 'No spreadsheets found.' };
    }

    const spreadsheets = [];

    for (const item of items) {
      const spreadsheetId = item.id;
      const name = item.name;
      const shared = item.shared || false;
      const owners = item.owners?.map((owner: any) => owner.emailAddress).join(', ') || '';

      try {
        // Get spreadsheet metadata
        const spreadsheetResponse = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        const sheetsData = spreadsheetResponse.data.sheets || [];
        const sheetCount = sheetsData.length;

        // Check for Apps Script
        const scriptResponse = await drive.files.list({
          q: `'${spreadsheetId}' in parents and mimeType='application/vnd.google-apps.script'`,
          fields: "files(id, name)",
        });

        const scripts = scriptResponse.data.files || [];
        const appscriptPresent = scripts.length > 0;

        // Check for blank sheets
        const blankSheets = [];
        for (const sheet of sheetsData) {
          const sheetName = sheet.properties.title;
          if (await isSheetBlank(sheets, spreadsheetId, sheetName)) {
            blankSheets.push(sheetName);
          }
        }

        // Get permissions
        const permissions = await getSpreadsheetPermissions(drive, spreadsheetId);
        const viewerEmails = permissions
          .filter((perm: any) => perm.role === 'reader' && perm.emailAddress)
          .map((perm: any) => perm.emailAddress);

        const ownerEmails = permissions
          .filter((perm: any) => perm.role === 'owner' && perm.emailAddress)
          .map((perm: any) => perm.emailAddress);

        const publicViewAllowed = permissions.some(
          (perm: any) => perm.type === 'anyone' && perm.allowFileDiscovery
        );

        // Check for external connections (IMPORTRANGE)
        const externalConnections = [];
        try {
          const spreadsheetData = await sheets.spreadsheets.get({
            spreadsheetId,
            includeGridData: true,
          });

          for (const sheet of spreadsheetData.data.sheets || []) {
            const sheetName = sheet.properties.title;
            const data = sheet.data || [];

            for (const rowData of data) {
              const rows = rowData.rowData || [];
              for (const row of rows) {
                const values = row.values || [];
                for (const cell of values) {
                  const formula = cell.userEnteredValue?.formulaValue;
                  if (formula && formula.toUpperCase().includes('IMPORTRANGE')) {
                    externalConnections.push(`${sheetName}: ${formula}`);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error checking external connections for ${name}:`, error);
        }

        spreadsheets.push({
          name,
          id: spreadsheetId,
          sheetCount,
          shared,
          owners,
          appscriptPresent,
          blankSheets,
          ownerEmails,
          viewerEmails,
          publicViewAllowed,
          externalConnections,
        });

      } catch (error) {
        console.error(`Error processing spreadsheet ${name}:`, error);
        spreadsheets.push({
          name,
          id: spreadsheetId,
          error: 'Failed to process this spreadsheet',
        });
      }
    }

    return { spreadsheets };

  } catch (error) {
    console.error('Error listing spreadsheets:', error);
    return { error: 'Failed to list spreadsheets' };
  }
}

// API route handler
export async function GET() {
  try {
    const { drive, sheets, script, error } = await authenticateAndBuildServices();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    const result = await listSpreadsheets(drive, sheets, script);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
