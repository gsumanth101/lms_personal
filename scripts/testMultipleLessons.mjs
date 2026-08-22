import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDu-7ztQxv_wSrD6EPAoLgF_iPbRCfrNAw",
  authDomain: "prod-497915.firebaseapp.com",
  projectId: "prod-497915",
  storageBucket: "prod-497915.firebasestorage.app",
  messagingSenderId: "681500610143",
  appId: "1:681500610143:web:5fc976083ea112dee6d5ea",
  measurementId: "G-2BQGSBYB53"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testUid = 'test_user_multi_1';
const courseId = 'spoken_english';

async function testSaveProgressWithWatchTime(lessonId, watchTime, duration, forceComplete, forceUncomplete) {
  const progDocRef = doc(db, `users/${testUid}/progress`, `${courseId}_${lessonId}`);
  const existingProgSnap = await getDoc(progDocRef);
  const wasAlreadyCompleted = existingProgSnap.exists() && Boolean(existingProgSnap.data()?.completed);

  const percentage = duration > 0 ? Math.min(100, Math.round((watchTime / duration) * 100)) : 0;
  const isCompleted = forceUncomplete
    ? false
    : (forceComplete || percentage >= 90 || wasAlreadyCompleted);

  const progressRecord = {
    courseId,
    lessonId,
    userId: testUid,
    watchTime,
    duration,
    percentage: isCompleted ? 100 : percentage,
    completed: isCompleted,
    lastWatchedAt: new Date().toISOString(),
  };
  await setDoc(progDocRef, progressRecord, { merge: true });

  const enrollDocRef = doc(db, `users/${testUid}/enrollments`, courseId);
  const enrollSnap = await getDoc(enrollDocRef);

  let currentEnroll;
  if (enrollSnap.exists()) {
    currentEnroll = enrollSnap.data();
  } else {
    currentEnroll = {
      courseId,
      userId: testUid,
      startedAt: new Date().toISOString(),
      progress: 0,
      completedLessons: [],
      totalLessons: 30,
      completed: false,
    };
  }

  const completedSet = new Set(currentEnroll.completedLessons || []);
  if (isCompleted) {
    completedSet.add(lessonId);
  } else if (forceUncomplete) {
    completedSet.delete(lessonId);
  }

  const completedArray = Array.from(completedSet);
  const overallProgress = Math.min(100, Math.round((completedArray.length / (currentEnroll.totalLessons || 30)) * 100));

  const updatedEnrollment = {
    ...currentEnroll,
    progress: overallProgress,
    completedLessons: completedArray,
    completed: overallProgress >= 100,
    lastAccessedAt: new Date().toISOString(),
  };

  await setDoc(enrollDocRef, updatedEnrollment, { merge: true });
  console.log(`[Op] lesson="${lessonId}", watchTime=${watchTime}, forceComplete=${forceComplete}, forceUncomplete=${forceUncomplete} -> completedCount=${completedArray.length}:`, completedArray);
}

async function run() {
  console.log('--- TEST: MARKING MULTIPLE LESSONS ---');
  // 1. Mark lesson 1 complete
  await testSaveProgressWithWatchTime('linux_lesson_1', 1800, 1800, true, false);

  // 2. Mark lesson 2 complete
  await testSaveProgressWithWatchTime('linux_lesson_2', 1800, 1800, true, false);

  // 3. Mark lesson 3 complete
  await testSaveProgressWithWatchTime('linux_lesson_3', 1800, 1800, true, false);

  // 4. Mark lesson 4 complete
  await testSaveProgressWithWatchTime('linux_lesson_4', 1800, 1800, true, false);

  // 5. User opens lesson 1 again and watches 5 seconds (watchTime=5, forceComplete=undefined, forceUncomplete=undefined)
  console.log('\n--- SIMULATING USER OPENING LESSON 1 AGAIN & WATCHING 5s ---');
  await testSaveProgressWithWatchTime('linux_lesson_1', 5, 1800, undefined, undefined);

  // Verify that all 4 lessons are STILL complete
  const finalSnap = await getDoc(doc(db, `users/${testUid}/enrollments`, courseId));
  const finalCompleted = finalSnap.data()?.completedLessons || [];
  console.log('\nFinal completed lessons list:', finalCompleted);

  if (finalCompleted.length === 4 && ['linux_lesson_1', 'linux_lesson_2', 'linux_lesson_3', 'linux_lesson_4'].every(id => finalCompleted.includes(id))) {
    console.log('✓ SUCCESS: All 4 lessons remain completed even after opening/watching an earlier lesson!');
  } else {
    console.error('✗ FAILURE: An earlier lesson was lost!');
  }
}

run().catch(console.error);

