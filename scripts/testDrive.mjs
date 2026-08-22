import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

const jwtClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth: jwtClient });
const folderId = '1Ive2NU1vj3QQYmOS4U544hkjSh2aJzzH';

async function test() {
  console.log('Authorizing JWT client for Service Account:', key.client_email);
  await jwtClient.authorize();
  console.log('Authorization successful!');

  console.log('Fetching files in root folder:', folderId);
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log('Discovered items in Drive:', res.data.files);
  } catch (e) {
    console.error('Drive API Error:', e.message);
  }
}

test().catch(console.error);
