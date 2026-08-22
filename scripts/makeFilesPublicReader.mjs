import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const key = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../serviceAccountKey.json'), 'utf8'));

const ROOT_FOLDER_ID = '1Ive2NU1vj3QQYmOS4U544hkjSh2aJzzH';

const jwtClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth: jwtClient });

async function listAllChildFiles(folderId) {
  const all = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 100,
    });
    if (res.data.files) all.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return all;
}

async function makeFolderAndFilesPublic(folderId, depth = 0) {
  try {
    // Make the folder itself readable
    await drive.permissions.create({
      fileId: folderId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    }).catch(() => {});

    const items = await listAllChildFiles(folderId);
    for (const item of items) {
      process.stdout.write(`Setting public reader permission on: "${item.name}"... `);
      try {
        await drive.permissions.create({
          fileId: item.id,
          requestBody: { role: 'reader', type: 'anyone' },
          supportsAllDrives: true,
        });
        console.log('✓ OK');
      } catch (e) {
        console.log(`(already permitted or ${e.message})`);
      }

      if (item.mimeType === 'application/vnd.google-apps.folder') {
        await makeFolderAndFilesPublic(item.id, depth + 1);
      }
    }
  } catch (err) {
    console.error(`Error processing folder ${folderId}:`, err.message);
  }
}

async function run() {
  console.log('Authorizing Google Drive Service Account...');
  await jwtClient.authorize();
  console.log('Scanning and setting video files to Anyone-With-Link Reader...');
  await makeFolderAndFilesPublic(ROOT_FOLDER_ID);
  console.log('\n====================================================');
  console.log('All course videos are now streamable by all users!');
  console.log('====================================================');
}

run().catch(console.error);
