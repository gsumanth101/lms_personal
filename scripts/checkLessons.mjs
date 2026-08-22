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

const db = getFirestore();

async function syncAndRepairUserEnrollments() {
  console.log('--- REPAIRING & SYNCING USER ENROLLMENTS ---');
  const usersSnap = await db.collection('users').get();
  for (const uDoc of usersSnap.docs) {
    const userId = uDoc.id;
    console.log(`\nUser: ${userId} (${uDoc.data().email})`);
    
    // Find all completed progress for this user
    const progSnap = await db.collection('users').doc(userId).collection('progress').get();
    const completedByCourse = new Map();

    progSnap.docs.forEach((pDoc) => {
      const p = pDoc.data();
      if (p.completed && p.courseId && p.lessonId) {
        // Normalize lessonId
        let cleanLessonId = p.lessonId;
        if (!cleanLessonId.startsWith(p.courseId)) {
          cleanLessonId = `${p.courseId}_${cleanLessonId}`;
        }
        if (!completedByCourse.has(p.courseId)) {
          completedByCourse.set(p.courseId, new Set());
        }
        completedByCourse.get(p.courseId).add(cleanLessonId);
      }
    });

    for (const [courseId, lessonSet] of completedByCourse.entries()) {
      const courseDoc = await db.collection('courses').doc(courseId).get();
      const totalLessons = courseDoc.exists ? (courseDoc.data().totalLessons || 30) : 30;
      const completedArray = Array.from(lessonSet);
      const progress = Math.min(100, Math.round((completedArray.length / totalLessons) * 100));

      const enrollRef = db.collection('users').doc(userId).collection('enrollments').doc(courseId);
      const enrollDoc = await enrollRef.get();

      const existingData = enrollDoc.exists ? enrollDoc.data() : {};
      const updated = {
        courseId,
        userId,
        startedAt: existingData.startedAt || new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        progress,
        completedLessons: completedArray,
        totalLessons,
        completed: progress >= 100,
        updatedAt: new Date().toISOString(),
      };

      await enrollRef.set(updated, { merge: true });
      console.log(`  ✓ Updated Course "${courseId}": ${completedArray.length}/${totalLessons} (${progress}%) completed`);
      console.log(`    Lessons:`, completedArray);
    }
  }
}

syncAndRepairUserEnrollments().catch(console.error);



