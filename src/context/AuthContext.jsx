import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUserData } from '../firebase/auth'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      setDataLoading(true)
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const data = await getUserData(firebaseUser.uid)
          setUserData(data)
        } catch (err) {
          console.error(err)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
      setDataLoading(false)
    })
    return unsubscribe
  }, [])

  const value = { user, userData, loading, dataLoading }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}