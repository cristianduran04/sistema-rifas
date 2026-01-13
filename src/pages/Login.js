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

    // 🔥 LEEMOS EL ROL DESPUÉS DE LOGUEAR
    const snap = await getDoc(doc(db, 'users', res.user.uid))
    const rol = snap.exists() ? snap.data().rol : 'user'

    // 🔥 REDIRECCIÓN CORRECTA
    if (rol === 'admin') {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  return (
    <form onSubmit={login}>
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
