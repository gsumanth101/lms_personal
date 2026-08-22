import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function testRead() {
  console.log('Querying collection "courses" via Web SDK...');
  try {
    const snap = await getDocs(collection(db, 'courses'));
    console.log(`Success! Found ${snap.docs.length} courses in Firestore:`);
    snap.docs.forEach(doc => {
      console.log(` - ID: ${doc.id}, Title: "${doc.data().title}", Lessons: ${doc.data().totalLessons}`);
    });
  } catch (err) {
    console.error('Web SDK Read Error:', err.message);
  }
}

testRead().catch(console.error);
