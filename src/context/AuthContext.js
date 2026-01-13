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
        const snap = await getDoc(doc(db, 'users', u.uid))
        setUser(u)
        setRol(snap.exists() ? snap.data().rol : 'user')
      } else {
        setUser(null)
        setRol(null)
      }
      setLoading(false)
    })

    return unsub
  }, [])

  if (loading) return null   // 👈 CLAVE

  return (
    <AuthContext.Provider value={{ user, rol }}>
      {children}
    </AuthContext.Provider>
  )
}
