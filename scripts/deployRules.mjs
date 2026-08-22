import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');
const rulesPath = path.resolve(__dirname, '../firestore.rules');

const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const rulesContent = fs.readFileSync(rulesPath, 'utf8');

const jwtClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'],
});

const firebaserules = google.firebaserules({ version: 'v1', auth: jwtClient });

async function deploy() {
  console.log('Authorizing JWT client with Cloud Platform scope...');
  await jwtClient.authorize();

  console.log(`Creating Ruleset for project: ${key.project_id}...`);
  try {
    const rulesetRes = await firebaserules.projects.rulesets.create({
      name: `projects/${key.project_id}`,
      requestBody: {
        source: {
          files: [
            {
              name: 'firestore.rules',
              content: rulesContent,
            },
          ],
        },
      },
    });

    const rulesetName = rulesetRes.data.name;
    console.log(`Created Ruleset: ${rulesetName}`);

    console.log('Releasing Ruleset to cloud.firestore...');
    try {
      await firebaserules.projects.releases.patch({
        name: `projects/${key.project_id}/releases/cloud.firestore`,
        requestBody: {
          release: {
            name: `projects/${key.project_id}/releases/cloud.firestore`,
            rulesetName: rulesetName,
          },
        },
      });
      console.log('Successfully released rules to cloud.firestore via patch!');
    } catch (e) {
      console.log('Patch failed, attempting release creation...');
      await firebaserules.projects.releases.create({
        name: `projects/${key.project_id}`,
        requestBody: {
          name: `projects/${key.project_id}/releases/cloud.firestore`,
          rulesetName: rulesetName,
        },
      });
      console.log('Successfully created release cloud.firestore!');
    }

    console.log('\n>>> SUCCESS: Firestore Security Rules are now active in Firebase Cloud! <<<');
  } catch (err) {
    console.error('Rules Deployment Error:', err.message);
  }
}

deploy().catch(console.error);
