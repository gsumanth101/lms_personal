import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const key = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../serviceAccountKey.json'), 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(key), projectId: key.project_id });
}

const vercelConfig = {
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
};

fs.writeFileSync(path.resolve(__dirname, '../vercel.json'), JSON.stringify(vercelConfig, null, 2));
console.log('Created vercel.json successfully!');




