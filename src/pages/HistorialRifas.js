import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function HistorialRifas() {
  const [rifas, setRifas] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'rifas'), where('estado', '==', 'finalizada'))
    getDocs(q).then(snap =>
      setRifas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  return (
    <div>
      <h2>Rifas finalizadas</h2>
      {rifas.map(r => (
        <div key={r.id}>
          <h4>{r.titulo}</h4>
        </div>
      ))}
    </div>
  )
}
