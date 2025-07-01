import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDU3bLR1vYW2GvuZdz-iVdayxPIKs77P6g',
  authDomain: 'pancakeswap-dev-firebase.firebaseapp.com',
  projectId: 'pancakeswap-dev-firebase',
  storageBucket: 'pancakeswap-dev-firebase.firebasestorage.app',
  messagingSenderId: '389585225139',
  appId: '1:389585225139:web:12bb674737c1493355f7c6',
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
