import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: 'pancakeswap-dev-firebase.firebaseapp.com',
  projectId: 'pancakeswap-dev-firebase',
  storageBucket: 'pancakeswap-dev-firebase.firebasestorage.app',
  messagingSenderId: '389585225139',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
