import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { auth } from '../firebase'
import app from '../firebase'

export const AuthContext = createContext(null)

const db = getFirestore(app)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe = () => {}

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
              const fetchedRole = userDoc.exists() ? userDoc.data().role || null : null
              setRole(fetchedRole)
              setUser(firebaseUser)
            } else {
              setUser(null)
              setRole(null)
            }
          } catch {
            setUser(firebaseUser || null)
            setRole(null)
          } finally {
            setLoading(false)
          }
        },
        () => {
          setUser(null)
          setRole(null)
          setLoading(false)
        },
      )
    } catch {
      setUser(null)
      setRole(null)
      setLoading(false)
    }

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
