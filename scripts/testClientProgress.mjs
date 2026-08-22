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

async function test() {
  console.log('Testing Firestore progress write...');
  try {
    const testUid = 'test_learner_123';
    const courseId = 'spoken_english';
    const lessonId = 'spoken_english_lesson_1';

    const enrollRef = doc(db, `users/${testUid}/enrollments`, courseId);
    console.log('Attempting write to:', enrollRef.path);
    await setDoc(enrollRef, {
      courseId,
      userId: testUid,
      progress: 100,
      completed: true,
      completedLessons: [lessonId],
      totalLessons: 63,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log('Successfully wrote enrollment!');
    const snap = await getDoc(enrollRef);
    console.log('Read back enrollment:', snap.data());
  } catch (err) {
    console.error('Error during write:', err.message);
  }
}

test().catch(console.error);
