import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()

    const res = await signInWithEmailAndPassword(auth, email, password)

    const ref = doc(db, 'users', res.user.uid)
    const snap = await getDoc(ref)

    const rol = snap.exists() ? snap.data().rol : 'user'
    console.log('ROL LOGIN:', rol)

    // 🔥 AQUÍ ESTÁ LA CLAVE
    if (rol === 'admin') {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  return (
    <form onSubmit={login} style={{ padding: 40 }}>
      <h2>Iniciar sesión</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button>Entrar</button>
    </form>
  )
}
