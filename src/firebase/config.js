import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "<AIzaSyAHvdGa-WS3A1369U_TBq7tBL0fj4zAkv8>",
  authDomain: "<hch1-f57cf.firebaseapp.com",
  projectId: "<hch1-f57cf>",
  storageBucket: "<hch1-f57cf.firebasestorage.app",
  messagingSenderId: "<510625102682>",
  appId: "<1:510625102682:web:57b96403250af73ba6d163>"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };