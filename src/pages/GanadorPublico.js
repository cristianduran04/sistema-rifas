import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export default function GanadorPublico() {
  const { id } = useParams()
  const [ganador, setGanador] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'ganadores', id)).then(snap => {
      if (snap.exists()) setGanador(snap.data())
    })
  }, [id])

  if (!ganador) return <p>No hay ganador aún</p>

  return (
    <div>
      <h2>🎉 GANADOR 🎉</h2>
      <p>Email: {ganador.email}</p>
      <p>Número ganador: {ganador.numero}</p>
    </div>
  )
}
