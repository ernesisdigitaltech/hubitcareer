import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCVZSBvqdxYvfyIqhyHn4N9CrBehJiG66A",
  authDomain: "hubitcareer.firebaseapp.com",
  projectId: "hubitcareer",
  storageBucket: "hubitcareer.firebasestorage.app",
  messagingSenderId: "504990680686",
  appId: "1:504990680686:web:c9bcf71872050816f2887f"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app