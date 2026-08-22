import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const key = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../serviceAccountKey.json'), 'utf8'));

const jwtClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth: jwtClient });

// Test file: first lesson of Spoken English (12ejxq-UkrMSMVLuWe4WX_jiJ7moDEqid)
const testFileId = '12ejxq-UkrMSMVLuWe4WX_jiJ7moDEqid';

async function checkPermissions() {
  await jwtClient.authorize();
  console.log('Checking permissions for file:', testFileId);
  try {
    const fileRes = await drive.files.get({
      fileId: testFileId,
      fields: 'id, name, mimeType, webViewLink, permissions',
      supportsAllDrives: true,
    });
    console.log('File Name:', fileRes.data.name);
    console.log('WebViewLink:', fileRes.data.webViewLink);
    console.log('Permissions:', fileRes.data.permissions);

    // Let's also check if we can make it "anyone with link can view" so iframe playback works 100% seamlessly for all users
    try {
      console.log('Ensuring anyoneWithLink permission on file...');
      const permRes = await drive.permissions.create({
        fileId: testFileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        supportsAllDrives: true,
      });
      console.log('Permission created successfully:', permRes.data);
    } catch (permErr) {
      console.log('Permission create info:', permErr.message);
    }

  } catch (err) {
    console.error('Error fetching file:', err.message);
  }
}

checkPermissions().catch(console.error);
