import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCHizzJb-lYnHwCczT3S9y2n2V3jcJCFQg",
  authDomain: "gastosapp-3969b.firebaseapp.com",
  projectId: "gastosapp-3969b",
  storageBucket: "gastosapp-3969b.firebasestorage.app",
  messagingSenderId: "294579328114",
  appId: "1:294579328114:web:d42b8b081a240955311eeb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);