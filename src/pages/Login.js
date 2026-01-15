import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()

    try {
      const res = await signInWithEmailAndPassword(auth, email, password)

      const ref = doc(db, 'users', res.user.uid)
      const snap = await getDoc(ref)

      const rol = snap.exists() ? snap.data().rol : 'user'
      console.log('ROL LOGIN:', rol)

      if (rol === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error) {
      alert('Correo o contraseña incorrectos')
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={login} className="login-card">
        <h2>Iniciar sesión</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

