import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Link } from 'react-router-dom'

export default function Home() {
  const [rifas, setRifas] = useState([])

  useEffect(() => {
    getDocs(collection(db, 'rifas')).then(snap =>
      setRifas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  return (
    <div>
      <h1>Rifas disponibles</h1>
      {rifas.map(r => (
        <div key={r.id}>
          <h3>{r.titulo}</h3>
          <p>${r.precioNumero}</p>
          <Link to={`/rifa/${r.id}`}>Participar</Link>
        </div>
      ))}
    </div>
  )
}
