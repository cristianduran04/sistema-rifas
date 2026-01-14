import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          setRol(snap.data().rol)
          console.log('ROL DETECTADO:', snap.data().rol)
        } else {
          setRol('user')
          console.log('NO EXISTE DOC USER')
        }

        setUser(u)
      } else {
        setUser(null)
        setRol(null)
      }

      setLoading(false)
    })

    return () => unsub()
  }, [])

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, rol }}>
      {children}
    </AuthContext.Provider>
  )
}
