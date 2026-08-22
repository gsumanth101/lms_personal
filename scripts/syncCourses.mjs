/**
 * LearnOS - Automatic Course & Video Synchronization Engine
 * 
 * Flow:
 * 1. Authenticates Google Drive API v3 using Service Account JWT
 * 2. Scans root course folder: 1Ive2NU1vj3QQYmOS4U544hkjSh2aJzzH
 * 3. Scans all course folders (Spoken English, Linux, Oracle(SQL/PLSQL), etc.)
 * 4. Extracts modules, video lessons, and resources
 * 5. Uses fast Firestore batch writes to persist courses and lessons
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse .env if process.env is not populated
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        val = val.replace(/\\n/g, '\n');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}
loadEnv();

const ROOT_FOLDER_ID = process.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || '1Ive2NU1vj3QQYmOS4U544hkjSh2aJzzH';

let key;
const KEY_PATH = path.resolve(__dirname, '../serviceAccountKey.json');

if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  key = {
    project_id: process.env.FIREBASE_PROJECT_ID || 'prod-497915',
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
} else if (fs.existsSync(KEY_PATH)) {
  key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
} else {
  throw new Error('Missing FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in environment.');
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(key),
    projectId: key.project_id,
  });
}

const db = getFirestore();

// Initialize Google Drive API JWT
const jwtClient = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth: jwtClient });


function sanitizeId(str) {
  return str.toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function extractOrder(fileName) {
  const match = fileName.match(/^(\d+)[\s._-]+/);
  return match ? parseInt(match[1], 10) : 99;
}

function cleanLessonTitle(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/^\d+[\s._-]+/, '')
    .trim();
}

async function listDriveFiles(query) {
  const allFiles = [];
  let pageToken;

  do {
    const res = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime)',
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 100,
    });

    if (res.data.files) {
      allFiles.push(...res.data.files);
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return allFiles;
}

export async function runSync() {
  console.log('====================================================');
  console.log('LearnOS Content Synchronization Engine');
  console.log(`Root Folder ID: ${ROOT_FOLDER_ID}`);
  console.log(`Project: ${key.project_id}`);
  console.log('====================================================\n');

  console.log('[1/4] Authorizing Service Account with Google Drive...');
  await jwtClient.authorize();
  console.log('Service Account authorized.\n');

  console.log('[2/4] Scanning root folder for Course Directories...');
  const courseFolders = await listDriveFiles(
    `'${ROOT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );

  console.log(`Discovered ${courseFolders.length} course folders in Drive:\n`);
  courseFolders.forEach((f, i) => console.log(`  ${i + 1}. ${f.name} (Folder ID: ${f.id})`));
  console.log('');

  let totalSavedLessons = 0;

  for (const folder of courseFolders) {
    const courseId = sanitizeId(folder.name);
    console.log(`----------------------------------------------------`);
    console.log(`Processing: "${folder.name}"...`);

    // Find all files and subfolders inside this course folder
    const folderItems = await listDriveFiles(`'${folder.id}' in parents and trashed = false`);

    const subfolders = folderItems.filter(
      (f) => f.mimeType === 'application/vnd.google-apps.folder'
    );
    let videoFiles = folderItems.filter(
      (f) =>
        f.mimeType.startsWith('video/') ||
        f.mimeType === 'application/octet-stream' ||
        f.name.match(/\.(mp4|mkv|mov|webm)$/i)
    );

    // If subfolders exist, inspect each subfolder for video lessons
    for (const sub of subfolders) {
      console.log(`  Scanning subfolder: "${sub.name}"`);
      const subItems = await listDriveFiles(`'${sub.id}' in parents and trashed = false`);
      const subVideos = subItems
        .filter(
          (f) =>
            f.mimeType.startsWith('video/') ||
            f.mimeType === 'application/octet-stream' ||
            f.name.match(/\.(mp4|mkv|mov|webm)$/i)
        )
        .map((v) => ({ ...v, moduleName: sub.name }));
      videoFiles.push(...subVideos);
    }

    // Sort video lessons
    videoFiles.sort((a, b) => {
      const ordA = extractOrder(a.name);
      const ordB = extractOrder(b.name);
      return ordA !== ordB ? ordA - ordB : a.name.localeCompare(b.name);
    });

    console.log(`  Discovered ${videoFiles.length} lessons.`);

    const lessonsData = [];
    const batch = db.batch();

    for (let i = 0; i < videoFiles.length; i++) {
      const video = videoFiles[i];
      const lessonOrder = extractOrder(video.name) !== 99 ? extractOrder(video.name) : i + 1;
      const lessonId = `${courseId}_lesson_${lessonOrder}`;
      const cleanTitle = cleanLessonTitle(video.name);
      const storagePath = `courses/${courseId}/videos/${lessonId}.mp4`;

      const lessonDoc = {
        id: lessonId,
        courseId,
        driveFileId: video.id,
        storagePath,
        title: `${String(lessonOrder).padStart(2, '0')} ${cleanTitle}`,
        order: lessonOrder,
        mimeType: video.mimeType || 'video/mp4',
        fileType: 'VIDEO',
        duration: 1800,
        moduleName: video.moduleName || 'Curriculum Modules',
        streamUrl: `https://drive.google.com/file/d/${video.id}/preview`,
        webViewLink: `https://drive.google.com/file/d/${video.id}/view`,
        createdTime: video.createdTime || new Date().toISOString(),
        modifiedTime: video.modifiedTime || new Date().toISOString(),
      };

      lessonsData.push(lessonDoc);

      const lessonRef = db.collection('courses').doc(courseId).collection('lessons').doc(lessonId);
      batch.set(lessonRef, lessonDoc, { merge: true });
    }

    // Category and thumbnail mapping
    const category = folder.name.toLowerCase().includes('english')
      ? 'Communication & Soft Skills'
      : folder.name.toLowerCase().includes('linux')
      ? 'Operating Systems & DevOps'
      : folder.name.toLowerCase().includes('oracle') || folder.name.toLowerCase().includes('sql')
      ? 'Database Engineering & SQL'
      : 'Software Engineering';

    const thumbnail = folder.name.toLowerCase().includes('english')
      ? 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800'
      : folder.name.toLowerCase().includes('linux')
      ? 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800'
      : folder.name.toLowerCase().includes('oracle')
      ? 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800'
      : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

    const courseDoc = {
      id: courseId,
      driveFolderId: folder.id,
      title: folder.name,
      description: `Comprehensive hands-on curriculum covering ${folder.name}. Master core concepts and real-world techniques.`,
      thumbnail,
      category,
      level: 'All Levels',
      instructor: {
        name: 'Senior Instructor',
      },
      totalLessons: lessonsData.length,
      totalDuration: lessonsData.length * 1800,
      lastSynced: new Date().toISOString(),
      published: true,
      tags: [folder.name, 'LearnOS', 'Curriculum'],
      lessons: lessonsData,
    };

    const courseRef = db.collection('courses').doc(courseId);
    batch.set(courseRef, courseDoc, { merge: true });

    // Commit fast batch
    await batch.commit();
    totalSavedLessons += lessonsData.length;
    console.log(`  ✓ Batch saved Course "${folder.name}" and ${lessonsData.length} lessons to Firestore.\n`);
  }

  console.log('====================================================');
  console.log(`Sync Complete! Saved ${courseFolders.length} courses and ${totalSavedLessons} lessons to Firestore.`);
  console.log('====================================================\n');
}

runSync().catch((err) => {
  console.error('[Sync Fatal Error]:', err);
  process.exit(1);
});
