import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const register = async () => {
    const res = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', res.user.uid), {
      email,
      rol: 'user'
    })
    navigate('/')
  }

  return (
    <div>
      <h2>Registro</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" onChange={e => setPassword(e.target.value)} />
      <button onClick={register}>Crear cuenta</button>
    </div>
  )
}
