import { auth, db } from './config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export const registerUser = async (email, password, fullName, phone) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  await setDoc(doc(db, 'users', user.uid), {
    fullName,
    email,
    phone,
    role: 'student',
    createdAt: new Date().toISOString(),
    status: 'active',
    expertSkills: [],
    avatar: ''
  })
  return user
}

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const logoutUser = () => signOut(auth)

export const resetPassword = (email) => sendPasswordResetEmail(auth, email)

export const getUserData = async (uid) => {
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? docSnap.data() : null
}